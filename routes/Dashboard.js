// routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../connection/connection');
const responsePayload = require('../payload');

const { getISOWeek } = require('date-fns');

router.get('/', async (req, res) => {
  const { year, period } = req.query; // Get year and period from query parameters
  console.log('Received year:', year);
  console.log('Received period:', period);

  // Validate year
  if (!year || isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
    return responsePayload(400, 'Tahun tidak valid. Harap masukkan tahun yang benar.', null, res);
  }

  // Validate period
  const validPeriods = ['monthly', 'weekly', 'daily'];
  if (!period || !validPeriods.includes(period)) {
    return responsePayload(
      400,
      'Periode tidak valid. Harap masukkan periode yang benar (monthly, weekly, daily).',
      null,
      res
    );
  }

  try {
    // Ambil total penjualan untuk periode saat ini
    const totalPenjualanResult = await db.query(
      'SELECT SUM(total_harga) AS total_penjualan FROM penjualan WHERE EXTRACT(YEAR FROM tanggal) = $1',
      [year]
    );
    const totalPenjualan = totalPenjualanResult.rows[0].total_penjualan || 0;

    // Ambil total penjualan untuk periode sebelumnya
    let previousTotalPenjualan = 0;
    if (period === 'monthly') {
      previousTotalPenjualan = await db.query(
        'SELECT SUM(total_harga) AS total_penjualan FROM penjualan WHERE EXTRACT(YEAR FROM tanggal) = $1 AND EXTRACT(MONTH FROM tanggal) = $2',
        [year - 1, new Date().getMonth() + 1] // Mengambil bulan yang sama tahun lalu
      );
    } else if (period === 'weekly') {
      const currentWeek = getISOWeek(new Date()); // Mengambil minggu saat ini
      previousTotalPenjualan = await db.query(
        'SELECT SUM(total_harga) AS total_penjualan FROM penjualan WHERE EXTRACT(YEAR FROM tanggal) = $1 AND EXTRACT(WEEK FROM tanggal) = $2',
        [year, currentWeek - 1] // Mengambil minggu yang sama minggu lalu
      );
    } else if (period === 'daily') {
      previousTotalPenjualan = await db.query(
        'SELECT SUM(total_harga) AS total_penjualan FROM penjualan WHERE tanggal::date = $1',
        [new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]] // Mengambil hari sebelumnya
      );
    }

    const previousTotal = previousTotalPenjualan.rows[0].total_penjualan || 0;
    console.log('Previous Total Penjualan:', previousTotal);
    console.log('Total Penjualan:', totalPenjualan);

    // Hitung persentase perubahan
    const trendPercentage =
      previousTotal === 0 ? 0 : ((totalPenjualan - previousTotal) / previousTotal) * 100;

    // Ambil total keuntungan
    const totalKeuntunganResult = await db.query(
      'SELECT SUM(keuntungan) AS total_keuntungan FROM history_penjualan'
    );
    const totalKeuntungan = totalKeuntunganResult.rows[0].total_keuntungan || 0;

    // Ambil jumlah pelanggan
    const totalPelangganResult = await db.query('SELECT COUNT(*) AS total_pelanggan FROM customer');
    const totalPelanggan = totalPelangganResult.rows[0].total_pelanggan || 0;

    // Ambil jumlah sparepart
    const totalSparepartResult = await db.query(
      'SELECT COUNT(*) AS total_sparepart FROM sparepart'
    );
    const totalSparepart = totalSparepartResult.rows[0].total_sparepart || 0;

    // Ambil statistik penjualan berdasarkan periode
    let salesQuery;
    if (period === 'monthly') {
      salesQuery = `
        SELECT
          EXTRACT(MONTH FROM tanggal) AS bulan,
          SUM(total_harga) AS total_penjualan
        FROM penjualan
        WHERE EXTRACT(YEAR FROM tanggal) = $1
        GROUP BY bulan
        ORDER BY bulan
      `;
    } else if (period === 'weekly') {
      salesQuery = `
        SELECT
          EXTRACT(WEEK FROM tanggal) AS minggu,
          SUM(total_harga) AS total_penjualan
        FROM penjualan
        WHERE EXTRACT(YEAR FROM tanggal) = $1
        GROUP BY minggu
        ORDER BY minggu
      `;
    } else if (period === 'daily') {
      salesQuery = `
        SELECT
          tanggal::date AS tanggal,
          SUM(total_harga) AS total_penjualan
        FROM penjualan
        WHERE EXTRACT(YEAR FROM tanggal) = $1
        GROUP BY tanggal
        ORDER BY tanggal
      `;
    }

    const salesData = await db.query(salesQuery, [year]);

    // Kumpulkan semua data
    const responseData = {
      totalPenjualan,
      totalKeuntungan,
      totalPelanggan,
      totalSparepart,
      trend: `${trendPercentage.toFixed(2)}% vs periode sebelumnya`, // Menambahkan informasi tren
      [period === 'monthly' ? 'monthlySales' : period === 'weekly' ? 'weeklySales' : 'dailySales']:
        salesData.rows,
    };

    responsePayload(200, 'Dashboard data berhasil diambil', responseData, res);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    responsePayload(500, 'Gagal mengambil data dashboard', null, res);
  }
});

module.exports = router;

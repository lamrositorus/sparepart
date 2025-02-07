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
        [year, new Date().getMonth() + 1] // Mengambil bulan yang sama tahun lalu
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

    const previousTotalPenjualanValue = previousTotalPenjualan.rows[0].total_penjualan || 0;
    console.log('Previous Total Penjualan:', previousTotalPenjualanValue);
    console.log('Total Penjualan:', totalPenjualan);

    // Hitung persentase perubahan total penjualan
    const trendPercentage =
      previousTotalPenjualanValue === 0
        ? 0
        : ((totalPenjualan - previousTotalPenjualanValue) / previousTotalPenjualanValue) * 100;

    // Ambil total keuntungan untuk periode saat ini
    const totalKeuntunganResult = await db.query(
      'SELECT SUM(keuntungan) AS total_keuntungan FROM history_penjualan'
    );
    const totalKeuntungan = totalKeuntunganResult.rows[0].total_keuntungan || 0;
    console.log('Total Keuntungan:', totalKeuntungan);

    // Ambil total keuntungan untuk periode sebelumnya
    let previousTotalKeuntungan = 0;
    if (period === 'monthly') {
      previousTotalKeuntungan = await db.query(
        'SELECT SUM(keuntungan) AS total_keuntungan FROM history_penjualan WHERE EXTRACT(YEAR FROM tanggal) = $1 AND EXTRACT(MONTH FROM tanggal) = $2',
        [year, new Date().getMonth()] // Mengambil bulan yang sama tahun lalu
      );
    } else if (period === 'weekly') {
      const currentWeek = getISOWeek(new Date()); // Mengambil minggu saat ini
      previousTotalKeuntungan = await db.query(
        'SELECT SUM(keuntungan) AS total_keuntungan FROM history_penjualan WHERE EXTRACT(YEAR FROM tanggal) = $1 AND EXTRACT(WEEK FROM tanggal) = $2',
        [year, currentWeek - 1] // Mengambil minggu yang sama minggu lalu
      );
    } else if (period === 'daily') {
      previousTotalKeuntungan = await db.query(
        'SELECT SUM(keuntungan) AS total_keuntungan FROM history_penjualan WHERE tanggal::date = $1',
        [new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]] // Mengambil hari sebelumnya
      );
    }

    const previousTotalKeuntunganValue = previousTotalKeuntungan.rows[0].total_keuntungan || 0;
    console.log('Previous Total Keuntungan:', previousTotalKeuntunganValue);
    console.log('Total Keuntungan:', totalKeuntungan);

    // Hitung persentase perubahan total keuntungan
    const trendPercentageKeuntungan =
      previousTotalKeuntunganValue === 0
        ? 0
        : ((totalKeuntungan - previousTotalKeuntunganValue) / previousTotalKeuntunganValue) * 100;

    // Ambil jumlah pelanggan untuk periode saat ini
    const totalPelangganResult = await db.query('SELECT COUNT(*) AS total_pelanggan FROM customer');
    const totalPelanggan = totalPelangganResult.rows[0].total_pelanggan || 0;

    // Ambil jumlah pelanggan untuk periode sebelumnya
    let previousTotalPelanggan = 0;
    if (period === 'monthly') {
      previousTotalPelanggan = await db.query(
        'SELECT COUNT(*) AS total_pelanggan FROM customer WHERE EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(MONTH FROM created_at) = $2',
        [year, new Date().getMonth()] // Mengambil bulan yang sama tahun lalu
      );
    } else if (period === 'weekly') {
      const currentWeek = getISOWeek(new Date());
      previousTotalPelanggan = await db.query(
        'SELECT COUNT(*) AS total_pelanggan FROM customer WHERE EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(WEEK FROM created_at) = $2',
        [year, currentWeek - 1] // Mengambil minggu yang sama minggu lalu
      );
    } else if (period === 'daily') {
      previousTotalPelanggan = await db.query(
        'SELECT COUNT(*) AS total_pelanggan FROM customer WHERE created_at::date = $1',
        [new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]] // Mengambil hari sebelumnya
      );
    }

    const previousTotalPelangganValue = previousTotalPelanggan.rows[0].total_pelanggan || 0;
    console.log('Previous Total Pelanggan:', previousTotalPelangganValue);
    console.log('Total Pelanggan:', totalPelanggan);

    // Hitung persentase perubahan total pelanggan
    const pelangganTrendPercentage =
      previousTotalPelangganValue === 0
        ? 0
        : ((totalPelanggan - previousTotalPelangganValue) / previousTotalPelangganValue) * 100;

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
      trend: `${trendPercentage.toFixed(2)}% vs periode sebelumnya`, // Menambahkan informasi tren penjualan
      keuntunganTrend: `${trendPercentageKeuntungan.toFixed(2)}% vs periode sebelumnya`, // Menambahkan informasi tren keuntungan
      pelangganTrend: `${pelangganTrendPercentage.toFixed(2)}% vs periode sebelumnya`, // Menambahkan informasi tren pelanggan
      monthlySales: [], // Inisialisasi dengan array kosong
      weeklySales: [], // Inisialisasi dengan array kosong
      dailySales: [], // Inisialisasi dengan array kosong
    };

    // Ambil data penjualan berdasarkan periode
    if (period === 'monthly') {
      responseData.monthlySales = salesData.rows || []; // Pastikan ini adalah array
    } else if (period === 'weekly') {
      responseData.weeklySales = salesData.rows || []; // Pastikan ini adalah array
    } else if (period === 'daily') {
      responseData.dailySales = salesData.rows || []; // Pastikan ini adalah array
    }

    responsePayload(200, 'Dashboard data berhasil diambil', responseData, res);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    responsePayload(500, 'Gagal mengambil data dashboard', null, res);
  }
});

module.exports = router;

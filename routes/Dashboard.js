// routes/dashboard.js
const express = require('express');
const router = express.Router();
const db = require('../connection/connection');
const responsePayload = require('../payload');
const { getISOWeek } = require('date-fns');

router.get('/', async (req, res) => {
  let { year, period, startDate, endDate } = req.query; // Ambil year, period, startDate, dan endDate dari query parameters
  console.log('Received year:', year);
  console.log('Received period:', period);
  console.log('Received startDate:', startDate);
  console.log('Received endDate:', endDate);

  // Validasi year
  if (!year || isNaN(year) || year < 2000 || year > new Date().getFullYear()) {
    return responsePayload(400, 'Tahun tidak valid. Harap masukkan tahun yang benar.', null, res);
  }

  // Validasi period
  const validPeriods = ['monthly', 'weekly', 'daily', 'yearly'];
  if (!period || !validPeriods.includes(period)) {
    return responsePayload(
      400,
      'Periode tidak valid. Harap masukkan periode yang benar (monthly, weekly, daily, yearly).',
      null,
      res
    );
  }

  try {
    // Ambil total penjualan untuk periode saat ini
    let totalPenjualanQuery =
      'SELECT SUM(total_harga) AS total_penjualan FROM penjualan WHERE EXTRACT(YEAR FROM tanggal) = $1';
    let totalKeuntunganQuery =
      'SELECT SUM(keuntungan) AS total_keuntungan FROM history_penjualan WHERE EXTRACT(YEAR FROM tanggal) = $1';
    let totalPelangganQuery =
      'SELECT COUNT(*) AS total_pelanggan FROM customer WHERE EXTRACT(YEAR FROM created_at) = $1';

    let totalPenjualanParams = [year];
    let totalKeuntunganParams = [year];
    let totalPelangganParams = [year];
    // Jika startDate diisi tetapi endDate tidak, atur endDate ke hari ini
    if (startDate && !endDate) {
      endDate = new Date().toISOString().split('T')[0];
    }
    if (!startDate && endDate) {
      startDate = new Date(endDate).toISOString().split('T')[0];
    }

    // Tambahkan filter berdasarkan tanggal jika ada
    if (startDate && endDate) {
      totalPenjualanQuery += ' AND tanggal BETWEEN $2 AND $3';
      totalKeuntunganQuery += ' AND tanggal BETWEEN $2 AND $3';
      totalPelangganQuery += ' AND created_at BETWEEN $2 AND $3';
      totalPenjualanParams.push(startDate, endDate);
      totalKeuntunganParams.push(startDate, endDate);
      totalPelangganParams.push(startDate, endDate);
    } else if (period === 'monthly') {
      totalPenjualanQuery += ' AND EXTRACT(MONTH FROM tanggal) = $2';
      totalKeuntunganQuery += ' AND EXTRACT(MONTH FROM tanggal) = $2';
      totalPelangganQuery += ' AND EXTRACT(MONTH FROM created_at) = $2';
      totalPenjualanParams.push(new Date().getMonth() + 1); // Bulan saat ini
      totalKeuntunganParams.push(new Date().getMonth() + 1); // Bulan saat ini
      totalPelangganParams.push(new Date().getMonth() + 1); // Bulan saat ini
    } else if (period === 'weekly') {
      const currentWeek = getISOWeek(new Date());
      totalPenjualanQuery += ' AND EXTRACT(WEEK FROM tanggal) = $2';
      totalKeuntunganQuery += ' AND EXTRACT(WEEK FROM tanggal) = $2';
      totalPelangganQuery += ' AND EXTRACT(WEEK FROM created_at) = $2';
      totalPenjualanParams.push(currentWeek); // Minggu saat ini
      totalKeuntunganParams.push(currentWeek); // Minggu saat ini
      totalPelangganParams.push(currentWeek); // Minggu saat ini
    } else if (period === 'daily') {
      const today = new Date().toISOString().split('T')[0]; // Ambil tanggal hari ini
      totalPenjualanQuery += ' AND tanggal::date = $2';
      totalKeuntunganQuery += ' AND tanggal::date = $2';
      totalPelangganQuery += ' AND created_at::date = $2';
      totalPenjualanParams.push(today); // Tanggal hari ini
      totalKeuntunganParams.push(today); // Tanggal hari ini
      totalPelangganParams.push(today); // Tanggal hari ini
    }
    const totalPenjualanResult = await db.query(totalPenjualanQuery, totalPenjualanParams);
    const totalPenjualan = totalPenjualanResult.rows[0].total_penjualan || 0;

    const totalKeuntunganResult = await db.query(totalKeuntunganQuery, totalKeuntunganParams);
    const totalKeuntungan = totalKeuntunganResult.rows[0].total_keuntungan || 0;

    const totalPelangganResult = await db.query(totalPelangganQuery, totalPelangganParams);
    const totalPelanggan = totalPelangganResult.rows[0].total_pelanggan || 0;

    // Ambil jumlah sparepart
    const totalSparepartResult = await db.query(
      'SELECT COUNT(*) AS total_sparepart FROM sparepart'
    );
    const totalSparepart = totalSparepartResult.rows[0].total_sparepart || 0;

    // Kumpulkan semua data
    const responseData = {
      totalPenjualan,
      totalKeuntungan,
      totalPelanggan,
      totalSparepart,
      trend: 'N/A', // Placeholder, bisa diisi sesuai kebutuhan
      keuntunganTrend: 'N/A', // Placeholder, bisa diisi sesuai kebutuhan
      pelangganTrend: 'N/A', // Placeholder, bisa diisi sesuai kebutuhan
      monthlySales: [], // Inisialisasi dengan array kosong
      weeklySales: [], // Inisialisasi dengan array kosong
      dailySales: [], // Inisialisasi dengan array kosong
      yearlySales: [], // Inisialisasi dengan array kosong
    };

    // Ambil data penjualan berdasarkan periode
    let salesQuery;
    if (period === 'monthly') {
      salesQuery = `
        SELECT
          EXTRACT(MONTH FROM tanggal) AS bulan,
          SUM(total_harga) AS total_penjualan
        FROM penjualan
        WHERE EXTRACT(YEAR FROM tanggal) = $1
        ${startDate && endDate ? 'AND tanggal BETWEEN $2 AND $3' : ''}
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
        ${startDate && endDate ? 'AND tanggal BETWEEN $2 AND $3' : ''}
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
        ${startDate && endDate ? 'AND tanggal BETWEEN $2 AND $3' : ''}
        GROUP BY tanggal
        ORDER BY tanggal
      `;
    } else if (period === 'yearly') {
      salesQuery = `
        SELECT
          EXTRACT(YEAR FROM tanggal) AS tahun,
          SUM(total_harga) AS total_penjualan
        FROM penjualan
        WHERE EXTRACT(YEAR FROM tanggal) = $1 
        ${startDate && endDate ? 'AND tanggal BETWEEN $2 AND $3' : ''}
        GROUP BY tahun
        ORDER BY tahun
      `;
    }
    // Kirim parameter yang sesuai
    const salesData = await db.query(salesQuery, [year, startDate, endDate].filter(Boolean)); // Hanya kirim parameter yang ada

    // Ambil data penjualan berdasarkan periode
    if (period === 'monthly') {
      responseData.monthlySales = salesData.rows || []; // Pastikan ini adalah array
    } else if (period === 'weekly') {
      responseData.weeklySales = salesData.rows || []; // Pastikan ini adalah array
    } else if (period === 'daily') {
      responseData.dailySales = salesData.rows || []; // Pastikan ini adalah array
    } else if (period === 'yearly') {
      // Ambil data penjualan untuk setiap tahun dari tahun pertama hingga tahun saat ini
      const yearlySalesQuery = `
    SELECT
      EXTRACT(YEAR FROM tanggal) AS tahun,
      SUM(total_harga) AS total_penjualan
    FROM penjualan
    GROUP BY tahun
    ORDER BY tahun
  `;

      const yearlySalesData = await db.query(yearlySalesQuery);
      responseData.yearlySales = yearlySalesData.rows || []; // Pastikan ini adalah array

      // Jika Anda ingin menambahkan total penjualan tahun sebelumnya
      const previousYear = parseInt(year) - 1;
      const previousYearSalesQuery = `
    SELECT
      SUM(total_harga) AS total_penjualan
    FROM penjualan
    WHERE EXTRACT(YEAR FROM tanggal) = $1
  `;

      const previousYearSalesData = await db.query(previousYearSalesQuery, [previousYear]);
      const totalPenjualanPreviousYear = previousYearSalesData.rows[0].total_penjualan || 0;

      // Tambahkan total penjualan tahun sebelumnya ke responseData
      responseData.totalPenjualanPreviousYear = totalPenjualanPreviousYear; // Tambahkan total penjualan tahun sebelumnya
    }

    responsePayload(200, 'Dashboard data berhasil diambil', responseData, res);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    responsePayload(500, 'Gagal mengambil data dashboard', null, res);
  }
});

module.exports = router;

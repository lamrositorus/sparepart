const express = require('express');
const router = express.Router();
const responsePayload = require('../payload');
const db = require('../connection/connection');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

router.get('/customers', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM customer');
    if (result.rows.length === 0) {
      responsePayload(200, 'data tidak ditemukan untuk di export ', null, res);
      return;
    }
    const csvWriter = createCsvWriter({
      path: 'customer.csv',
      header: [
        { id: 'id_customer', title: 'ID Customer' },
        { id: 'nama_customer', title: 'Nama Customer' },
        { id: 'alamat', title: 'Alamat' },
        { id: 'telepon', title: 'Telepon' },
        { id: 'email', title: 'Email' },
      ],
    });
    //tulis data ke csv
    await csvWriter.writeRecords(result.rows);

    //kirim file csv ke client
    res.download('customer.csv', 'customer.csv', (err) => {
      if (err) {
        responsePayload(500, 'gagal mengunduh file', null, res);
      }
      responsePayload(200, 'file customer.csv berhasil diunduh', null, res);
    });
  } catch (err) {
    console.log('Error: ' + err.message);
    responsePayload(500, 'gagal melakukan export data', null, res);
  }
});

//get history pembelian
router.get('/historypembelian', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM history_pembelian');
    if (result.rows.length === 0) {
      responsePayload(200, 'data tidak ditemukan untuk di export ', null, res);
      return;
    }
    const csvWriter = createCsvWriter({
      path: 'historypembelian.csv',
      header: [
        { id: 'id_history_pembelian', title: 'ID History Pembelian' },
        { id: 'id_pembelian', title: 'ID pembelian' },
        { id: 'id_pemasok', title: 'ID pemasok' },
        { id: 'id_sparepart', title: 'ID Sparepart' },
        { id: 'jumlah', title: 'Jumlah' },
        { id: 'total_harga', title: 'Total harga' },
        { id: 'tanggal', title: 'Tanggal' },
        { id: 'created_at', title: 'Waktu dibuat' },
        { id: 'updated_at', title: 'Waktu diperbarui' },
      ],
    });
    //tulis data ke csv
    await csvWriter.writeRecords(result.rows);
    //kirim file csv ke client
    res.download('historypembelian.csv', 'historypembelian.csv', (err) => {
      if (err) {
        responsePayload(500, 'gagal mengunduh file', null, res);
      }
      responsePayload(200, 'file historypembelian.csv berhasil diunduh', null, res);
    });
  } catch (err) {
    console.log('Error: ' + err.message);
    responsePayload(500, 'gagal melakukan export data', null, res);
  }
});

//get history penjualan
router.get('/historypenjualan', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM history_penjualan');
    if (result.rows.length === 0) {
      responsePayload(200, 'data tidak ditemukan untuk di export ', null, res);
      return;
    }
    const csvWriter = createCsvWriter({
      path: 'historypenjualan.csv',
      header: [
        { id: 'id_history_penjualan', title: 'ID History Penjualan' },
        { id: 'id_penjualan', title: 'ID Penjualan' },
        { id: 'id_customer', title: 'ID Customer' },
        { id: 'id_sparepart', title: 'ID Sparepart' },
        { id: 'jumlah', title: 'Jumlah' },
        { id: 'harga_beli', title: 'Harga beli' },
        { id: 'harga_jual', title: 'Harga jual' },
        { id: 'margin', title: 'Margin' },
        { id: 'keuntungan', title: 'Keuntungan' },
        { id: 'total_harga', title: 'Total harga' },
        { id: 'tanggal', title: 'Tanggal' },
        { id: 'created_at', title: 'Waktu dibuat' },
        { id: 'updated_at', title: 'Waktu diperbarui' },
      ],
    });
    //tulis data ke csv
    await csvWriter.writeRecords(result.rows);
    //kirim file csv ke client
    res.download('historypenjualan.csv', 'historypenjualan.csv', (err) => {
      if (err) {
        responsePayload(500, 'gagal mengunduh file', null, res);
      }
      responsePayload(200, 'file historypenjualan.csv berhasil diunduh', null, res);
    });
  } catch (err) {
    console.log('Error: ' + err.message);
    responsePayload(500, 'gagal melakukan export data', null, res);
  }
});
module.exports = router;

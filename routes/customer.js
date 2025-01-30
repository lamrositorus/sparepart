const express = require('express');
const router = express.Router();
const db = require('../connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');
const verifyToken = require('../middleware/verifikasiToken');
/* get customer */
router.get('/', (req, res) => {
  db.query('SELECT * FROM customer', (err, result) => {
    if (err) {
      responsePayload(500, 'gagal mengambil data', null, res);
      return;
    }
    if (result.rows.length === 0) {
      responsePayload(200, 'data tidak ditemukan', null, res);
      return;
    }
    responsePayload(200, 'data customer berhasil diambil', result.rows, res);
  });
});

/* post customer */
router.post('/', verifyToken, (req, res) => {
  const data = req.body;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  if (!data || !data.nama_customer || !data.alamat || !data.telepon || !data.email) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }

  // Validasi nama
  if (data.nama_customer.length < 3) {
    responsePayload(400, 'nama customer harus lebih dari 3 karakter', null, res);
    return;
  }

  // Validasi email menggunakan regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    responsePayload(400, 'email tidak valid, harus menggunakan @example.com', null, res);
    return;
  }

  // Validasi alamat
  if (data.alamat.length < 5) {
    responsePayload(400, 'alamat harus lebih dari 5 karakter', null, res);
    return;
  }

  // Validasi telepon
  if (data.telepon.length < 10) {
    responsePayload(400, 'telepon harus lebih dari 10 karakter', null, res);
    return;
  }

  // Masukkan ke database
  const query =
    'INSERT INTO customer (id_customer, nama_customer, alamat, telepon, email, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
  const values = [
    id,
    data.nama_customer,
    data.alamat,
    data.telepon,
    data.email,
    created_at,
    updated_at,
  ];
  db.query(query, values, (err, result) => {
    if (err) {
      responsePayload(500, 'gagal menyimpan data ', null, res);
      return;
    }
    responsePayload(200, 'data customer berhasil ditambahkan', result.rows[0], res);
  });
});

module.exports = router;

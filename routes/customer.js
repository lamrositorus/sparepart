const express = require('express');
const router = express.Router();
const db = require('../connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');

/* get customer */
router.get('/', (req, res) => {
  db.query('SELECT * FROM customer', (err, result) => {
    if (err) {
      responsePayload(500, 'gagal mengambil data', null, res);
      return;
    }
    responsePayload(200, 'data customer berhasil diambil', result.rows, res);
  });
});
module.exports = router;

/* post customer */
router.post('/', (req, res) => {
  const data = req.body;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  if (!data || !data.nama_customer || !data.alamat || !data.telepon || !data.email) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }
  //validasi nama
  if (data.nama_customer.length < 3) {
    responsePayload(400, 'nama customer harus lebih dari 3 karakter', null, res);
    return;
  }
  //validasi email
  if (!data.email.includes('@')) {
    responsePayload(400, 'email tidak valid, harus menggunakan @example.com', null, res);
    return;
  }
  if (data.email.length < 5) {
    responsePayload(400, 'email harus lebih dari 5 karakter', null, res);
    return;
  }
  //validasi telepon
  if (data.telepon.length < 10) {
    responsePayload(400, 'telepon harus lebih dari 10 karakter', null, res);
    return;
  }

  //masukan ke database
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
      responsePayload(500, 'gagal menyimpan data', null, res);
      return;
    }
    responsePayload(200, 'data customer berhasil ditambahkan', result.rows[0], res);
  });
});

/* get detail customer */
router.get('/:id', (req, res) => {
  const id = req.params.id;
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }
  db.query('SELECT * FROM customer WHERE id_customer = $1', [id], (err, result) => {
    if (err) {
      responsePayload(500, 'gagal mengambil data', null, res);
      return;
    }
    if (result.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }
    responsePayload(200, 'data customer berhasil diambil', result.rows[0], res);
  });
});

/* put customer */
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const updated_at = new Date();
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }
  if (!data || !data.nama_customer || !data.alamat || !data.telepon || !data.email) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }

  //validasi nama
  if (data.nama_customer.length < 3) {
    responsePayload(400, 'nama customer harus lebih dari 3 karakter', null, res);
    return;
  }
  //validasi email
  if (!data.email.includes('@')) {
    responsePayload(400, 'email tidak valid, harus menggunakan @example.com', null, res);
    return;
  }
  if (data.email.length < 5) {
    responsePayload(400, 'email harus lebih dari 5 karakter', null, res);
    return;
  }
  //validasi telepon
  if (data.telepon.length < 10) {
    responsePayload(400, 'telepon harus lebih dari 10 karakter', null, res);
    return;
  }

  //updated
  const query =
    'UPDATE customer SET nama_customer = $1, alamat = $2, telepon = $3, email = $4, updated_at = $5 WHERE id_customer = $6 RETURNING *';
  const values = [data.nama_customer, data.alamat, data.telepon, data.email, updated_at, id];
  db.query(query, values, (err, result) => {
    if (err) {
      responsePayload(500, 'gagal mengupdate data', null, res);
      return;
    }
    if (result.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }
    responsePayload(200, 'data berhasil diupdate', result.rows[0], res);
  });
});

/* delete customer  */
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }
  db.query('DELETE FROM customer WHERE id_customer = $1', [id], (err, result) => {
    if (err) {
      responsePayload(500, 'gagal menghapus data', null, res);
      return;
    }
    if (result.rowCount === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }
    responsePayload(200, 'data berhasil dihapus', null, res);
    return;
  });
});

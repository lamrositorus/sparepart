const express = require('express');
const router = express.Router();
const db = require('../connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');

/* get pemasok */
router.get('/', (req, res) => {
  db.query('SELECT * FROM pemasok', (err, result) => {
    if (err) {
      responsePayload(500, 'gagal mengambil data', null, res);
    } else {
      responsePayload(200, 'data pemasok berhasil diambil', result.rows, res);
    }
  });
});

/* post pemasok */
router.post('/', (req, res) => {
  const data = req.body;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  //cek jika data tidak ada
  if (!data || !data.nama_pemasok || !data.alamat || !data.telepon || !data.email) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }

  //cek jika nama_pemasok sudah ada
  const checkQuery = 'SELECT * FROM pemasok WHERE nama_pemasok = $1';
  db.query(checkQuery, [data.nama_pemasok], (err, result) => {
    if (err) {
      responsePayload(500, 'gagal menambahkan data', null, res);
    }
    if (result.rows.length > 0) {
      responsePayload(400, 'nama pemasok sudah ada', null, res);
      return;
    }
  });

  //cek input nama_pemasok harus string
  if (typeof data.nama_pemasok !== 'string') {
    responsePayload(400, 'nama pemasok harus berupa string', null, res);
    return;
  }
  //cek input telepon harus angka
  if (!/^\d+$/.test(data.telepon)) {
    responsePayload(400, 'telepon harus berupa angka', null, res);
    return;
  }
  //cek input email harus valid
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    responsePayload(400, 'email tidak valid', null, res);
    return;
  }
  //cek input alamat harus string
  if (typeof data.alamat !== 'string') {
    responsePayload(400, 'alamat harus berupa string', null, res);
    return;
  }

  const query = `INSERT INTO pemasok (id_pemasok, nama_pemasok, alamat, telepon, email, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
  const values = [
    id,
    data.nama_pemasok,
    data.alamat,
    data.telepon,
    data.email,
    created_at,
    updated_at,
  ];
  db.query(query, values, (err, result) => {
    if (err) {
      responsePayload(500, 'gagal menambahkan data', null, res);
    }
    const payload = result.rows[0];
    responsePayload(200, 'data pemasok berhasil ditambahkan', payload, res);
  });
});

/* delete pemasok */
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  //cek jika id tidak ada
  const checkQuery = 'SELECT * FROM pemasok WHERE id_pemasok = $1';
  db.query(checkQuery, [id], (err, result) => {
    if (err) {
      responsePayload(500, 'gagal menghapus data', null, res);
      return;
    }
    if (result.rows.length === 0) {
      responsePayload(404, 'data pemasok tidak ditemukan', null, res);
      return;
    }
  });
  const query = `DELETE FROM pemasok WHERE id_pemasok = $1`;
  db.query(query, [id], (err, result) => {
    if (err) {
      responsePayload(500, 'gagal menghapus data', null, res);
    }
    responsePayload(200, 'data pemasok berhasil dihapus', null, res);
  });
});
module.exports = router;

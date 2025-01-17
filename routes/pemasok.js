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

/* get pemasok by id */
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM pemasok WHERE id_pemasok = $1';

  //cek jika id tidak ada di database
  const checkId = 'SELECT * FROM pemasok WHERE id_pemasok = $1';
  db.query(checkId, [id], (err, result) => {
    if (err) {
      responsePayload(500, 'gagal mengambil data', null, res);
      return;
    }
    if (result.rows.length === 0) {
      responsePayload(404, 'id tidak di temukan', null, res);
      return;
    }

    db.query(query, [id], (err, result) => {
      if (err) {
        responsePayload(500, 'gagal mengambil data', null, res);
        return;
      }
      responsePayload(200, 'data pemasok berhasil diambil', result.rows, res);
    });
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
      return;
    }
    if (result.rows.length > 0) {
      responsePayload(400, 'nama pemasok sudah ada', null, res);
      return;
    }

    //cek input nama_pemasok harus string
    if (typeof data.nama_pemasok !== 'string') {
      responsePayload(400, 'nama pemasok harus berupa string', null, res);
      return;
    }
    //validasi nomor telepon
    const phoneRegex = /^[0-9]+$/; // Regex untuk mengecek hanya angka
    if (!phoneRegex.test(data.telepon)) {
      responsePayload(400, 'nomor telepon harus berupa angka', null, res);
      return;
    }
    // validasi panjang nomor telepon
    if (data.telepon.length !== 12) {
      responsePayload(400, 'nomor telepon harus 12 digit', null, res);
      return;
    }
    //cek input email harus valid
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      responsePayload(
        400,
        'email tidak valid, email harus menggunakan format abc@example.com',
        null,
        res
      );
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
        return;
      }
      const payload = result.rows[0];
      responsePayload(200, 'data pemasok berhasil ditambahkan', payload, res);
    });
  });
});

/* put pemasok */
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const updated_at = new Date();
  const query = `UPDATE pemasok SET nama_pemasok = $1, alamat = $2, telepon = $3, email = $4, updated_at = $5 WHERE id_pemasok = $6 RETURNING *`;
  const values = [data.nama_pemasok, data.alamat, data.telepon, data.email, updated_at, id];
  db.query(query, values, (err, result) => {
    if (err) {
      responsePayload(500, 'gagal mengubah data', null, res);
      return;
    }
    if (result.rows.length === 0) {
      responsePayload(404, 'data pemasok tidak ditemukan', null, res);
      return;
    }
    const payload = result.rows[0];
    responsePayload(200, 'data pemasok berhasil diubah', payload, res);
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

    const query = `DELETE FROM pemasok WHERE id_pemasok = $1`;
    db.query(query, [id], (err, result) => {
      if (err) {
        responsePayload(500, 'gagal menghapus data', null, res);
        return;
      }
      responsePayload(200, 'data pemasok berhasil dihapus', null, res);
    });
  });
});

module.exports = router;

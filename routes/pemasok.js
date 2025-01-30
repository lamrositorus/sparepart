const express = require('express');
const router = express.Router();
const db = require('../connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');

/* get pemasok */
router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM pemasok');
  if (result.rows.length === 0) {
    responsePayload(200, 'data tidak ditemukan', null, res);
    return;
  }
  responsePayload(200, 'data berhasil diambil', result.rows, res);
});

/* get pemasok by id */
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const result = await db.query('SELECT * FROM pemasok WHERE id_pemasok = $1', [id]);
  if (result.rows.length === 0) {
    responsePayload(404, 'data tidak ditemukan', null, res);
    return;
  }
  responsePayload(200, 'data berhasil diambil', result.rows[0], res);
});
/* post pemasok */
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const id = uuidv4();

    // Validate required fields
    if (!data || !data.nama_pemasok || !data.alamat || !data.telepon || !data.email) {
      return responsePayload(400, 'data tidak valid', null, res);
    }

    // Check existing pemasok
    const existingPemasok = await db.query('SELECT * FROM pemasok WHERE nama_pemasok = $1', [
      data.nama_pemasok,
    ]);

    if (existingPemasok.rows.length > 0) {
      return responsePayload(400, 'nama pemasok sudah ada', null, res);
    }

    // Validate nama_pemasok type
    if (typeof data.nama_pemasok !== 'string') {
      return responsePayload(400, 'nama pemasok harus berupa string', null, res);
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(data.telepon)) {
      return responsePayload(400, 'nomor telepon harus berupa angka', null, res);
    }

    // Validate phone number length
    if (data.telepon.length !== 12) {
      return responsePayload(400, 'nomor telepon harus 12 digit', null, res);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return responsePayload(400, 'format email tidak valid', null, res);
    }

    const query = `
      INSERT INTO pemasok 
      (id_pemasok, nama_pemasok, alamat, telepon, email, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [id, data.nama_pemasok, data.alamat, data.telepon, data.email];
    const result = await db.query(query, values);

    return responsePayload(201, 'data berhasil disimpan', result.rows[0], res);
  } catch (error) {
    console.error('Error:', error);
    return responsePayload(500, 'gagal menyimpan data', null, res);
  }
});

/* put pemasok */
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // Validate required fields
    if (!data || !data.nama_pemasok || !data.alamat || !data.telepon || !data.email) {
      return responsePayload(400, 'data tidak valid', null, res);
    }

    // Check if pemasok exists
    const existingPemasok = await db.query('SELECT * FROM pemasok WHERE id_pemasok = $1', [id]);
    if (!existingPemasok.rows.length) {
      return responsePayload(404, 'data pemasok tidak ditemukan', null, res);
    }

    //validasi jika nama pemasok sudah ada
    const existingNamaPemasok = await db.query('SELECT * FROM pemasok WHERE nama_pemasok = $1', [
      data.nama_pemasok,
    ]);
    if (existingNamaPemasok.rows.length > 0) {
      return responsePayload(400, 'nama pemasok sudah ada', null, res);
    }

    // Validate nama_pemasok type
    if (typeof data.nama_pemasok !== 'string') {
      return responsePayload(400, 'nama pemasok harus berupa string', null, res);
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(data.telepon)) {
      return responsePayload(400, 'nomor telepon harus berupa angka', null, res);
    }

    // Validate phone number length
    if (data.telepon.length > 12) {
      return responsePayload(400, 'nomor telepon harus 12 digit', null, res);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return responsePayload(400, 'format email tidak valid, abc@gmail.com', null, res);
    }

    // Update pemasok
    const query = `
      UPDATE pemasok 
      SET nama_pemasok = $1, 
          alamat = $2, 
          telepon = $3, 
          email = $4, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id_pemasok = $5 
      RETURNING *
    `;

    const values = [data.nama_pemasok, data.alamat, data.telepon, data.email, id];
    const result = await db.query(query, values);

    return responsePayload(200, 'data berhasil diubah', result.rows[0], res);
  } catch (error) {
    console.error('Error:', error);
    return responsePayload(500, 'gagal mengubah data', null, res);
  }
});

/* delete pemasok */
router.delete('/:id', async (req, res) => {
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

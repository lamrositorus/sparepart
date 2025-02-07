const express = require('express');
const router = express.Router();
const db = require('../connection/connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');
const { logActivity } = require('../routes/aktivitas');
/* get kategori */
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM kategori');
    if (result.rows.length === 0) {
      return responsePayload(200, 'Tidak ada kategori yang ditemukan', null, res);
    }
    responsePayload(200, 'Data berhasil diambil', result.rows, res);
  } catch (err) {
    console.error('Error fetching categories:', err);
    responsePayload(500, 'Gagal mengambil data', null, res);
  }
});

/* post kategori */
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const id = uuidv4();
    const created_at = new Date();
    const updated_at = new Date();

    // Validate required fields
    if (!data || !data.nama_kategori || !data.deskripsi) {
      return responsePayload(400, 'data tidak valid', null, res);
    }
    //validasi nama_kategori harus lebih dari 3 karakter
    if (data.nama_kategori.length < 3) {
      return responsePayload(400, 'nama kategori harus lebih dari 3 karakter', null, res);
    }

    // Check for existing category name
    const checkResult = await db.query('SELECT * FROM kategori WHERE nama_kategori = $1', [
      data.nama_kategori,
    ]);

    if (checkResult.rows.length > 0) {
      return responsePayload(400, 'nama kategori sudah ada', null, res);
    }

    // Insert new category
    const query = `
      INSERT INTO kategori 
      (id_kategori, nama_kategori, deskripsi, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const values = [id, data.nama_kategori, data.deskripsi, created_at, updated_at];

    //masukin ke log aktivitas
    await logActivity('menambahkan kategori', `menambahkan kategori ${data.nama_kategori} `);
    const result = await db.query(query, values);
    return responsePayload(201, 'data berhasil disimpan', result.rows[0], res);
  } catch (error) {
    console.error('Error:', error);
    return responsePayload(500, 'gagal menyimpan data', null, res);
  }
});

/* get detail kategori */
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  //cek jika id tidak ada
  if (!id) {
    return responsePayload(400, 'id tidak valid', null, res);
  }
  try {
    const result = await db.query('SELECT * FROM kategori WHERE id_kategori = $1', [id]);
    if (result.rows.length === 0) {
      return responsePayload(404, 'data tidak ditemukan', null, res);
    }
    responsePayload(200, 'data berhasil diambil', result.rows[0], res);
  } catch (err) {
    console.log(err);
    responsePayload(500, 'gagal mengambil data', null, res);
  }
});

/* put kategori */
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const updated_at = new Date();

  //cek jika id tidak ada
  if (!id) {
    return responsePayload(400, 'id tidak valid', null, res);
  }

  //periksa jika data tidak ada
  if (!data || !data.nama_kategori || !data.deskripsi) {
    return responsePayload(400, 'data tidak valid', null, res);
  }
  //validasi nama_kategori harus lebih dari 3 karakter
  if (data.nama_kategori.length < 3) {
    return responsePayload(400, 'nama kategori harus lebih dari 3 karakter', null, res);
  }

  try {
    //simpan data ke database
    const query =
      'UPDATE kategori SET nama_kategori = $1, deskripsi = $2, updated_at = $3 WHERE id_kategori = $4 RETURNING *';
    const values = [data.nama_kategori, data.deskripsi, updated_at, id];
    const result = await db.query(query, values);
    await logActivity('update kategori', `update kategori ${data.nama_kategori} `);
    responsePayload(200, 'data berhasil diupdate', result.rows[0], res);
  } catch (err) {
    console.log(err);
    responsePayload(500, 'gagal menyimpan data', null, res);
  }
});

/* delete kategori */
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  //cek jika id tidak ada
  if (!id) {
    return responsePayload(400, 'id tidak valid', null, res);
  }
  data = req.body;
  console.log('data', data);

  try {
    //cek jika data ada
    const checkResult = await db.query('SELECT * FROM kategori WHERE id_kategori = $1', [id]);
    if (checkResult.rows.length === 0) {
      return responsePayload(404, 'data tidak ditemukan', null, res);
    }
    //masukin ke log aktivitas
    await logActivity('hapus kategori', `hapus kategori ${checkResult.rows[0].nama_kategori} `);
    await db.query('DELETE FROM kategori WHERE id_kategori = $1', [id]);
    responsePayload(200, 'data berhasil dihapus', null, res);
  } catch (err) {
    console.log(err);
    responsePayload(500, 'gagal menghapus data', null, res);
  }
});

module.exports = router;

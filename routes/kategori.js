const express = require('express');
const router = express.Router();
const db = require('../connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');

/* get kategori */
router.get('/', (req, res) => {
  db.query('SELECT * FROM kategori', (err, result) => {
    if (err) {
      console.log(err);
    }
    const payload = result.rows;
    responsePayload(200, 'data kategori berhasil diambil ', payload, res);
  });
});
/* post kategori */
router.post('/', (req, res) => {
  const data = req.body;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();
  //periksa jika data tidak ada
  if (!data || !data.nama_kategori || !data.deskripsi) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }
  //cek jika nama_kategori sudah ada
  db.query(
    'SELECT * FROM kategori WHERE nama_kategori = $1',
    [data.nama_kategori],
    (err, result) => {
      if (err) {
        responsePayload(500, 'gagal mengambil data', null, res);
      }
      if (result.rows.length > 0) {
        responsePayload(400, 'nama kategori sudah ada', null, res);
        return;
      }
    }
  );
  //simpan data ke database
  const query =
    'INSERT INTO kategori (id_kategori, nama_kategori, deskripsi, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *';
  const values = [id, data.nama_kategori, data.deskripsi, created_at, updated_at];
  db.query(query, values, (err, result) => {
    if (err) {
      console.log(err);
      responsePayload(500, 'gagal menyimpan data', null, res);
      return;
    }
    responsePayload(200, 'data berhasil disimpan', result.rows[0], res);
  });
});
/* get detail kategori */
router.get('/:id', (req, res) => {
  const id = req.params.id;

  //cek jika id tidak ada
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }

  db.query('SELECT * FROM kategori WHERE id_kategori = $1', [id], (err, result) => {
    if (err) {
      console.log(err);
      responsePayload(500, 'gagal mengambil data', null, res);
      return;
    }
    if (result.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }
    responsePayload(200, 'data berhasil diambil', result.rows[0], res);
  });
});
/* put kategori */
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const updated_at = new Date();

  //cek jika id tidak ada
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }

  //periksa jika data tidak ada
  if (!data || !data.nama_kategori || !data.deskripsi) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }
  //simpan data ke database
  const query =
    'UPDATE kategori SET nama_kategori = $1, deskripsi = $2, updated_at = $3 WHERE id_kategori = $4 RETURNING *';
  const values = [data.nama_kategori, data.deskripsi, updated_at, id];
  db.query(query, values, (err, result) => {
    if (err) {
      console.log(err);
      responsePayload(500, 'gagal menyimpan data', null, res);
      return;
    }
    responsePayload(200, 'data berhasil diupdate', result.rows[0], res);
  });
});

/* delete kategori */
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  //cek jika id tidak ada
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }
  //cek jika data ada
  db.query('SELECT * FROM kategori WHERE id_kategori = $1', [id], (err, result) => {
    if (err) {
      console.log(err);
      responsePayload(500, 'gagal menghapus data', null, res);
      return;
    }
    if (result.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }
  });
  db.query('DELETE FROM kategori WHERE id_kategori = $1', [id], (err, result) => {
    if (err) {
      console.log(err);
      responsePayload(500, 'gagal menghapus data', null, res);
      return;
    }
    responsePayload(200, 'data berhasil dihapus', null, res);
  });
});

module.exports = router;

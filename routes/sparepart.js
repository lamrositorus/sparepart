const express = require('express');
const router = express.Router();
const db = require('../connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');

/* get sparepart */
router.get('/', async (req, res) => {
  //ambil data dari database
  const result = await db.query('SELECT * FROM sparepart');
  if (result.rows.length === 0) {
    responsePayload(200, 'data tidak ditemukan', null, res);
    return;
  }
  responsePayload(200, 'data berhasil diambil', result.rows, res);
});

/* post sparepart */
router.post('/', async (req, res) => {
  const data = req.body;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  //cek jika data tidak ada
  if (
    !data ||
    !data.nama_sparepart ||
    !data.harga ||
    !data.stok ||
    !data.id_kategori ||
    !data.id_pemasok
  ) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }
  //validasi nama_sparepart
  if (data.nama_sparepart.length < 3) {
    responsePayload(400, 'nama sparepart harus lebih dari 3 karakter', null, res);
    return;
  }
  //validasi nama jika sudah ada
  const checkQuery = 'SELECT * FROM sparepart WHERE nama_sparepart = $1';
  let result = await db.query(checkQuery, [data.nama_sparepart]);
  if (result.rows.length > 0) {
    responsePayload(400, 'nama sparepart sudah ada', null, res);
    return;
  }

  //validasi id_kategori
  const checkKategori = 'SELECT * FROM kategori WHERE id_kategori = $1';
  result = await db.query(checkKategori, [data.id_kategori]);
  if (result.rows.length === 0) {
    responsePayload(404, 'id kategori tidak ditemukan', null, res);
    return;
  }

  //validasi id_pemasok
  const checkPemasok = 'SELECT * FROM pemasok WHERE id_pemasok = $1';
  result = await db.query(checkPemasok, [data.id_pemasok]);
  if (result.rows.length === 0) {
    responsePayload(404, 'id pemasok tidak ditemukan', null, res);
    return;
  }

  //validasi harga
  if (data.harga <= 0) {
    responsePayload(400, 'harga harus lebih dari 0', null, res);
    return;
  }
  //validasi stok
  if (data.stok <= 0) {
    responsePayload(400, 'stok harus lebih dari 0', null, res);
    return;
  }
  //validasi tanggal_masuk
  if (data.tanggal_masuk) {
    const date = new Date(data.tanggal_masuk);
    if (date.toString() === 'Invalid Date') {
      responsePayload(400, 'tanggal masuk tidak valid', null, res);
      return;
    }
  }

  //masukan ke database
  const query =
    'INSERT INTO sparepart (id_sparepart, nama_sparepart, harga, stok, id_kategori, id_pemasok, deskripsi, tanggal_masuk, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *';
  const values = [
    id,
    data.nama_sparepart,
    data.harga,
    data.stok,
    data.id_kategori,
    data.id_pemasok,
    data.deskripsi,
    data.tanggal_masuk,
    created_at,
    updated_at,
  ];
  result = await db.query(query, values);
  responsePayload(200, 'data berhasil disimpan', result.rows[0], res);
});

/* get detail sparepart */
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) {
    responsePayload(400, 'id tidak ditemuka', null, res);
    return;
  }
  //ambil data dari database
  const result = await db.query('SELECT * FROM sparepart WHERE id_sparepart = $1', [id]);
  if (result.rows.length === 0) {
    responsePayload(404, 'data tidak ditemukan', null, res);
    return;
  }
  responsePayload(200, 'data berhasil diambil', result.rows[0], res);
});

/* put sparepart */
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const updated_at = new Date();
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }
  //validasi data
  if (
    !data ||
    !data.nama_sparepart ||
    !data.harga ||
    !data.stok ||
    !data.id_kategori ||
    !data.id_pemasok
  ) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }
  //validasi nama_sparepart
  if (data.nama_sparepart.length < 3) {
    responsePayload(400, 'nama sparepart harus lebih dari 3 karakter', null, res);
    return;
  }
  //validasi nama jika sudah ada
  const checkQuery = 'SELECT * FROM sparepart WHERE nama_sparepart = $1 AND id_sparepart != $2';
  let result = await db.query(checkQuery, [data.nama_sparepart, id]);
  if (result.rows.length > 0) {
    responsePayload(400, 'nama sparepart sudah ada', null, res);
    return;
  }

  //validasi id_kategori
  const checkKategori = 'SELECT * FROM kategori WHERE id_kategori = $1';
  result = await db.query(checkKategori, [data.id_kategori]);
  if (result.rows.length === 0) {
    responsePayload(404, 'id kategori tidak ditemukan', null, res);
    return;
  }

  //validasi id_pemasok
  const checkPemasok = 'SELECT * FROM pemasok WHERE id_pemasok = $1';
  result = await db.query(checkPemasok, [data.id_pemasok]);
  if (result.rows.length === 0) {
    responsePayload(404, 'id pemasok tidak ditemukan', null, res);
    return;
  }

  //validasi harga
  if (data.harga <= 0) {
    responsePayload(400, 'harga harus lebih dari 0', null, res);
    return;
  }
  //validasi stok
  if (data.stok <= 0) {
    responsePayload(400, 'stok harus lebih dari 0', null, res);
    return;
  }
  //validasi tanggal_masuk
  if (data.tanggal_masuk) {
    const date = new Date(data.tanggal_masuk);
    if (date.toString() === 'Invalid Date') {
      responsePayload(400, 'tanggal masuk tidak valid', null, res);
      return;
    }
  }

  //update data
  const query =
    'UPDATE sparepart SET nama_sparepart = $1, harga = $2, stok = $3, id_kategori = $4, id_pemasok = $5, updated_at = $6 WHERE id_sparepart = $7 RETURNING *';
  const values = [
    data.nama_sparepart,
    data.harga,
    data.stok,
    data.id_kategori,
    data.id_pemasok,
    updated_at,
    id,
  ];
  result = await db.query(query, values);
  responsePayload(200, 'data berhasil diubah', result.rows[0], res);
});

/* delete sparepart */
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }
  //ambil data dari database
  const result = await db.query('SELECT * FROM sparepart WHERE id_sparepart = $1', [id]);
  if (result.rows.length === 0) {
    responsePayload(404, 'data tidak ditemukan', null, res);
    return;
  }
  //hapus
  const query = 'DELETE FROM sparepart WHERE id_sparepart = $1';
  await db.query(query, [id]);
  responsePayload(200, 'data berhasil dihapus', null, res);
  return;
});

module.exports = router;

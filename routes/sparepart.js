const express = require('express');
const router = express.Router();
const db = require('../connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');

/* GET all spareparts */
router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM sparepart');
  if (result.rows.length === 0) {
    responsePayload(200, 'data tidak ditemukan', null, res);
    return;
  }
  responsePayload(200, 'data berhasil diambil', result.rows, res);
});

/* POST new sparepart */
router.post('/', async (req, res) => {
  const data = req.body;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  // Validate input data
  if (
    !data ||
    !data.nama_sparepart ||
    !data.harga ||
    !data.stok ||
    !data.id_kategori ||
    !data.id_pemasok ||
    data.margin === undefined
  ) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }

  // Validate nama_sparepart
  if (data.nama_sparepart.length < 3) {
    responsePayload(400, 'nama sparepart harus lebih dari 3 karakter', null, res);
    return;
  }

  // Validate if nama_sparepart already exists menggunakan regex 
  const checkQuery = 'SELECT * FROM sparepart WHERE nama_sparepart = $1';
  const result = await db.query(checkQuery, [data.nama_sparepart]);
  if (result.rows.length > 0) {
    responsePayload(400, 'nama sparepart sudah ada', null, res);
    return;
  }
  


  // Validate id_kategori
  const checkKategori = 'SELECT * FROM kategori WHERE id_kategori = $1';
  result = await db.query(checkKategori, [data.id_kategori]);
  if (result.rows.length === 0) {
    responsePayload(404, 'id kategori tidak ditemukan', null, res);
    return;
  }

  // Validate id_pemasok
  const checkPemasok = 'SELECT * FROM pemasok WHERE id_pemasok = $1';
  result = await db.query(checkPemasok, [data.id_pemasok]);
  if (result.rows.length === 0) {
    responsePayload(404, 'id pemasok tidak ditemukan', null, res);
    return;
  }

  // Validate harga
  if (data.harga <= 0) {
    responsePayload(400, 'harga harus lebih dari 0', null, res);
    return;
  }

  // Validate stok
  if (data.stok <= 0) {
    responsePayload(400, 'stok harus lebih dari 0', null, res);
    return;
  }

  // Validate margin
  if (data.margin < 0 || data.margin >= 1) {
    responsePayload(400, 'margin harus antara 0 dan 1', null, res);
    return;
  }

  // Calculate harga_jual
  const hargaJual = data.harga / (1 - data.margin); // Menghitung harga jual

  // Insert into database
  const query =
    'INSERT INTO sparepart (id_sparepart, nama_sparepart, harga, harga_jual, margin, stok, id_kategori, id_pemasok, deskripsi, tanggal_masuk, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *';
  const values = [
    id,
    data.nama_sparepart,
    data.harga,
    hargaJual.toFixed(2), // Simpan harga jual
    data.margin,
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

/* GET detail sparepart */
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) {
    responsePayload(400, 'id tidak ditemukan', null, res);
    return;
  }
  const result = await db.query('SELECT * FROM sparepart WHERE id_sparepart = $1', [id]);
  if (result.rows.length === 0) {
    responsePayload(404, 'sparepart tidak ditemukan', null, res);
    return;
  }
  responsePayload(200, 'data berhasil diambil', result.rows[0], res);
});

/* PUT update sparepart */
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const updated_at = new Date();
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }

  // Validate input data
  if (
    !data ||
    !data.nama_sparepart ||
    !data.harga ||
    !data.stok ||
    !data.id_kategori ||
    !data.id_pemasok ||
    data.margin === undefined
  ) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }

  // Validate harga
  if (data.harga <= 0) {
    responsePayload(400, 'harga harus lebih dari 0', null, res);
    return;
  }

  // Validate stok
  if (data.stok <= 0) {
    responsePayload(400, 'stok harus lebih dari 0', null, res);
    return;
  }

  // Validate margin
  if (data.margin < 0 || data.margin >= 1) {
    responsePayload(400, 'margin harus antara 0 dan 1', null, res);
    return;
  }

  // Calculate harga_jual
  const hargaJual = data.harga / (1 - data.margin); // Menghitung harga jual

  // Update data
  const query =
    'UPDATE sparepart SET nama_sparepart = $1, harga = $2, harga_jual = $3, margin = $4, stok = $5, id_kategori = $6, id_pemasok = $7, updated_at = $8 WHERE id_sparepart = $9 RETURNING *';
  const values = [
    data.nama_sparepart,
    data.harga,
    hargaJual.toFixed(2), // Simpan harga jual
    data.margin,
    data.stok,
    data.id_kategori,
    data.id_pemasok,
    updated_at,
    id,
  ];
  result = await db.query(query, values);
  responsePayload(200, 'data berhasil diubah', result.rows[0], res);
});

/* DELETE sparepart */
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }
  const query = 'DELETE FROM sparepart WHERE id_sparepart = $1 RETURNING *';
  const result = await db.query(query, [id]);
  if (result.rowCount === 0) {
    responsePayload(404, 'sparepart tidak ditemukan', null, res);
    return;
  }
  responsePayload(200, 'data berhasil dihapus', result.rows[0], res);
});

module.exports = router;

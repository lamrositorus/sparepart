const express = require('express');
const router = express.Router();
const db = require('../connection/connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');
const { logActivity } = require('./aktivitas');
/* GET all spareparts */
router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM sparepart');
  //kondisi jika gagal fetching api
  if (result.error) {
    console.error(result.error);
    return responsePayload(500, 'gagal mengambil data', null, res);
  }
  if (result.rows.length === 0) {
    return responsePayload(200, 'data tidak ditemukan', null, res);
  }
  // Format data untuk menghilangkan .00
  const formattedRows = result.rows.map((row) => ({
    ...row,
    harga: parseFloat(row.harga).toFixed(0),
    margin: parseFloat(row.margin).toFixed(2),
    harga_jual: parseFloat(row.harga_jual).toFixed(0),
  }));
  responsePayload(200, 'data berhasil diambil', formattedRows, res);
});

/* POST new sparepart */
router.post('/', async (req, res) => {
  const data = req.body;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  // Validate input data
  if (
    !data.nama_sparepart ||
    !data.harga ||
    !data.stok ||
    !data.id_kategori ||
    !data.id_pemasok ||
    data.margin === undefined
  ) {
    return responsePayload(400, 'data tidak valid', null, res);
  }

  // Validate nama_sparepart
  if (data.nama_sparepart.length < 3) {
    return responsePayload(400, 'nama sparepart harus lebih dari 3 karakter', null, res);
  }

  // Validate if nama_sparepart already exists
  const checkSparepart = 'SELECT * FROM sparepart WHERE nama_sparepart = $1';
  let result = await db.query(checkSparepart, [data.nama_sparepart]);
  if (result.rows.length > 0) {
    return responsePayload(400, 'nama sparepart sudah ada', null, res);
  }

  // Validate id_kategori
  const checkKategori = 'SELECT * FROM kategori WHERE id_kategori = $1';
  result = await db.query(checkKategori, [data.id_kategori]);
  if (result.rows.length === 0) {
    return responsePayload(404, 'id kategori tidak ditemukan', null, res);
  }

  // Validate id_pemasok
  const checkPemasok = 'SELECT * FROM pemasok WHERE id_pemasok = $1';
  result = await db.query(checkPemasok, [data.id_pemasok]);
  if (result.rows.length === 0) {
    return responsePayload(404, 'id pemasok tidak ditemukan', null, res);
  }

  // Validate harga
  if (data.harga <= 0) {
    return responsePayload(400, 'harga harus lebih dari 0', null, res);
  }

  // Validate stok
  if (data.stok <= 0) {
    return responsePayload(400, 'stok harus lebih dari 0', null, res);
  }

  // Validate margin
  if (data.margin < 0 || data.margin >= 1) {
    return responsePayload(400, 'margin harus antara 0 dan 1', null, res);
  }

  // Calculate harga_jual
  const harga = parseFloat(data.harga);
  const margin = parseFloat(data.margin);
  const marginValue = harga * margin; // Menghitung nilai margin
  const hargaJual = harga + marginValue; // Menambahkan margin ke harga pokok

  // Insert into database
  const query =
    'INSERT INTO sparepart (id_sparepart, nama_sparepart, harga, harga_jual, margin, stok, id_kategori, id_pemasok, deskripsi, tanggal_masuk, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *';
  const values = [
    id,
    data.nama_sparepart,
    data.harga,
    hargaJual.toFixed(0),
    data.margin,
    data.stok,
    data.id_kategori,
    data.id_pemasok,
    data.deskripsi,
    data.tanggal_masuk,
    created_at,
    updated_at,
  ];
  await logActivity('CREATE_SPAREPART', `Sparepart ${data.nama_sparepart} berhasil ditambahkan`);

  result = await db.query(query, values);
  responsePayload(200, 'data berhasil disimpan', result.rows[0], res);
});

/* GET detail sparepart */
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return responsePayload(400, 'id tidak ditemukan', null, res);
  }
  const result = await db.query('SELECT * FROM sparepart WHERE id_sparepart = $1', [id]);
  if (result.rows.length === 0) {
    return responsePayload(404, 'sparepart tidak ditemukan', null, res);
  }
  responsePayload(200, 'data berhasil diambil', result.rows[0], res);
});

/* PUT update sparepart */
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const updated_at = new Date();
  if (!id) {
    return responsePayload(400, 'id tidak valid', null, res);
  }

  // Validate input data
  if (
    !data ||
    !data.nama_sparepart ||
    !data.harga ||
    !data.stok ||
    data.margin === undefined ||
    data.margin === null
  ) {
    return responsePayload(400, 'data tidak valid', null, res);
  }

  // Validate harga
  if (data.harga <= 0) {
    return responsePayload(400, 'harga harus lebih dari 0', null, res);
  }

  // Validate stok
  if (data.stok <= 0) {
    return responsePayload(400, 'stok harus lebih dari 0', null, res);
  }

  // Validate margin
  if (data.margin < 0 || data.margin >= 1) {
    return responsePayload(400, 'margin harus antara 0 dan 1', null, res);
  }

  // Calculate harga_jual
  const harga = parseFloat(data.harga);
  const margin = parseFloat(data.margin);
  const marginValue = harga * margin; // Menghitung nilai margin
  const hargaJual = harga + marginValue; // Menambahkan margin ke harga pokok
  // Update data
  const query =
    'UPDATE sparepart SET nama_sparepart = $1, harga = $2, harga_jual = $3, margin = $4, stok = $5, deskripsi = $6, updated_at = $7 WHERE id_sparepart = $8 RETURNING *';
  const values = [
    data.nama_sparepart,
    data.harga,
    hargaJual,
    data.margin,
    data.stok,
    data.deskripsi,
    updated_at,
    id,
  ];

  try {
    const result = await db.query(query, values);

    // Check if the update was successful
    if (result.rows.length === 0) {
      return responsePayload(404, 'sparepart tidak ditemukan', null, res);
    }
    await logActivity('UPDATE_SPAREPART', `Sparepart ${data.nama_sparepart} berhasil diubah`);

    // Return the updated data
    responsePayload(200, 'data berhasil diubah', result.rows[0], res);
  } catch (error) {
    console.error('Error updating sparepart:', error);
    responsePayload(500, 'gagal memperbarui sparepart', null, res);
  }
});

/* DELETE sparepart */
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return responsePayload(400, 'id tidak valid', null, res);
  }
  const query = 'DELETE FROM sparepart WHERE id_sparepart = $1 RETURNING *';
  const result = await db.query(query, [id]);
  if (result.rowCount === 0) {
    return responsePayload(404, 'sparepart tidak ditemukan', null, res);
  }
  await logActivity('DELETE_SPAREPART', `Sparepart dengan ID ${id} berhasil dihapus`);

  responsePayload(200, 'data berhasil dihapus', result.rows[0], res);
});

module.exports = router;

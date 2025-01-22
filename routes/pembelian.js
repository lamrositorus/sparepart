const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../connection');
const responsePayload = require('../payload');

/* get pembelian */
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM pembelian');
    if (result.rows.length === 0) {
      responsePayload(200, 'data tidak ditemukan', null, res);
      return;
    }
    responsePayload(200, 'berhasil mengambil data', result.rows, res);
  } catch (err) {
    responsePayload(500, 'gagal mengambil data', null, res);
  }
});

/* get detail pembelian */
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }
  try {
    const result = await db.query('SELECT * FROM pembelian WHERE id_pembelian = $1', [id]);
    if (result.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }
    responsePayload(200, 'berhasil mengambil data', result.rows[0], res);
  } catch (err) {
    responsePayload(500, 'gagal mengambil data', null, res);
  }
});

/* post pembelian */
router.post('/', async (req, res) => {
  const data = req.body;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  // Cek jika data tidak ada
  if (
    !data ||
    !data.id_sparepart ||
    !data.id_pemasok ||
    !data.tanggal ||
    !data.jumlah ||
    !data.status
  ) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }

  try {
    // Validasi id_sparepart harus ada di tabel sparepart
    let result = await db.query('SELECT * FROM sparepart WHERE id_sparepart = $1', [
      data.id_sparepart,
    ]);
    if (result.rows.length === 0) {
      responsePayload(404, 'id_sparepart tidak ditemukan', null, res);
      return;
    }

    // Validasi id_pemasok harus ada di tabel pemasok
    result = await db.query('SELECT * FROM pemasok WHERE id_pemasok = $1', [data.id_pemasok]);
    if (result.rows.length === 0) {
      responsePayload(404, 'id_pemasok tidak ditemukan', null, res);
      return;
    }

    // Validasi jumlah tidak boleh kurang dari 1
    if (data.jumlah < 1) {
      responsePayload(400, 'jumlah tidak boleh kurang dari 1', null, res);
      return;
    }

    // Ambil harga dan stok dari sparepart
    const sparepart = await db.query('SELECT harga, stok FROM sparepart WHERE id_sparepart = $1', [
      data.id_sparepart,
    ]);
    const harga = sparepart.rows[0].harga;
    const stok = sparepart.rows[0].stok;

    // Validasi total_harga tidak boleh lebih dari stok * harga
    const total_harga = harga * data.jumlah;
    if (total_harga > stok * harga) {
      responsePayload(400, 'total_harga tidak boleh lebih dari stok * harga', null, res);
      return;
    }

    // Validasi status tidak boleh selain Pending, Selesai, Dibatalkan
    if (data.status !== 'Pending' && data.status !== 'Selesai' && data.status !== 'Dibatalkan') {
      responsePayload(400, 'status tidak boleh selain Pending, Selesai, Dibatalkan', null, res);
      return;
    }

    // Masukkan ke database pembelian
    const query =
      'INSERT INTO pembelian (id_pembelian, id_sparepart, id_pemasok, tanggal, jumlah, total_harga, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    const values = [
      id,
      data.id_sparepart,
      data.id_pemasok,
      data.tanggal,
      data.jumlah,
      total_harga,
      data.status,
      created_at,
      updated_at,
    ];
    result = await db.query(query, values);

    // Ambil ID pembelian yang baru saja dimasukkan
    const id_pembelian = result.rows[0].id_pembelian;

    // Input ke history pembelian
    const queryHistory =
      'INSERT INTO history_pembelian (id_history_pembelian, id_pembelian, id_pemasok, id_sparepart, jumlah, total_harga, tanggal, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    const valuess = [
      uuidv4(), // ID untuk history pembelian
      id_pembelian, // ID pembelian yang baru saja dimasukkan
      data.id_pemasok, // ID pemasok dari data
      data.id_sparepart, // ID sparepart dari data
      data.jumlah, // Jumlah dari data
      total_harga, // Total harga yang sudah dihitung
      data.tanggal, // Tanggal dari data
      created_at,
      updated_at,
    ];
    const pembelianHistory = await db.query(queryHistory, valuess);

    responsePayload(201, 'data berhasil disimpan', pembelianHistory.rows[0], res);
  } catch (err) {
    console.error(err); // Log error untuk debugging
    responsePayload(500, 'gagal menyimpan data', null, res);
  }
});

/* update pembelian */
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const updated_at = new Date();

  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }

  // Cek jika data tidak ada
  if (
    !data ||
    !data.id_sparepart ||
    !data.id_pemasok ||
    !data.tanggal ||
    !data.jumlah ||
    !data.status
  ) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }

  try {
    // Validasi id_sparepart
    let result = await db.query('SELECT * FROM sparepart WHERE id_sparepart = $1', [
      data.id_sparepart,
    ]);
    if (result.rows.length === 0) {
      responsePayload(404, 'id_sparepart tidak ditemukan', null, res);
      return;
    }

    // Validasi id_pemasok
    result = await db.query('SELECT * FROM pemasok WHERE id_pemasok = $1', [data.id_pemasok]);
    if (result.rows.length === 0) {
      responsePayload(404, 'id_pemasok tidak ditemukan', null, res);
      return;
    }

    // Ambil data pembelian lama
    const pembelianLama = await db.query('SELECT * FROM pembelian WHERE id_pembelian = $1', [id]);
    if (pembelianLama.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }
    const jumlahLama = pembelianLama.rows[0].jumlah;
    const statusLama = pembelianLama.rows[0].status; // Ambil status lama

    // Validasi jumlah tidak boleh lebih dari stok
    result = await db.query('SELECT * FROM sparepart WHERE id_sparepart = $1', [data.id_sparepart]);
    if (result.rows[0].stok + jumlahLama < data.jumlah) {
      responsePayload(400, 'jumlah tidak boleh lebih dari stok', null, res);
      return;
    }

    // Validasi total_harga tidak boleh lebih dari stok * harga
    if (result.rows[0].stok * result.rows[0].harga < data.total_harga) {
      responsePayload(400, 'total_harga tidak boleh lebih dari stok * harga', null, res);
      return;
    }

    // Validasi status tidak boleh selain Pending, Selesai, Dibatalkan
    if (data.status !== 'Pending' && data.status !== 'Selesai' && data.status !== 'Dibatalkan') {
      responsePayload(400, 'status tidak boleh selain Pending, Selesai, Dibatalkan', null, res);
      return;
    }

    // Ambil harga dari tabel sparepart
    const harga = await db.query('SELECT harga FROM sparepart WHERE id_sparepart = $1', [
      data.id_sparepart,
    ]);
    const total_harga = harga.rows[0].harga * data.jumlah;

    // Update pembelian
    const query =
      'UPDATE pembelian SET id_sparepart = $1, id_pemasok = $2, tanggal = $3, jumlah = $4, total_harga = $5, status = $6, updated_at = $7 WHERE id_pembelian = $8 RETURNING *';
    const values = [
      data.id_sparepart,
      data.id_pemasok,
      data.tanggal,
      data.jumlah,
      total_harga,
      data.status,
      updated_at,
      id,
    ];
    result = await db.query(query, values);
    if (result.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }

    // Update stok sparepart berdasarkan kondisi status
    if (data.status === 'Selesai' && statusLama !== 'Selesai') {
      // Hanya kurangi stok jika status lama bukan 'Selesai'
      await db.query('UPDATE sparepart SET stok = stok - $1 WHERE id_sparepart = $2', [
        data.jumlah,
        data.id_sparepart,
      ]);
    } else if (data.status === 'Dibatalkan' && statusLama !== 'Dibatalkan') {
      // Hanya tambahkan stok jika status lama bukan 'Dibatalkan'
      await db.query('UPDATE sparepart SET stok = stok + $1 WHERE id_sparepart = $2', [
        data.jumlah,
        data.id_sparepart,
      ]);
    }

    responsePayload(200, 'data berhasil diupdate', result.rows[0], res);
  } catch (err) {
    responsePayload(500, 'gagal mengupdate data', null, res);
  }
});

/* delete pembelian */
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }
  try {
    await db.query('DELETE FROM pembelian WHERE id_pembelian = $1', [id]);
    responsePayload(200, 'data berhasil dihapus', null, res);
  } catch (err) {
    responsePayload(500, 'gagal menghapus data', null, res);
  }
});

module.exports = router;

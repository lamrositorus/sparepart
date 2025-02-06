const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../connection/connection');
const responsePayload = require('../payload');
const { logActivity } = require('../routes/aktivitas');
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

    // Validasi total_harga tidak boleh lebih dari stok * harga
    const total_harga = harga * data.jumlah;

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

    //tambahkan stok di sparepart jika berhasil dan kurangi jika di batalkan
    if (data.status === 'Selesai') {
      const queryUpdateStok = 'UPDATE sparepart SET stok = stok + $1 WHERE id_sparepart = $2';
      await db.query(queryUpdateStok, [data.jumlah, data.id_sparepart]);
    } else if (data.status === 'Dibatalkan') {
      const queryUpdateStok = 'UPDATE sparepart SET stok = stok - $1 WHERE id_sparepart = $2';
      await db.query(queryUpdateStok, [data.jumlah, data.id_sparepart]);
    }
    await logActivity(
      'CREATE_PEMBELIAN',
      `Pembelian baru dengan ID ${id_pembelian} berhasil disimpan`
    );

    responsePayload(201, 'data berhasil disimpan', pembelianHistory.rows[0], res);
  } catch (err) {
    console.error(err); // Log error untuk debugging
    responsePayload(500, 'gagal menyimpan data', null, res);
  }
});

/* update pembelian */
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body; // Ambil status dari body
  const updated_at = new Date();

  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }

  // Validasi status
  if (!status || (status !== 'Pending' && status !== 'Selesai' && status !== 'Dibatalkan')) {
    responsePayload(400, 'status tidak boleh selain Pending, Selesai, Dibatalkan', null, res);
    return;
  }

  try {
    // Ambil data pembelian lama
    const pembelianLama = await db.query('SELECT * FROM pembelian WHERE id_pembelian = $1', [id]);
    if (pembelianLama.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }

    const statusLama = pembelianLama.rows[0].status; // Ambil status lama

    // Update status pembelian
    const query =
      'UPDATE pembelian SET status = $1, updated_at = $2 WHERE id_pembelian = $3 RETURNING *';
    const values = [status, updated_at, id];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }

    // Update stok sparepart berdasarkan kondisi status
    const id_sparepart = pembelianLama.rows[0].id_sparepart; // Ambil id_sparepart dari data lama
    const jumlah = pembelianLama.rows[0].jumlah; // Ambil jumlah dari data lama

    if (status === 'Selesai' && statusLama !== 'Selesai') {
      // Hanya kurangi stok jika status baru adalah 'Selesai' dan status lama bukan 'Selesai'
      await db.query('UPDATE sparepart SET stok = stok + $1 WHERE id_sparepart = $2', [
        jumlah,
        id_sparepart,
      ]);
    } else if (status === 'Dibatalkan' && statusLama !== 'Dibatalkan') {
      // Hanya tambahkan stok jika status baru adalah 'Dibatalkan' dan status lama bukan 'Dibatalkan'
      await db.query('UPDATE sparepart SET stok = stok - $1 WHERE id_sparepart = $2', [
        jumlah,
        id_sparepart,
      ]);
    }
    await logActivity(
      'UPDATE_PEMBELIAN',
      `Status pembelian dengan ID ${id} berhasil diupdate menjadi ${status}`
    );

    responsePayload(200, 'status berhasil diupdate', result.rows[0], res);
  } catch (err) {
    console.error(err); // Log error untuk debugging
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
    await logActivity('DELETE_PEMBELIAN', `Pembelian dengan ID ${id} berhasil dihapus`);

    responsePayload(200, 'data berhasil dihapus', null, res);
  } catch (err) {
    responsePayload(500, 'gagal menghapus data', null, res);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');

/* get penjualan */
router.get('/', (req, res) => {
  db.query('SELECT * FROM penjualan', (err, result) => {
    if (err) {
      responsePayload(500, 'gagal mengambil data', null, res);
    }
    if (result.rows.length === 0) {
      responsePayload(200, 'data tidak ditemukan', null, res);
      return;
    }
    responsePayload(200, 'data berhasil diambil', result.rows, res);
  });
});

/* post penjualan */
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const id = uuidv4();

    // Validasi input
    if (
      !data ||
      !data.id_sparepart ||
      !data.id_customer ||
      !data.tanggal ||
      !data.jumlah ||
      !data.metode_pembayaran
    ) {
      return responsePayload(400, 'data tidak valid', null, res);
    }
    //validasi id_sparepart
    const sparepart = await db.query('SELECT * FROM sparepart WHERE id_sparepart = $1', [
      data.id_sparepart,
    ]);
    if (!sparepart.rows.length) {
      return responsePayload(404, 'sparepart tidak ditemukan', null, res);
    }
    //validasi id_customer
    const resultCustomer = await db.query('SELECT * FROM customer WHERE id_customer = $1', [
      data.id_customer,
    ]);
    if (!resultCustomer.rows.length) {
      return responsePayload(400, 'customer tidak ditemukan', null, res);
    }
    //validasi metode_pembayaran
    const metodePembayaran = ['Tunai', 'Kredit', 'Transfer'];
    if (!metodePembayaran.includes(data.metode_pembayaran)) {
      return responsePayload(
        400,
        'metode pembayaran harus tunai, kredit, atau transfer',
        null,
        res
      );
    }
    // Ambil harga dan cek stok
    const result = await db.query('SELECT harga, stok FROM sparepart WHERE id_sparepart = $1', [
      data.id_sparepart,
    ]);

    if (!result.rows.length) {
      return responsePayload(404, 'sparepart tidak ditemukan', null, res);
    }

    // Validasi stok
    if (result.rows[0].stok < data.jumlah) {
      return responsePayload(400, 'stok tidak mencukupi', null, res);
    }

    // Hitung total harga
    const total_harga = result.rows[0].harga * data.jumlah;

    // Insert penjualan
    const query = `
        INSERT INTO penjualan (
          id_penjualan, id_sparepart, id_customer, 
          tanggal, jumlah, total_harga, metode_pembayaran, 
          created_at, updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
        RETURNING *
      `;

    const values = [
      id,
      data.id_sparepart,
      data.id_customer,
      data.tanggal,
      data.jumlah,
      total_harga,
      data.metode_pembayaran,
    ];

    const penjualan = await db.query(query, values);

    // Update stok
    await db.query(
      'UPDATE sparepart SET stok = stok - $1, updated_at = CURRENT_TIMESTAMP WHERE id_sparepart = $2',
      [data.jumlah, data.id_sparepart]
    );

    return responsePayload(201, 'data berhasil disimpan', penjualan.rows[0], res);
  } catch (error) {
    console.error('Error:', error);
    return responsePayload(500, 'gagal menyimpan data', null, res);
  }
});

/* get penjualan by id */
router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM penjualan WHERE id_penjualan = $1', [id], (err, result) => {
    if (err) {
      responsePayload(500, 'gagal mengambil data', null, res);
    }
    if (result.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
    }
    responsePayload(200, 'data berhasil diambil', result.rows, res);
  });
});

/* put penjualan */
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    // 1. Get current sale data
    const currentSale = await db.query('SELECT * FROM penjualan WHERE id_penjualan = $1', [id]);
    if (!currentSale.rows.length) {
      return responsePayload(404, 'data tidak ditemukan', null, res);
    }

    // 2. Get sparepart data
    const sparepart = await db.query('SELECT harga, stok FROM sparepart WHERE id_sparepart = $1', [
      data.id_sparepart,
    ]);
    if (!sparepart.rows.length) {
      return responsePayload(404, 'sparepart tidak ditemukan', null, res);
    }

    // 3. Calculate stock changes
    const currentQty = currentSale.rows[0].jumlah;
    const newQty = data.jumlah;
    const stockDiff = currentQty - newQty;
    const newStock = sparepart.rows[0].stok + stockDiff;

    // 4. Validate new stock
    if (newStock < 0) {
      return responsePayload(400, 'stok tidak mencukupi', null, res);
    }

    // 5. Calculate new total
    const total_harga = sparepart.rows[0].harga * newQty;

    // 6. Update penjualan
    const query = `
        UPDATE penjualan 
        SET id_sparepart = $2, 
            id_customer = $3, 
            tanggal = $4, 
            jumlah = $5, 
            total_harga = $6, 
            metode_pembayaran = $7, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id_penjualan = $1 
        RETURNING *
      `;

    const values = [
      id,
      data.id_sparepart,
      data.id_customer,
      data.tanggal,
      newQty,
      total_harga,
      data.metode_pembayaran,
    ];

    // 7. Update sparepart stock
    await db.query(
      'UPDATE sparepart SET stok = $1, updated_at = CURRENT_TIMESTAMP WHERE id_sparepart = $2',
      [newStock, data.id_sparepart]
    );

    const result = await db.query(query, values);
    return responsePayload(200, 'data berhasil diupdate', result.rows[0], res);
  } catch (error) {
    console.error('Error:', error);
    return responsePayload(500, 'gagal mengupdate data', null, res);
  }
});

/* delete penjualan */
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM penjualan WHERE id_penjualan = $1', [id], (err, result) => {
    if (err) {
      responsePayload(500, 'gagal menghapus data', null, res);
    }
    responsePayload(200, 'data berhasil dihapus', null, res);
  });
});

module.exports = router;

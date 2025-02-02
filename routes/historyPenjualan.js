const express = require('express');
const router = express.Router();
const db = require('../connection/connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');
/* get history penjualan */
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM history_penjualan');
    if (result.rows.length === 0) {
      responsePayload(200, 'data tidak ditemukan', null, res);
      return;
    }
    responsePayload(200, 'berhasil mengambil data', result.rows, res);
  } catch (err) {
    responsePayload(500, 'gagal mengambil data', null, res);
  }
});
module.exports = router;

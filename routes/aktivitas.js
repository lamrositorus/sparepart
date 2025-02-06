// routes/aktivitas.js
const express = require('express');
const router = express.Router();
const db = require('../connection/connection');
const responsePayload = require('../payload');

/* Get recent activities */
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM aktivitas ORDER BY waktu DESC LIMIT 10'); // Ambil 10 aktivitas terbaru
    if (result.rows.length === 0) {
      return responsePayload(200, 'Tidak ada aktivitas terbaru', [], res);
    }
    responsePayload(200, 'Aktivitas berhasil diambil', result.rows, res);
  } catch (err) {
    console.error('Error fetching recent activities:', err);
    responsePayload(500, 'Gagal mengambil aktivitas terbaru', null, res);
  }
});

/* Log a new activity */
const logActivity = async (jenis_aktivitas, detail) => {
  const query = 'INSERT INTO aktivitas (jenis_aktivitas, detail) VALUES ($1, $2)';
  const values = [jenis_aktivitas, detail];
  await db.query(query, values);
};
// Ekspor router dan fungsi logActivity
module.exports = {
  router,
  logActivity,
};

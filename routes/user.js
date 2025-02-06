const express = require('express');
const router = express.Router();
const db = require('../connection/connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifikasiToken');
const passport = require('passport');
require('dotenv').config();
const redis = require('../connection/redis');
const redisClient = require('../connection/redis');

const secretKey = process.env.SECRET_KEY;
/* Get users */
// routes/user.js
router.get('/', verifyToken, async (req, res) => {
  // if (req.user.role !== 'Admin') {
  //   return res.status(403).json({ message: 'Anda tidak memiliki akses' });
  // }

  try {
    const result = await db.query('SELECT * FROM "user"');
    if (result.rows.length === 0) {
      return res.status(200).json([]); // Mengembalikan array kosong jika tidak ada data
    }

    return res.status(200).json(result.rows); // Mengembalikan data pengguna
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Route untuk memulai autentikasi Google
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'], // Request akses ke profil dan email
  })
);

// In user.js, update the callback route:
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Redirect with token in Authorization header
    res.redirect(
      `http://localhost:5173/user/login?token=${req.user.token}&id_user=${req.user.id_user}`
    );
  }
);

/* Get user by id */
router.get('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }
  //validasi jika gagal mengambil data
  const result = await db.query('SELECT * FROM "user" WHERE id_user = $1', [id]);
  if (result.rows.length === 0) {
    responsePayload(404, 'data tidak ditemukan', null, res);
    return;
  }
  //cek data apakah ada di redis
  try {
    const result = await db.query('SELECT * FROM "user" WHERE id_user = $1', [id]);
    if (result.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      redisClient.get(id, async (err, data) => {
        if (err) {
          console.error('Error fetching data from Redis:', err);
          responsePayload(500, 'Terjadi kesalahan pada server', null, res);
          return;
        }
        if (data) {
          responsePayload(200, 'data ditemukan', result.rows[0], res);
          redisClient.set(id, JSON.stringify(result.rows[0]));
        }
        console.log('Data tidak ditemukan di Redis');
      });
      return;
    }
    responsePayload(200, 'data ditemukan', result.rows[0], res);
  } catch (error) {
    console.error('Error fetching user:', error);
    responsePayload(500, 'Terjadi kesalahan pada server', null, res);
  }
});
/* Post create user */
router.post('/signup', async (req, res) => {
  const data = req.body;
  const id = uuidv4();
  const created_at = new Date();
  const updated_at = new Date();

  if (!data || !data.username || !data.password || !data.email || !data.role) {
    responsePayload(400, 'data tidak valid', null, res);
    return;
  }
  //validasi username
  const result = await db.query('SELECT * FROM "user" WHERE username = $1', [data.username]);
  if (result.rows.length > 0) {
    responsePayload(400, 'username sudah digunakan', null, res);
    return;
  }
  //validasi email
  const resultEmail = await db.query('SELECT * FROM "user" WHERE email = $1', [data.email]);
  const checkEmail = resultEmail.rows.length > 0;
  if (checkEmail) {
    responsePayload(400, 'email sudah digunakan', null, res);
    return;
  }
  //cek email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    responsePayload(400, 'email tidak valid, abc@example.com', null, res);
    return;
  }
  //validasi password
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(data.password)) {
    responsePayload(
      400,
      'Password harus memiliki minimal 8 karakter, termasuk setidaknya 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter khusus.',
      null,
      res
    );
    return;
  }
  //validasi role
  const role = data.role;
  const validRoles = ['Admin', 'Staff'];
  if (!validRoles.includes(role)) {
    responsePayload(400, 'Role tidak valid, pilih salah satu Admin dan Staff', null, res);
    return;
  }

  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(data.password, saltRounds);
  data.password = hashedPassword;
  // Masukkan ke database
  const query =
    'INSERT INTO "user" (id_user, username, password, email, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)';
  const values = [id, data.username, data.password, data.email, data.role, created_at, updated_at];
  await db.query(query, values); // Hanya menjalankan query tanpa mengharapkan hasil

  // Mengembalikan data yang baru disimpan
  responsePayload(201, 'data berhasil disimpan', { id_user: id, ...data }, res);
});

/* post login */
router.post('/login', async (req, res) => {
  const data = req.body;
  const username = data.username;
  const password = data.password;

  // Validasi input
  if (!username || !password) {
    return responsePayload(400, 'Username dan password tidak boleh kosong', null, res);
  }

  try {
    // Mencari pengguna berdasarkan username
    const result = await db.query('SELECT * FROM "user" WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return responsePayload(400, 'Username tidak ditemukan', null, res);
    }

    const user = result.rows[0]; // Ambil pengguna pertama
    const userPassword = user.password;

    // Validasi password yang di-hash
    const passwordMatch = await bcrypt.compare(password, userPassword);
    console.log('password: ' + passwordMatch);
    if (!passwordMatch) {
      return responsePayload(400, 'Password salah', null, res);
    }
    //validasi

    // Generate token
    const token = jwt.sign({ id: user.id_user }, secretKey, { expiresIn: '1h' });

    // Mengembalikan ID pengguna dan token
    return responsePayload(200, 'Login berhasil', { id: user.id_user, token }, res);
  } catch (error) {
    console.error('Error during login:', error);
    return responsePayload(500, 'Terjadi kesalahan pada server', null, res);
  }
});

/* update user */
router.put('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  const updated_at = new Date();
  if (!id || !data) {
    responsePayload(400, 'id dan data tidak valid', null, res);
    return;
  }

  //updated data
  const query =
    'UPDATE "user" SET username = $1, password = $2, email = $3, role = $4, updated_at = $5 WHERE id_user = $6 RETURNING *';
  const values = [data.username, data.password, data.email, data.role, updated_at, id];
  await db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      responsePayload(500, 'gagal mengupdate data', null, res);
      return;
    }
    if (result.rows.length === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }
    responsePayload(200, 'data berhasil diupdate', result.rows[0], res);
  });
});
/* delete user */
router.delete('/:id', verifyToken, async (req, res) => {
  const id = req.params.id;
  if (!id) {
    responsePayload(400, 'id tidak valid', null, res);
    return;
  }
  try {
    const result = await db.query('DELETE FROM "user" WHERE id_user = $1', [id]);
    if (result.rowCount === 0) {
      responsePayload(404, 'data tidak ditemukan', null, res);
      return;
    }
    responsePayload(200, 'data berhasil dihapus', null, res);
  } catch (err) {
    responsePayload(500, 'gagal menghapus data', null, res);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../connection');
const responsePayload = require('../payload');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifikasiToken');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;
console.log('key saat login: ', secretKey);
/* Get users */
router.get('/', verifyToken, async (req, res) => {
  const result = await db.query('SELECT * FROM "user"');
  if (result.rows.length === 0) {
    responsePayload(200, 'data tidak ditemukan', null, res);
    return;
  }

  responsePayload(200, 'berhasil mengambil data', result.rows, res);
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
  const validRoles = ['Admin', 'User'];
  if (!validRoles.includes(role)) {
    responsePayload(400, 'Role tidak valid, pilih salah satu Admin dan user', null, res);
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

  if (!username || !password) {
    responsePayload(400, 'username dan password tidak boleh kosong', null, res);
    return;
  }

  const result = await db.query('SELECT * FROM "user" WHERE username = $1', [username]);
  if (result.rows.length === 0) {
    responsePayload(400, 'username tidak ditemukan', null, res);
    return;
  }
  const user = result;
  const userPassword = user.rows[0].password;

  //validasi password yang di hash
  const passwordMatch = await bcrypt.compare(password, userPassword);
  if (!passwordMatch) {
    responsePayload(400, 'password salah', null, res);
    return;
  }
  //generate token
  const token = jwt.sign({ id: user.rows[0].id_user }, secretKey, { expiresIn: '1h' });
  responsePayload(200, 'login berhasil', { token }, res);
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

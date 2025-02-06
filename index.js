const express = require('express');
const app = express();
const PORT = 4000;
const cors = require('cors');
const verifyToken = require('./middleware/verifikasiToken');
const session = require('express-session');
const passport = require('passport');
const serverless = require('serverless-http');
require('./oauth/passport');
require('dotenv').config();
//middleware untuk mengizinkan permintaan dari domain yang berbeda
app.use(cors());

//middleware untuk mengurai body permintaan HTTP menjadi objek JavaScript
app.use(express.json());

//import routes
const kategori = require('./routes/kategori');
const pemasok = require('./routes/pemasok');
const sparepart = require('./routes/sparepart');
const pembelian = require('./routes/pembelian');
const customer = require('./routes/customer');
const penjualan = require('./routes/penjualan');
const historyPenjualan = require('./routes/historyPenjualan');
const historyPembelian = require('./routes/historyPembelian');
const exportData = require('./routes/exportData');
const dashboard = require('./routes/Dashboard');
const aktivitas = require('./routes/aktivitas').router;
const user = require('./routes/user');

//insialisasi session dan passport
// Inisialisasi session dan passport
app.use(
  session({
    secret: process.env.SECRET_KEY, // Pastikan SECRET_KEY ada di .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set true jika menggunakan HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());
//use routes
app.use('/kategori', verifyToken, kategori);
app.use('/pemasok', verifyToken, pemasok);
app.use('/sparepart', verifyToken, sparepart);
app.use('/pembelian', verifyToken, pembelian);
app.use('/customer', verifyToken, customer);
app.use('/penjualan', verifyToken, penjualan);
app.use('/historyPenjualan', verifyToken, historyPenjualan);
app.use('/historyPembelian', verifyToken, historyPembelian);
app.use('/export', verifyToken, exportData);
app.use('/dashboard', verifyToken, dashboard);
app.use('/aktivitas', aktivitas);
app.use('/user', user);

app.use((req, res, next) => {
  console.log('Session:', req.session);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

//server tetap berjalan meski terjadi error
process.on('unhandledRejection', (err, promise) => {
  console.log(`Logged Error: ${err}`);
});

process.on('uncaughtException', (err) => {
  console.log(`Logged Error: ${err}`);
});
app.use((err, req, res, next) => {
  console.error('error cuy: ', err.stack);
  res.status(500).send('Something broke!');
});

module.exports = serverless(app);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

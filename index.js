const express = require('express');
const app = express();
const PORT = 4000;
const cors = require('cors');

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
//use routes
app.use('/kategori', kategori);
app.use('/pemasok', pemasok);
app.use('/sparepart', sparepart);
app.use('/pembelian', pembelian);
app.use('/customer', customer);
app.use('/penjualan', penjualan);

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

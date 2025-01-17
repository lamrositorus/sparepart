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
//use routes
app.use('/kategori', kategori);
app.use('/pemasok', pemasok);

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

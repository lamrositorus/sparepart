const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST, // Menggunakan localhost
  port: process.env.DB_PORT, // Port default PostgreSQL lokal
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // SSL dihapus karena localhost biasanya tidak memerlukan SSL
});

// Koneksi ke database
client
  .connect()
  .then(() => console.log('Connected to local PostgreSQL'))
  .catch((err) => console.error('Connection error', err.stack));

module.exports = client;

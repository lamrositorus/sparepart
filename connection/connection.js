const { Client } = require('pg');
require('dotenv').config();
// Gunakan URI Supabase untuk koneksi
const client = new Client({
  connectionString: process.env.DB_URL, // Menggunakan variabel lingkungan
  ssl: {
    rejectUnauthorized: false, // Pastikan SSL diaktifkan untuk koneksi ke Supabase
  },
});

// Koneksi ke database
client.connect()
  .then(() => console.log('Connected to Supabase PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = client;
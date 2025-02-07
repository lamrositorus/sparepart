const { faker } = require('@faker-js/faker');
require('dotenv').config();
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

async function seedPemasok() {
  const pemasokData = [];

  for (let i = 0; i < 100; i++) {
    pemasokData.push({
      id_pemasok: faker.string.uuid(), // Menghasilkan UUID untuk id_pemasok
      nama_pemasok: faker.company.name(), // Menghasilkan nama perusahaan acak
      alamat: faker.location.streetAddress(), // Menghasilkan alamat acak
      telepon: faker.phone.number('###-###-####').slice(0, 15), // Menghasilkan nomor telepon dengan format yang sesuai
      email: faker.internet.email(), // Menghasilkan email acak
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  await knex('pemasok').insert(pemasokData);
  console.log('Data dummy berhasil ditambahkan ke tabel pemasok');
}

seedPemasok()
  .then(() => {
    return knex.destroy(); // Menutup koneksi setelah selesai
  })
  .catch((error) => {
    console.error('Error saat menambahkan data dummy:', error);
    return knex.destroy();
  });

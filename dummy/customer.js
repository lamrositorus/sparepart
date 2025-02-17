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

async function seedCustomer() {
  const customerData = [];

  for (let i = 0; i < 100; i++) {
    customerData.push({
      id_customer: faker.string.uuid(), // Menghasilkan UUID untuk id_customer
      nama_customer: faker.person.fullName(), // Menghasilkan nama pelanggan acak
      alamat: faker.location.streetAddress(), // Menghasilkan alamat acak
      telepon: faker.phone.number('###-###-####').slice(0, 15), // Menghasilkan nomor telepon dengan format yang sesuai
      email: faker.internet.email(), // Menghasilkan email acak
      created_at: new Date(), // Waktu saat data dibuat
      updated_at: new Date(), // Waktu saat data diperbarui
    });
  }

  await knex('customer').insert(customerData);
  console.log('Data dummy berhasil ditambahkan ke tabel customer');
}

seedCustomer()
  .then(() => {
    return knex.destroy(); // Menutup koneksi setelah selesai
  })
  .catch((error) => {
    console.error('Error saat menambahkan data dummy:', error);
    return knex.destroy();
  });

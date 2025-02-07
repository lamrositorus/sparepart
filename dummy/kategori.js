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

// Daftar kategori sparepart mobil
const sparepartCategories = [
  'Rem',
  'Suspensi',
  'Transmisi',
  'Knalpot',
  'Radiator',
  'Filter Udara',
  'Baterai',
  'Lampu Depan',
  'Kaca Spion',
  'Sistem Pendingin',
  'Sistem Pengereman',
  'Sistem Pengapian',
  'Sistem Bahan Bakar',
  'Sistem Elektrik',
  'Body Mobil',
];

async function seedKategori() {
  const kategoriData = new Set(); // Menggunakan Set untuk memastikan kategori unik

  // Ambil kategori unik dari sparepartCategories
  while (kategoriData.size < Math.min(100, sparepartCategories.length)) {
    const randomCategory = faker.helpers.arrayElement(sparepartCategories);
    kategoriData.add(randomCategory);
    console.log('Menambahkan kategori:', randomCategory); // Log kategori yang ditambahkan
  }

  const kategoriArray = Array.from(kategoriData).map((kategori) => ({
    id_kategori: faker.string.uuid(),
    nama_kategori: kategori,
    deskripsi: faker.lorem.sentence(),
    created_at: new Date(),
    updated_at: new Date(),
  }));

  await knex('kategori').insert(kategoriArray);
  console.log('Data dummy berhasil ditambahkan ke tabel kategori');
  return kategoriArray;
}

seedKategori()
  .then(() => {
    return knex.destroy(); // Menutup koneksi setelah selesai
  })
  .catch((error) => {
    console.error('Error saat menambahkan data dummy:', error);
    return knex.destroy();
  });
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

// Daftar nama sparepart berdasarkan kategori dan rentang harga
const sparepartDataByCategory = {
  Rem: {
    names: ['Rem Depan', 'Rem Belakang', 'Kampas Rem', 'Cakram Rem'],
    priceRange: { min: 50000, max: 300000 },
  },
  Suspensi: {
    names: ['Shockbreaker', 'Spring Suspensi', 'Bushing Suspensi'],
    priceRange: { min: 200000, max: 800000 },
  },
  Transmisi: {
    names: ['Transmisi Manual', 'Transmisi Otomatis', 'Kopling'],
    priceRange: { min: 1000000, max: 5000000 },
  },
  Knalpot: {
    names: ['Knalpot Racing', 'Knalpot Standar', 'Muffler'],
    priceRange: { min: 300000, max: 1500000 },
  },
  Radiator: {
    names: ['Radiator Mobil', 'Kipas Radiator', 'Thermostat'],
    priceRange: { min: 150000, max: 600000 },
  },
  'Filter Udara': {
    names: ['Filter Udara Kering', 'Filter Udara Basah'],
    priceRange: { min: 20000, max: 100000 },
  },
  Baterai: {
    names: ['Baterai Mobil', 'Baterai Kering'],
    priceRange: { min: 300000, max: 1200000 },
  },
  'Lampu Depan': {
    names: ['Lampu Depan LED', 'Lampu Depan Halogen'],
    priceRange: { min: 100000, max: 500000 },
  },
  'Kaca Spion': {
    names: ['Kaca Spion Kiri', 'Kaca Spion Kanan'],
    priceRange: { min: 50000, max: 200000 },
  },
  'Sistem Pendingin': {
    names: ['Kompresor AC', 'Kondensor AC'],
    priceRange: { min: 500000, max: 2000000 },
  },
  'Sistem Pengereman': {
    names: ['Master Rem', 'Silinder Rem'],
    priceRange: { min: 100000, max: 500000 },
  },
  'Sistem Pengapian': {
    names: ['Koil Pengapian', 'Busi'],
    priceRange: { min: 20000, max: 150000 },
  },
  'Sistem Bahan Bakar': {
    names: ['Pompa Bahan Bakar', 'Filter Bahan Bakar'],
    priceRange: { min: 100000, max: 400000 },
  },
  'Sistem Elektrik': {
    names: ['Alternator', 'Starter'],
    priceRange: { min: 300000, max: 1500000 },
  },
  'Body Mobil': {
    names: ['Pintu Mobil', 'Kap Mobil'],
    priceRange: { min: 500000, max: 3000000 },
  },
};

async function seedSparepart() {
  // Ambil semua id_kategori dan id_pemasok dari tabel yang relevan
  const kategoriIds = await knex('kategori').pluck('id_kategori');
  const pemasokIds = await knex('pemasok').pluck('id_pemasok');

  const sparepartData = [];

  for (let i = 0; i < 1000; i++) {
    // Pilih kategori acak
    const id_kategori = faker.helpers.arrayElement(kategoriIds);
    const kategori = await knex('kategori').where('id_kategori', id_kategori).first();

    // Tambahkan log untuk memeriksa nama kategori
    console.log('Kategori yang diambil:', kategori.nama_kategori);

    // Ambil data sparepart berdasarkan kategori
    const sparepartDataForCategory = sparepartDataByCategory[kategori.nama_kategori];

    // Validasi untuk memastikan sparepartDataForCategory tidak undefined
    if (!sparepartDataForCategory) {
      console.error(
        `Kategori ${kategori.nama_kategori} tidak ditemukan dalam sparepartDataByCategory.`
      );
      continue; // Lewati iterasi ini jika kategori tidak ditemukan
    }

    const nama_sparepart = faker.helpers.arrayElement(sparepartDataForCategory.names);

    // Menghasilkan harga acak dalam rentang yang ditentukan
    const harga = faker.number.int({
      min: sparepartDataForCategory.priceRange.min,
      max: sparepartDataForCategory.priceRange.max,
    });

    // Menghasilkan margin acak antara 0 dan 1
    const margin = parseFloat(faker.number.float({ min: 0, max: 1, precision: 0.01 }));

    // Menghitung harga jual
    const hargaJual = parseFloat((harga * (1 + margin)).toFixed(0));

    sparepartData.push({
      id_sparepart: faker.string.uuid(), // Menghasilkan UUID untuk id_sparepart
      nama_sparepart: nama_sparepart, // Menggunakan nama sparepart yang sesuai dengan kategori
      harga: harga, // Menggunakan harga yang lebih realistis
      margin: margin, // Menghasilkan margin acak
      harga_jual: hargaJual, // Menghasilkan harga jual berdasarkan harga
      stok: faker.number.int({ min: 1, max: 100 }), // Menghasilkan stok acak, minimal 1
      id_kategori: id_kategori, // Mengambil id_kategori acak
      id_pemasok: faker.helpers.arrayElement(pemasokIds), // Mengambil id_pemasok acak
      deskripsi: faker.lorem.sentence(), // Menghasilkan deskripsi acak
      tanggal_masuk: faker.date.past(), // Menghasilkan tanggal masuk acak
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // Cek apakah ada data yang akan dimasukkan
  if (sparepartData.length > 0) {
    await knex('sparepart').insert(sparepartData);
    console.log('Data dummy berhasil ditambahkan ke tabel sparepart');
  } else {
    console.log('Tidak ada data sparepart yang dihasilkan.');
  }
}

seedSparepart()
  .then(() => {
    return knex.destroy(); // Menutup koneksi setelah selesai
  })
  .catch((error) => {
    console.error('Error saat menambahkan data dummy:', error);
    return knex.destroy();
  });

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

async function seedPembelian() {
  // Fetch existing sparepart and pemasok IDs
  const sparepartIds = await knex('sparepart').pluck('id_sparepart');
  const pemasokIds = await knex('pemasok').pluck('id_pemasok');

  const pembelianData = [];
  const historyPembelianData = [];
  const batchSize = 100; // Define batch size for insertion

  for (let i = 0; i < 1500; i++) {
    const id_pembelian = faker.string.uuid(); // Generate a unique ID for pembelian
    const id_sparepart = faker.helpers.arrayElement(sparepartIds); // Randomly select a sparepart ID
    const id_pemasok = faker.helpers.arrayElement(pemasokIds); // Randomly select a pemasok ID
    const tanggal = faker.date.past(); // Generate a random date in the past
    const jumlah = faker.number.int({ min: 1, max: 10 }); // Random quantity between 1 and 10

    // Fetch sparepart data to calculate total_harga
    const sparepart = await knex('sparepart').where('id_sparepart', id_sparepart).first();
    const total_harga = sparepart.harga * jumlah; // Calculate total price

    // Prepare pembelian data
    pembelianData.push({
      id_pembelian,
      id_sparepart,
      id_pemasok,
      tanggal,
      jumlah,
      total_harga,
      status: faker.helpers.arrayElement(['Pending', 'Selesai', 'Dibatalkan']), // Random status
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Prepare history_pembelian data
    historyPembelianData.push({
      id_history_pembelian: faker.string.uuid(), // Generate a unique ID for history
      id_pembelian,
      id_pemasok,
      id_sparepart,
      jumlah,
      total_harga,
      tanggal,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Insert in batches
    if (pembelianData.length === batchSize) {
      await knex('pembelian').insert(pembelianData);
      await knex('history_pembelian').insert(historyPembelianData);
      console.log(`Inserted ${batchSize} pembelian and history records.`);
      pembelianData.length = 0; // Clear the array
      historyPembelianData.length = 0; // Clear the array
    }
  }

  // Insert any remaining records
  if (pembelianData.length > 0) {
    await knex('pembelian').insert(pembelianData);
    await knex('history_pembelian').insert(historyPembelianData);
    console.log(`Inserted remaining ${pembelianData.length} pembelian and history records.`);
  }

  console.log('Data dummy pembelian dan history berhasil ditambahkan.');
}

seedPembelian()
  .then(() => knex.destroy())
  .catch((error) => {
    console.error('Error saat menambahkan data dummy pembelian:', error);
    return knex.destroy();
  });

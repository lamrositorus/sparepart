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

async function seedPenjualan() {
  // Fetch existing sparepart and customer IDs
  const sparepartIds = await knex('sparepart').pluck('id_sparepart');
  const customerIds = await knex('customer').pluck('id_customer');

  const penjualanData = [];
  const historyPenjualanData = [];
  const batchSize = 100; // Define batch size for insertion

  for (let i = 0; i < 15000; i++) {
    const id_penjualan = faker.string.uuid(); // Generate a unique ID for penjualan
    const id_sparepart = faker.helpers.arrayElement(sparepartIds); // Randomly select a sparepart ID
    const id_customer = faker.helpers.arrayElement(customerIds); // Randomly select a customer ID
    const tanggal = faker.date.past(); // Generate a random date in the past
    const jumlah = faker.number.int({ min: 1, max: 10 }); // Random quantity between 1 and 10
    const metode_pembayaran = faker.helpers.arrayElement(['Tunai', 'Kredit', 'Transfer']); // Random payment method

    // Fetch sparepart data to calculate total_harga and other fields
    const sparepart = await knex('sparepart').where('id_sparepart', id_sparepart).first();
    const total_harga = sparepart.harga_jual * jumlah; // Calculate total price
    const keuntungan_per_unit = sparepart.harga_jual - sparepart.harga; // Calculate profit per unit
    const total_keuntungan = keuntungan_per_unit * jumlah; // Calculate total profit

    // Prepare penjualan data
    penjualanData.push({
      id_penjualan,
      id_sparepart,
      id_customer,
      tanggal,
      jumlah,
      total_harga,
      metode_pembayaran,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Prepare history_penjualan data
    historyPenjualanData.push({
      id_history_penjualan: faker.string.uuid(), // Generate a unique ID for history
      id_penjualan,
      id_customer,
      id_sparepart,
      jumlah,
      harga_beli: sparepart.harga,
      harga_jual: sparepart.harga_jual,
      margin: sparepart.margin,
      keuntungan: total_keuntungan,
      total_harga,
      tanggal,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Insert in batches
    if (penjualanData.length === batchSize) {
      await knex('penjualan').insert(penjualanData);
      await knex('history_penjualan').insert(historyPenjualanData);
      console.log(`Inserted ${batchSize} penjualan and history records.`);
      penjualanData.length = 0; // Clear the array
      historyPenjualanData.length = 0; // Clear the array
    }
  }

  // Insert any remaining records
  if (penjualanData.length > 0) {
    await knex('penjualan').insert(penjualanData);
    await knex('history_penjualan').insert(historyPenjualanData);
    console.log(`Inserted remaining ${penjualanData.length} penjualan and history records.`);
  }

  console.log('Data dummy penjualan dan history berhasil ditambahkan.');
}

seedPenjualan()
  .then(() => knex.destroy())
  .catch((error) => {
    console.error('Error saat menambahkan data dummy penjualan:', error);
    return knex.destroy();
  });

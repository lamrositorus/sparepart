// migrations/xxxx_create_penjualan_table.js
exports.up = function (knex) {
  return knex.schema.createTable('penjualan', function (table) {
    table.string('id_penjualan', 36).primary(); // Menggunakan VARCHAR
    table
      .string('id_sparepart', 36)
      .references('id_sparepart')
      .inTable('sparepart')
      .onDelete('CASCADE');
    table
      .string('id_customer', 36)
      .references('id_customer')
      .inTable('customer')
      .onDelete('CASCADE');
    table.date('tanggal').notNullable();
    table.integer('jumlah').notNullable();
    table.decimal('total_harga', 10, 2).notNullable();
    table.enu('metode_pembayaran', ['Tunai', 'Kredit', 'Transfer']).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // Menetapkan default ke waktu saat ini
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // Menetapkan default ke waktu saat ini
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('penjualan');
};

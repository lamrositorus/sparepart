exports.up = function (knex) {
  return knex.schema.createTable('history_penjualan', function (table) {
    table.string('id_history_penjualan', 36).primary(); // VARCHAR untuk ID, panjang 36 karakter
    table
      .string('id_penjualan', 36)
      .references('id_penjualan')
      .inTable('pembelian')
      .onDelete('CASCADE');
    table
      .string('id_customer', 36)
      .references('id_customer')
      .inTable('customer')
      .onDelete('CASCADE');
    table
      .string('id_sparepart', 36)
      .references('id_sparepart')
      .inTable('sparepart')
      .onDelete('CASCADE');
    table.integer('jumlah').notNullable();
    table.decimal('total_harga', 10, 2).notNullable();
    table.date('tanggal').notNullable();
    table.timestamps(true, true); // created_at dan updated_at
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('history_penjualan');
};

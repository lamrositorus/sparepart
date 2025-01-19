// migrations/xxxx_create_pembelian_table.js
exports.up = function (knex) {
  return knex.schema.createTable('pembelian', function (table) {
    table.string('id_pembelian', 36).primary(); // Menggunakan VARCHAR
    table
      .string('id_sparepart', 36)
      .references('id_sparepart')
      .inTable('sparepart')
      .onDelete('CASCADE');
    table.string('id_pemasok', 36).references('id_pemasok').inTable('pemasok').onDelete('CASCADE');
    table.date('tanggal').notNullable();
    table.integer('jumlah').notNullable();
    table.decimal('total_harga', 10, 2).notNullable();
    table.enu('status', ['Pending', 'Selesai', 'Dibatalkan']).defaultTo('Pending');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('pembelian');
};

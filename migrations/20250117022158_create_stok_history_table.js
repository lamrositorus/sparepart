// migrations/xxxx_create_stok_history_table.js
exports.up = function (knex) {
  return knex.schema.createTable('stok_history', function (table) {
    table.string('id_stok_history', 36).primary();
    table
      .string('id_sparepart', 36)
      .unsigned()
      .references('id_sparepart')
      .inTable('sparepart')
      .onDelete('CASCADE');
    table.integer('jumlah').notNullable();
    table.date('tanggal').notNullable();
    table.enu('tipe', ['Masuk', 'Keluar']).notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('stok_history');
};

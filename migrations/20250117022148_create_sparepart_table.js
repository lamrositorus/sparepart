// migrations/xxxx_create_sparepart_table.js
exports.up = function (knex) {
  return knex.schema.createTable('sparepart', function (table) {
    table.string('id_sparepart', 36).primary(); // Menggunakan VARCHAR
    table.string('nama_sparepart', 100).notNullable();
    table.decimal('harga', 10, 2).notNullable();
    table.integer('stok').notNullable();
    table
      .string('id_kategori', 36)
      .references('id_kategori')
      .inTable('kategori')
      .onDelete('CASCADE');
    table.string('id_pemasok', 36).references('id_pemasok').inTable('pemasok').onDelete('CASCADE');
    table.text('deskripsi').nullable();
    table.date('tanggal_masuk').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('sparepart');
};

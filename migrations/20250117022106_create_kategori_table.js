// migrations/xxxx_create_kategori_table.js
exports.up = function (knex) {
  return knex.schema.createTable('kategori', function (table) {
    table.string('id_kategori', 36).primary(); // Menggunakan VARCHAR
    table.string('nama_kategori', 100).notNullable();
    table.text('deskripsi').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('kategori');
};

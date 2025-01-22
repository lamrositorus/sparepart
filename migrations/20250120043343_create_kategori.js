// migrations/xxxx_create_kategori_table.js
exports.up = function (knex) {
  return knex.schema.createTable('kategori', function (table) {
    table.string('id_kategori', 36).primary(); // Menggunakan VARCHAR
    table.string('nama_kategori', 100).notNullable();
    table.text('deskripsi').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // Menetapkan default ke waktu saat ini
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // Menetapkan default ke waktu saat ini
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('kategori');
};

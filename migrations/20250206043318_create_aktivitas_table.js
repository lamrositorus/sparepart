// migrations/xxxx_create_aktivitas_table.js
exports.up = function (knex) {
  return knex.schema.createTable('aktivitas', function (table) {
    table.increments('id').primary(); // Kolom id sebagai primary key dengan auto-increment
    table.string('jenis_aktivitas', 50).notNullable(); // Kolom untuk jenis aktivitas
    table.text('detail').nullable(); // Kolom untuk detail aktivitas
    table.timestamp('waktu').defaultTo(knex.fn.now()).notNullable(); // Kolom untuk waktu, default ke waktu saat ini
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('aktivitas'); // Menghapus tabel jika ada
};

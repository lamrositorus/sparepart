// migrations/xxxx_create_customer_table.js
exports.up = function (knex) {
  return knex.schema.createTable('customer', function (table) {
    table.string('id_customer', 36).primary(); // Menggunakan VARCHAR
    table.string('nama_customer', 100).notNullable();
    table.string('alamat', 255).nullable();
    table.string('telepon', 15).nullable();
    table.string('email', 100).nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('customer');
};

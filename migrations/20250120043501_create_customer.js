// migrations/xxxx_create_customer_table.js
exports.up = function (knex) {
  return knex.schema.createTable('customer', function (table) {
    table.string('id_customer', 36).primary(); // Menggunakan VARCHAR
    table.string('nama_customer', 100).notNullable();
    table.string('alamat', 255).nullable();
    table.string('telepon', 15).nullable();
    table.string('email', 100).nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // Menetapkan default ke waktu saat ini
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // Menetapkan default ke waktu saat ini
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('customer');
};

// migrations/xxxx_create_user_table.js
exports.up = function (knex) {
  return knex.schema.createTable('user', function (table) {
    table.string('id_user', 36).primary();
    table.string('google_id', 36).primary();
    table.string('profile_picture', 255).nullable();
    table.string('username', 100).notNullable().unique();
    table.string('password', 255).nullable(); // Mengizinkan null
    table.string('email', 100).notNullable().unique();
    table.enu('role', ['Admin', 'Staff']).defaultTo('Staff');
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // Menetapkan default ke waktu saat ini
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // Menetapkan default ke waktu saat ini
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('user');
};

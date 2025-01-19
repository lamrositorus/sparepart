// migrations/xxxx_create_user_table.js
exports.up = function (knex) {
  return knex.schema.createTable('user', function (table) {
    table.increments('id_user').primary();
    table.string('username', 100).notNullable().unique();
    table.string('password', 255).notNullable();
    table.string('email', 100).notNullable().unique();
    table.enu('role', ['Admin', 'User ']).defaultTo('User ');
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('user');
};

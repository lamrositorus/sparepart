exports.up = function (knex) {
  return knex.schema.createTable('history_pembelian', function (table) {
    table.string('id_history_pembelian', 36).primary(); // VARCHAR untuk ID, panjang 36 karakter
    table
      .string('id_pembelian', 36)
      .references('id_pembelian')
      .inTable('pembelian')
      .onDelete('CASCADE');
    table.string('id_pemasok', 36).references('id_pemasok').inTable('pemasok').onDelete('CASCADE');
    table
      .string('id_sparepart', 36)
      .references('id_sparepart')
      .inTable('sparepart')
      .onDelete('CASCADE');
    table.integer('jumlah').notNullable();
    table.decimal('total_harga', 10, 2).notNullable();
    table.date('tanggal').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // Menetapkan default ke waktu saat ini
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // Menetapkan default ke waktu saat ini
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('history_pembelian');
};

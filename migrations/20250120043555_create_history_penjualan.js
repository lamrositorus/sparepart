// migrations/xxxx_create_history_penjualan_table.js
exports.up = function (knex) {
  return knex.schema.createTable('history_penjualan', function (table) {
    table.string('id_history_penjualan', 36).primary(); // ID unik untuk riwayat penjualan
    table
      .string('id_penjualan', 36)
      .references('id_penjualan')
      .inTable('penjualan')
      .onDelete('CASCADE'); // Referensi ke penjualan
    table
      .string('id_customer', 36)
      .references('id_customer')
      .inTable('customer')
      .onDelete('CASCADE'); // Referensi ke customer
    table
      .string('id_sparepart', 36)
      .references('id_sparepart')
      .inTable('sparepart')
      .onDelete('CASCADE'); // Referensi ke sparepart
    table.integer('jumlah').notNullable(); // Jumlah yang terjual
    table.decimal('harga_beli', 10, 2).notNullable(); // Harga beli per unit
    table.decimal('harga_jual', 10, 2).notNullable(); // Harga jual per unit
    table.decimal('margin', 5, 2).notNullable(); // Margin keuntungan
    table.decimal('keuntungan', 10, 2).notNullable(); // Total keuntungan
    table.decimal('total_harga', 10, 2).notNullable(); // Total harga penjualan
    table.timestamp('tanggal').defaultTo(knex.fn.now()).notNullable(); // Tanggal transaksi
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // Waktu pembuatan
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // Waktu pembaruan
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('history_penjualan');
};

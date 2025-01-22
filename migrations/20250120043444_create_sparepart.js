// migrations/xxxx_create_sparepart_table.js
exports.up = function (knex) {
  return knex.schema.createTable('sparepart', function (table) {
    table.string('id_sparepart', 36).primary(); // ID unik untuk sparepart
    table.string('nama_sparepart', 100).notNullable(); // Nama sparepart
    table.decimal('harga', 10, 2).notNullable(); // Harga beli per unit
    table.decimal('margin', 5, 2).notNullable().defaultTo(0); // Margin keuntungan
    table.decimal('harga_jual', 10, 2).notNullable(); // Harga jual per unit
    table.integer('stok').notNullable(); // Jumlah stok yang tersedia
    table
      .string('id_kategori', 36)
      .references('id_kategori')
      .inTable('kategori')
      .onDelete('CASCADE'); // Kategori sparepart
    table.string('id_pemasok', 36).references('id_pemasok').inTable('pemasok').onDelete('CASCADE'); // Pemasok sparepart
    table.text('deskripsi').nullable(); // Deskripsi sparepart
    table.date('tanggal_masuk').nullable(); // Tanggal masuknya sparepart
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // Waktu pembuatan
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // Waktu pembaruan
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('sparepart');
};

exports.up = function (knex) {
  return knex.schema.createTable('pembelian', function (table) {
    table.string('id_pembelian', 36).primary(); // Menggunakan VARCHAR untuk ID
    table
      .string('id_sparepart', 36)
      .references('id_sparepart')
      .inTable('sparepart')
      .onDelete('CASCADE'); // Mengatur foreign key ke tabel sparepart
    table.string('id_pemasok', 36).references('id_pemasok').inTable('pemasok').onDelete('CASCADE'); // Mengatur foreign key ke tabel pemasok
    table.date('tanggal').notNullable(); // Tanggal pembelian
    table.integer('jumlah').notNullable(); // Jumlah pembelian
    table.decimal('total_harga', 10, 2).notNullable(); // Total harga
    table.enu('status', ['Pending', 'Selesai', 'Dibatalkan']).notNullable(); // Status pembelian
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // Waktu dibuat
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // Waktu diperbarui
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('pembelian'); // Menghapus tabel jika rollback
};

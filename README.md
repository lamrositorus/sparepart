# Sparepart Management System - README

This project is a migration setup for a Sparepart Management System using Express.js, Knex.js, and PostgreSQL. The system manages various entities such as spare parts, suppliers, customers, and sales/purchase histories.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Migrations Explanation](#migrations-explanation)
5. [Database Connection](#database-connection)
6. [Support](#support)

## Prerequisites
1. **Node.js** (v14 or later)
2. **PostgreSQL** (Installed and running)
3. **Knex.js** (Installed via npm)
4. **Express.js** (Installed via npm)

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a new PostgreSQL database:
    ```sql
    CREATE DATABASE sparepart;
    ```

4. Configure the PostgreSQL database connection in `knexfile.js` and `db.js`.

5. Run the migrations:
    ```bash
    npx knex migrate:latest
    ```

## Usage

### Running the Application
1. Start the Express server:
    ```bash
    npm start
    ```

2. The application will be accessible at `http://localhost:3000` (default port). Update the port in the `app.js` file if needed.

3. Use a database client (e.g., pgAdmin or DBeaver) to interact with the database or access the API endpoints.

### Sample API Endpoints
- **List all spare parts:**
    ```http
    GET /api/spareparts
    ```
- **Add a new spare part:**
    ```http
    POST /api/spareparts
    ```
    **Body:**
    ```json
    {
      "nama_sparepart": "Example Sparepart",
      "harga": 10000,
      "margin": 2000,
      "harga_jual": 12000,
      "stok": 50
    }
    ```
- **Update stock:**
    ```http
    PUT /api/spareparts/:id
    ```
- **Delete a spare part:**
    ```http
    DELETE /api/spareparts/:id
    ```

## Migrations Explanation

### 1. `history_pembelian`
- **Purpose**: Tracks purchase history of spare parts.
- **Columns**:
  - `id_history_pembelian`: Primary key.
  - `id_pembelian`: Foreign key referencing the `pembelian` table.
  - `id_pemasok`: Foreign key referencing the `pemasok` table.
  - `id_sparepart`: Foreign key referencing the `sparepart` table.
  - `jumlah`: Quantity purchased.
  - `total_harga`: Total purchase amount.
  - `tanggal`: Date of purchase.

### 2. `history_penjualan`
- **Purpose**: Tracks sales history of spare parts.
- **Columns**:
  - `id_history_penjualan`: Primary key.
  - `id_penjualan`: Foreign key referencing the `penjualan` table.
  - `id_customer`: Foreign key referencing the `customer` table.
  - `id_sparepart`: Foreign key referencing the `sparepart` table.
  - `jumlah`: Quantity sold.
  - `harga_beli`: Purchase price per unit.
  - `harga_jual`: Sale price per unit.
  - `margin`: Profit margin per unit.
  - `keuntungan`: Total profit.
  - `total_harga`: Total sale amount.

### 3. `user`
- **Purpose**: Manages application users.
- **Columns**:
  - `id_user`: Primary key.
  - `username`: Unique username.
  - `password`: Encrypted user password.
  - `email`: Unique user email.
  - `role`: Role of the user (Admin or Staff).

### 4. `penjualan`
- **Purpose**: Records sales transactions.
- **Columns**:
  - `id_penjualan`: Primary key.
  - `id_sparepart`: Foreign key referencing the `sparepart` table.
  - `id_customer`: Foreign key referencing the `customer` table.
  - `tanggal`: Sale date.
  - `jumlah`: Quantity sold.
  - `total_harga`: Total sale amount.
  - `metode_pembayaran`: Payment method (Cash, Credit, or Transfer).

### 5. `pembelian`
- **Purpose**: Records purchase transactions.
- **Columns**:
  - `id_pembelian`: Primary key.
  - `id_sparepart`: Foreign key referencing the `sparepart` table.
  - `id_pemasok`: Foreign key referencing the `pemasok` table.
  - `tanggal`: Purchase date.
  - `jumlah`: Quantity purchased.
  - `total_harga`: Total purchase amount.
  - `status`: Purchase status (Pending, Completed, or Cancelled).

### 6. `customer`
- **Purpose**: Manages customer data.
- **Columns**:
  - `id_customer`: Primary key.
  - `nama_customer`: Customer name.
  - `alamat`: Customer address.
  - `telepon`: Customer phone number.
  - `email`: Customer email.

### 7. `sparepart`
- **Purpose**: Stores spare part information.
- **Columns**:
  - `id_sparepart`: Primary key.
  - `nama_sparepart`: Spare part name.
  - `harga`: Purchase price per unit.
  - `margin`: Profit margin per unit.
  - `harga_jual`: Sale price per unit.
  - `stok`: Quantity in stock.

### 8. `pemasok`
- **Purpose**: Manages supplier data.
- **Columns**:
  - `id_pemasok`: Primary key.
  - `nama_pemasok`: Supplier name.
  - `alamat`: Supplier address.
  - `telepon`: Supplier phone number.
  - `email`: Supplier email.

### 9. `kategori`
- **Purpose**: Categorizes spare parts.
- **Columns**:
  - `id_kategori`: Primary key.
  - `nama_kategori`: Category name.
  - `deskripsi`: Category description.

## Database Connection

Located in the `db.js` file:
```javascript
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sparepart',
  password: 'admin',
  port: 5432,
});

client.connect();

module.exports = client;
```

Replace the connection parameters with your PostgreSQL configuration.

## Support

For further support, contact the project maintainers at [support@example.com](mailto:support@example.com).

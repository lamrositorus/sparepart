const request = require('supertest');
const app = require('../index');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;
const token = jwt.sign({ id: 'user_id', role: 'Admin' }, secretKey);

//dapetin id pemasok
let testPemasokId = 'c2e739e6-7c45-4e8c-ba51-7de61a32da32';
let idPemasok = 'b8ed03b0-88a0-4e75-9af6-2f978af56338';

describe('GET /pemasok', () => {
  //uji jika gagal mengambil data
  it('should return 200 if data is empty', async () => {
    const response = await request(app).get('/pemasok').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
  //uji jika berhasil mengambil data
  it('should return 200 if data is found', async () => {
    const response = await request(app).get('/pemasok').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});

describe('GET /pemasok/:id', () => {
  //uji jika gagal mengambil data
  it('should return 404 if data is not found', async () => {
    const response = await request(app).get('/pemasok/1').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(404);
  });
  //uji jika berhasil mengambil data
  it('should return 200 if data is found', async () => {
    const response = await request(app)
      .get(`/pemasok/${testPemasokId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});

describe('PUT /pemasok/:id', () => {
  //uji jika gagal mengubah data

  it('should return 404 if data is not found', async () => {
    const response = await request(app)
      .put(`/pemasok/asdas`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama_pemasok: 'Pemasok Baru',
        alamat: 'Jl. Baru',
        telepon: '08123456789',
        email: 'pemasokbaru@example.com',
      });
    expect(response.status).toBe(404);
  });

  //uji jika pemasok sudah ada
  it('should return 400 if pemasok is already used', async () => {
    const response = await request(app)
      .put(`/pemasok/${testPemasokId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama_pemasok: 'Pemasok Baru',
        alamat: 'Jl. Baru',
        telepon: '08123456789',
        email: 'pemasokbaru@example.com',
      });
    expect(response.status).toBe(400);
  });

  //uji nama pemasok harus berupa string
  it('should return 400 if nama pemasok is not a string', async () => {
    const response = await request(app)
      .put(`/pemasok/${testPemasokId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama_pemasok: 123,
        alamat: 'Jl. Baru',
        telepon: '08123456789',
        email: 'pemasokbaru@example.com',
      });
    expect(response.status).toBe(400);
  });

  //uji format telepon harus berupa angka
  it('should return 400 if telepon is not a number', async () => {
    const response = await request(app)
      .put(`/pemasok/${testPemasokId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama_pemasok: 'Pemasok Baru',
        alamat: 'Jl. Baru',
        telepon: 'abc',
        email: 'pemasokbaru@example.com',
      });
    expect(response.status).toBe(400);
  });

  //uji panjang telepon harus 12 digit
  it('should return 400 if telepon is not 10 digits', async () => {
    const response = await request(app)
      .put(`/pemasok/${testPemasokId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama_pemasok: 'Pemasok Baru',
        alamat: 'Jl. Baru',
        telepon: '0812345678',
        email: 'pemasokbaru@example.com',
      });
    expect(response.status).toBe(400);
  });

  //uji format email
  it('should return 400 if email is not valid', async () => {
    const response = await request(app)
      .put(`/pemasok/${testPemasokId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama_pemasok: 'Pemasok Baru',
        alamat: 'Jl. Baru',
        telepon: '08123456789',
        email: 'pemasokbaru',
      });
    expect(response.status).toBe(400);
  });

  //uji jika berhasil mengubah data
  it('should return 200 if data is updated', async () => {
    const response = await request(app)
      .put(`/pemasok/${idPemasok}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama_pemasok: 'yang baru',
        alamat: 'Jl. Baru',
        telepon: '08123456789',
        email: 'pemasokbaru@example.com',
      });
    console.log(response.body);
    expect(response.status).toBe(200);
  });
});

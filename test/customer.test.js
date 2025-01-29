const request = require('supertest');
const app = require('../index');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;

const token = jwt.sign({ id: 'user_id', role: 'Admin' }, secretKey);

describe('POST /customer', () => {
  // Uji jika data tidak valid
  it('should return 400 if data is invalid', async () => {
    const response = await request(app)
      .post('/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama: '',
        alamat: '',
        no_telp: '',
        email: '',
      });
    expect(response.status).toBe(400);
  });

  //uji validasi nama
  it('should return 400 if nama customer is less than 3 characters', async () => {
    const response = await request(app)
      .post('/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama: 'Te',
        alamat: 'Test Alamat',
        no_telp: '08123456789',
        email: 'testcustomer@example.com',
      });
    expect(response.status).toBe(400);
  });

  //uji validasi email
  it('should return 400 if email is invalid', async () => {
    const response = await request(app)
      .post('/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama: 'Test Customer',
        alamat: 'Test Alamat',
        no_telp: '08123456789',
        email: 'invalidemail',
      });
    expect(response.status).toBe(400);
  });
  //uji validasi alamat
  it('should return 400 if alamat is less than 5 characters', async () => {
    const response = await request(app)
      .post('/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama: 'Test Customer',
        alamat: 'Te',
        no_telp: '08123456789',
        email: 'testcustomer@example.com',
      });
    expect(response.status).toBe(400);
  });

  //uji validasi no_telp
  it('should return 400 if no_telp is less than 10 characters', async () => {
    const response = await request(app)
      .post('/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama: 'Test Customer',
        alamat: 'Test Alamat',
        no_telp: '0812345678',
        email: 'testcustomer@example.com',
      });
    expect(response.status).toBe(400);
  });

  // Uji jika customer berhasil ditambahkan tanpa token permission
  it('should return 403 if customer is added successfully without token permission', async () => {
    const response = await request(app).post('/customer').send({
      nama_customer: 'Test Customer',
      alamat: 'Test Alamat',
      telepon: '08123456789',
      email: 'testcustomer@example.com',
    });
    expect(response.status).toBe(401); // Pastikan ini sesuai dengan logika di endpoint
  });

  // Uji jika customer berhasil ditambahkan
  it('should return 200 if customer is added successfully', async () => {
    const response = await request(app)
      .post('/customer')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nama_customer: 'Test Customer',
        alamat: 'Test Alamat',
        telepon: '08123456789',
        email: 'testcustomer@example.com',
      });
    expect(response.status).toBe(200);
  });
});

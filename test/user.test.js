const request = require('supertest');
const app = require('../index'); // Impor aplikasi dari index.js
const db = require('../connection/connection');
const jwt = require('jsonwebtoken');

describe('GET /user', () => {
  // Uji jika pengguna bukan Admin
  it('should return 403 if user is not an Admin', async () => {
    // Buat token untuk pengguna yang bukan Admin
    const token = jwt.sign({ id: 'user_id', role: 'User ' }, process.env.SECRET_KEY);

    const response = await request(app).get('/user').set('Authorization', `Bearer ${token}`); // Set token di header

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'Anda tidak memiliki akses');
  });

  // Uji jika pengguna adalah Admin
  it('should return 200 if data is found and user is Admin', async () => {
    // Buat token untuk pengguna yang adalah Admin
    const token = jwt.sign({ id: 'admin_id', role: 'Admin' }, process.env.SECRET_KEY);

    // Pastikan ada data di database untuk pengujian ini
    const response = await request(app).get('/user').set('Authorization', `Bearer ${token}`); // Set token di header

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array); // Memeriksa apakah respons adalah array
  });
});
describe('POST /user/login', () => {
  // Uji jika username dan password tidak ada
  it('should return 400 if username or password is missing', async () => {
    const response = await request(app).post('/user/login').send({
      username: '',
      password: '',
    });
    expect(response.status).toBe(400);
  });
  // Uji jika username dan password valid
  it('should return 200 if username and password are valid', async () => {
    const response = await request(app).post('/user/login').send({
      username: 'lamro',
      password: 'Password!1',
    });
    expect(response.status).toBe(200);
  });
  // Uji jika username tidak valid
  it('should return 400 if password is incorrect', async () => {
    const response = await request(app).post('/user/login').send({
      username: 'lamro',
      password: 'Password!2',
    });
    expect(response.status).toBe(400);
  });
});

/* test untuk signup */
describe('POST /user/signup', () => {
  // Uji jika data tidak valid
  it('should return 400 if data is invalid', async () => {
    const response = await request(app).post('/user/signup').send({
      username: 'lamro',
      password: 'Password!1',
      email: 'lamro@gmail.com',
      role: 'Admin',
    });
    expect(response.status).toBe(400);
  });
  // Uji jika username sudah digunakan
  it('should return 400 if username is already used', async () => {
    const response = await request(app).post('/user/signup').send({
      username: 'lamro',
      password: 'Password!1',
      email: 'lamro@gmail.com',
      role: 'Admin',
    });
    expect(response.status).toBe(400);
  });
  // Uji jika email sudah digunakan
  it('should return 400 if email is already used', async () => {
    const response = await request(app).post('/user/signup').send({
      username: 'lamro1',
      password: 'Password!1',
      email: 'lamro@gmail.com',
      role: 'Admin',
    });
    expect(response.status).toBe(400);
  });
  // Uji jika email tidak valid
  it('should return 400 if email is invalid', async () => {
    const response = await request(app).post('/user/signup').send({
      username: 'lamro1',
      password: 'Password!1',
      email: 'lamro',
      role: 'Admin',
    });
    expect(response.status).toBe(400);
  });

  //uji password tidak valid (kurang dari 8 karakter)
  it('should return 400 if password is invalid', async () => {
    const response = await request(app).post('/user/signup').send({
      username: 'lamro1',
      password: 'Pass!1',
      email: 'lamro1@gmail.com',
      role: ' Admin',
    });
    expect(response.status).toBe(400);
  });

  //uji role tidak valid
  it('should return 400 if role is invalid', async () => {
    const response = await request(app).post('/user/signup').send({
      username: 'lamro1',
      password: 'Password!1',
      email: 'lamro1@gmail.com',
      role: 'User',
    });
    expect(response.status).toBe(400);
  });
});

// connection/redis.js
const redis = require('redis');

// Buat koneksi ke Redis
const redisClient = redis.createClient({
  host: 'localhost', // Host Redis
  port: 6379, // Port Redis
});

// Handle error koneksi
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// Export Redis client
module.exports = redisClient;

const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  console.log('Received token:', token); // Log token yang diterima
  console.log('Secret Key:', secretKey); // Log secret key
  if (!token) {
    return res.status(400).json({ message: 'token tidak ditemukan' });
  }
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;

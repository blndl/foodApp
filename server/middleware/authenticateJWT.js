const jwt = require('jsonwebtoken');
const { loadKeys } = require('../utils/loadKeys');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ message: 'No token' });

  const keys = loadKeys();

  if (!keys || !keys.accessKey) {
    return res.status(503).json({ message: 'Server not ready — keys not loaded' });
  }

  jwt.verify(token, keys.accessKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

module.exports = authenticateJWT;

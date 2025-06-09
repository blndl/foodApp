const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/password');
const { loadKeys } = require('../utils/loadKeys');

console.log('🔍 hashPassword:', typeof hashPassword);
console.log('🔍 comparePassword:', typeof comparePassword);
console.log('🔍 loadKeys:', typeof loadKeys);

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  try {
    const existing = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await hashPassword(password);
    await db.none('INSERT INTO users(email, password) VALUES($1, $2)', [email, hashed]);

    res.status(201).json({ message: 'User created' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Signup error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid password' });

    const keys = loadKeys();
    const accessToken = jwt.sign({ id: user.id }, keys.accessKey, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id }, keys.refreshKey, { expiresIn: '7d' });

    res.json({ accessToken, refreshToken, userId: user.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Login error' });
  }
});


router.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  const keys = loadKeys();

  try {
    const decoded = jwt.verify(refreshToken, keys.refreshKey);

    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      keys.accessKey,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      keys.refreshKey,
      { expiresIn: '7d' }
    );

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

router.get('/test', (req, res) => {
    res.send('Auth route is working!');
  });

module.exports = router;

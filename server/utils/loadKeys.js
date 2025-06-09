const fs = require('fs');
const path = require('path');

function loadKeys() {
  const secretPath = path.resolve(__dirname, '../keys.json');
  try {
    const raw = fs.readFileSync(secretPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Warning: JWT keys not found yet.');
    return null;
  }
}

module.exports = { loadKeys };
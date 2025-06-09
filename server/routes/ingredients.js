const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await db.any('SELECT * FROM ingredients ORDER BY food_label');
    res.status(200).json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ message: 'Failed to fetch ingredients' });
  }
});

console.log('✅ Inside ingredients.js before export');
console.log('🧪 typeof router:', typeof router);
console.log('🧪 router keys:', Object.keys(router));
module.exports = router;


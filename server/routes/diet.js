const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateJWT = require('../middleware/authenticateJWT');

router.post('/eatmeal', authenticateJWT, async (req, res) => {
  const { profileId, mealId } = req.body;

  if (!profileId || !mealId) {
    return res.status(400).json({ message: 'Missing profileId or mealId' });
  }

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;

  try {
    await db.none(
      `
      INSERT INTO meals_eaten ("profileId", "mealId", day, month)
      VALUES ($1, $2, $3, $4)
      `,
      [profileId, mealId, day, month]
    );

    res.status(201).json({ message: 'Meal successfully logged as eaten' });
  } catch (err) {
    console.error('Error logging eaten meal:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/mealseaten/:profileId/:day/:month', authenticateJWT, async (req, res) => {
    const { profileId, day, month } = req.params;
  
    try {
      const rows = await db.any(
        `
        SELECT
          me."mealId",
          m.name AS meal_name,
          i.id AS ingredient_id,
          i.food_label,
          mi.quantity,
          i.proteines_g,
          i.glucides_g,
          i.lipides_g,
          i.nrj_kj
        FROM meals_eaten me
        JOIN meals m ON m.id = me."mealId"
        JOIN meal_ingredients mi ON mi."mealId" = me."mealId"
        JOIN ingredients i ON i.id = mi."ingredientId"
        WHERE me."profileId" = $1 AND me.day = $2 AND me.month = $3
        ORDER BY me.eaten_at DESC
        `,
        [profileId, day, month]
      );
  
      // Group by meal
      const mealMap = new Map();
      rows.forEach(row => {
        if (!mealMap.has(row.mealId)) {
          mealMap.set(row.mealId, {
            mealId: row.mealId,
            meal_name: row.meal_name,
            ingredients: [],
          });
        }
  
        mealMap.get(row.mealId).ingredients.push({
          id: row.ingredient_id,
          food_label: row.food_label,
          quantity: row.quantity,
          proteines_g: row.proteines_g,
          glucides_g: row.glucides_g,
          lipides_g: row.lipides_g,
          nrj_kj: row.nrj_kj,
        });
      });
  
      const meals = Array.from(mealMap.values());
  
      res.status(200).json(meals);
    } catch (err) {
      console.error('Error fetching eaten meals:', err);
      res.status(500).json({ message: 'Failed to fetch meals eaten' });
    }
  });
  

module.exports = router;

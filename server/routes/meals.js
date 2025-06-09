const express = require('express');
const router = express.Router();
const db = require('../db');
const authenticateJWT = require('../middleware/authenticateJWT');

router.post('/meals', authenticateJWT, async (req, res) => {
  const { name, profileId, ingredients } = req.body;

  if (!name || !profileId || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (ingredients.length > 10) {
    return res.status(400).json({ message: 'Max 10 ingredients allowed' });
  }

  try {
    await db.tx(async t => {
      const meal = await t.one(
        `INSERT INTO meals ("profileId", name) VALUES ($1, $2) RETURNING id`,
        [profileId, name]
      );

      const insertPromises = ingredients.map(({ ingredientId, quantity }) =>
        t.none(
          `INSERT INTO meal_ingredients ("mealId", "ingredientId", quantity)
           VALUES ($1, $2, $3)`,
          [meal.id, ingredientId, quantity]
        )
      );

      await Promise.all(insertPromises);
    });

    res.status(201).json({ message: 'Meal created successfully' });
  } catch (error) {
    console.error('Error creating meal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/listmeals', async (req, res) => {
  try {
    const results = await db.any(`
      SELECT 
      m.id AS meal_id,
      m.name AS meal_name,
      m."profileId",
      p."profileName",
      i.id AS ingredient_id,
      i.food_label,
      mi.quantity,
      i.proteines_g,
      i.glucides_g,
      i.lipides_g,
      i.nrj_kj,
      ROUND((i.proteines_g * mi.quantity / 100)::numeric, 2) AS proteines_total,
      ROUND((i.glucides_g * mi.quantity / 100)::numeric, 2) AS glucides_total,
      ROUND((i.lipides_g * mi.quantity / 100)::numeric, 2) AS lipides_total,
      ROUND((i.nrj_kj * mi.quantity / 100)::numeric, 2) AS energy_total_kj
      FROM meals m
      JOIN profiles p ON m."profileId" = p.id
      JOIN meal_ingredients mi ON m.id = mi."mealId"
      JOIN ingredients i ON mi."ingredientId" = i.id
      ORDER BY m.id DESC, i.food_label;
    `);
    res.json(results);

  } catch (err) {
    console.error('Error fetching detailed nutrition:', err);
    res.status(500).json({ message: 'Failed to retrieve detailed meal data' });
  }
});
router.get('/showmealsby/:profileId', authenticateJWT, async (req, res) => {
    const profileId = req.params.profileId;
  
    try {
      const meals = await db.any(`
        SELECT id, "profileId", name FROM meals WHERE "profileId" = $1
      `, [profileId]);
  
      if (meals.length === 0) {
        return res.status(404).json({ message: 'No meals found for this profile' });
      }
  
      const mealsWithIngredients = await Promise.all(meals.map(async (meal) => {
        const ingredients = await db.any(`
          SELECT mi."ingredientId", mi.quantity, i.food_label
          FROM meal_ingredients mi
          JOIN ingredients i ON mi."ingredientId" = i.id
          WHERE mi."mealId" = $1
        `, [meal.id]);
  
        return {
          id: meal.id,
          profileId: meal.profileId,
          name: meal.name,
          ingredients: ingredients.map(i => ({
            ingredientId: i.ingredientId,
            quantity: i.quantity,
            food_label: i.food_label,
          })),
        };
      }));
  
      res.json(mealsWithIngredients);
    } catch (err) {
      console.error('Error fetching meals by profileId:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
router.get('/showmealby/:id', authenticateJWT, async (req, res) => {
  const mealId = req.params.id;

  try {
    const meal = await db.oneOrNone(`
      SELECT id, "profileId", name FROM meals WHERE id = $1
    `, [mealId]);

    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    const ingredients = await db.any(`
      SELECT mi."ingredientId", mi.quantity, i.food_label
      FROM meal_ingredients mi
      JOIN ingredients i ON mi."ingredientId" = i.id
      WHERE mi."mealId" = $1
    `, [mealId]);

    res.json({
      id: meal.id,
      profileId: meal.profileId,
      name: meal.name,
      ingredients: ingredients.map(i => ({
        ingredientId: i.ingredientId,
        quantity: i.quantity,
        food_label: i.food_label,
      })),
    });
  } catch (err) {
    console.error('Error fetching meal:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/editmeal/:id', authenticateJWT, async (req, res) => {
  const mealId = req.params.id;
  const { name, ingredients } = req.body;

  if (!name || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (ingredients.length > 10) {
    return res.status(400).json({ message: 'Max 10 ingredients allowed' });
  }

  try {
    await db.tx(async t => {
      await t.none(
        `UPDATE meals SET name = $1 WHERE id = $2`,
        [name, mealId]
      );

      await t.none(`DELETE FROM meal_ingredients WHERE "mealId" = $1`, [mealId]);

      const insertPromises = ingredients.map(({ ingredientId, quantity }) =>
        t.none(
          `INSERT INTO meal_ingredients ("mealId", "ingredientId", quantity)
           VALUES ($1, $2, $3)`,
          [mealId, ingredientId, quantity]
        )
      );

      await Promise.all(insertPromises);
    });

    res.json({ message: 'Meal updated successfully' });
  } catch (err) {
    console.error('Error updating meal:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

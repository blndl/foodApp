const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const xlsx = require('xlsx');
const db = require('../db');

const createIngredientsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS ingredients (
      id SERIAL PRIMARY KEY,
      food_label TEXT,
      proteines_g REAL,
      glucides_g REAL,
      lipides_g REAL,
      fibres_g REAL,
      nrj_kj REAL
    );
  `;
  await db.none(query);
};

const importIngredients = async () => {
  const filePath = path.resolve(__dirname, '../data/ingredients.xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  console.log('yo')

  const filteredData = rows.filter(row => {
    console.log('HYPOTH value:', row.HYPOTH);
    return row.HYPOTH && row.HYPOTH.trim().toUpperCase() === 'MB';
  });
  

  const sanitize = val => (typeof val === 'string' ? parseFloat(val) : val);

  await db.tx(async t => {
    for (const row of filteredData) {
      await t.none(
        `INSERT INTO ingredients (food_label, proteines_g, glucides_g, lipides_g,fibres_g, nrj_kj)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [row.FOOD_LABEL, sanitize(row.proteines_g), sanitize(row.glucides_g), 
            sanitize(row.lipides_g), sanitize(row.fibres_g), sanitize(row.nrj_kj)]
      );
    }
  });
};

router.get('/initdb', async (req, res) => {
    const createUserTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;
    const createProfileTableQuery = `
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "profileName" TEXT,
        age INTEGER,
        gender TEXT,
        height DECIMAL(5, 2),
        weight DECIMAL(5, 2),
        "activityLevel" TEXT,
        objective TEXT,
        diet TEXT
      );
    `;
    const createMealsTableQuery = `
      CREATE TABLE IF NOT EXISTS meals (
        id SERIAL PRIMARY KEY,
        "profileId" INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const createMealIngredientsTableQuery = `
      CREATE TABLE IF NOT EXISTS meal_ingredients (
        id SERIAL PRIMARY KEY,
        "mealId" INTEGER REFERENCES meals(id) ON DELETE CASCADE,
        "ingredientId" INTEGER REFERENCES ingredients(id),
        quantity REAL
      );
    `;
  
    const createMealsEatenTableQuery = `
      CREATE TABLE IF NOT EXISTS meals_eaten (
        id SERIAL PRIMARY KEY,
        "profileId" INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
        "mealId" INTEGER REFERENCES meals(id) ON DELETE CASCADE,
        day INTEGER NOT NULL,
        month INTEGER NOT NULL,
        eaten_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
  
    try {
      await db.none(createUserTableQuery);
      await db.none(createProfileTableQuery);
      await db.none(createMealsTableQuery);
      await db.none(createMealIngredientsTableQuery);
      await db.none(createMealsEatenTableQuery);
  
      res.status(200).json({ message: 'DB initialized' });
    } catch (error) {
      console.error('DB init error:', error);
      res.status(500).json({ message: 'Database init failed' });
    }
  });
  

router.post('/initdbing', async (req, res) => {
  console.log('/initdbing called');
  try {
    await createIngredientsTable();
    await importIngredients();
    res.status(200).json({ message: 'Ingredients imported' });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Import failed' });
  }
});

router.get('/initkey', async (req, res) => {
  const accessKey = crypto.randomBytes(32).toString('hex');
  const refreshKey = crypto.randomBytes(64).toString('hex');
  const keyPath = path.resolve(__dirname, '../keys.json');

  try {
    const keyData = { accessKey, refreshKey };
    await fs.promises.writeFile(keyPath, JSON.stringify(keyData, null, 2));
    res.status(200).json({ message: 'Keys generated', keys: keyData });
  } catch (err) {
    console.error('Key write error:', err);
    res.status(500).json({ message: 'Key write failed' });
  }
});

module.exports = router;

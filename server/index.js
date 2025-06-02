const express = require('express');
const db = require('./db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const xlsx = require('xlsx');
const app = express();
const port = 8080

app.use(cors());
app.use(express.json());

function loadKeys() {
  const secretPath = path.resolve(__dirname, 'keys.json');
  try {
    const raw = fs.readFileSync(secretPath, 'utf8');
    const keys = JSON.parse(raw);
    return keys;
  } catch (err) {
    console.error('Error reading secret:', err.message);
    throw new Error('Could not read JWT keys');
  }
}

function authenticateJWT(req, res, next) {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  const keys = loadKeys();

  jwt.verify(token, keys.accessKey, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Request body:', req.body);
    console.log(' /login route was hit:');

    if (!email || !password ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    try
    {
      console.log("test")
      const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
      console.log('User found:', user);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      console.log("test")
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      console.log("test")
      const keys = loadKeys();
      console.log("test")
      const accessToken = jwt.sign({ id: user.id, username: user.email }, keys.accessKey, { expiresIn: '15m' });
      console.log("test")
      const refreshToken = jwt.sign({ id: user.id, username: user.email }, keys.refreshKey, { expiresIn: '7d' });
      console.log("Generated Access Token:", accessToken);
      console.log("Generated Refresh Token:", refreshToken);
      res.status(200).json({ accessToken, refreshToken, userId: user.id });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }

  });

app.post('/signup', async (req, res) => {
  console.log(' /signup route was hit');
  const { email, password } = req.body;


  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);

    if (existingUser) {
      return res.status(400).json({ message: 'email already exists' });
    }

    await db.none('INSERT INTO users(email, password) VALUES($1, $2)', [email, password]);

    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }


});
app.post('/newProfile', authenticateJWT, async (req, res) => {
  const {
    userId, profileName, age, gender, height, weight,
    activityLevel, objective, diet
  } = req.body;
  console.log("yo")

  try {
    await db.none(
      `INSERT INTO profiles ("userId", "profileName", age, gender, height, weight, "activityLevel", objective, diet)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [userId, profileName, age, gender, height, weight, activityLevel, objective, diet]
    );
    console.log("salut")
    res.status(201).json({ message: 'Profile created successfully' });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/get/profile/:profileId', authenticateJWT, async (req, res) => {
  const profileId = req.params.profileId;

  try {
    const profile = await db.oneOrNone('SELECT * FROM profiles WHERE id = $1', [profileId]);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/get/profiles/:userId', authenticateJWT, async (req, res) => {
  console.log(' /profile route was hit');
  const userId = req.params.userId;

  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE id = $1', [userId]);
    console.log("User from DB:", user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`Querying profiles for user ID: ${userId}`);
    const profiles = await db.any('SELECT * FROM profiles WHERE "userId" = $1', [userId]);
    console.log("Profiles from DB:", profiles);
    res.json({ email: user.email, profiles });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, keys.refreshKey);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId, username: decoded.username },
      keys.accessKey,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, username: decoded.username },
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

app.delete('/delete/profile/:profileId', authenticateJWT, async (req, res) => {
  const profileId = req.params.profileId;
  const userId = req.user.id;

  try {
    const profile = await db.oneOrNone('SELECT * FROM profiles WHERE id = $1', [profileId]);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (profile.userId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this profile' });
    }

    await db.none('DELETE FROM profiles WHERE id = $1', [profileId]);
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/update/profile/:profileId', authenticateJWT, async (req, res) => {
  const { profileId } = req.params;
  const userIdFromToken = req.user.id;
  console.log('User ID from token:', userIdFromToken);
  const {
    profileName,
    age,
    gender,
    height,
    weight,
    activityLevel,
    objective,
    diet
  } = req.body;

  try {
    const profile = await db.oneOrNone('SELECT * FROM profiles WHERE id = $1 AND "userId" = $2', [profileId, userIdFromToken]);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found or not authorized' });
    }

    await db.none(
      `UPDATE profiles SET 
         "profileName" = $1,
         age = $2,
         gender = $3,
         height = $4,
         weight = $5,
         "activityLevel" = $6,
         objective = $7,
         diet = $8
       WHERE id = $9`,
      [profileName, age, gender, height, weight, activityLevel, objective, diet, profileId]
    );

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await db.any('SELECT * FROM ingredients ORDER BY food_label');
    res.status(200).json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ message: 'Failed to fetch ingredients' });
  }
});

//for development only
app.get('/initkey', async (req, res) => {
 
  const accessKey = crypto.randomBytes(32).toString('hex');
  const refreshKey = crypto.randomBytes(64).toString('hex');
  console.log(accessKey)
  console.log(refreshKey)
  
  const MKey = path.resolve(__dirname, 'keys.json');
  const MObject = { accessKey: accessKey,
                    refreshKey: refreshKey};
  

  try {
    await fs.promises.writeFile(MKey, JSON.stringify(MObject, null, 2));
    console.log(`JWT secret written to file: ${MKey}`);
  } catch (error) {
    console.error('Error writing JWT secret to file:', error);
    res.status(500).json({ message: 'Failed to create JWT secret' });
  }
  const writtenContent = await fs.promises.readFile(MKey, 'utf8');
  console.log('Content of the written file:', writtenContent);
  res.status(200).json({ message: 'JWT secret generated and saved successfully!' });
})

app.get('/showkey', (req, res) => {
  const secretPath = path.resolve(__dirname, 'keys.json');

  try {
    const raw = fs.readFileSync(secretPath, 'utf8');
    const data = JSON.parse(raw);
    res.status(200).json({ jwtSecret: data.JWT_SECRET });
  } catch (err) {
    console.error('Error reading secret:', err.message);
    res.status(500).json({ message: 'Could not read secret file' });
  }

})


app.get('/initdb', async (req, res) => {
    const createUserTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;
    const createProfileTableQuery = `
    CREATE TYPE activityLevel AS ENUM ('none', 'a bit', 'a lot', 'professional level');
    CREATE TYPE objective AS ENUM ('gain weight', 'lose weight', 'gain muscle mass', 'maintain weight');
    CREATE TYPE diet AS ENUM ('vegan', 'vegetarian', 'non-vegetarian', 'paleo', 'keto');

    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
      "profileName" TEXT,
      age INTEGER,
      gender TEXT,
      height DECIMAL(5, 2),
      weight DECIMAL(5, 2),
      "activityLevel" activityLevel,
      objective objective,
      diet diet
    );
  `;
  
    try {
      await db.none(createUserTableQuery);
      await db.none(createProfileTableQuery);

      res.status(200).json({ message: 'Users and profiles tables created successfully.' });  } catch (error) {
    console.error('Error creating table or saving secret:', error);
    res.status(500).json({ error: 'Database setup failed.' });
  }
});


async function createIngredientsTable() {
  const createIngredientsTableQuery = `
    CREATE TABLE IF NOT EXISTS ingredients (
      id SERIAL PRIMARY KEY,
      food_label TEXT,
      proteines_g REAL,
      glucides_g REAL,
      lipides_g REAL
    );
  `;
  await db.none(createIngredientsTableQuery);
}

async function importIngredients() {
  const filePath = path.resolve(__dirname, 'data', 'ingredients.xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const sanitize = (val) => (typeof val === 'string' ? parseFloat(val) : val);

  return db.tx(async (t) => {
    const insertQuery = `
      INSERT INTO ingredients (food_label, proteines_g, glucides_g, lipides_g)
      VALUES ($1, $2, $3, $4)
    `;

    for (const row of rows) {
      await t.none(insertQuery, [
        row.FOOD_LABEL,
        sanitize(row.proteines_g),
        sanitize(row.glucides_g),
        sanitize(row.lipides_g),
      ]);
    }
  });
}

app.post('/initdbing', async (req, res) => {
  try {
    await createIngredientsTable();
    await importIngredients();
    res.status(200).json({ message: 'Ingredients imported successfully!' });
  } catch (error) {
    console.error('Error importing ingredients:', error);
    res.status(500).json({ message: 'Failed to import ingredients' });
  }
});
//route should never be accessed outside of development

app.listen(port, '0.0.0.0', () => {
    console.log('server listening on port 8080')
})

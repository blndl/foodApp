const express = require('express');
const db = require('./db');
const cors = require('cors');

const app = express();
const port = 8080

app.use(cors());
app.use(express.json());



app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    console.log(' /login route was hit');

    if (!username || !password ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    try
    {
      const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid password' });
      }

    res.status(200).json({ message: 'Login successful!' });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }

  });

app.post('/signup', async (req, res) => {
  console.log(' /signup route was hit');
  const { username, password } = req.body;


  if (!username || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingUser = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [username]);

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, password]);

    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }


});




//for development only
app.get('/initdb', async (req, res) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;
  
    try {
      await db.none(createTableQuery);
      res.status(200).json({ message: 'Users table created (if it didn’t already exist).' });
    } catch (error) {
      console.error('Error creating table:', error);
      res.status(500).json({ error: 'Database setup failed.' });
    }
    console.log(' /init-db route was hit');
  });
//route should never be accessed outside of development

app.listen(port, '0.0.0.0', () => {
    console.log('server listening on port 8080')
})

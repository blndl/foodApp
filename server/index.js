console.log('Starting server')
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

//require('dotenv').config();
app.use(cors());
app.use(express.json());

/*const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles.js');
const mealRoutes = require('./routes/meals');
const ingredientRoutes = require('./routes/ingredients');
const devRoutes = require('./routes/dev');*/

let authRoutes, profileRoutes, mealRoutes, ingredientRoutes, devRoutes, dietRoutes;

try {
  authRoutes = require('./routes/auth');
  console.log(' Loaded auth');
} catch (e) {
  console.error(' Failed to load auth:', e);
}

try {
  profileRoutes = require('./routes/profiles.js');
  console.log(' Loaded profiles');
} catch (e) {
  console.error(' Failed to load profiles:', e);
}

try {
  mealRoutes = require('./routes/meals');
  console.log(' Loaded meals');
} catch (e) {
  console.error(' Failed to load meals:', e);
}

try {
  ingredientRoutes = require('./routes/ingredients');
  console.log(' Loaded ingredients');
} catch (e) {
  console.error(' Failed to load ingredients:', e);
}

try {
  devRoutes = require('./routes/dev');
  console.log(' Loaded dev');
} catch (e) {
  console.error(' Failed to load dev:', e);
}
try {
  dietRoutes = require('./routes/diet');
  console.log(' Loaded diet');
} catch (e) {
  console.error(' Failed to load diet:', e);
}


app.use('/auth', authRoutes);
app.use('/profiles', profileRoutes);
app.use('/meals', mealRoutes);
app.use('/ingredients', ingredientRoutes);
app.use('/diet', dietRoutes);
// dev
app.use('/dev', devRoutes);


app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});

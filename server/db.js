const pgp = require('pg-promise')();

const db = pgp({
  host: 'postgres',
  port: 5432,
  database: 'postgres',
  user: 'admin',
  password: 'password' 
});

module.exports = db
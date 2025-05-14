const pgp = require('pg-promise')();

const db = pgp({
  host: 'postgres',
  port: 5432,
  database: 'postgres',
  user: 'admin',
  password: 'password' 
});

async function createDatabaseIfNotExists() {
    try {
      await db.none(`CREATE DATABASE IF NOT EXISTS userdb;`);
      console.log("Database created successfully (if it didn't already exist).");
    } catch (error) {
      console.error("Error creating database:", error);
    }
  }

  module.exports = db
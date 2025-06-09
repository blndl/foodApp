const xlsx = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

async function importExcel() {
  const filePath = path.join(__dirname, 'data', 'ingredients.xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const filteredData = data.filter(row => row.HYPOTH === 'MB');

  for (const row of filteredData) {
    await pool.query(
      `INSERT INTO ingredients (food_label, proteines_g, glucides_g, lipides_g, nrj_kj)
       VALUES ($1, $2, $3, $4, $5)`,
      [row.FOOD_LABEL, row.proteines_g, row.glucides_g, row.lipides_g, row.nrj_kj]
    );
  }

  console.log('Import completed.');
}

module.exports = importExcel;

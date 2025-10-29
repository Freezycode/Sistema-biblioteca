const mysql = require('mysql2/promise');
require('dotenv').config({ path: __dirname + '/../../.env' });
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = db;
db.query('SELECT 1')
  .then(() => console.log('Conectado ao MySQL com sucesso!'))
  .catch(err => console.error('Erro ao conectar no banco:', err.message));


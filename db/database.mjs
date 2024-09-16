// /db/database.mjs
import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'sam123',
  database: 'dealsdray'
});
export default db;
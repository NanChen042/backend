import mysql from 'mysql2'

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'a123456b',
  database: 'test_database',
  waitForConnections: true,
  connectionLimit: 10,
}).promise()
import mysql from 'mysql2'

export const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'a123456b',
  database: 'test_database'
})
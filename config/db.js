// Подключение через пул
// const mysql = require('mysql2/promise');

// const connectDB = async () => {
//   try {
//     console.log('Connecting to MySQL with the following settings:');
//     const pool = mysql.createPool({
//       host: process.env.MYSQL_HOST,
//       user: process.env.MYSQL_USER,
//       password: process.env.MYSQL_PASSWORD,
//       database: process.env.MYSQL_DATABASE,
//       port: process.env.MYSQL_PORT || 3306,
//       waitForConnections: true,
//       connectionLimit: 10,  // Количество соединений в пуле
//       queueLimit: 0,
//     });

//     console.log('MySQL pool created');
//     return pool; // Возвращаем пул соединений
//   } catch (error) {
//     console.error('Error connecting to MySQL:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

// config/db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST,
  user:     process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port:     process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

module.exports = pool;



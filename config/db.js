// Подключение через пул
const mysql = require('mysql2/promise');

const connectDB = async () => {
  try {
    console.log('Connecting to MySQL with the following settings:');
    // console.log('Host:', process.env.MYSQL_HOST);
    // console.log('User:', process.env.MYSQL_USER);
    // console.log('Database:', process.env.MYSQL_DATABASE);

    const pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: process.env.MYSQL_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,  // Количество соединений в пуле
      queueLimit: 0,
    });

    console.log('MySQL pool created');
    return pool; // Возвращаем пул соединений
  } catch (error) {
    console.error('Error connecting to MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


// const mysql = require('mysql2/promise');

// const connectDB = async () => {
//   try {
//     console.log('Connecting to MySQL with the following settings:');
//     console.log('Host:', process.env.MYSQL_HOST);
//     console.log('User:', process.env.MYSQL_USER);
//     console.log('Database:', process.env.MYSQL_DATABASE);

//     const connection = await mysql.createConnection({
//       host: process.env.MYSQL_HOST,
//       user: process.env.MYSQL_USER,
//       password: process.env.MYSQL_PASSWORD,
//       database: process.env.MYSQL_DATABASE,
//       port: process.env.MYSQL_PORT || 3306,
//     });

//     console.log('MySQL connected');
//     return connection;
//   } catch (error) {
//     console.error('Error connecting to MySQL:', error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;




// const mongoose = require("mongoose");

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("MongoDB connected");
//   } catch (error) {
//     console.error(error.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

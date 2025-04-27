// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const db = require('../config/db'); // Подключаем соединение с БД




// Авторизация пользователя (проверка логина и пароля)
// exports.loginUser = async (req, res) => {
  
//   const { login, password } = req.body;

//   console.log("log",req.body);
//   if (!login || !password) {
//     return res.status(400).json({ error: 'Login and password are required' });
//   }

//   try {

//     // await clearPool();
//     // Получаем пользователя из базы данных
//     // const connection = await db();
//     const [rows] = await db.execute('SELECT * FROM users WHERE login = ?', [login]);

//     if (rows.length === 0) {
//       return res.status(401).json({ error: 'Invalid login or password' });
//     }

//     // Сравниваем хешированный пароль с тем, который в базе
//     const user = rows[0];
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(401).json({ error: 'Invalid login or password' });
//     }

//     // Генерация JWT-токена
//     // const token = jwt.sign(
//     //   { id: user.id, login: user.login },
//     //   'your_secret_key', // В реальном проекте используйте переменные окружения для хранения секретных ключей
//     //   { expiresIn: '1h' } // Время жизни токена
//     // );
//      const token = jwt.sign(
//          { userId: user.id },                     // кладём userId в payload
//          process.env.JWT_SECRET,                  // берём секрет из .env
//          { expiresIn: '1h' }
//        );

//     res.json({ message: 'Login successful', token });
//     connection.end();
//   } catch (error) {
//     console.error('Error logging in user:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// controllers/authController.js
// require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
// const connectDB = require('../config/db');
const db = require('../config/db');

exports.loginUser = async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required' });
  }
  try {
    // const connection = await connectDB();
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE login = ?',
      [login]
    );
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password))) {
      return res.status(401).json({ error: 'Invalid login or password' });
    }
    // console.log("jwt",process.env.JWT_SECRET);
    
    const token = jwt.sign(
      { userId: rows[0].id },
     
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    // console.log("jwt",process.env.JWT_SECRET);
    res.json({ message: 'Login successful!!', token});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Регистрация нового пользователя
// exports.registerUser = async (req, res) => {
//     const { login, password } = req.body;
  
//     if (!login || !password) {
//       return res.status(400).json({ error: 'Login and password are required' });
//     }
  
//     try {
//       // Хешируем пароль
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       // Вставляем нового пользователя в базу данных
//       const query = 'INSERT INTO users (login, password) VALUES (?, ?)';
//       const values = [login, hashedPassword];
  
//       // const connection = await db();
//       const [result] = await db.execute(query, values);
  
//       res.status(201).json({ id: result.insertId, login });
//       connection.end();
//     } catch (error) {
//       console.error('Error registering user:', error);
//       res.status(500).json({ error: error.message });
//     }
//   };

// controllers/authController.js

exports.registerUser = async (req, res) => {
// -  const { login, password } = req.body;
  const { login, password, locationIds } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (login, password) VALUES (?, ?)';
    const [result] = await db.execute(query, [login, hashedPassword]);
    const userId = result.insertId;

   // Привязка пользователя к точкам
   if (Array.isArray(locationIds) && locationIds.length) {
     const values = locationIds.map(loc => [userId, loc]);
     await db.query(
       'INSERT INTO user_locations (user_id, location_id) VALUES ?',
       [values]
     );
   }

    res.status(201).json({ id: userId, login });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
};

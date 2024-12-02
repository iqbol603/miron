// const bcrypt = require('bcryptjs');
// const connectDB = require('../config/db');

// // Регистрация нового пользователя
// exports.registerUser = async (req, res) => {
//   const { login, password } = req.body;

//   if (!login || !password) {
//     return res.status(400).json({ error: 'Login and password are required' });
//   }

//   try {
//     // Хешируем пароль
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Вставляем нового пользователя в базу данных
//     const query = 'INSERT INTO users (login, password) VALUES (?, ?)';
//     const values = [login, hashedPassword];

//     const connection = await connectDB();
//     const [result] = await connection.execute(query, values);

//     res.status(201).json({ id: result.insertId, login });
//     connection.end();
//   } catch (error) {
//     console.error('Error registering user:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

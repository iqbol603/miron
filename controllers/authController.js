const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../config/db'); // Подключаем соединение с БД




// Авторизация пользователя (проверка логина и пароля)
exports.loginUser = async (req, res) => {
  
  const { login, password } = req.body;

  console.log("log",req.body);
  if (!login || !password) {
    return res.status(400).json({ error: 'Login and password are required' });
  }

  try {

    // await clearPool();
    // Получаем пользователя из базы данных
    const connection = await connectDB();
    const [rows] = await connection.execute('SELECT * FROM users WHERE login = ?', [login]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid login or password' });
    }

    // Сравниваем хешированный пароль с тем, который в базе
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login or password' });
    }

    // Генерация JWT-токена
    const token = jwt.sign(
      { id: user.id, login: user.login },
      'your_secret_key', // В реальном проекте используйте переменные окружения для хранения секретных ключей
      { expiresIn: '1h' } // Время жизни токена
    );

    res.json({ message: 'Login successful', token });
    connection.end();
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Регистрация нового пользователя
exports.registerUser = async (req, res) => {
    const { login, password } = req.body;
  
    if (!login || !password) {
      return res.status(400).json({ error: 'Login and password are required' });
    }
  
    try {
      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Вставляем нового пользователя в базу данных
      const query = 'INSERT INTO users (login, password) VALUES (?, ?)';
      const values = [login, hashedPassword];
  
      const connection = await connectDB();
      const [result] = await connection.execute(query, values);
  
      res.status(201).json({ id: result.insertId, login });
      connection.end();
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: error.message });
    }
  };
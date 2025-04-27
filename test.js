// app.js или другой файл, где нужно выполнить запрос
require('dotenv').config();  // Это загрузит переменные окружения из .env файла

const db = require('./config/db');

async function runApp() {
  // const connection = await db(); // Получаем подключение к базе данных

  try {
    // Пример запроса: Получение всех записей из таблицы `products`
    const [rows, fields] = await db.execute('SELECT * FROM products');
    console.log('Products:', rows);

    // Пример вставки нового продукта
    const [result] = await connection.execute('INSERT INTO products (name, price) VALUES (?, ?)', ['Shawarma', 5.99]);
    console.log('Product inserted:', result);
  } catch (error) {
    console.error('Error executing query:', error.message);
  } finally {
    await connection.end(); // Закрываем соединение после выполнения запросов
  }
}

runApp();

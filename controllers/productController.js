const connectDB = require('../config/db'); // Подключаем функцию для соединения с базой данных

// Добавление продукта
exports.addProduct = async (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const query = 'INSERT INTO products (name, price) VALUES (?, ?)';
  const values = [name, price];

  try {
    const pool = await connectDB(); // Получаем пул соединений
    const [result] = await pool.query(query, values); // Выполняем запрос с использованием пула
    res.status(201).json({ id: result.insertId, name, price });
  } catch (error) {
    console.error('Error inserting product:', error);
    res.status(500).json({ error: error.message });
  }
};

// Добавление продукта
// exports.addProduct = async (req, res) => {
//   const { name, price } = req.body;

//   if (!name || !price) {
//     return res.status(400).json({ error: 'Name and price are required' });
//   }

//   const query = 'INSERT INTO products (name, price) VALUES (?, ?)';
//   const values = [name, price];

//   try {
//     const connection = await connectDB(); // Получаем соединение с БД
//     const [result] = await connection.execute(query, values); // Выполняем запрос
//     res.status(201).json({ id: result.insertId, name, price });
//     connection.end(); // Закрываем соединение после запроса
//   } catch (error) {
//     console.error('Error inserting product:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// Получение всех продуктов
// exports.getProducts = async (req, res) => {
//   const query = 'SELECT * FROM products';

//   try {
//     const connection = await connectDB(); // Получаем соединение с БД
//     const [rows] = await connection.execute(query); // Выполняем запрос
//     res.json(rows);
//     connection.end(); // Закрываем соединение после запроса
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// Получение всех продуктов
exports.getProducts = async (req, res) => {
  const query = 'SELECT * FROM products';

  try {
    const pool = await connectDB(); // Получаем пул соединений
    const [rows] = await pool.query(query); // Выполняем запрос с использованием пула
    res.json(rows); // Отправляем результат запроса
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
};


// const Product = require("../models/Product");

// exports.addProduct = async (req, res) => {
//   try {
//     const product = new Product(req.body);
//     await product.save();
//     res.json(product);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.json(products);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

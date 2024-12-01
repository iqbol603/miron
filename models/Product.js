// models/Product.js
// models/Product.js
// models/Product.js
const connectDB = require('../config/db'); // Подключение к базе данных

// Функция для добавления продукта в базу данных
const addProduct = async (name, price) => {
  const connection = await connectDB();

  const [rows] = await connection.execute(
    'INSERT INTO products (name, price) VALUES (?, ?)',
    [name, price]
  );

  console.log('Product inserted:', rows);
  connection.end();
};

// Функция для получения всех продуктов из базы данных
const getProducts = async () => {
  const connection = await connectDB();

  const [rows] = await connection.execute('SELECT * FROM products');
  console.log('All Products:', rows);

  connection.end();
};

module.exports = { addProduct, getProducts };


// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db'); // Подключение к базе данных

// const Product = sequelize.define('Product', {
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false, // Поле не может быть пустым
//   },
//   price: {
//     type: DataTypes.FLOAT,
//     allowNull: false, // Поле не может быть пустым
//     validate: {
//       isFloat: true, // Проверка, что цена — это число с плавающей точкой
//     },
//   },
// }, {
//   timestamps: true, // Sequelize автоматически добавляет поля createdAt и updatedAt
// });

// module.exports = Product;


// const mongoose = require("mongoose");

// const ProductSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   price: { type: Number, required: true },
// });

// module.exports = mongoose.model("Product", ProductSchema);

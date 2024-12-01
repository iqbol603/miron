// models/Customer.js
const db = require('../config/db'); // Подключение к базе данных

// Функция для создания клиента в базе данных
const createCustomer = async (name, phone, email, price) => {
  const query = `
    INSERT INTO customers (name, phone, email, price)
    VALUES (?, ?, ?, ?)
  `;
  const values = [name, phone, email, price];

  try {
    const [result] = await db.execute(query, values); // Выполняем запрос
    console.log('Customer created with ID:', result.insertId);
    return result;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

module.exports = { createCustomer };


// models/Customer.js
// const mongoose = require("mongoose");

// const CustomerSchema = new mongoose.Schema(
//   {
//     name: String,
//     phone: String,
//     email: String,
//     price: Number,
//     orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
//   },
//   {
//     timestamps: true, // Автоматически добавляет поля createdAt и updatedAt
//   }
// );

// module.exports = mongoose.model("Customer", CustomerSchema);

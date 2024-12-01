// models/Order.js
// models/Order.js
const db = require('../config/db'); // Подключение к базе данных

// Функция для создания заказа
const createOrder = async (customerId, totalAmount) => {
  const query = `
    INSERT INTO orders (customerId, totalAmount)
    VALUES (?, ?)
  `;
  const values = [customerId, totalAmount];

  try {
    const [result] = await db.execute(query, values);
    console.log('Order created with ID:', result.insertId);
    return result;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Функция для генерации уникального orderId
const generateOrderId = async () => {
  let isUnique = false;
  let orderId;

  while (!isUnique) {
    orderId = Math.floor(10000000 + Math.random() * 90000000); // Генерация случайного числа

    // Проверка, существует ли заказ с таким orderId
    const [existingOrder] = await db.execute('SELECT * FROM orders WHERE orderId = ?', [orderId]);
    if (existingOrder.length === 0) {
      isUnique = true; // Если заказ с таким ID не найден — уникальный
    }
  }

  return orderId;
};

// Функция для получения всех заказов
const getOrders = async () => {
  try {
    const [rows] = await db.execute('SELECT * FROM orders');
    return rows;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

module.exports = { createOrder, generateOrderId, getOrders };


// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema({
//   orderId: { type: Number, unique: true, required: true },
//   customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: false },
//   products: [
//     {
//       product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//       quantity: { type: Number, required: true },
//     },
//   ],
//   totalAmount: { type: Number, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// async function generateUniqueOrderId() {
//   let orderId;
//   let isUnique = false;

//   while (!isUnique) {
//     orderId = Math.floor(10000000 + Math.random() * 90000000);
//     const existingOrder = await mongoose.model("Order").findOne({ orderId });
//     if (!existingOrder) {
//       isUnique = true;
//     }
//   }
//   return orderId;
// }

// OrderSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     console.log("Generating unique orderId...");
//     this.orderId = await generateUniqueOrderId();
//     console.log("Generated orderId:", this.orderId);
//   }
//   next();
// });

// module.exports = mongoose.model("Order", OrderSchema);

// models/Sale.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Подключение к базе данных
const Product = require('./Product'); // Импорт модели Product

const Sale = sequelize.define('Sale', {
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Устанавливает текущую дату по умолчанию
  },
}, {
  timestamps: true, // Sequelize автоматически добавляет createdAt и updatedAt
});

// Связь с продуктами (многие ко многим)
Sale.belongsToMany(Product, { through: 'SaleProducts', foreignKey: 'saleId' });
Product.belongsToMany(Sale, { through: 'SaleProducts', foreignKey: 'productId' });

module.exports = Sale;


// const mongoose = require("mongoose");

// const SaleSchema = new mongoose.Schema({
//   products: [
//     {
//       product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//       quantity: { type: Number, required: true },
//     },
//   ],
//   totalAmount: { type: Number, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Sale", SaleSchema);

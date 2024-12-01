// models/Sale.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Подключение к базе данных

const Sale = sequelize.define('Sale', {
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Устанавливаем текущую дату по умолчанию
    allowNull: false, // Поле обязательно
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false, // Количество обязательно
  },
}, {
  timestamps: true, // Sequelize автоматически добавляет createdAt и updatedAt
});

module.exports = Sale;



// models/Sales.js
// const mongoose = require("mongoose");

// const SalesSchema = new mongoose.Schema({
//   date: { type: Date, default: Date.now, required: true }, // Текущая дата по умолчанию
//   quantity: { type: Number, required: true }, // Количество проданной шаурмы
// });

// module.exports = mongoose.model("Sales", SalesSchema);

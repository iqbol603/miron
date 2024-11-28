// models/Sales.js
const mongoose = require("mongoose");

const SalesSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now, required: true }, // Текущая дата по умолчанию
  quantity: { type: Number, required: true }, // Количество проданной шаурмы
});

module.exports = mongoose.model("Sales", SalesSchema);

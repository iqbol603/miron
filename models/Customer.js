// models/Customer.js
const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    price: Number,
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  {
    timestamps: true, // Автоматически добавляет поля createdAt и updatedAt
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);

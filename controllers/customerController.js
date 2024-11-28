// controllers/customerController.js
const Customer = require("../models/Customer");

exports.addCustomer = async (req, res) => {
  const customer = new Customer(req.body);
  await customer.save();
  res.json(customer);
};

exports.getCustomers = async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
};

// Новая функция для редактирования клиента
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Новая функция для удаления клиента
exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Получение аналитики по добавленным клиентам за каждый день
exports.getDailyCustomerStats = async (req, res) => {
    try {
      const stats = await Customer.aggregate([
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$createdAt" },
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" }
            },
            totalCustomers: { $sum: 1 },
            totalSalesAmount: { $sum: "$price" } // Общая сумма за день
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
      ]);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Получение аналитики по добавленным клиентам за каждый месяц
  exports.getMonthlyCustomerStats = async (req, res) => {
    try {
      const stats = await Customer.aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" }
            },
            totalCustomers: { $sum: 1 },
            totalSalesAmount: { $sum: "$price" } // Общая сумма за месяц
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Получение аналитики по добавленным клиентам за каждый год
  exports.getYearlyCustomerStats = async (req, res) => {
    try {
      const stats = await Customer.aggregate([
        {
          $group: {
            _id: { year: { $year: "$createdAt" } },
            totalCustomers: { $sum: 1 },
            totalSalesAmount: { $sum: "$price" } // Общая сумма за месяц
          }
        },
        { $sort: { "_id.year": 1 } }
      ]);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


const Sales = require("../models/Sales");

// Добавление записи о продажах
exports.addSale = async (req, res) => {
  try {
    const sale = new Sales(req.body);
    await sale.save();
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение аналитики по дням
exports.getDailySales = async (req, res) => {
  try {
    const sales = await Sales.aggregate([
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$date" },
            month: { $month: "$date" },
            year: { $year: "$date" }
          },
          totalSales: { $sum: "$quantity" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение аналитики за месяц
exports.getMonthlySales = async (req, res) => {
  try {
    const sales = await Sales.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" }
          },
          totalSales: { $sum: "$quantity" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получение аналитики за год
exports.getYearlySales = async (req, res) => {
  try {
    const sales = await Sales.aggregate([
      {
        $group: {
          _id: { year: { $year: "$date" } },
          totalSales: { $sum: "$quantity" }
        }
      },
      { $sort: { "_id.year": 1 } }
    ]);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

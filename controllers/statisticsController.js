// controllers/statisticsController.js
const db = require('../config/db');

//
// controllers/statisticsController.js
exports.ordersByLocation = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(`
      SELECT
        l.id,
        l.name,
        COUNT(o.id) AS ordersCount
      FROM user_locations ul
      JOIN locations      l ON l.id = ul.location_id
      LEFT JOIN orders    o ON o.location_id = l.id
      WHERE ul.user_id = ?
      GROUP BY l.id, l.name
      ORDER BY l.id
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось получить статистику по точкам' });
  }
};


// 1) Дневная аналитика заказов
//
exports.getDailyOrderStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(`
      SELECT 
        DAY(o.createdAt)   AS day,
        MONTH(o.createdAt) AS month,
        YEAR(o.createdAt)  AS year,
        COUNT(DISTINCT o.id)               AS totalOrders,
        SUM(op.quantity * p.price)         AS totalSalesAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p       ON op.productId = p.id
      JOIN user_locations ul ON o.location_id = ul.location_id
      WHERE ul.user_id = ?
      GROUP BY year, month, day
      ORDER BY year, month, day
    `, [userId]);

    const stats = rows.map(r => ({
      id:    { day: r.day, month: r.month, year: r.year },
      totalOrders:      r.totalOrders,
      totalSalesAmount: r.totalSalesAmount
    }));

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось получить дневную аналитику заказов' });
  }
};

//
// 2) Дневная статистика по продуктам
//
exports.getDailyProductStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(`
      SELECT
        DAY(o.createdAt)   AS day,
        MONTH(o.createdAt) AS month,
        YEAR(o.createdAt)  AS year,
        p.name             AS productName,
        p.price            AS productPrice,
        SUM(op.quantity)   AS totalQuantity,
        SUM(op.quantity * p.price) AS totalAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p       ON op.productId = p.id
      JOIN user_locations ul ON o.location_id = ul.location_id
      WHERE ul.user_id = ?
      GROUP BY year, month, day, productName, productPrice
      ORDER BY year, month, day, productName
    `, [userId]);

    // сгруппируем по дате
    const grouped = rows.reduce((acc, r) => {
      const key = `${r.year}-${r.month}-${r.day}`;
      if (!acc[key]) {
        acc[key] = { id: { day: r.day, month: r.month, year: r.year }, products: [] };
      }
      acc[key].products.push({
        name: r.productName,
        price: r.productPrice,
        quantity: r.totalQuantity,
        totalAmount: r.totalAmount
      });
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось получить дневную статистику продуктов' });
  }
};

//
// 3) Месячная аналитика заказов
//
exports.getMonthlyOrderStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(`
      SELECT 
        MONTH(o.createdAt) AS month,
        YEAR(o.createdAt)  AS year,
        COUNT(DISTINCT o.id)       AS totalOrders,
        SUM(op.quantity * p.price) AS totalSalesAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p       ON op.productId = p.id
      JOIN user_locations ul ON o.location_id = ul.location_id
      WHERE ul.user_id = ?
      GROUP BY year, month
      ORDER BY year, month
    `, [userId]);

    const stats = rows.map(r => ({
      id:    { month: r.month, year: r.year },
      totalOrders:      r.totalOrders,
      totalSalesAmount: r.totalSalesAmount
    }));

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось получить месячную аналитику заказов' });
  }
};

//
// 4) Месячная статистика продуктов
//
exports.getMonthlyProductStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(`
      SELECT 
        MONTH(o.createdAt) AS month,
        YEAR(o.createdAt)  AS year,
        p.name             AS productName,
        p.price            AS productPrice,
        SUM(op.quantity)   AS totalQuantity,
        SUM(op.quantity * p.price) AS totalAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p       ON op.productId = p.id
      JOIN user_locations ul ON o.location_id = ul.location_id
      WHERE ul.user_id = ?
      GROUP BY year, month, productName, productPrice
      ORDER BY year, month, productName
    `, [userId]);

    const grouped = rows.reduce((acc, r) => {
      const key = `${r.year}-${r.month}`;
      if (!acc[key]) {
        acc[key] = { id: { month: r.month, year: r.year }, products: [] };
      }
      acc[key].products.push({
        name: r.productName,
        price: r.productPrice,
        quantity: r.totalQuantity,
        totalAmount: r.totalAmount
      });
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось получить месячную статистику продуктов' });
  }
};

//
// 5) Годовая аналитика заказов
//
exports.getYearlyOrderStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(`
      SELECT 
        YEAR(o.createdAt) AS year,
        COUNT(DISTINCT o.id)       AS totalOrders,
        SUM(op.quantity * p.price) AS totalSalesAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p       ON op.productId = p.id
      JOIN user_locations ul ON o.location_id = ul.location_id
      WHERE ul.user_id = ?
      GROUP BY year
      ORDER BY year
    `, [userId]);

    const stats = rows.map(r => ({
      id:    { year: r.year },
      totalOrders:      r.totalOrders,
      totalSalesAmount: r.totalSalesAmount
    }));

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось получить годовую аналитику заказов' });
  }
};

//
// 6) Годовая статистика продуктов
//
exports.getYearlyProductStats = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(`
      SELECT 
        YEAR(o.createdAt) AS year,
        p.name             AS productName,
        p.price            AS productPrice,
        SUM(op.quantity)   AS totalQuantity,
        SUM(op.quantity * p.price) AS totalAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p       ON op.productId = p.id
      JOIN user_locations ul ON o.location_id = ul.location_id
      WHERE ul.user_id = ?
      GROUP BY year, productName, productPrice
      ORDER BY year, productName
    `, [userId]);

    const grouped = rows.reduce((acc, r) => {
      const y = r.year;
      if (!acc[y]) {
        acc[y] = { id: { year: y }, products: [] };
      }
      acc[y].products.push({
        name: r.productName,
        price: r.productPrice,
        quantity: r.totalQuantity,
        totalAmount: r.totalAmount
      });
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось получить годовую статистику продуктов' });
  }
};

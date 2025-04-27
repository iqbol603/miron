// controllers/orderController.js
const db = require('../config/db');

// Получение продукта по ID
async function getProductById(productId) {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
    return rows[0];
  } catch (err) {
    throw new Error('Ошибка при получении продукта: ' + err.message);
  }
}

// Получение клиента по ID
async function getCustomerById(customerId) {
  try {
    const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [customerId]);
    return rows[0];
  } catch (err) {
    throw new Error('Ошибка при получении клиента: ' + err.message);
  }
}

// Генерация уникального orderId
async function generateUniqueOrderId() {
  let orderId;
  let isUnique = false;
  while (!isUnique) {
    orderId = Math.floor(10000000 + Math.random() * 90000000);
    try {
      const [rows] = await db.query('SELECT 1 FROM orders WHERE orderId = ?', [orderId]);
      if (!rows.length) isUnique = true;
    } catch (err) {
      throw new Error('Ошибка при проверке уникальности orderId: ' + err.message);
    }
  }
  return orderId;
}

// Создание нового заказа с привязкой к точке и проверкой доступа
exports.addOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { products, customerId, locationId } = req.body;
    if (!Array.isArray(products) || !products.length) {
      return res.status(400).json({ error: 'Укажите продукты для заказа' });
    }
    if (!locationId) {
      return res.status(400).json({ error: 'Не указана точка заказа' });
    }
    // проверка доступа
    const [access] = await db.query(
      'SELECT 1 FROM user_locations WHERE user_id = ? AND location_id = ?',
      [userId, locationId]
    );
    if (!access.length) {
      return res.status(403).json({ error: 'Нет доступа к этой точке' });
    }
    // подсчет суммы
    let totalAmount = 0;
    const orderProducts = await Promise.all(
      products.map(async ({ productId, quantity }) => {
        const product = await getProductById(productId);
        if (!product) throw new Error(`Продукт с ID ${productId} не найден`);
        totalAmount += product.price * quantity;
        return { product: product.id, quantity };
      })
    );
    // внешний ID
    const externalId = await generateUniqueOrderId();
    // вставка заказа
    const [result] = await db.query(
      'INSERT INTO orders (orderId, totalAmount, customerId, location_id) VALUES (?, ?, ?, ?)',
      [externalId, totalAmount, customerId, locationId]
    );
    const newOrderId = result.insertId;
    // вставка позиций
    for (const { product, quantity } of orderProducts) {
      await db.query(
        'INSERT INTO order_products (orderId, productId, quantity) VALUES (?, ?, ?)',
        [newOrderId, product, quantity]
      );
    }
    res.json({ orderId: externalId, totalAmount, products: orderProducts });
  } catch (error) {
    console.error('Ошибка при добавлении заказа:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение всех заказов с учетом доступа по точкам
exports.getAllOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT
         o.id AS orderId,
         o.totalAmount,
         o.createdAt AS orderDate,
         o.location_id AS locationId,
         l.name AS locationName,
         op.productId,
         p.name AS productName,
         p.price AS productPrice,
         op.quantity
       FROM orders o
       JOIN user_locations ul ON o.location_id = ul.location_id
       JOIN locations l ON o.location_id = l.id
       LEFT JOIN order_products op ON o.id = op.orderId
       LEFT JOIN products p ON op.productId = p.id
       WHERE ul.user_id = ?
       ORDER BY o.createdAt DESC`,
      [userId]
    );
    const orders = rows.reduce((acc, row) => {
      if (!acc[row.orderId]) {
        acc[row.orderId] = {
          orderId: row.orderId,
          totalAmount: row.totalAmount,
          orderDate: row.orderDate,
          location: { id: row.locationId, name: row.locationName },
          products: []
        };
      }
      if (row.productId) {
        acc[row.orderId].products.push({
          productId: row.productId,
          name: row.productName,
          price: row.productPrice,
          quantity: row.quantity
        });
      }
      return acc;
    }, {});
    res.json(Object.values(orders));
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ error: error.message });
  }
};

// Дневная статистика заказов по точкам
exports.getDailyOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT
         o.location_id AS locationId,
         l.name AS locationName,
         DAY(o.createdAt) AS day,
         MONTH(o.createdAt) AS month,
         YEAR(o.createdAt) AS year,
         COUNT(DISTINCT o.id) AS totalOrders,
         SUM(op.quantity * p.price) AS totalSalesAmount
       FROM orders o
       JOIN user_locations ul ON o.location_id = ul.location_id
       JOIN locations l ON o.location_id = l.id
       JOIN order_products op ON o.id = op.orderId
       JOIN products p ON op.productId = p.id
       WHERE ul.user_id = ?
       GROUP BY locationId, locationName, year, month, day
       ORDER BY locationId, year, month, day`,
      [userId]
    );
    const stats = rows.reduce((acc, r) => {
      if (!acc[r.locationId]) acc[r.locationId] = { locationId: r.locationId, locationName: r.locationName, daily: [] };
      acc[r.locationId].daily.push({ id: { year: r.year, month: r.month, day: r.day }, totalOrders: r.totalOrders, totalSalesAmount: r.totalSalesAmount });
      return acc;
    }, {});
    res.json(Object.values(stats));
  } catch (error) {
    console.error('Ошибка при получении дневной статистики заказов:', error);
    res.status(500).json({ error: error.message });
  }
};

// Месячная статистика заказов по точкам
exports.getMonthlyOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT
         o.location_id AS locationId,
         l.name AS locationName,
         MONTH(o.createdAt) AS month,
         YEAR(o.createdAt) AS year,
         COUNT(DISTINCT o.id) AS totalOrders,
         SUM(op.quantity * p.price) AS totalSalesAmount
       FROM orders o
       JOIN user_locations ul ON o.location_id = ul.location_id
       JOIN locations l ON o.location_id = l.id
       JOIN order_products op ON o.id = op.orderId
       JOIN products p ON op.productId = p.id
       WHERE ul.user_id = ?
       GROUP BY locationId, locationName, year, month
       ORDER BY locationId, year, month`,
      [userId]
    );
    const stats = rows.reduce((acc, r) => {
      if (!acc[r.locationId]) acc[r.locationId] = { locationId: r.locationId, locationName: r.locationName, monthly: [] };
      acc[r.locationId].monthly.push({ id: { year: r.year, month: r.month }, totalOrders: r.totalOrders, totalSalesAmount: r.totalSalesAmount });
      return acc;
    }, {});
    res.json(Object.values(stats));
  } catch (error) {
    console.error('Ошибка при получении месячной статистики заказов:', error);
    res.status(500).json({ error: error.message });
  }
};

// Годовая статистика заказов по точкам
exports.getYearlyOrderStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT
         o.location_id AS locationId,
         l.name AS locationName,
         YEAR(o.createdAt) AS year,
         COUNT(DISTINCT o.id) AS totalOrders,
         SUM(op.quantity * p.price) AS totalSalesAmount
       FROM orders o
       JOIN user_locations ul ON o.location_id = ul.location_id
       JOIN locations l ON o.location_id = l.id
       JOIN order_products op ON o.id = op.orderId
       JOIN products p ON op.productId = p.id
       WHERE ul.user_id = ?
       GROUP BY locationId, locationName, year
       ORDER BY locationId, year`,
      [userId]
    );
    const stats = rows.reduce((acc, r) => {
      if (!acc[r.locationId]) acc[r.locationId] = { locationId: r.locationId, locationName: r.locationName, yearly: [] };
      acc[r.locationId].yearly.push({ id: { year: r.year }, totalOrders: r.totalOrders, totalSalesAmount: r.totalSalesAmount });
      return acc;
    }, {});
    res.json(Object.values(stats));
  } catch (error) {
    console.error('Ошибка при получении годовой статистики заказов:', error);
    res.status(500).json({ error: error.message });
  }
};

// Дневная статистика продуктов по точкам
exports.getDailyProductStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT
         o.location_id AS locationId,
         l.name AS locationName,
         DAY(o.createdAt) AS day,
         MONTH(o.createdAt) AS month,
         YEAR(o.createdAt) AS year,
         p.name AS productName,
         p.price AS productPrice,
         SUM(op.quantity) AS totalQuantity,
         SUM(op.quantity * p.price) AS totalAmount
       FROM orders o
       JOIN user_locations ul ON o.location_id = ul.location_id
       JOIN locations l ON o.location_id = l.id
       JOIN order_products op ON o.id = op.orderId
       JOIN products p ON op.productId = p.id
       WHERE ul.user_id = ?
       GROUP BY locationId, locationName, year, month, day, productName, productPrice
       ORDER BY locationId, year, month, day, productName`,
      [userId]
    );
    const stats = rows.reduce((acc, r) => {
      if (!acc[r.locationId]) acc[r.locationId] = { locationId: r.locationId, locationName: r.locationName, dailyProducts: [] };
      acc[r.locationId].dailyProducts.push({
        id: { year: r.year, month: r.month, day: r.day },
        productName: r.productName,
        price: r.productPrice,
        quantity: r.totalQuantity,
        totalAmount: r.totalAmount
      });
      return acc;
    }, {});
    res.json(Object.values(stats));
  } catch (error) {
    console.error('Ошибка при получении дневной статистики продуктов:', error);
    res.status(500).json({ error: error.message });
  }
};

// Месячная статистика продуктов по точкам
exports.getMonthlyProductStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT
         o.location_id AS locationId,
         l.name AS locationName,
         MONTH(o.createdAt) AS month,
         YEAR(o.createdAt) AS year,
         p.name AS productName,
         p.price AS productPrice,
         SUM(op.quantity) AS totalQuantity,
         SUM(op.quantity * p.price) AS totalAmount
       FROM orders o
       JOIN user_locations ul ON o.location_id = ul.location_id
       JOIN locations l ON o.location_id = l.id
       JOIN order_products op ON o.id = op.orderId
       JOIN products p ON op.productId = p.id
       WHERE ul.user_id = ?
       GROUP BY locationId, locationName, year, month, productName, productPrice
       ORDER BY locationId, year, month, productName`,
      [userId]
    );
    const stats = rows.reduce((acc, r) => {
      if (!acc[r.locationId]) acc[r.locationId] = { locationId: r.locationId, locationName: r.locationName, monthlyProducts: [] };
      acc[r.locationId].monthlyProducts.push({
        id: { year: r.year, month: r.month },
        productName: r.productName,
        price: r.productPrice,
        quantity: r.totalQuantity,
        totalAmount: r.totalAmount
      });
      return acc;
    }, {});
    res.json(Object.values(stats));
  } catch (error) {
    console.error('Ошибка при получении месячной статистики продуктов:', error);
    res.status(500).json({ error: error.message });
  }
};

// Годовая статистика продуктов по точкам
exports.getYearlyProductStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      `SELECT
         o.location_id AS locationId,
         l.name AS locationName,
         YEAR(o.createdAt) AS year,
         p.name AS productName,
         p.price AS productPrice,
         SUM(op.quantity) AS totalQuantity,
         SUM(op.quantity * p.price) AS totalAmount
       FROM orders o
       JOIN user_locations ul ON o.location_id = ul.location_id
       JOIN locations l ON o.location_id = l.id
       JOIN order_products op ON o.id = op.orderId
       JOIN products p ON op.productId = p.id
       WHERE ul.user_id = ?
       GROUP BY locationId, locationName, year, productName, productPrice
       ORDER BY locationId, year, productName`,
      [userId]
    );
    const stats = rows.reduce((acc, r) => {
      if (!acc[r.locationId]) acc[r.locationId] = { locationId: r.locationId, locationName: r.locationName, yearlyProducts: [] };
      acc[r.locationId].yearlyProducts.push({
        id: { year: r.year },
        productName: r.productName,
        price: r.productPrice,
        quantity: r.totalQuantity,
        totalAmount: r.totalAmount
      });
      return acc;
    }, {});
    res.json(Object.values(stats));
  } catch (error) {
    console.error('Ошибка при получении годовой статистики продуктов:', error);
    res.status(500).json({ error: error.message });
  }
};

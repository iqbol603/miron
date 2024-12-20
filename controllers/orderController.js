const connectDB = require('../config/db'); // Подключаем функцию для соединения с БД

// Функция для получения продукта по ID
async function getProductById(productId) {
  const pool = await connectDB();  // Получаем пул соединений

  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    return rows[0]; // Возвращаем первый результат, если найден
  } catch (err) {
    throw new Error('Ошибка при получении продукта: ' + err.message);
  }
}

// Функция для получения клиента по ID
async function getCustomerById(customerId) {
  const pool = await connectDB();  // Получаем пул соединений

  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [customerId]);
    return rows[0]; // Возвращаем клиента
  } catch (err) {
    throw new Error('Ошибка при получении клиента: ' + err.message);
  }
}

// Генерация уникального orderId
async function generateUniqueOrderId() {
  let orderId;
  let isUnique = false;
  const pool = await connectDB();  // Получаем пул соединений

  while (!isUnique) {
    orderId = Math.floor(10000000 + Math.random() * 90000000); // Генерация случайного orderId
    try {
      const [rows] = await pool.query('SELECT * FROM orders WHERE orderId = ?', [orderId]);
      if (rows.length === 0) { // Если такого заказа нет
        isUnique = true; // Уникальный orderId найден
      }
    } catch (err) {
      throw new Error('Ошибка при проверке уникальности orderId: ' + err.message);
    }
  }

  return orderId;
}

// Создание нового заказа
exports.addOrder = async (req, res) => {
  try {
    const { products, customerId } = req.body;
    console.log("Received products:", products);

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "Неполные данные для заказа. Укажите продукты" });
    }

    let totalAmount = 0;
    const pool = await connectDB();  // Получаем пул соединений

    // Получаем продукты и общую сумму
    const orderProducts = await Promise.all(
      products.map(async ({ productId, quantity }) => {
        const product = await getProductById(productId);
        if (!product) throw new Error(`Продукт с ID ${productId} не найден`);

        totalAmount += product.price * quantity;
        return { product: product.id, quantity };
      })
    );

    // Генерация уникального orderId
    const orderId = await generateUniqueOrderId();

    // Создание заказа в базе данных
    const [result] = await pool.query('INSERT INTO orders (orderId, totalAmount, customerId) VALUES (?, ?, ?)', [
      orderId, totalAmount, customerId
    ]);

    // Получаем ID нового заказа
    const newOrderId = result.insertId;

    // Связь заказанных продуктов с заказом
    for (let { product, quantity } of orderProducts) {
      await pool.query('INSERT INTO order_products (orderId, productId, quantity) VALUES (?, ?, ?)', [
        newOrderId, product, quantity
      ]);
    }

    // Отправляем ответ с данными о заказе
    res.json({ orderId, totalAmount, products: orderProducts });
  } catch (error) {
    console.error("Ошибка при добавлении заказа:", error);
    res.status(500).json({ error: error.message });
  }
};



// Получение всех заказов
exports.getAllOrders = async (req, res) => {
  try {
    const pool = await connectDB(); // Получаем пул соединений

    // SQL-запрос для извлечения всех заказов с продуктами
    const query = `
      SELECT 
        o.id AS orderId,
        o.totalAmount,
        o.createdAt AS orderDate,
        op.productId,
        p.name AS productName,
        p.price AS productPrice,
        op.quantity
      FROM orders o
      LEFT JOIN order_products op ON o.id = op.orderId
      LEFT JOIN products p ON op.productId = p.id
    `;

    // Выполняем запрос
    const [rows] = await pool.query(query);

    // Группируем заказы и их продукты
    const orders = rows.reduce((acc, row) => {
      const { orderId, totalAmount, orderDate, productId, productName, productPrice, quantity } = row;

      if (!acc[orderId]) {
        acc[orderId] = {
          orderId,
          totalAmount,
          orderDate,
          products: [],
        };
      }

      if (productId) {
        acc[orderId].products.push({
          productId,
          name: productName,
          price: productPrice,
          quantity,
        });
      }

      return acc;
    }, {});

    // Преобразуем объект в массив
    const ordersArray = Object.values(orders);

    res.json(ordersArray);
  } catch (error) {
    console.error("Ошибка при получении заказов:", error);
    res.status(500).json({ error: error.message });
  }
};



// Дневная аналитика заказов
exports.getDailyOrderStats = async (req, res) => {
  try {
    const pool = await connectDB();

    const query = `
      SELECT 
        DAY(o.createdAt) AS day,
        MONTH(o.createdAt) AS month,
        YEAR(o.createdAt) AS year,
        COUNT(DISTINCT o.id) AS totalOrders,
        SUM(op.quantity * p.price) AS totalSalesAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p ON op.productId = p.id
      GROUP BY year, month, day
      ORDER BY year ASC, month ASC, day ASC
    `;

    const [rows] = await pool.query(query);

    const stats = rows.map(row => ({
      id: {
        day: row.day,
        month: row.month,
        year: row.year,
      },
      totalOrders: row.totalOrders,
      totalSalesAmount: row.totalSalesAmount,
    }));

    res.json(stats);
  } catch (error) {
    console.error("Ошибка при получении дневной аналитики заказов:", error);
    res.status(500).json({ error: error.message });
  }
};



// Дневная статистика продуктов
exports.getDailyProductStats = async (req, res) => {
  try {
    const pool = await connectDB();

    const query = `
      SELECT 
        DAY(o.createdAt) AS day,
        MONTH(o.createdAt) AS month,
        YEAR(o.createdAt) AS year,
        p.name AS productName,
        p.price AS productPrice,
        SUM(op.quantity) AS totalQuantity,
        SUM(op.quantity * p.price) AS totalAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p ON op.productId = p.id
      GROUP BY year, month, day, productName, productPrice
      ORDER BY year ASC, month ASC, day ASC, productName ASC
    `;

    const [rows] = await pool.query(query);

    const stats = rows.reduce((acc, row) => {
      const { day, month, year, productName, productPrice, totalQuantity, totalAmount } = row;

      const key = `${day}-${month}-${year}`;
      if (!acc[key]) {
        acc[key] = {
          id: { day, month, year },
          products: [],
        };
      }

      acc[key].products.push({
        name: productName,
        price: productPrice,
        quantity: totalQuantity,
        totalAmount,
      });

      return acc;
    }, {});

    const statsArray = Object.values(stats);

    res.json(statsArray);
  } catch (error) {
    console.error("Ошибка при получении дневной статистики продуктов:", error);
    res.status(500).json({ error: error.message });
  }
};






// Аналогичные изменения применим для getMonthlyOrderStats и getYearlyOrderStats


// Ежемесячная аналитика

exports.getMonthlyOrderStats = async (req, res) => {
  try {
    const pool = await connectDB();

    // SQL-запрос для месячной аналитики заказов
    const query = `
      SELECT 
        MONTH(o.createdAt) AS month,
        YEAR(o.createdAt) AS year,
        COUNT(DISTINCT o.id) AS totalOrders,
        SUM(op.quantity * p.price) AS totalSalesAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p ON op.productId = p.id
      GROUP BY year, month
      ORDER BY year ASC, month ASC
    `;

    const [rows] = await pool.query(query);

    // Форматируем результат
    const stats = rows.map(row => ({
      id: {
        month: row.month,
        year: row.year,
      },
      totalSalesAmount: row.totalSalesAmount,
      totalOrders: row.totalOrders,
    }));

    res.json(stats);
  } catch (error) {
    console.error("Ошибка при получении месячной аналитики заказов:", error);
    res.status(500).json({ error: error.message });
  }
};




exports.getMonthlyProductStats = async (req, res) => {
  try {
    const pool = await connectDB();

    // SQL-запрос для месячной аналитики продуктов
    const query = `
      SELECT 
        MONTH(o.createdAt) AS month,
        YEAR(o.createdAt) AS year,
        p.name AS productName,
        p.price AS productPrice,
        SUM(op.quantity) AS totalQuantity,
        SUM(op.quantity * p.price) AS totalAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p ON op.productId = p.id
      GROUP BY year, month, productName, productPrice
      ORDER BY year ASC, month ASC, productName ASC
    `;

    const [rows] = await pool.query(query);

    // Группируем результаты по месяцам
    const stats = rows.reduce((acc, row) => {
      const { month, year, productName, productPrice, totalQuantity, totalAmount } = row;

      const key = `${year}-${month}`;
      if (!acc[key]) {
        acc[key] = {
          id: { month, year },
          products: [],
        };
      }

      acc[key].products.push({
        name: productName,
        price: productPrice,
        quantity: totalQuantity,
        totalAmount,
      });

      return acc;
    }, {});

    // Преобразуем объект в массив
    const statsArray = Object.values(stats);

    res.json(statsArray);
  } catch (error) {
    console.error("Ошибка при получении статистики продуктов по месяцам:", error);
    res.status(500).json({ error: error.message });
  }
};









// Ежегодная аналитика
exports.getYearlyOrderStats = async (req, res) => {
  try {
    const pool = await connectDB();

    // SQL-запрос для годовой аналитики заказов
    const query = `
      SELECT 
        YEAR(o.createdAt) AS year,
        COUNT(DISTINCT o.id) AS totalOrders,
        SUM(op.quantity * p.price) AS totalSalesAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p ON op.productId = p.id
      GROUP BY year
      ORDER BY year ASC;
    `;

    const [rows] = await pool.query(query);

    // Форматируем результат
    const stats = rows.map(row => ({
      id: {
        year: row.year,
      },
      totalSalesAmount: row.totalSalesAmount,
      totalOrders: row.totalOrders,
    }));

    res.json(stats);
  } catch (error) {
    console.error("Ошибка при получении годовой аналитики заказов:", error);
    res.status(500).json({ error: error.message });
  }
};




exports.getYearlyProductStats = async (req, res) => {
  try {
    const pool = await connectDB();

    // SQL-запрос для годовой аналитики продуктов
    const query = `
      SELECT 
        YEAR(o.createdAt) AS year,
        p.name AS productName,
        p.price AS productPrice,
        SUM(op.quantity) AS totalQuantity,
        SUM(op.quantity * p.price) AS totalAmount
      FROM orders o
      JOIN order_products op ON o.id = op.orderId
      JOIN products p ON op.productId = p.id
      GROUP BY year, productName, productPrice
      ORDER BY year ASC, productName ASC;
    `;

    const [rows] = await pool.query(query);

    // Группируем результаты по годам
    const stats = rows.reduce((acc, row) => {
      const { year, productName, productPrice, totalQuantity, totalAmount } = row;

      if (!acc[year]) {
        acc[year] = {
          id: year,
          products: [],
        };
      }

      acc[year].products.push({
        name: productName,
        price: productPrice,
        quantity: totalQuantity,
        totalAmount,
      });

      return acc;
    }, {});

    // Преобразуем объект в массив
    const statsArray = Object.values(stats);

    res.json(statsArray);
  } catch (error) {
    console.error("Ошибка при получении статистики продуктов по годам:", error);
    res.status(500).json({ error: error.message });
  }
};






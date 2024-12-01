const connectDB = require('../config/db'); // Подключаем функцию для соединения с БД

// Добавление нового клиента
exports.addCustomer = async (req, res) => {
  const { name, phone, email, price } = req.body;

  if (!name || !phone || !price) {
    return res.status(400).json({ error: 'Name, phone, and price are required' });
  }

  const query = 'INSERT INTO customers (name, phone, email, price, createdAt) VALUES (?, ?, ?, ?, NOW())';
  const values = [name, phone, email, price];

  try {
    const connection = await connectDB();
    const [result] = await connection.execute(query, values);
    res.status(201).json({ id: result.insertId, name, phone, email, price });
    connection.end();
  } catch (error) {
    console.error('Error inserting customer:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение всех клиентов
exports.getCustomers = async (req, res) => {
  const query = 'SELECT * FROM customers';

  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(query);
    res.json(rows);
    connection.end();
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
};

// Редактирование информации о клиенте
exports.updateCustomer = async (req, res) => {
  const { name, phone, email, price } = req.body;
  const query = 'UPDATE customers SET name = ?, phone = ?, email = ?, price = ? WHERE id = ?';
  const values = [name, phone, email, price, req.params.id];

  try {
    const connection = await connectDB();
    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully' });
    connection.end();
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: error.message });
  }
};

// Удаление клиента
exports.deleteCustomer = async (req, res) => {
  const query = 'DELETE FROM customers WHERE id = ?';
  const values = [req.params.id];

  try {
    const connection = await connectDB();
    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
    connection.end();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение аналитики по добавленным клиентам за каждый день
exports.getDailyCustomerStats = async (req, res) => {
  const query = `
    SELECT DAY(createdAt) AS day, MONTH(createdAt) AS month, YEAR(createdAt) AS year, 
           COUNT(*) AS totalCustomers, SUM(price) AS totalSalesAmount
    FROM customers
    GROUP BY YEAR(createdAt), MONTH(createdAt), DAY(createdAt)
    ORDER BY year, month, day;
  `;

  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(query);
    res.json(rows);
    connection.end();
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение аналитики по добавленным клиентам за каждый месяц
exports.getMonthlyCustomerStats = async (req, res) => {
  const query = `
    SELECT MONTH(createdAt) AS month, YEAR(createdAt) AS year, 
           COUNT(*) AS totalCustomers, SUM(price) AS totalSalesAmount
    FROM customers
    GROUP BY YEAR(createdAt), MONTH(createdAt)
    ORDER BY year, month;
  `;

  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(query);
    res.json(rows);
    connection.end();
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// Получение аналитики по добавленным клиентам за каждый год
exports.getYearlyCustomerStats = async (req, res) => {
  const query = `
    SELECT YEAR(createdAt) AS year, 
           COUNT(*) AS totalCustomers, SUM(price) AS totalSalesAmount
    FROM customers
    GROUP BY YEAR(createdAt)
    ORDER BY year;
  `;

  try {
    const connection = await connectDB();
    const [rows] = await connection.execute(query);
    res.json(rows);
    connection.end();
  } catch (error) {
    console.error('Error fetching yearly stats:', error);
    res.status(500).json({ error: error.message });
  }
};

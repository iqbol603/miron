// controllers/locationController.js
const db = require('../config/db');

exports.listLocations = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, name FROM locations ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось получить список точек' });
  }
};

exports.createLocation = async (req, res) => {
  const { name, address } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO locations (name, address) VALUES (?, ?)',
      [name, address]
    );
    res.status(201).json({ id: result.insertId, name, address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Не удалось создать точку' });
  }
};

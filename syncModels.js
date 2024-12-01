const sequelize = require('./config/db');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Customer = require('./models/Customer');

// Синхронизация всех моделей с базой данных
async function syncModels() {
  try {
    // Синхронизируем модели
    await sequelize.sync({ force: true }); // 'force: true' удаляет таблицы, если они уже существуют (будьте осторожны)

    console.log("Таблицы успешно синхронизированы!");

    // Закрываем соединение с базой данных
    await sequelize.close();
  } catch (error) {
    console.error('Ошибка при синхронизации моделей:', error);
  }
}

syncModels();

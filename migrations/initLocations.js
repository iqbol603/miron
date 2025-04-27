// migrations/initLocations.js
const db = require('../config/db');

(async () => {
  try {
    // 1) Создать таблицу locations, если её нет
    await db.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2) Вставить дефолтную точку с id = 1, если её ещё нет
    await db.query(`
      INSERT INTO locations (id, name, address)
      SELECT 1, 'Точка 1 (Шаурмания)', 'Основная точка'
      FROM DUAL
      WHERE NOT EXISTS (SELECT 1 FROM locations WHERE id = 1);
    `);

    console.log('ℹ️  Точка 1 добавлена в locations (если отсутствовала)');

    // 3) Создать таблицу user_locations, если её нет
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_locations (
        user_id     INT NOT NULL,
        location_id INT NOT NULL,
        PRIMARY KEY (user_id, location_id),
        FOREIGN KEY (user_id)     REFERENCES users(id),
        FOREIGN KEY (location_id) REFERENCES locations(id)
      );
    `);

    // 4) Проверить наличие столбца location_id в orders
    const [cols] = await db.query(`
      SHOW COLUMNS FROM orders LIKE 'location_id';
    `);
    if (cols.length === 0) {
      // 5) Добавить столбец (по умолчанию = 1)
      await db.query(`
        ALTER TABLE orders
          ADD COLUMN location_id INT DEFAULT 1;
      `);
      console.log('➕ Добавлен orders.location_id');
    } else {
      console.log('ℹ️  Столбец orders.location_id уже существует');
    }

    // 6) Заполнить существующие заказы значением 1
    await db.query(`
      UPDATE orders
        SET location_id = 1
        WHERE location_id IS NULL;
    `);
    console.log('✅ Старые заказы привязаны к точке 1');

    // 7) Сделать столбец NOT NULL
    await db.query(`
      ALTER TABLE orders
        MODIFY COLUMN location_id INT NOT NULL;
    `);
    console.log('🔒 orders.location_id теперь NOT NULL');

    console.log('🎉 Миграции завершены успешно');
    process.exit(0);

  } catch (err) {
    console.error('❌ Ошибка миграции:', err);
    process.exit(1);
  }
})();

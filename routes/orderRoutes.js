// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const orderController = require("../controllers/orderController");

// Создание нового заказа (требует авторизации)
router.post("/", auth, orderController.addOrder);

// Получение всех заказов (только по своим точкам)
router.get("/", auth, orderController.getAllOrders);

// Статистика заказов по дням
router.get("/stats/daily", auth, orderController.getDailyOrderStats);

// Статистика продуктов по дням
router.get("/products/daily", auth, orderController.getDailyProductStats);

// Месячная аналитика заказов
router.get("/stats/monthly", auth, orderController.getMonthlyOrderStats);

// Месячная статистика продуктов
router.get("/stats/products/monthly", auth, orderController.getMonthlyProductStats);

// Годовая аналитика заказов
router.get("/stats/yearly", auth, orderController.getYearlyOrderStats);

// Годовая статистика продуктов
router.get("/products/yearly", auth, orderController.getYearlyProductStats);

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const orderController = require("../controllers/orderController");

// router.post("/", orderController.addOrder); // Создание нового заказа
// router.get("/", orderController.getAllOrders); // Получение всех заказов
// router.get("/stats/daily", orderController.getDailyOrderStats);
// router.get("/products/daily", orderController.getDailyProductStats);
// router.get("/stats/monthly", orderController.getMonthlyOrderStats);
// router.get("/stats/products/monthly", orderController.getMonthlyProductStats);
// router.get("/stats/yearly", orderController.getYearlyOrderStats);
// router.get("/products/yearly", orderController.getYearlyProductStats);

// module.exports = router;

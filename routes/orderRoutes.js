const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.addOrder); // Создание нового заказа
router.get("/", orderController.getAllOrders); // Получение всех заказов
router.get("/stats/daily", orderController.getDailyOrderStats);
router.get("/products/daily", orderController.getDailyProductStats);
router.get("/stats/monthly", orderController.getMonthlyOrderStats);
router.get("/stats/products/monthly", orderController.getMonthlyProductStats);
router.get("/stats/yearly", orderController.getYearlyOrderStats);
router.get("/products/yearly", orderController.getYearlyProductStats);

module.exports = router;

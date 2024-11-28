const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");

router.post("/", salesController.addSale); // Добавление новой продажи
router.get("/daily", salesController.getDailySales); // Ежедневная аналитика
router.get("/monthly", salesController.getMonthlySales); // Ежемесячная аналитика
router.get("/yearly", salesController.getYearlySales); // Годовая аналитика

module.exports = router;

// routes/customerRoutes.js
const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");

router.post("/", customerController.addCustomer);
router.get("/", customerController.getCustomers);
router.put("/:id", customerController.updateCustomer); // Новый маршрут для редактирования
router.delete("/:id", customerController.deleteCustomer); // Новый маршрут для удаления
router.get("/stats/daily", customerController.getDailyCustomerStats); // Ежедневная аналитика клиентов
router.get("/stats/monthly", customerController.getMonthlyCustomerStats); // Ежемесячная аналитика клиентов
router.get("/stats/yearly", customerController.getYearlyCustomerStats); // Годовая аналитика клиентов


module.exports = router;

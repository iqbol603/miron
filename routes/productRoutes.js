const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.post("/", productController.addProduct); // Добавление нового продукта
router.get("/", productController.getProducts); // Получение всех продуктов

module.exports = router;

const express = require('express');
// const { registerUser, loginUser } = require('../controllers/authController');
const authController = require("../controllers/authController");
const router = express.Router();

// Роут для регистрации
router.post('/register', authController.registerUser);

// Роут для авторизации
router.post('/login', authController.loginUser);

module.exports = router;

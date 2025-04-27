// routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
// Если у вас есть авторизация — вставьте сюда middleware:
// const auth = require('../middleware/auth');

router.get('/', /* auth, */ locationController.listLocations);
router.post('/', /* authAdmin, */ locationController.createLocation);

module.exports = router;

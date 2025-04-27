// // routes/statisticsRoutes.js
// const express = require('express');
// const router = express.Router();
// const statisticsController = require('../controllers/statisticsController');
// // const auth = require('../middleware/auth');  // если у вас есть авторизация

// router.get('/locations', /* auth, */ statisticsController.ordersByLocation);

// module.exports = router;

// routes/statisticsRoutes.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const ctrl    = require('../controllers/statisticsController');

// теперь все эти эндпоинты доступны только залогиненным
router.get('/locations', auth, ctrl.ordersByLocation);
router.get('/orders/daily',     auth, ctrl.getDailyOrderStats);
router.get('/orders/monthly',   auth, ctrl.getMonthlyOrderStats);
router.get('/orders/yearly',    auth, ctrl.getYearlyOrderStats);
router.get('/products/daily',   auth, ctrl.getDailyProductStats);
router.get('/products/monthly', auth, ctrl.getMonthlyProductStats);
router.get('/products/yearly',  auth, ctrl.getYearlyProductStats);

module.exports = router;

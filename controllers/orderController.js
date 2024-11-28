const Order = require("../models/Order");
const Product = require("../models/Product");

// Создание нового заказа
async function generateUniqueOrderId() {
  let orderId;
  let isUnique = false;

  while (!isUnique) {
    orderId = Math.floor(10000000 + Math.random() * 90000000);
    const existingOrder = await Order.findOne({ orderId });
    if (!existingOrder) {
      isUnique = true;
    }
  }
  return orderId;
}

// Создание нового заказа
exports.addOrder = async (req, res) => {
  try {
    const { products } = req.body;
    console.log("Received products:", products);

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "Неполные данные для заказа. Укажите продукты" });
    }

    let totalAmount = 0;

    // Получаем продукты и общую сумму
    const orderProducts = await Promise.all(
      products.map(async ({ productId, quantity }) => {
        const product = await Product.findById(productId);
        if (!product) throw new Error(`Продукт с ID ${productId} не найден`);

        totalAmount += product.price * quantity;
        return { product: product._id, quantity };
      })
    );

    // Генерация уникального orderId
    const orderId = await generateUniqueOrderId();

    // Создание заказа с orderId
    const order = new Order({
      orderId,
      products: orderProducts,
      totalAmount,
    });

    await order.save();
    res.json(order);
  } catch (error) {
    console.error("Ошибка при добавлении заказа:", error);
    res.status(500).json({ error: error.message });
  }
};

// Получение всех заказов
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("products.product");
    res.json(orders);
  } catch (error) {
    console.error("Ошибка при получении заказов:", error);
    res.status(500).json({ error: error.message });
  }
};


// Дневная аналитика
exports.getDailyOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalSalesAmount: {
            $sum: { $multiply: ["$products.quantity", "$productDetails.price"] },
          },
          uniqueOrders: { $addToSet: "$_id" }, // Собираем уникальные ID заказов
        },
      },
      {
        $project: {
          _id: 1,
          totalSalesAmount: 1,
          totalOrders: { $size: "$uniqueOrders" }, // Подсчитываем количество уникальных заказов
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Ошибка при получении дневной статистики заказов:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getDailyProductStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
            name: "$productDetails.name",
            price: "$productDetails.price",
          },
          quantity: { $sum: "$products.quantity" },
          totalAmount: {
            $sum: { $multiply: ["$products.quantity", "$productDetails.price"] },
          },
        },
      },
      {
        $group: {
          _id: {
            day: "$_id.day",
            month: "$_id.month",
            year: "$_id.year",
          },
          products: {
            $push: {
              name: "$_id.name",
              price: "$_id.price",
              quantity: "$quantity",
              totalAmount: "$totalAmount",
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Ошибка при получении статистики продуктов за день:", error);
    res.status(500).json({ error: error.message });
  }
};



// Аналогичные изменения применим для getMonthlyOrderStats и getYearlyOrderStats


// Ежемесячная аналитика

exports.getMonthlyOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalSalesAmount: {
            $sum: { $multiply: ["$products.quantity", "$productDetails.price"] },
          },
          uniqueOrders: { $addToSet: "$_id" }, // Собираем уникальные ID заказов
        },
      },
      {
        $project: {
          _id: 1,
          totalSalesAmount: 1,
          totalOrders: { $size: "$uniqueOrders" }, // Подсчитываем количество уникальных заказов
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Ошибка при получении месячной статистики заказов:", error);
    res.status(500).json({ error: error.message });
  }
};



exports.getMonthlyProductStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
            name: "$productDetails.name",
            price: "$productDetails.price",
          },
          quantity: { $sum: "$products.quantity" },
          totalAmount: {
            $sum: { $multiply: ["$products.quantity", "$productDetails.price"] },
          },
        },
      },
      {
        $group: {
          _id: {
            month: "$_id.month",
            year: "$_id.year",
          },
          products: {
            $push: {
              name: "$_id.name",
              price: "$_id.price",
              quantity: "$quantity",
              totalAmount: "$totalAmount",
            },
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }, // Сортировка по годам и месяцам
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Ошибка при получении статистики продуктов по месяцам:", error);
    res.status(500).json({ error: error.message });
  }
};








// Ежегодная аналитика
exports.getYearlyOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
          },
          totalSalesAmount: {
            $sum: { $multiply: ["$products.quantity", "$productDetails.price"] },
          },
          uniqueOrders: { $addToSet: "$_id" }, // Собираем уникальные ID заказов
        },
      },
      {
        $project: {
          _id: 1,
          totalSalesAmount: 1,
          totalOrders: { $size: "$uniqueOrders" }, // Подсчитываем количество уникальных заказов
        },
      },
      { $sort: { "_id.year": 1 } },
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Ошибка при получении годовой статистики заказов:", error);
    res.status(500).json({ error: error.message });
  }
};



exports.getYearlyProductStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            name: "$productDetails.name",
            price: "$productDetails.price",
          },
          quantity: { $sum: "$products.quantity" },
          totalAmount: {
            $sum: { $multiply: ["$products.quantity", "$productDetails.price"] },
          },
        },
      },
      {
        $group: {
          _id: "$_id.year", // Группировка по году
          products: {
            $push: {
              name: "$_id.name",
              price: "$_id.price",
              quantity: "$quantity",
              totalAmount: "$totalAmount",
            },
          },
        },
      },
      { $sort: { _id: 1 } }, // Сортировка по году
    ]);

    res.json(stats);
  } catch (error) {
    console.error("Ошибка при получении статистики продуктов по годам:", error);
    res.status(500).json({ error: error.message });
  }
};





const Sale = require("../models/Sale");
const Product = require("../models/Product");

exports.addSale = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    const saleProducts = await Promise.all(
      products.map(async ({ productId, quantity }) => {
        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");
        return { product: product._id, quantity };
      })
    );

    const sale = new Sale({
      products: saleProducts,
      totalAmount,
    });
    await sale.save();
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

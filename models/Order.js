const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderId: { type: Number, unique: true, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: false },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

async function generateUniqueOrderId() {
  let orderId;
  let isUnique = false;

  while (!isUnique) {
    orderId = Math.floor(10000000 + Math.random() * 90000000);
    const existingOrder = await mongoose.model("Order").findOne({ orderId });
    if (!existingOrder) {
      isUnique = true;
    }
  }
  return orderId;
}

OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    console.log("Generating unique orderId...");
    this.orderId = await generateUniqueOrderId();
    console.log("Generated orderId:", this.orderId);
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);

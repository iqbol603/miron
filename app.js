require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();
connectDB();
const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
// app.use("/api/sales", require("./routes/salesRoutes"));


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

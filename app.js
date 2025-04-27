require("dotenv").config();
const express = require("express");
const db = require("./config/db");

const app = express();
// db();
const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/locations", require("./routes/locationRoutes"));
app.use("/api/statistics", require("./routes/statisticsRoutes"));
// app.use("/api/sales", require("./routes/salesRoutes"));


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const diemDenRoutes = require("./routes/diemDenRoutes");
const tourRoutes = require("./routes/tourRoutes");
const { requestLogger, notFound, errorHandler } = require("./middlewares");

const app = express();

app.use((req, res, next) => {
  res.setHeader("X-Student-Id", process.env.STUDENT_ID || "N23DCPT056");
  next();
});
app.use(requestLogger);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Backend quản lý tour du lịch đang hoạt động",
    studentId: process.env.STUDENT_ID || "N23DCPT056",
  });
});
app.use("/api/diem-den", diemDenRoutes);
app.use("/api/tour", tourRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5020;

if (require.main === module) {
  if (!process.env.MONGODB_URI) {
    console.error("Thiếu MONGODB_URI trong file .env");
    process.exit(1);
  }

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Đã kết nối MongoDB");
      app.listen(PORT, () => console.log(`Backend đang chạy tại http://localhost:${PORT}`));
    })
    .catch((error) => {
      console.error("Không thể kết nối MongoDB:", error.message);
      process.exit(1);
    });
}

module.exports = app;

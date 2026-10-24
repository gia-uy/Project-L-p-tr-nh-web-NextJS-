const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");

const diemDenSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => randomUUID(), unique: true, index: true },
    ten: { type: String, required: true, trim: true, unique: true },
    quocGia: { type: String, required: true, trim: true },
    hinhAnh: { type: String, trim: true, default: "" },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.models.DiemDen || mongoose.model("DiemDen", diemDenSchema);
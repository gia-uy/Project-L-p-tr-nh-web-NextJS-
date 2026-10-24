const mongoose = require("mongoose");
const { randomUUID } = require("node:crypto");

const tourSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => randomUUID(), unique: true, index: true },
    maTour: { type: String, required: true, trim: true, uppercase: true, unique: true },
    tenTour: { type: String, required: true, trim: true },
    ngayKhoiHanh: { type: Date, required: true },
    ngayKetThuc: { type: Date, required: true },
    soNgay: { type: Number, required: true, min: 1, max: 15 },
    giaNguoiLon: { type: Number, required: true, min: 0 },
    soChoToiDa: { type: Number, required: true, min: 10, max: 50 },
    soChoDaDat: { type: Number, required: true, min: 0, default: 0 },
    diemDenId: { type: String, required: true, index: true },
    hinhAnh: { type: String, trim: true, default: "" },
  },
  { timestamps: true, versionKey: false },
);

tourSchema.virtual("conCho").get(function getConCho() {
  return this.soChoToiDa - this.soChoDaDat;
});
tourSchema.set("toJSON", { virtuals: true });
tourSchema.set("toObject", { virtuals: true });

module.exports = mongoose.models.Tour || mongoose.model("Tour", tourSchema);
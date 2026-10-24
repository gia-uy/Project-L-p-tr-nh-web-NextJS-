const DiemDen = require("../models/DiemDen");
const Tour = require("../models/Tour");
const { httpError } = require("./helpers");

function validateImagePath(value) {
  const path = String(value || "").trim();
  if (path && (!/^\/images\/[A-Za-z0-9._/-]+$/.test(path) || path.includes(".."))) {
    throw httpError(400, "Đường dẫn ảnh không hợp lệ", [
      { field: "hinhAnh", message: "Dùng đường dẫn cục bộ dạng /images/ten-anh.jpg" },
    ]);
  }
  return path;
}

async function list(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 5));
  const [data, total] = await Promise.all([
    DiemDen.find().sort({ ten: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    DiemDen.countDocuments(),
  ]);
  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

async function create(req, res) {
  const ten = String(req.body.ten || "").trim();
  const quocGia = String(req.body.quocGia || "").trim();
  const details = [];
  if (!ten) details.push({ field: "ten", message: "Tên điểm đến là bắt buộc" });
  if (!quocGia) details.push({ field: "quocGia", message: "Quốc gia là bắt buộc" });
  if (details.length) throw httpError(400, "Dữ liệu điểm đến không hợp lệ", details);
  const hinhAnh = validateImagePath(req.body.hinhAnh);
  const item = await DiemDen.create({ ten, quocGia, hinhAnh });
  res.status(201).json(item);
}

async function update(req, res) {
  const item = await DiemDen.findOne({ id: req.params.id });
  if (!item) throw httpError(404, "Không tìm thấy điểm đến");
  const ten = req.body.ten === undefined ? item.ten : String(req.body.ten).trim();
  const quocGia = req.body.quocGia === undefined ? item.quocGia : String(req.body.quocGia).trim();
  const hinhAnh = req.body.hinhAnh === undefined ? item.hinhAnh : validateImagePath(req.body.hinhAnh);
  const details = [];
  if (!ten) details.push({ field: "ten", message: "Tên điểm đến là bắt buộc" });
  if (!quocGia) details.push({ field: "quocGia", message: "Quốc gia là bắt buộc" });
  if (details.length) throw httpError(400, "Dữ liệu điểm đến không hợp lệ", details);
  item.ten = ten;
  item.quocGia = quocGia;
  item.hinhAnh = hinhAnh;
  await item.save();
  res.json(item);
}

async function remove(req, res) {
  const item = await DiemDen.findOne({ id: req.params.id });
  if (!item) throw httpError(404, "Không tìm thấy điểm đến");
  if (await Tour.exists({ diemDenId: item.id })) {
    throw httpError(409, "Không thể xóa điểm đến đang được tour sử dụng");
  }
  await item.deleteOne();
  res.json({ message: "Đã xóa điểm đến" });
}

module.exports = { list, create, update, remove };

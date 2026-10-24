const Tour = require("../models/Tour");
const DiemDen = require("../models/DiemDen");
const {
  httpError, parseDate, addDays, validateTour, ensureDestination, escapeRegex,
} = require("./helpers");

async function withDestination(tour) {
  const destination = await DiemDen.findOne({ id: tour.diemDenId }).lean();
  return { ...tour, conCho: tour.soChoToiDa - tour.soChoDaDat, diemDen: destination || null };
}

async function list(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 5));
  const order = String(req.query.order || "asc").toLowerCase();
  const sort = String(req.query.sort || "ngayKhoiHanh");
  if (!["asc", "desc"].includes(order)) throw httpError(400, "order chỉ nhận asc hoặc desc");
  if (!["ngayKhoiHanh", "giaNguoiLon"].includes(sort)) throw httpError(400, "sort chỉ nhận ngayKhoiHanh hoặc giaNguoiLon");

  const filter = {};
  if (req.query.q) {
    const query = new RegExp(escapeRegex(req.query.q), "i");
    filter.$or = [{ tenTour: query }, { maTour: query }];
  }
  if (req.query.diemDenId) filter.diemDenId = String(req.query.diemDenId);
  const expressions = [];
  if (req.query.thang !== undefined) {
    const month = Number(req.query.thang);
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw httpError(400, "thang phải là số từ 1 đến 12", [{ field: "thang", message: "Chọn tháng từ 1 đến 12" }]);
    }
    expressions.push({ $eq: [{ $month: "$ngayKhoiHanh" }, month] });
  }
  if (req.query.giaMax !== undefined) {
    const max = Number(req.query.giaMax);
    if (!Number.isFinite(max) || max < 0) throw httpError(400, "giaMax phải là số không âm");
    filter.giaNguoiLon = { $lte: max };
  }
  if (String(req.query.conCho).toLowerCase() === "true") {
    expressions.push({ $gt: ["$soChoToiDa", "$soChoDaDat"] });
  }
  if (expressions.length === 1) filter.$expr = expressions[0];
  if (expressions.length > 1) filter.$expr = { $and: expressions };

  const [records, total] = await Promise.all([
    Tour.find(filter).sort({ [sort]: order === "asc" ? 1 : -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Tour.countDocuments(filter),
  ]);
  const data = await Promise.all(records.map(withDestination));
  res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
}

async function getById(req, res) {
  const tour = await Tour.findOne({ id: req.params.id }).lean();
  if (!tour) throw httpError(404, "Không tìm thấy tour");
  res.json(await withDestination(tour));
}

async function create(req, res) {
  const input = req.body;
  validateTour(input, { isCreate: true });
  await ensureDestination(input.diemDenId);
  const start = parseDate(input.ngayKhoiHanh, "ngayKhoiHanh");
  const item = await Tour.create({
    maTour: String(input.maTour).trim().toUpperCase(),
    tenTour: String(input.tenTour).trim(),
    ngayKhoiHanh: start,
    ngayKetThuc: addDays(start, Number(input.soNgay) - 1),
    soNgay: Number(input.soNgay),
    giaNguoiLon: Number(input.giaNguoiLon),
    soChoToiDa: Number(input.soChoToiDa),
    soChoDaDat: Number(input.soChoDaDat || 0),
    diemDenId: String(input.diemDenId),
  });
  res.status(201).json(await withDestination(item.toObject()));
}

async function update(req, res) {
  const item = await Tour.findOne({ id: req.params.id });
  if (!item) throw httpError(404, "Không tìm thấy tour");
  const input = { ...item.toObject(), ...req.body };
  validateTour(input);
  if (Number(input.soChoToiDa) < item.soChoDaDat) {
    throw httpError(400, "Số chỗ tối đa không thể thấp hơn số chỗ đã đặt", [
      { field: "soChoToiDa", message: `Tour đã đặt ${item.soChoDaDat} chỗ` },
    ]);
  }
  await ensureDestination(String(input.diemDenId));
  const start = parseDate(input.ngayKhoiHanh, "ngayKhoiHanh");
  item.maTour = String(input.maTour).trim().toUpperCase();
  item.tenTour = String(input.tenTour).trim();
  item.ngayKhoiHanh = start;
  item.soNgay = Number(input.soNgay);
  item.ngayKetThuc = addDays(start, item.soNgay - 1);
  item.giaNguoiLon = Number(input.giaNguoiLon);
  item.soChoToiDa = Number(input.soChoToiDa);
  item.soChoDaDat = Number(input.soChoDaDat);
  item.diemDenId = String(input.diemDenId);
  await item.save();
  res.json(await withDestination(item.toObject()));
}

async function remove(req, res) {
  const item = await Tour.findOne({ id: req.params.id });
  if (!item) throw httpError(404, "Không tìm thấy tour");
  if (item.soChoDaDat > 0) throw httpError(409, "Không thể xóa tour đã có người đặt chỗ");
  await item.deleteOne();
  res.json({ message: "Đã xóa tour" });
}

async function book(req, res) {
  const soNguoi = Number(req.body.soNguoi);
  if (!Number.isInteger(soNguoi) || soNguoi < 1) {
    throw httpError(400, "soNguoi phải là số nguyên lớn hơn 0", [
      { field: "soNguoi", message: "Nhập số người hợp lệ" },
    ]);
  }
  const now = new Date();
  const tour = await Tour.findOneAndUpdate(
    {
      id: req.params.id,
      ngayKhoiHanh: { $gt: now },
      $expr: { $lte: [{ $add: ["$soChoDaDat", soNguoi] }, "$soChoToiDa"] },
    },
    { $inc: { soChoDaDat: soNguoi } },
    { new: true, runValidators: true },
  ).lean();

  if (!tour) {
    const existing = await Tour.findOne({ id: req.params.id }).lean();
    if (!existing) throw httpError(404, "Không tìm thấy tour");
    if (existing.ngayKhoiHanh <= now) throw httpError(400, "Tour đã khởi hành");
    throw httpError(400, "Số chỗ còn lại không đủ");
  }
  res.json({
    ...await withDestination(tour),
    phanTramDaDat: Math.round((tour.soChoDaDat / tour.soChoToiDa) * 100),
  });
}

async function stats(req, res) {
  const [totalTours, tours, destinations] = await Promise.all([
    Tour.countDocuments(),
    Tour.find().select("diemDenId soChoDaDat giaNguoiLon").lean(),
    DiemDen.find().select("id ten quocGia").lean(),
  ]);
  const bookings = new Map();
  let doanhThuDuKien = 0;
  for (const tour of tours) {
    bookings.set(tour.diemDenId, (bookings.get(tour.diemDenId) || 0) + tour.soChoDaDat);
    doanhThuDuKien += tour.soChoDaDat * tour.giaNguoiLon;
  }
  res.json({
    tongSoTour: totalTours,
    tongSoChoDaDat: tours.reduce((sum, tour) => sum + tour.soChoDaDat, 0),
    doanhThuDuKien,
    theoDiemDen: destinations.map((destination) => ({
      diemDenId: destination.id,
      ten: destination.ten,
      quocGia: destination.quocGia,
      soChoDaDat: bookings.get(destination.id) || 0,
    })),
  });
}

module.exports = { list, getById, create, update, remove, book, stats };

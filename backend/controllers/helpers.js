const DiemDen = require("../models/DiemDen");

function httpError(status, message, details = []) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

function parseDate(value, field) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    throw httpError(400, `${field} không hợp lệ`, [{ field, message: "Vui lòng nhập ngày hợp lệ" }]);
  }
  return date;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function validateTour(input, { isCreate = false } = {}) {
  const errors = [];
  const required = ["maTour", "tenTour", "ngayKhoiHanh", "soNgay", "giaNguoiLon", "soChoToiDa", "diemDenId"];
  for (const field of required) {
    if (input[field] === undefined || input[field] === null || input[field] === "") {
      errors.push({ field, message: "Trường này là bắt buộc" });
    }
  }

  if (input.maTour !== undefined && !/^T\d{3}$/.test(String(input.maTour).trim().toUpperCase())) {
    errors.push({ field: "maTour", message: "Mã tour phải có dạng T và 3 chữ số (ví dụ T001)" });
  }
  if (input.tenTour !== undefined && !String(input.tenTour).trim()) {
    errors.push({ field: "tenTour", message: "Tên tour không được để trống" });
  }
  if (input.soNgay !== undefined && (!Number.isInteger(Number(input.soNgay)) || Number(input.soNgay) < 1 || Number(input.soNgay) > 15)) {
    errors.push({ field: "soNgay", message: "Số ngày phải là số nguyên từ 1 đến 15" });
  }
  if (input.giaNguoiLon !== undefined && (!Number.isFinite(Number(input.giaNguoiLon)) || Number(input.giaNguoiLon) <= 0)) {
    errors.push({ field: "giaNguoiLon", message: "Giá người lớn phải lớn hơn 0" });
  }
  if (input.soChoToiDa !== undefined && (!Number.isInteger(Number(input.soChoToiDa)) || Number(input.soChoToiDa) < 10 || Number(input.soChoToiDa) > 50)) {
    errors.push({ field: "soChoToiDa", message: "Số chỗ tối đa phải là số nguyên từ 10 đến 50" });
  }
  if (input.soChoDaDat !== undefined && (!Number.isInteger(Number(input.soChoDaDat)) || Number(input.soChoDaDat) < 0)) {
    errors.push({ field: "soChoDaDat", message: "Số chỗ đã đặt phải là số nguyên không âm" });
  }
  if (input.ngayKhoiHanh !== undefined) {
    const date = new Date(input.ngayKhoiHanh);
    if (Number.isNaN(date.getTime())) {
      errors.push({ field: "ngayKhoiHanh", message: "Ngày khởi hành không hợp lệ" });
    } else if (isCreate && date <= new Date()) {
      errors.push({ field: "ngayKhoiHanh", message: "Ngày khởi hành phải ở tương lai" });
    }
  }
  if (input.soChoDaDat !== undefined && input.soChoToiDa !== undefined && Number(input.soChoDaDat) > Number(input.soChoToiDa)) {
    errors.push({ field: "soChoDaDat", message: "Số chỗ đã đặt không được vượt số chỗ tối đa" });
  }
  if (errors.length) throw httpError(400, "Dữ liệu tour không hợp lệ", errors);
}

async function ensureDestination(id) {
  const destination = await DiemDen.findOne({ id });
  if (!destination) {
    throw httpError(400, "Điểm đến không tồn tại", [{ field: "diemDenId", message: "Vui lòng chọn điểm đến hợp lệ" }]);
  }
  return destination;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateImagePath(value) {
  const path = String(value || "").trim();
  if (path && (!/^\/images\/[A-Za-z0-9._/-]+$/.test(path) || path.includes(".."))) {
    throw httpError(400, "Đường dẫn ảnh không hợp lệ", [
      { field: "hinhAnh", message: "Dùng đường dẫn cục bộ dạng /images/ten-anh.jpg" },
    ]);
  }
  return path;
}

module.exports = {
  httpError, parseDate, addDays, validateTour, ensureDestination, escapeRegex, validateImagePath,
};

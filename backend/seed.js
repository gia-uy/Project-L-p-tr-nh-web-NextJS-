require("dotenv").config();

const mongoose = require("mongoose");
const DiemDen = require("./models/DiemDen");
const Tour = require("./models/Tour");
const { addDays } = require("./controllers/helpers");

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error("Thiếu MONGODB_URI trong file .env");
  await mongoose.connect(process.env.MONGODB_URI);

  const destinationData = [
    { ten: "Đà Lạt", quocGia: "Việt Nam", hinhAnh: "/images/A001.jpg" },
    { ten: "Hội An", quocGia: "Việt Nam", hinhAnh: "/images/A002.jpg" },
    { ten: "Phú Quốc", quocGia: "Việt Nam", hinhAnh: "/images/A003.jpg" },
    { ten: "Bangkok", quocGia: "Thái Lan", hinhAnh: "/images/A004.jpg" },
  ];
  await DiemDen.bulkWrite(destinationData.map((item) => ({
    updateOne: { filter: { ten: item.ten }, update: { $set: item }, upsert: true },
  })));
  const destinations = await DiemDen.find({ ten: { $in: destinationData.map((item) => item.ten) } })
    .sort({ ten: 1 });
  const destinationIndex = new Map(destinationData.map((item, index) => [item.ten, index]));
  destinations.sort((left, right) => destinationIndex.get(left.ten) - destinationIndex.get(right.ten));
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const samples = [
    ["T001", "Săn mây Đà Lạt", 12, 3, 4500000, 22, 20, 0],
    ["T002", "Phố cổ Hội An – ký ức miền Trung", 20, 2, 3200000, 18, 9, 1],
    ["T003", "Nghỉ dưỡng biển Phú Quốc", 30, 4, 8900000, 30, 12, 2],
    ["T004", "Khám phá Bangkok cuối tuần", 45, 3, 6200000, 24, 16, 3],
    ["T005", "Dạo bước giữa vườn hoa Đà Lạt", 60, 4, 6800000, 20, 7, 0],
    ["T006", "N23DCPT056 – Hoàng hôn Phú Quốc", 8, 3, 5100000, 15, 12, 2],
    ["T007", "Làng nghề và đèn lồng Hội An", 90, 2, 3900000, 28, 8, 1],
    ["T008", "Bangkok qua những khu chợ đêm", 105, 4, 9700000, 35, 10, 3],
    ["T009", "Phú Quốc – khám phá đảo nhỏ", 120, 5, 12400000, 26, 5, 2],
    ["T010", "Ẩm thực đường phố Bangkok", 150, 4, 22500000, 32, 11, 3],
    ["T011", "Đà Lạt cảnh rừng – gần kín chỗ", 5, 3, 4800000, 20, 19, 0],
    ["T012", " Ẩm thực Hội An ", 210, 2, 3500000, 22, 0, 1],
  ];
  const tourData = samples.map(([maTour, tenTour, offset, soNgay, gia, max, booked, destinationIndex], index) => {
    const ngayKhoiHanh = addDays(today, offset);
    return {
      maTour,
      tenTour,
      ngayKhoiHanh,
      ngayKetThuc: addDays(ngayKhoiHanh, soNgay - 1),
      soNgay,
      giaNguoiLon: gia,
      soChoToiDa: max,
      soChoDaDat: booked,
      diemDenId: destinations[destinationIndex].id,
      hinhAnh: `/images/A${String(index + 1).padStart(3, "0")}.jpg`,
    };
  });
  await Tour.bulkWrite(tourData.map((item) => ({
    updateOne: { filter: { maTour: item.maTour }, update: { $set: item }, upsert: true },
  })));
  const obsoleteSeedDestinations = await DiemDen.find({
    ten: { $in: ["Kyoto", "Nha Trang", "Sa Pa", "Singapore", "Bali", "Osaka", "Hà Giang", "Huế"] },
  }).select("id");
  for (const destination of obsoleteSeedDestinations) {
    if (!(await Tour.exists({ diemDenId: destination.id }))) {
      await destination.deleteOne();
    }
  }
  console.log(`Đã tạo/cập nhật ${destinations.length} điểm đến và ${samples.length} tour mẫu.`);
}

seed()
  .catch((error) => {
    console.error("Không thể tạo dữ liệu mẫu:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });

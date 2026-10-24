require("dotenv").config();

const mongoose = require("mongoose");
const DiemDen = require("./models/DiemDen");
const Tour = require("./models/Tour");
const { addDays } = require("./controllers/helpers");

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error("Thiếu MONGODB_URI trong file .env");
  await mongoose.connect(process.env.MONGODB_URI);

  const destinationData = [
    { ten: "Đà Lạt", quocGia: "Việt Nam",hinhAnh: "/public/images/A001.jpg" },
    { ten: "Hội An", quocGia: "Việt Nam",hinhAnh: "/public/images/A002.jpg" },
    { ten: "Phú Quốc", quocGia: "Việt Nam",hinhAnh: "/public/images/A003.jpg" },
    { ten: "Bangkok", quocGia: "Thái Lan",hinhAnh: "/public/images/A004.jpg" },
    { ten: "Kyoto", quocGia: "Nhật Bản",hinhAnh: "/public/images/A005.jpg" },
    { ten: "Nha Trang", quocGia: "Việt Nam",hinhAnh: "/public/images/A006.jpg" },
    { ten: "Sa Pa", quocGia: "Việt Nam",hinhAnh: "/public/images/A007.jpg" },
    { ten: "Singapore", quocGia: "Singapore",hinhAnh: "/public/images/A008.jpg" },
    { ten: "Bali", quocGia: "Indonesia",hinhAnh: "/public/images/A009.jpg" },
    { ten: "Osaka", quocGia: "Nhật Bản",hinhAnh: "/public/images/A010.jpg" },
    { ten: "Hà Giang", quocGia: "Việt Nam",hinhAnh: "/public/images/A011.jpg" },
    { ten: "Huế", quocGia: "Việt Nam",hinhAnh: "/public/images/A012.jpg" },
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
    ["T005", "Mùa lá đỏ Kyoto", 60, 6, 18900000, 20, 7, 4],
    ["T006", "N23DCPT056 – Biển xanh Nha Trang", 75, 3, 5100000, 15, 12, 5],
    ["T007", "Chạm mây trên đỉnh Sa Pa", 90, 3, 5900000, 28, 8, 6],
    ["T008", "Singapore – thành phố vườn", 105, 4, 9700000, 35, 10, 7],
    ["T009", "Bali – bình minh bên biển", 120, 5, 12400000, 26, 5, 8],
    ["T010", "Osaka – sắc xuân Nhật Bản", 150, 4, 22500000, 32, 11, 9],
    ["T011", "Cung đường Hà Giang ", 180, 3, 4800000, 20, 19, 10],
    ["T012", "Huế – dấu xưa Cố đô", 210, 2, 3500000, 22, 0, 11],
  ];
  const tourData = samples.map(([maTour, tenTour, offset, soNgay, gia, max, booked, destinationIndex]) => {
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
    };
  });
  await Tour.bulkWrite(tourData.map((item) => ({
    updateOne: { filter: { maTour: item.maTour }, update: { $set: item }, upsert: true },
  })));
  await DiemDen.deleteMany({
    ten: { $in: ["Bangkok", "Kyoto"] },
    id: { $nin: tourData.map((item) => item.diemDenId) },
  });
  console.log(`Đã tạo ${destinations.length} điểm đến và ${samples.length} tour mẫu, mỗi tour có điểm đến riêng.`);
}

seed()
  .catch((error) => {
    console.error("Không thể tạo dữ liệu mẫu:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });

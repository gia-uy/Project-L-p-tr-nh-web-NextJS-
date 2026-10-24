# N23DCPT056 – Đề 05: Quản lý tour du lịch

**Sinh viên:** Thạch Gia Uy
**MSSV:** N23DCPT056
**Số đề:** 05

Ứng dụng quản lý tour du lịch gồm Backend Node.js/Express, MongoDB/Mongoose và Frontend Next.js App Router. Giao diện UaTravel dùng bảng màu pastel, nội dung UTF-8 tiếng Việt và font Nunito Sans với fallback Segoe UI/Tahoma/Arial.

## Yêu cầu

- Node.js 20 trở lên và npm.
- MongoDB cục bộ hoặc MongoDB Atlas có chuỗi kết nối hợp lệ.

## Cấu hình và chạy

1. Backend: sao chép `backend/.env.example` thành `backend/.env`, sửa `MONGODB_URI` theo môi trường MongoDB của bạn. Backend chạy cổng `5020`.
2. Tạo dữ liệu mẫu (4 điểm đến, 12 tour; có tour gần kín chỗ và tour chứa MSSV. Seed cập nhật theo tên điểm đến/mã tour, chỉ dọn điểm đến mẫu cũ khi không còn tour sử dụng và không xóa dữ liệu khác):

   ```powershell
   cd backend
   npm install
   npm run seed
   npm run dev
   ```

3. Frontend: sao chép `frontend/.env.example` thành `frontend/.env.local`. Giá trị mặc định là `NEXT_PUBLIC_API_URL=http://localhost:5020/api`.

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Mở `http://localhost:3000`. Dùng `npm run build` trong `frontend` để kiểm tra bản production, sau đó `npm start` để chạy bản build.

## Chức năng

- Backend CRUD điểm đến và tour, kiểm tra dữ liệu, tự tính ngày kết thúc và số chỗ còn.
- Tìm theo tên/mã tour; lọc điểm đến, tháng khởi hành, giá tối đa và tình trạng còn chỗ; sắp xếp theo ngày/giá; phân trang mặc định 5 bản ghi.
- Đặt chỗ có kiểm tra ngày khởi hành và số chỗ theo cập nhật nguyên tử; không xóa tour đã có khách hoặc giảm sức chứa thấp hơn số đã đặt.
- Thống kê số tour, chỗ đặt theo điểm đến và doanh thu dự kiến.
- Frontend gồm danh sách/tìm kiếm/lọc/phân trang, chi tiết/đặt chỗ, form thêm sửa tour, quản lý điểm đến và thống kê.
- Có thể gắn ảnh riêng cho từng tour trong form thêm/sửa tour, hoặc ảnh chung cho điểm đến trong trang quản lý điểm đến. Chép file vào `frontend/public/images/` rồi nhập đường dẫn như `/images/A001.jpg`. 12 tour seed dùng riêng các ảnh `/images/A001.jpg` đến `/images/A012.jpg`. Ảnh tour được ưu tiên trên danh sách và trang chi tiết; nếu để trống sẽ dùng ảnh của điểm đến. Hỗ trợ JPG, PNG, WebP hoặc AVIF với tên file dùng chữ/số, dấu gạch ngang hoặc gạch dưới.
- Header/footer dùng chung; mọi response Backend có `X-Student-Id: N23DCPT056`; footer hiển thị họ tên, MSSV và số đề.

## API chính

| Method | Đường dẫn | Mô tả |
|---|---|---|
| GET, POST | `/api/diem-den` | Danh sách và tạo điểm đến |
| PUT, DELETE | `/api/diem-den/:id` | Cập nhật và xóa điểm đến |
| GET | `/api/tour` | Danh sách, tìm kiếm, lọc, sắp xếp, phân trang |
| GET | `/api/tour/stats` | Thống kê tour và doanh thu |
| POST | `/api/tour` | Tạo tour |
| GET, PUT, DELETE | `/api/tour/:id` | Chi tiết, cập nhật, xóa tour |
| PATCH | `/api/tour/:id/dat-cho` | Đặt chỗ với body `{ "soNguoi": 2 }` |

## Đóng gói nộp bài

Từ thư mục cha `N23DCPT056_De05`, tạo ZIP chỉ chứa `backend`, `frontend` và `README.md`; bỏ qua `node_modules`, `.next` và các file môi trường chứa thông tin kết nối. Không nộp `.env`/`.env.local`; dùng các file `.env.example` để hướng dẫn cấu hình.

## Đã hoàn thành các yêu cầu của đề bài
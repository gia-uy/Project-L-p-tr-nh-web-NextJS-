import Link from "next/link";
import BookingPanel from "../../../components/BookingPanel";
import TourActions from "../../../components/TourActions";
import { API_URL } from "../../../lib/api";
import { formatCurrency, formatDate } from "../../../lib/format";

async function getTour(id) {
  try {
    const response = await fetch(`${API_URL}/tour/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!response.ok) return { error: response.status === 404 ? "Không tìm thấy tour này." : "Không thể tải thông tin tour từ Backend." };
    return { tour: await response.json() };
  } catch {
    return { error: "Không thể kết nối Backend. Hãy kiểm tra máy chủ và NEXT_PUBLIC_API_URL." };
  }
}

export default async function TourDetailPage({ params }) {
  const { id } = await params;
  const { tour, error } = await getTour(id);
  if (error) return <div className="page-shell"><div className="breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><span>Chi tiết tour</span></div><div className="notice notice-error detail-load-error">{error}</div><Link className="button button-outline" href="/">← Quay lại danh sách</Link></div>;

  const booked = tour.soChoDaDat;
  const percent = Math.round((booked / tour.soChoToiDa) * 100);
  return <div className="page-shell detail-page">
    <div className="breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><span>{tour.maTour}</span></div>
    <section className="detail-hero">
      <div className={`detail-hero-art${tour.hinhAnh || tour.diemDen?.hinhAnh ? " has-image" : ""}`} style={tour.hinhAnh || tour.diemDen?.hinhAnh ? { backgroundImage: `linear-gradient(0deg, rgba(31, 28, 38, .48), rgba(31, 28, 38, .04)), url("${tour.hinhAnh || tour.diemDen?.hinhAnh}")` } : undefined} role={tour.hinhAnh || tour.diemDen?.hinhAnh ? "img" : undefined} aria-label={tour.hinhAnh || tour.diemDen?.hinhAnh ? `Ảnh tour ${tour.tenTour}` : undefined}><span className="detail-art-sun" /><span className="detail-art-shape shape-one" /><span className="detail-art-shape shape-two" /><span className="detail-art-caption">UATRAVEL · HÀNH TRÌNH {tour.maTour}</span></div>
      <div className="detail-intro"><span className="eyebrow"><span className="eyebrow-dot" /> {tour.maTour} · {tour.diemDen?.ten || "Điểm đến"}</span><h1>{tour.tenTour}</h1><p>{tour.diemDen?.ten}, {tour.diemDen?.quocGia}</p><div className="detail-price">{formatCurrency(tour.giaNguoiLon)}<small> / khách</small></div><TourActions tour={tour} /></div>
    </section>
    <div className="detail-columns">
      <section className="detail-main">
        <div className="section-heading compact-heading"><div><span className="eyebrow">MỘT CHÚT THÔNG TIN</span><h2>Hành trình <em>của bạn</em></h2></div></div>
        <div className="detail-facts">
          <div><span>Khởi hành</span><strong>{formatDate(tour.ngayKhoiHanh)}</strong></div>
          <div><span>Kết thúc</span><strong>{formatDate(tour.ngayKetThuc)}</strong></div>
          <div><span>Thời lượng</span><strong>{tour.soNgay} ngày</strong></div>
          <div><span>Điểm đến</span><strong>{tour.diemDen?.ten || "—"}</strong></div>
          <div><span>Số chỗ</span><strong>{booked} / {tour.soChoToiDa} khách</strong></div>
          <div><span>Đã lấp đầy</span><strong>{percent}%</strong></div>
        </div>
        <div className="detail-note"><span>✳</span><p>Đôi khi, điều tuyệt nhất không phải là nơi ta đến, mà là những khoảnh khắc nhỏ trên đường đi.</p></div>
      </section>
      <BookingPanel tour={tour} />
    </div>
  </div>;
}

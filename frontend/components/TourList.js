"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/format";

const emptyFilters = { q: "", diemDenId: "", thang: "", giaMax: "", conCho: false, sort: "ngayKhoiHanh", order: "asc" };

export default function TourList() {
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], total: 0, totalPages: 0, limit: 5 });
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/diem-den?limit=100").then((data) => setDestinations(data.data)).catch((reason) => setError(reason.message));
  }, []);

  const loadTours = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "5", sort: applied.sort, order: applied.order });
    if (applied.q.trim()) params.set("q", applied.q.trim());
    if (applied.diemDenId) params.set("diemDenId", applied.diemDenId);
    if (applied.thang) params.set("thang", applied.thang);
    if (applied.giaMax) params.set("giaMax", applied.giaMax);
    if (applied.conCho) params.set("conCho", "true");
    try {
      setResult(await apiRequest(`/tour?${params.toString()}`));
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }, [applied, page]);

  useEffect(() => { loadTours(); }, [loadTours]);

  function changeFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function submitFilters(event) {
    event.preventDefault();
    setPage(1);
    setApplied({ ...filters });
  }

  function clearFilters() {
    setFilters(emptyFilters);
    setApplied(emptyFilters);
    setPage(1);
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> MỞ LỐI HÀNH TRÌNH</span>
          <h1>Đi để thấy<br /><em>thế giới dịu dàng</em></h1>
          <p>Những chuyến đi được chọn lọc cho bạn, để mỗi hành trình đều trở thành một kỷ niệm đáng nhớ</p>
          <a className="button button-dark" href="#tour-list">Khám phá hành trình <span aria-hidden="true">↓</span></a>
          <div className="hero-note"><span className="avatar-stack">✦</span> Hơn 2.400+ chuyến đi đáng nhớ</div>
        </div>
        <div className="hero-art" aria-label="Minh họa phong cảnh núi và mặt trời">
          <div className="sun" />
          <div className="mountain mountain-back" />
          <div className="mountain mountain-front" />
          <div className="hero-art-caption"><span>01 / 04</span><span>Find your somewhere</span></div>
          <div className="hero-stamp">GO<br />SLOW</div>
        </div>
        <div className="hero-side-label">TRAVEL · FEEL · REMEMBER</div>
      </section>

      <section className="section tour-section" id="tour-list">
        <div className="section-heading">
          <div><span className="eyebrow">LỰA CHỌN CỦA BẠN</span><h2>Chuyến đi <em>đang chờ</em></h2></div>
          <p>Tìm một nơi thật hợp với tâm trạng hôm nay.</p>
        </div>
        <form className="filter-panel" onSubmit={submitFilters}>
          <label className="filter-search"><span aria-hidden="true">⌕</span><input value={filters.q} onChange={(event) => changeFilter("q", event.target.value)} placeholder="Bạn muốn đi đâu?" aria-label="Tìm theo tên hoặc mã tour" /></label>
          <label><span>Điểm đến</span><select value={filters.diemDenId} onChange={(event) => changeFilter("diemDenId", event.target.value)}><option value="">Tất cả điểm đến</option>{destinations.map((item) => <option key={item.id} value={item.id}>{item.ten}</option>)}</select></label>
          <label><span>Tháng đi</span><select value={filters.thang} onChange={(event) => changeFilter("thang", event.target.value)}><option value="">Mọi thời điểm</option>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>Tháng {index + 1}</option>)}</select></label>
          <label><span>Giá tối đa</span><select value={filters.giaMax} onChange={(event) => changeFilter("giaMax", event.target.value)}><option value="">Không giới hạn</option><option value="5000000">5 triệu</option><option value="10000000">10 triệu</option><option value="20000000">20 triệu</option></select></label>
          <button className="button button-dark filter-submit" type="submit">Tìm tour <span aria-hidden="true">↗</span></button>
          <label className="check-filter"><input type="checkbox" checked={filters.conCho} onChange={(event) => changeFilter("conCho", event.target.checked)} /> Chỉ tour còn chỗ</label>
          <label className="sort-filter"><span>Sắp xếp</span><select value={`${filters.sort}:${filters.order}`} onChange={(event) => { const [sort, order] = event.target.value.split(":"); setFilters((current) => ({ ...current, sort, order })); }}><option value="ngayKhoiHanh:asc">Ngày khởi hành gần nhất</option><option value="ngayKhoiHanh:desc">Ngày khởi hành xa nhất</option><option value="giaNguoiLon:asc">Giá thấp đến cao</option><option value="giaNguoiLon:desc">Giá cao đến thấp</option></select></label>
          <button className="text-button clear-filter" type="button" onClick={clearFilters}>Xóa bộ lọc</button>
        </form>

        <div className="results-line"><span>{loading ? "Đang tìm chuyến đi..." : `${result.total} chuyến đi phù hợp`}</span><span>HIỂN THỊ TỐI ĐA 5 TOUR / TRANG</span></div>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
        {loading ? <div className="loading-state"><span className="spinner" />Đang tải những hành trình thật đẹp...</div> :
          !error && result.data.length === 0 ? <div className="empty-state"><span>☁</span><h3>Chưa tìm thấy chuyến đi phù hợp</h3><p>Thử thay đổi bộ lọc hoặc quay lại sau nhé</p><button className="button button-outline" onClick={clearFilters}>Xem tất cả tour</button></div> :
            <div className="tour-grid">
              {result.data.map((tour, index) => {
                const themes = ["lavender", "peach", "mint", "blue"];
                const imagePath = tour.hinhAnh || tour.diemDen?.hinhAnh;
                return <article className="tour-card" key={tour.id}>
                  <Link className={`card-visual ${themes[index % themes.length]}${imagePath ? " has-image" : ""}`} href={`/tour/${tour.id}`} aria-label={`Xem ${tour.tenTour}`} style={imagePath ? { backgroundImage: `linear-gradient(0deg, rgba(31, 28, 38, .52), rgba(31, 28, 38, .04)), url("${imagePath}")` } : undefined}>
                    <span className="card-number">0{(page - 1) * 5 + index + 1}</span>
                    {!imagePath && <><span className="visual-sun" /><span className="visual-landscape">{index % 4 === 0 ? "☁" : index % 4 === 1 ? "⌂" : index % 4 === 2 ? "✿" : "⌁"}</span></>}
                    <span className="visual-destination">{tour.diemDen?.ten || "Việt Nam"}</span>
                    <span className="card-arrow">↗</span>
                  </Link>
                  <div className="card-content">
                    <div className="card-meta"><span>{tour.maTour}</span><span className={tour.conCho ? "availability" : "sold-out"}>{tour.conCho ? `Còn ${tour.conCho} chỗ` : "Đã hết chỗ"}</span></div>
                    <h3><Link href={`/tour/${tour.id}`}>{tour.tenTour}</Link></h3>
                    <div className="card-details"><span>{tour.soNgay} ngày · {formatDate(tour.ngayKhoiHanh)}</span><strong>{formatCurrency(tour.giaNguoiLon)}<small> / khách</small></strong></div>
                  </div>
                </article>;
              })}
            </div>}
        {!loading && result.totalPages > 1 && <div className="pagination"><button className="button button-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Trước</button><span>Trang <strong>{page}</strong> / {result.totalPages}</span><button className="button button-outline" disabled={page >= result.totalPages} onClick={() => setPage(page + 1)}>Tiếp →</button></div>}
      </section>
      <section className="closing-banner"><span className="eyebrow">MỌI CHUYẾN ĐI ĐỀU BẮT ĐẦU TỪ MỘT LỜI HẸN</span><h2>Đi đâu đó nhé?</h2><Link href="/tour/new" className="button button-light">Tạo hành trình mới <span aria-hidden="true">↗</span></Link></section>
    </>
  );
}

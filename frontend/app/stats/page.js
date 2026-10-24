import Link from "next/link";
import { API_URL } from "../../lib/api";
import { formatCurrency } from "../../lib/format";

async function getStats() {
  try {
    const response = await fetch(`${API_URL}/tour/stats`, { cache: "no-store" });
    if (!response.ok) return { error: "Không thể tải số liệu thống kê từ Backend." };
    return { stats: await response.json() };
  } catch {
    return { error: "Không thể kết nối Backend. Hãy kiểm tra máy chủ và NEXT_PUBLIC_API_URL." };
  }
}

export default async function StatsPage() {
  const { stats, error } = await getStats();
  const maxBookings = Math.max(1, ...(stats?.theoDiemDen || []).map((item) => item.soChoDaDat));
  return <div className="page-shell management-page">
    <div className="breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><span>Thống kê</span></div>
    <div className="page-title-row"><div><span className="eyebrow">NHỮNG CON SỐ KỂ CHUYỆN</span><h1>UaTravel <em>qua lăng kính</em></h1><p>Tổng quan tour và lượt đặt chỗ trên các hành trình.</p></div></div>
    {error && <div className="notice notice-error" role="alert">{error}</div>}
    {stats && <>
      <section className="stats-cards">
        <article className="stat-card stat-lavender"><span>TỔNG SỐ TOUR</span><strong>{stats.tongSoTour}</strong><small>hành trình đang quản lý</small><span className="stat-decoration">✳</span></article>
        <article className="stat-card stat-mint"><span>CHỖ ĐÃ ĐẶT</span><strong>{stats.tongSoChoDaDat}</strong><small>lượt khách đăng ký</small><span className="stat-decoration">⌁</span></article>
        <article className="stat-card stat-peach"><span>DOANH THU DỰ KIẾN</span><strong>{formatCurrency(stats.doanhThuDuKien)}</strong><small>tính trên số chỗ đã đặt</small><span className="stat-decoration">↗</span></article>
      </section>
      <section className="stats-destinations">
        <div className="section-heading compact-heading"><div><span className="eyebrow">DỮ LIỆU ĐIỂM ĐẾN</span><h2>Khách đang <em>đi đâu?</em></h2></div><Link href="/destinations" className="text-link">Quản lý điểm đến ↗</Link></div>
        {stats.theoDiemDen.length === 0 ? <div className="empty-state"><span>☁</span><p>Chưa có dữ liệu điểm đến.</p></div> : <div className="stats-list">{stats.theoDiemDen.map((item, index) => <div className="stats-row" key={item.diemDenId}><div className="stats-name"><span className={`stats-icon stats-icon-${index % 4}`}>{["☁", "⌂", "✿", "⌁"][index % 4]}</span><span><strong>{item.ten}</strong><small>{item.quocGia}</small></span></div><div className="stats-bar"><span style={{ width: `${Math.max(item.soChoDaDat ? 6 : 0, (item.soChoDaDat / maxBookings) * 100)}%` }} /></div><strong className="stats-count">{item.soChoDaDat} khách</strong></div>)}</div>}
      </section>
    </>}
  </div>;
}

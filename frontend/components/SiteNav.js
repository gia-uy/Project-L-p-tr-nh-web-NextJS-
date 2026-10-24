import Link from "next/link";

export default function SiteNav() {
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand" href="/" aria-label="UaTravel - Trang chủ">
          <span className="brand-mark">U</span>
          <span>Ua<span className="brand-light">Travel</span></span>
        </Link>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <Link href="/">Khám phá tour</Link>
          <Link href="/destinations">Điểm đến</Link>
          <Link href="/stats">Thống kê</Link>
        </nav>
        <Link className="nav-cta" href="/tour/new">Tạo tour <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
  );
}

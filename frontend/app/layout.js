import Link from "next/link";
import SiteNav from "../components/SiteNav";
import "./globals.css";

export const metadata = {
  title: "UaTravel — Chuyến đi dịu dàng",
  description: "Khám phá những hành trình được chọn lọc cùng UaTravel.",
};

export default function RootLayout({ children }) {
  return <html lang="vi">
    <body>
      <SiteNav />
      <main>{children}</main>
      <footer className="site-footer">
        <div className="footer-top">
          <Link className="brand footer-brand" href="/"><span className="brand-mark">U</span><span>Ua<span className="brand-light">Travel</span></span></Link>
          <p>Đi thật xa, để thấy lòng mình gần hơn</p>
          <Link href="/" className="footer-top-link">Trở về đầu trang ↑</Link>
        </div>
        <div className="footer-bottom"><span>© 2026 UaTravel · Chạm vào những ngày xanh</span><strong>Thạch Gia Uy – N23DCPT056 – Đề 05</strong></div>
      </footer>
    </body>
  </html>;
}

import Link from "next/link";
import DestinationManager from "../../components/DestinationManager";

export default function DestinationsPage() {
  return <div className="page-shell management-page">
    <div className="breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><span>Điểm đến</span></div>
    <div className="page-title-row"><div><span className="eyebrow">NHỮNG MIỀN ĐẤT ĐÁNG NHỚ</span><h1>Điểm đến <em>của UaTravel</em></h1><p>Quản lý những nơi chốn sẽ góp mặt trong hành trình của bạn.</p></div><Link href="/tour/new" className="button button-dark">Tạo tour mới ↗</Link></div>
    <DestinationManager />
  </div>;
}

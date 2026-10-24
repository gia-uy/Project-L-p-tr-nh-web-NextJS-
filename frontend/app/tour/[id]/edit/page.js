import Link from "next/link";
import TourForm from "../../../../components/TourForm";

export default async function EditTourPage({ params }) {
  const { id } = await params;
  return <div className="page-shell form-page"><div className="breadcrumb"><Link href="/">Trang chủ</Link><span>/</span><Link href={`/tour/${id}`}>Chi tiết tour</Link><span>/</span><span>Chỉnh sửa</span></div><TourForm tourId={id} /></div>;
}

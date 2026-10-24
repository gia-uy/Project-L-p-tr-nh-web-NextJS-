"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, jsonBody } from "../lib/api";

const blankTour = {
  maTour: "", tenTour: "", ngayKhoiHanh: "", soNgay: 3, giaNguoiLon: "", soChoToiDa: 20, soChoDaDat: 0, diemDenId: "",
};

export default function TourForm({ tourId }) {
  const router = useRouter();
  const editing = Boolean(tourId);
  const [form, setForm] = useState(blankTour);
  const [destinations, setDestinations] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest("/diem-den?limit=100"),
      editing ? apiRequest(`/tour/${tourId}`) : Promise.resolve(null),
    ]).then(([destinationResult, tour]) => {
      setDestinations(destinationResult.data);
      if (tour) setForm({
        maTour: tour.maTour, tenTour: tour.tenTour, ngayKhoiHanh: new Date(tour.ngayKhoiHanh).toISOString().slice(0, 10),
        soNgay: tour.soNgay, giaNguoiLon: tour.giaNguoiLon, soChoToiDa: tour.soChoToiDa,
        soChoDaDat: tour.soChoDaDat, diemDenId: tour.diemDenId,
      });
    }).catch((error) => setLoadError(error.message)).finally(() => setLoading(false));
  }, [editing, tourId]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  }

  function validate() {
    const next = {};
    if (!/^T\d{3}$/i.test(form.maTour.trim())) next.maTour = "Mã tour gồm chữ T và 3 chữ số.";
    if (!form.tenTour.trim()) next.tenTour = "Vui lòng nhập tên tour.";
    if (!form.ngayKhoiHanh) next.ngayKhoiHanh = "Vui lòng chọn ngày khởi hành.";
    else if (!editing && new Date(`${form.ngayKhoiHanh}T00:00:00`) <= new Date()) next.ngayKhoiHanh = "Ngày khởi hành phải ở tương lai.";
    if (!Number.isInteger(Number(form.soNgay)) || Number(form.soNgay) < 1 || Number(form.soNgay) > 15) next.soNgay = "Nhập số nguyên từ 1 đến 15.";
    if (!Number.isFinite(Number(form.giaNguoiLon)) || Number(form.giaNguoiLon) <= 0) next.giaNguoiLon = "Giá phải lớn hơn 0.";
    if (!Number.isInteger(Number(form.soChoToiDa)) || Number(form.soChoToiDa) < 10 || Number(form.soChoToiDa) > 50) next.soChoToiDa = "Nhập số nguyên từ 10 đến 50.";
    if (Number(form.soChoToiDa) < Number(form.soChoDaDat)) next.soChoToiDa = `Không được ít hơn ${form.soChoDaDat} chỗ đã đặt.`;
    if (!form.diemDenId) next.diemDenId = "Vui lòng chọn điểm đến.";
    return next;
  }

  async function submit(event) {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      return;
    }
    setSaving(true);
    setErrors({});
    const payload = { ...form, soNgay: Number(form.soNgay), giaNguoiLon: Number(form.giaNguoiLon), soChoToiDa: Number(form.soChoToiDa), soChoDaDat: Number(form.soChoDaDat) };
    try {
      const saved = await apiRequest(editing ? `/tour/${tourId}` : "/tour", { method: editing ? "PUT" : "POST", body: jsonBody(payload) });
      router.push(`/tour/${saved.id}`);
      router.refresh();
    } catch (error) {
      const fieldErrors = {};
      for (const detail of error.details || []) if (detail.field) fieldErrors[detail.field] = detail.message;
      setErrors({ ...fieldErrors, form: error.message });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="loading-state"><span className="spinner" />Đang tải biểu mẫu...</div>;
  if (loadError) return <div className="notice notice-error">{loadError}</div>;

  const field = (name, label, input, hint) => <label className="form-field">{label}{input}<small>{errors[name] || hint || " "}</small></label>;

  return <section className="form-card">
    <div className="form-card-heading"><span className="eyebrow">{editing ? "CẬP NHẬT HÀNH TRÌNH" : "THÊM HÀNH TRÌNH MỚI"}</span><h1>{editing ? "Chỉnh sửa tour" : "Tạo tour mới"}</h1><p>Điền thông tin để hành trình sẵn sàng đón khách.</p></div>
    {errors.form && <div className="notice notice-error" role="alert">{errors.form}</div>}
    <form className="tour-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        {field("maTour", "Mã tour", <input name="maTour" value={form.maTour} onChange={updateField} placeholder="T001" aria-invalid={Boolean(errors.maTour)} />)}
        {field("tenTour", "Tên tour", <input name="tenTour" value={form.tenTour} onChange={updateField} placeholder="Ví dụ: Săn mây Đà Lạt" aria-invalid={Boolean(errors.tenTour)} />)}
        {field("ngayKhoiHanh", "Ngày khởi hành", <input type="date" name="ngayKhoiHanh" value={form.ngayKhoiHanh} min={!editing ? new Date(Date.now() + 86400000).toISOString().slice(0, 10) : undefined} onChange={updateField} aria-invalid={Boolean(errors.ngayKhoiHanh)} />)}
        {field("soNgay", "Số ngày", <input type="number" min="1" max="15" name="soNgay" value={form.soNgay} onChange={updateField} aria-invalid={Boolean(errors.soNgay)} />)}
        {field("giaNguoiLon", "Giá người lớn (VNĐ)", <input type="number" min="1" name="giaNguoiLon" value={form.giaNguoiLon} onChange={updateField} placeholder="4500000" aria-invalid={Boolean(errors.giaNguoiLon)} />)}
        {field("soChoToiDa", "Số chỗ tối đa", <input type="number" min="10" max="50" name="soChoToiDa" value={form.soChoToiDa} onChange={updateField} aria-invalid={Boolean(errors.soChoToiDa)} />, `Hiện đã đặt ${form.soChoDaDat} chỗ.`)}
        {editing && field("soChoDaDat", "Số chỗ đã đặt", <input type="number" name="soChoDaDat" value={form.soChoDaDat} disabled />, "Số chỗ được cập nhật khi khách đặt tour.")}
        {field("diemDenId", "Điểm đến", <select name="diemDenId" value={form.diemDenId} onChange={updateField} aria-invalid={Boolean(errors.diemDenId)}><option value="">Chọn điểm đến</option>{destinations.map((item) => <option key={item.id} value={item.id}>{item.ten} · {item.quocGia}</option>)}</select>)}
      </div>
      <div className="form-actions"><Link className="button button-outline" href={editing ? `/tour/${tourId}` : "/"}>Hủy</Link><button className="button button-dark" disabled={saving}>{saving ? "Đang lưu..." : editing ? "Lưu thay đổi ↗" : "Tạo hành trình ↗"}</button></div>
    </form>
  </section>;
}

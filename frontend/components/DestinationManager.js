"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, jsonBody } from "../lib/api";

export default function DestinationManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ ten: "", quocGia: "", hinhAnh: "" });
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await apiRequest("/diem-den?limit=100");
      setItems(result.data);
    } catch (reason) {
      setError(reason.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  function edit(item) {
    setEditingId(item.id);
    setForm({ ten: item.ten, quocGia: item.quocGia, hinhAnh: item.hinhAnh || "" });
    setError("");
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest(editingId ? `/diem-den/${editingId}` : "/diem-den", {
        method: editingId ? "PUT" : "POST", body: jsonBody(form),
      });
      setForm({ ten: "", quocGia: "", hinhAnh: "" });
      setEditingId("");
      await load();
    } catch (reason) {
      setError(reason.details?.[0]?.message || reason.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Xóa điểm đến ${item.ten}?`)) return;
    setError("");
    try {
      await apiRequest(`/diem-den/${item.id}`, { method: "DELETE" });
      await load();
    } catch (reason) {
      setError(reason.message);
    }
  }

  return <div className="destination-layout">
    <section className="form-card destination-form">
      <span className="eyebrow">{editingId ? "CHỈNH SỬA" : "THÊM ĐIỂM ĐẾN"}</span>
      <h2>{editingId ? "Cập nhật nơi chốn" : "Một nơi mới"}</h2>
      <form onSubmit={submit} className="tour-form">
        <label className="form-field">Tên điểm đến<input required value={form.ten} onChange={(event) => setForm({ ...form, ten: event.target.value })} placeholder="Ví dụ: Đà Lạt" /></label>
        <label className="form-field">Quốc gia<input required value={form.quocGia} onChange={(event) => setForm({ ...form, quocGia: event.target.value })} placeholder="Ví dụ: Việt Nam" /></label>
        <label className="form-field">Đường dẫn ảnh<input value={form.hinhAnh} onChange={(event) => setForm({ ...form, hinhAnh: event.target.value })} placeholder="/images/da-lat.jpg" aria-describedby="image-path-help" /><small id="image-path-help">Chép ảnh vào frontend/public/images/ rồi nhập /images/tên-ảnh.jpg</small></label>
        {form.hinhAnh && <div className="destination-image-preview" style={{ backgroundImage: `url("${form.hinhAnh}")` }} role="img" aria-label="Xem trước ảnh điểm đến"><span>Xem trước ảnh</span></div>}
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="form-actions"><button type="button" className="button button-outline" onClick={() => { setEditingId(""); setForm({ ten: "", quocGia: "", hinhAnh: "" }); setError(""); }}>Làm mới</button><button className="button button-dark" disabled={busy}>{busy ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm điểm đến ↗"}</button></div>
      </form>
    </section>
    <section className="destination-list">
      <div className="section-heading compact-heading"><div><span className="eyebrow">{items.length} ĐIỂM ĐẾN</span><h2>Nơi chốn <em>được yêu</em></h2></div></div>
      {error && <div className="notice notice-error">{error}</div>}
      {items.length === 0 ? <div className="empty-state"><span>⌁</span><p>Chưa có điểm đến nào.</p></div> : <div className="destination-grid">{items.map((item, index) => <article className={`destination-card destination-tone-${index % 4}${item.hinhAnh ? " has-image" : ""}`} key={item.id} style={item.hinhAnh ? { backgroundImage: `linear-gradient(0deg, rgba(31, 28, 38, .72), rgba(31, 28, 38, .06)), url("${item.hinhAnh}")` } : undefined}><span className="destination-index">0{index + 1}</span><span className="destination-symbol">{["☁", "⌂", "✿", "⌁"][index % 4]}</span><h3>{item.ten}</h3><p>{item.quocGia}</p><div className="destination-actions"><button onClick={() => edit(item)}>Sửa</button><button onClick={() => remove(item)}>Xóa</button></div></article>)}</div>}
    </section>
  </div>;
}

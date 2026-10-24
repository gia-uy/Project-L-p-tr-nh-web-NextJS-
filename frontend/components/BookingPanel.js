"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, jsonBody } from "../lib/api";

export default function BookingPanel({ tour }) {
  const router = useRouter();
  const [people, setPeople] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const remaining = tour.soChoToiDa - tour.soChoDaDat;
  const progress = Math.min(100, Math.round((tour.soChoDaDat / tour.soChoToiDa) * 100));

  async function book(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await apiRequest(`/tour/${tour.id}/dat-cho`, { method: "PATCH", body: jsonBody({ soNguoi: Number(people) }) });
      setMessage(`Đặt chỗ thành công! Đã có ${result.soChoDaDat}/${result.soChoToiDa} khách (${result.phanTramDaDat}%).`);
      router.refresh();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  return <section className="booking-card">
    <div className="booking-top"><div><span className="eyebrow">GIỮ CHỖ CHO BẠN</span><h2>Đặt chỗ</h2></div><span className="remaining-badge">{remaining} chỗ còn</span></div>
    <div className="progress-label"><span>Tiến độ đăng ký</span><strong>{progress}%</strong></div>
    <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
    <p className="muted-copy">Đã có {tour.soChoDaDat} / {tour.soChoToiDa} chỗ được đặt</p>
    <form onSubmit={book} className="booking-form">
      <label>Số người <input type="number" min="1" max={remaining} value={people} onChange={(event) => setPeople(event.target.value)} disabled={!remaining || busy} /></label>
      <button className="button button-dark" disabled={!remaining || busy}>{busy ? "Đang xử lý..." : remaining ? "Đặt chỗ ngay ↗" : "Đã hết chỗ"}</button>
    </form>
    {message && <p className="notice notice-success" role="status">{message}</p>}
    {error && <p className="field-error" role="alert">{error}</p>}
  </section>;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "../lib/api";

export default function TourActions({ tour }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function removeTour() {
    if (!window.confirm(`Bạn chắc chắn muốn xóa tour “${tour.tenTour}”?`)) return;
    setDeleting(true);
    setError("");
    try {
      await apiRequest(`/tour/${tour.id}`, { method: "DELETE" });
      router.push("/");
      router.refresh();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setDeleting(false);
    }
  }

  return <div className="detail-actions">
    <Link className="button button-outline" href={`/tour/${tour.id}/edit`}>Chỉnh sửa</Link>
    <button className="button button-danger" disabled={deleting} onClick={removeTour}>{deleting ? "Đang xóa..." : "Xóa tour"}</button>
    {error && <span className="field-error" role="alert">{error}</span>}
  </div>;
}

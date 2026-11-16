export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface UserSession {
  token: string;
  maNguoiDung: string;
  hoTen: string;
  soDienThoai: string;
  role: "Quay" | "Shipper" | "QuanTri" | "KhachHang" | string;
  maNhanVien?: string;
  maBuuCuc?: string;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Lỗi kết nối máy chủ" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export function formatVnd(amount: number | string | undefined | null): string {
  const num = Number(amount || 0);
  return num.toLocaleString("vi-VN") + "đ";
}

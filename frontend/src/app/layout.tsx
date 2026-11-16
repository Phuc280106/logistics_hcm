import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FastPost Logistics — Hệ thống Quản lý Vận chuyển",
  description: "FastPost Logistics HCM - OOAD System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-[#F8FAFC] text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}

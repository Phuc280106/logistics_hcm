# FastPost Logistics HCM (OOAD)

Hệ thống Quản lý Vận chuyển & Logistics Hợp nhất (**FastPost**), xây dựng dựa trên phân tích thiết kế hướng đối tượng (OOAD), sơ đồ RDM (`database/rdm.sql`) và giao diện Figma `FastPost - OOAD`.

## Kiến trúc hệ thống
- **Database:** Microsoft SQL Server (`database/rdm.sql` + `database/seed.sql`)
- **Backend:** Java 21+ / Spring Boot 3.5 (Spring Data JPA, Spring Security + JWT, REST API) tại `backend/`
- **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS) tại `frontend/`

## Hướng dẫn chạy nhanh
### 1. Khởi tạo CSDL SQL Server
Chạy `database/rdm.sql` rồi chạy `database/seed.sql` trong SSMS hoặc `sqlcmd` vào database `FastPostHCM`.

### 2. Chạy Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Mặc định chạy tại `http://localhost:8080`. Cấu hình kết nối SQL Server trong `backend/src/main/resources/application.properties`.

### 3. Chạy Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Mở `http://localhost:3000`.

## Tài khoản demo (từ `database/seed.sql`)
- **Nhân viên quầy:** `0909000001` / `123456`
- **Shipper:** `0909000002` / `123456`
- **Quản trị viên / Kho / Kế toán:** `0909000003` / `123456`
- **Khách hàng (OTP):** `0909123456` (OTP demo: `123456`)

# FastPost Logistics HCM (OOAD)

Hệ thống Quản lý Vận chuyển Hàng hóa Logistics Nội thành TP.HCM (**FastPost**), triển khai trọn vẹn theo báo cáo Phân tích & Thiết kế Hướng đối tượng (OOAD — 7 phân hệ Use Case `UC 1.1`..`UC 7.3`, 4 Sơ đồ trạng thái, 36 bảng RDM SQL Server và 15 màn hình Unified Web / Mobile PWA).

## Kiến trúc & Phạm vi Nghiệp vụ
- **Database (`database/rdm.sql`, `database/seed.sql`):** Microsoft SQL Server — đủ **36/36 bảng vật lý** có khóa ngoại toàn vẹn.
- **Backend (`backend/`):** Java 21+ / Spring Boot 3.5 / Spring Data JPA / JWT:
  - Phân hệ 1 (`UC 1.1`–`UC 1.4`): Quản lý nhân sự nội bộ, mạng lưới bưu cục/Hub, tiểu tuyến Shipper, bảng giá & tham số động.
  - Phân hệ 2 (`UC 2.1`–`UC 2.4`): Đăng nhập OTP, kích hoạt đồng bộ *Shadow Account*, hồ sơ cá nhân/Shop, sổ địa chỉ & tài khoản ngân hàng nhận COD.
  - Phân hệ 3 (`UC 3.1`–`UC 3.4`): Lên đơn Online / POS Quầy, tính cước tự động, in & in lại tem mã vạch (giới hạn 3 lần), tra cứu hành trình & hủy đơn.
  - Phân hệ 4 (`UC 4.1`–`UC 4.4`): Quét nhập kho đối soát Manifest (9 trạng thái), đóng bao luân chuyển Hub, biên bản hàng bất thường (`DongGoiLai` / `TraLaiKienHang` / `BoiThuong`), phiếu xuất kho bàn giao Shipper.
  - Phân hệ 5 (`UC 5.1`–`UC 5.4`): Tiếp nhận/từ chối đơn lấy, lấy hàng tận nơi, xác thực giao hàng POD (ảnh + GPS + chữ ký điện tử cảm ứng), giao lại (< 3 lần) & chuyển hoàn tự động khi thất bại 3 lần hoặc khách từ chối nhận.
  - Phân hệ 6 (`UC 6.1`–`UC 6.5`): Đối soát COD cuối ca, ví công nợ Shipper (khóa tự động khi >= 3.000.000đ hoặc > 24h), quyết toán trả COD cho Shop (`DaQuyetToanCOD` + xuất CSV lệnh chi), chốt quỹ ca & thanh toán VietQR động.
  - Phân hệ 7 (`UC 7.1`–`UC 7.3`): Báo cáo doanh thu thực tế, cảnh báo tồn kho > 24h & đơn trễ SLA > 48h, tính toán KPI tự động & xuất CSV.
- **Frontend (`frontend/`):** Next.js 15 (App Router, TypeScript, Tailwind CSS) hợp nhất Desktop POS/Admin và Mobile PWA (`/`, `/customer`, `/counter`, `/shipper`, `/admin`).

## Hướng dẫn chạy nhanh
### 1. Khởi tạo CSDL SQL Server (UTF-8)
```powershell
sqlcmd -S localhost -E -C -Q "CREATE DATABASE logictisthcm;"
sqlcmd -S localhost -d logictisthcm -E -C -f 65001 -i database/rdm.sql
sqlcmd -S localhost -d logictisthcm -E -C -f 65001 -i database/seed.sql
```

### 2. Chạy Backend (Spring Boot — Port `8080`)
```bash
cd backend
mvn spring-boot:run
```
Cấu hình kết nối SQL Server nằm tại `backend/src/main/resources/application.properties`.

### 3. Chạy Frontend (Next.js — Port `3000`)
```bash
cd frontend
npm install
npm run dev
```

## Tài khoản Demo (`database/seed.sql`)
- **Nhân viên quầy (`/counter`):** `0909000001` / `123456` (`NV_QUAY_01` — `BC_BENNGHE`)
- **Shipper (`/shipper`):** `0909000002` / `123456` (`NV_SHIP_01` — `BC_BENNGHE`)
- **Quản trị / Kho / Quản lý bưu cục (`/admin`):** `0909000003` / `123456` (`NV_ADMIN_01` — `KHO_Q1`)
- **Khách hàng OTP (`/customer`):** `0909123456` — OTP: `123456` (`ND_KH_01`)

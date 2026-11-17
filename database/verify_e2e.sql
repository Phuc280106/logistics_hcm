-- ==========================================================
-- KỊCH BẢN TRUY VẤN KIỂM CHỨNG END-TO-END TRÊN SSMS (logictisthcm)
-- ==========================================================

-- 1. Kiểm tra Tài khoản ngầm (Shadow Account - UC 2.1, UC 3.2)
SELECT nd.ma_nguoi_dung, nd.so_dien_thoai, nd.ho_ten, kh.loai_khach_hang, kh.la_tai_khoan_ngam, kh.ngay_kich_hoat
FROM khach_hang kh
JOIN nguoi_dung nd ON nd.ma_nguoi_dung = kh.ma_nguoi_dung
ORDER BY kh.ngay_kich_hoat DESC;

-- 2. Kiểm tra Vòng đời Đơn hàng & Cước phí (State Diagram DonHang)
SELECT ma_van_don, ma_khach_hang, ma_buu_cuc_hien_tai, ma_shipper,
       trong_luong_tinh_cuoc, tong_cuoc, tien_cod, nguoi_tra_cuoc, hinh_thuc_thanh_toan,
       so_lan_giao_that_bai, trang_thai, ngay_tao
FROM don_hang
ORDER BY ngay_tao DESC;

-- 3. Kiểm tra Lịch sử hành trình & Bằng chứng POD chữ ký số (UC 3.4, UC 5.3)
SELECT pod.ma_pod, pod.ma_van_don, pod.ten_nguoi_ky, pod.toa_do_gps, pod.thoi_gian_chup,
       LEFT(pod.chu_ky_dien_tu, 40) AS chu_ky_preview
FROM bang_chung_giao_hang pod
ORDER BY pod.thoi_gian_chup DESC;

-- 4. Kiểm tra Bảng kê trung chuyển Manifest & Biên bản bất thường (UC 4.1 - UC 4.3)
SELECT ma_manifest, ma_buu_cuc_di, ma_buu_cuc_den, tong_so_kien, trang_thai, ngay_lap
FROM manifest
ORDER BY ngay_lap DESC;

SELECT ma_bien_ban, ma_van_don, loai_bat_thuong, phuong_an_xu_ly, trang_thai_duyet
FROM bien_ban_bat_thuong;

-- 5. Kiểm tra Ví công nợ Shipper, Đối soát cuối ca & Quyết toán Shop (UC 6.1 - UC 6.4)
SELECT ma_vi, ma_shipper, tong_no_luy_ke, thoi_diem_phat_sinh_no, da_khoa_nhan_don
FROM vi_cong_no_shipper;

SELECT ma_doi_soat, ma_shipper, tong_phai_nop, so_tien_thuc_nop, so_tien_thieu, trang_thai, ngay_doi_soat
FROM phieu_doi_soat_shipper
ORDER BY ngay_doi_soat DESC;

SELECT ma_bang_ke, ma_ky, ma_khach_hang, ma_tai_khoan_ngan_hang, tong_cod, tong_cuoc_tru, thuc_tra, trang_thai_thanh_toan
FROM bang_ke_quyet_toan_shop;

-- 6. Kiểm tra Nhật ký in tem, Báo cáo doanh thu & KPI (UC 3.3, UC 7.1, UC 7.3)
SELECT TOP 10 ma_nhat_ky, ma_van_don, ma_nhan_vien_quay, so_lan_in, loai_in, ly_do_in_lai, thoi_gian_in
FROM nhat_ky_in_tem
ORDER BY thoi_gian_in DESC;

SELECT ma_bao_cao, ma_buu_cuc, doanh_thu_cuoc, tien_cod_trung_chuyen, tong_san_luong_don, ty_le_tien_mat, ty_le_viet_qr
FROM bao_cao_doanh_thu
ORDER BY den_ngay DESC;

SELECT ma_kpi, ma_shipper, ky_danh_gia, ty_le_giao_thanh_cong, ty_le_dung_hen_sla, diem_tong_ket, xep_loai
FROM danh_gia_kpi;

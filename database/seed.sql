-- ==========================================================
-- DỮ LIỆU MẪU (SEED DATA) - FASTPOST LOGISTICS HCM
-- ==========================================================

-- 1. Tham số hệ thống
INSERT INTO tham_so (ma_tham_so, ten_tham_so, kieu, gia_tri, tinh_trang) VALUES
('TS_HESO_QUYDOI', N'Hệ số quy đổi thể tích (DxRxC / hệ số)', 'FLOAT', '6000', 'Active'),
('TS_HANMUC_NO_SHIPPER', N'Hạn mức công nợ COD tối đa của Shipper (VNĐ)', 'NUMERIC', '3000000', 'Active'),
('TS_GIOIHAN_GIAO_THATBAI', N'Số lần giao thất bại tối đa trước chuyển hoàn', 'INT', '3', 'Active');

-- 2. Danh mục
INSERT INTO vung_tuyen (ma_vung_tuyen, ten_vung_tuyen, mo_ta) VALUES
('VT_NOITINH', N'Nội thành TP.HCM', N'Giao nhận nội thành TP. Hồ Chí Minh'),
('VT_NGOAITINH', N'Ngoại thành TP.HCM', N'Các huyện ngoại thành và vùng ven'),
('VT_LIENMIEN', N'Liên miền', N'Vận chuyển liên tỉnh toàn quốc');

INSERT INTO goi_dich_vu (ma_goi_dich_vu, ten_goi_dich_vu, mo_ta) VALUES
('GDV_TIEUCHUAN', N'Giao tiêu chuẩn', N'Giao trong 24-48h'),
('GDV_HOATOC', N'FastPost Hỏa Tốc', N'Giao nhanh trong 2-4h nội thành');

INSERT INTO loai_hang_hoa (ma_loai_hang, ten_loai_hang, mo_ta) VALUES
('LHH_THUONG', N'Hàng thông thường', N'Quần áo, phụ kiện, sách vở...'),
('LHH_DEVO', N'Hàng dễ vỡ', N'Thủy tinh, gốm sứ, thiết bị điện tử');

INSERT INTO ngan_hang (ma_ngan_hang_dm, ten_ngan_hang, ten_viet_tat) VALUES
('NH_VCB', N'Ngân hàng TMCP Ngoại thương Việt Nam', 'VCB'),
('NH_TCB', N'Ngân hàng TMCP Kỹ thương Việt Nam', 'TCB'),
('NH_MB', N'Ngân hàng TMCP Quân đội', 'MB');

-- 3. Bưu cục & Tuyến
INSERT INTO buu_cuc (ma_buu_cuc, ten_buu_cuc, loai_kho, dia_chi, toa_do_gps, so_du_quy_ket, trang_thai_hoat_dong) VALUES
('BC_BENNGHE', N'Bưu cục Bến Nghé - Quầy 03', 'BuuCucPhat', N'12 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP.HCM', '10.7745,106.7035', 15000000, 'Active'),
('KHO_Q1', N'Kho trung chuyển Quận 1', 'KhoTrungChuyen', N'88 Lê Lợi, Quận 1, TP.HCM', '10.7731,106.7009', 45000000, 'Active');

INSERT INTO tuyen_giao_hang (ma_tuyen, ma_buu_cuc, ten_tuyen, loai_tuyen) VALUES
('TUYEN_Q1', 'BC_BENNGHE', N'Tuyến Quận 1 - Trung tâm', 'NoiThanh');

-- 4. Người dùng & Nhân sự (mật khẩu demo: 123456)
INSERT INTO nguoi_dung (ma_nguoi_dung, so_dien_thoai, ho_ten, email, mat_khau, trang_thai) VALUES
('ND_QUAY_01', '0909000001', N'Nguyễn Hoàng Anh', 'hoanganh@fastpost.vn', '123456', 'Active'),
('ND_SHIP_01', '0909000002', N'Phương Duy', 'phuongduy@fastpost.vn', '123456', 'Active'),
('ND_ADMIN_01', '0909000003', N'Lê Minh Anh', 'minhanh@fastpost.vn', '123456', 'Active'),
('ND_KH_01', '0909123456', N'Trần Minh Đức', 'minhduc.shop@gmail.com', '123456', 'Active');

INSERT INTO khach_hang (ma_nguoi_dung, ten_shop, loai_khach_hang, la_tai_khoan_ngam, ngay_kich_hoat) VALUES
('ND_KH_01', N'Minh Đức Store', 'Shop', 0, GETDATE());

INSERT INTO so_dia_chi (ma_dia_chi, ma_khach_hang, ten_nguoi_nhan, so_dien_thoai, dia_chi_chi_tiet, phuong_xa, quan_huyen, la_mac_dinh) VALUES
('DC_01', 'ND_KH_01', N'Trần Thị Mai', '0912345678', N'45 Lê Duẩn', N'P. Bến Nghé', N'Quận 1', 1);

INSERT INTO tai_khoan_ngan_hang (ma_tk_ngan_hang, ma_khach_hang, ma_ngan_hang_dm, so_tai_khoan, ten_chu_tai_khoan, la_mac_dinh_cod) VALUES
('TKNH_01', 'ND_KH_01', 'NH_VCB', '0071001234567', N'TRAN MINH DUC', 1);

INSERT INTO nhan_vien (ma_nhan_vien, ma_nguoi_dung, ma_buu_cuc, loai_nhan_vien) VALUES
('NV_QUAY_01', 'ND_QUAY_01', 'BC_BENNGHE', 'Quay'),
('NV_SHIP_01', 'ND_SHIP_01', 'BC_BENNGHE', 'Shipper'),
('NV_ADMIN_01', 'ND_ADMIN_01', 'KHO_Q1', 'QuanTri');

INSERT INTO nhan_vien_quay (ma_nhan_vien) VALUES ('NV_QUAY_01');

INSERT INTO shipper (ma_nhan_vien, bien_so_xe, trang_thai_nhan_don, ti_le_giao_thanh_cong) VALUES
('NV_SHIP_01', '59T1-888.99', 'SanSang', 97.5);

INSERT INTO tieu_tuyen (ma_tieu_tuyen, ma_tuyen, ma_shipper, ten_tieu_tuyen) VALUES
('TT_BENGHE', 'TUYEN_Q1', 'NV_SHIP_01', N'Tiểu tuyến Bến Nghé - Đa Kao');

INSERT INTO chi_tiet_tieu_tuyen (ma_tieu_tuyen, quan_huyen, phuong_xa) VALUES
('TT_BENGHE', N'Quận 1', N'P. Bến Nghé'),
('TT_BENGHE', N'Quận 1', N'P. Đa Kao');

INSERT INTO vi_cong_no_shipper (ma_vi, ma_shipper, tong_no_luy_ke, thoi_diem_phat_sinh_no, da_khoa_nhan_don) VALUES
('VI_SHIP_01', 'NV_SHIP_01', 1250000, GETDATE(), 0);

-- 5. Bảng giá cước
INSERT INTO bang_gia_cuoc (ma_bang_gia, ten_bang_gia, ngay_hieu_luc, dang_kich_hoat, he_so_quy_doi_kich_thuoc) VALUES
('BG_2026', N'Bảng giá chuẩn HCM 2026', '2026-01-01', 1, 6000);

INSERT INTO chi_tiet_bang_gia (ma_bang_gia, ma_vung_tuyen, ma_goi_dich_vu, cuoc_san, khoi_luong_san_kg, don_gia_vuot_moi_kg, phu_phi_de_vo, ty_le_phi_cod) VALUES
('BG_2026', 'VT_NOITINH', 'GDV_TIEUCHUAN', 20000, 1.0, 10000, 3000, 0.01),
('BG_2026', 'VT_NOITINH', 'GDV_HOATOC', 35000, 1.0, 15000, 5000, 0.01),
('BG_2026', 'VT_NGOAITINH', 'GDV_TIEUCHUAN', 28000, 1.0, 12000, 4000, 0.012);

-- 6. Đơn hàng mẫu
INSERT INTO don_hang (
    ma_van_don, ma_khach_hang, ma_buu_cuc_hien_tai, ma_shipper, ma_bang_gia, ma_vung_tuyen, ma_goi_dich_vu, ma_loai_hang,
    nguoi_gui_sdt, nguoi_nhan_ten, nguoi_nhan_sdt, dia_chi_giao_chi_tiet, phuong_xa_giao, quan_huyen_giao,
    trong_luong_thuc, chieu_dai, chieu_rong, chieu_cao, trong_luong_tinh_cuoc, la_hang_de_vo, la_hang_cong_kenh,
    tien_cod, nguoi_tra_cuoc, hinh_thuc_thanh_toan, cuoc_san, cuoc_vuot_can, phu_phi, phi_cod, tong_cuoc, trang_thai, so_lan_giao_that_bai
) VALUES
('FP-98231', 'ND_KH_01', 'BC_BENNGHE', 'NV_SHIP_01', 'BG_2026', 'VT_NOITINH', 'GDV_HOATOC', 'LHH_THUONG',
 '0909123456', N'Trần Thị Mai', '0912345678', N'45 Lê Duẩn', N'P. Bến Nghé', N'Quận 1',
 1.2, 20, 15, 10, 1.2, 0, 0, 450000, 'NguoiGui', 'VietQR', 35000, 3000, 0, 4500, 42500, 'DangGiaoHang', 0),
('FP-98232', 'ND_KH_01', 'BC_BENNGHE', 'NV_SHIP_01', 'BG_2026', 'VT_NOITINH', 'GDV_TIEUCHUAN', 'LHH_THUONG',
 '0909123456', N'Lê Hoàng Phúc', '0903456789', N'78 Hai Bà Trưng', N'P. Đa Kao', N'Quận 1',
 0.8, 15, 10, 10, 0.8, 0, 0, 0, 'NguoiGui', 'VietQR', 20000, 0, 0, 0, 20000, 'SanSangGiao', 0),
('FP-98233', 'ND_KH_01', 'KHO_Q1', 'NV_SHIP_01', 'BG_2026', 'VT_NOITINH', 'GDV_TIEUCHUAN', 'LHH_DEVO',
 '0909123456', N'Nguyễn Văn Hùng', '0908111222', N'28 Nguyễn Huệ', N'P. Bến Nghé', N'Quận 1',
 1.5, 20, 15, 10, 1.5, 1, 0, 500000, 'NguoiGui', 'TienMat', 20000, 5000, 3000, 5000, 33000, 'DaNhapKho', 0),
('FP-98236', 'ND_KH_01', 'KHO_Q1', NULL, 'BG_2026', 'VT_NOITINH', 'GDV_TIEUCHUAN', 'LHH_DEVO',
 '0909123456', N'Phạm Thị Lan', '0907333444', N'102 Pasteur', N'P. Bến Nghé', N'Quận 1',
 2.0, 25, 20, 15, 2.0, 1, 0, 320000, 'NguoiNhan', 'TienMat', 20000, 10000, 3000, 3200, 36200, 'TamGiuChoXuLy', 0);

INSERT INTO lich_su_hanh_trinh (ma_hanh_trinh, ma_van_don, ma_buu_cuc, ma_nhan_vien_thuc_hien, trang_thai_ghi_nhan, mo_ta_chi_tiet) VALUES
('HT_01', 'FP-98231', 'BC_BENNGHE', 'NV_QUAY_01', 'DaNhapKho', N'Tiếp nhận đơn hàng tại Bưu cục Bến Nghé'),
('HT_02', 'FP-98231', 'BC_BENNGHE', 'NV_SHIP_01', 'DangGiaoHang', N'Shipper Phương Duy đã nhận đơn và đang đi giao');

-- 7. Manifest mẫu
INSERT INTO manifest (ma_manifest, ma_buu_cuc_di, ma_buu_cuc_den, ma_nhan_vien_lap, tong_so_kien, trang_thai) VALUES
('MF-Q1-151126', 'KHO_Q1', 'BC_BENNGHE', 'NV_ADMIN_01', 2, 'DangKhoiTao');

INSERT INTO chi_tiet_manifest (ma_manifest, ma_van_don, da_quet_nhap) VALUES
('MF-Q1-151126', 'FP-98231', 1),
('MF-Q1-151126', 'FP-98233', 0);

-- 8. Phiếu đối soát & KPI mẫu
INSERT INTO phieu_doi_soat_shipper (ma_doi_soat, ma_shipper, ma_nhan_vien_quay, tong_don_thanh_cong, tong_tien_cod, tong_cuoc_mat, tong_phai_nop, so_tien_thuc_nop, so_tien_thieu, trang_thai) VALUES
('PDS-20261115-01', 'NV_SHIP_01', 'NV_QUAY_01', 5, 1250000, 0, 1250000, 1250000, 0, 'DaKhoaSo');

INSERT INTO danh_gia_kpi (ma_kpi, ma_shipper, ky_danh_gia, ty_le_giao_thanh_cong, ty_le_dung_hen_sla, san_luong_don_binh_quan, diem_tong_ket, xep_loai) VALUES
('KPI_202611_01', 'NV_SHIP_01', '2026-11', 97.5, 95.0, 28, 96.2, 'A');

-- ==========================================================
-- THIẾT KẾ DỮ LIỆU LƯU TRỮ (RDM) - CHUẨN MICROSOFT SQL SERVER
-- ==========================================================

-- I. BẢNG THAM SỐ
CREATE TABLE tham_so (
    ma_tham_so VARCHAR(50) PRIMARY KEY,
    ten_tham_so NVARCHAR(150) NOT NULL,
    kieu VARCHAR(50) NOT NULL,
    gia_tri NVARCHAR(255) NOT NULL,
    tinh_trang VARCHAR(50) NOT NULL
);

-- II. CÁC BẢNG DANH MỤC
CREATE TABLE vung_tuyen (
    ma_vung_tuyen VARCHAR(50) PRIMARY KEY,
    ten_vung_tuyen NVARCHAR(100) NOT NULL,
    mo_ta NVARCHAR(MAX)
);

CREATE TABLE goi_dich_vu (
    ma_goi_dich_vu VARCHAR(50) PRIMARY KEY,
    ten_goi_dich_vu NVARCHAR(100) NOT NULL,
    mo_ta NVARCHAR(MAX)
);

CREATE TABLE loai_hang_hoa (
    ma_loai_hang VARCHAR(50) PRIMARY KEY,
    ten_loai_hang NVARCHAR(100) NOT NULL,
    mo_ta NVARCHAR(MAX)
);

CREATE TABLE ngan_hang (
    ma_ngan_hang_dm VARCHAR(50) PRIMARY KEY,
    ten_ngan_hang NVARCHAR(150) NOT NULL,
    ten_viet_tat VARCHAR(50) NOT NULL
);

-- III. BƯU CỤC & TUYẾN
CREATE TABLE buu_cuc (
    ma_buu_cuc VARCHAR(50) PRIMARY KEY,
    ten_buu_cuc NVARCHAR(150) NOT NULL UNIQUE,
    loai_kho VARCHAR(50) NOT NULL,
    dia_chi NVARCHAR(MAX) NOT NULL,
    toa_do_gps VARCHAR(100),
    so_du_quy_ket NUMERIC(18,2) NOT NULL DEFAULT 0,
    trang_thai_hoat_dong VARCHAR(50) NOT NULL
);

CREATE TABLE tuyen_giao_hang (
    ma_tuyen VARCHAR(50) PRIMARY KEY,
    ma_buu_cuc VARCHAR(50) NOT NULL REFERENCES buu_cuc(ma_buu_cuc),
    ten_tuyen NVARCHAR(150) NOT NULL,
    loai_tuyen VARCHAR(50) NOT NULL
);

-- IV. NGƯỜI DÙNG & NHÂN SỰ
CREATE TABLE nguoi_dung (
    ma_nguoi_dung VARCHAR(50) PRIMARY KEY,
    so_dien_thoai VARCHAR(20) NOT NULL UNIQUE,
    ho_ten NVARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    mat_khau NVARCHAR(MAX),
    trang_thai VARCHAR(50) NOT NULL
);

CREATE TABLE khach_hang (
    ma_nguoi_dung VARCHAR(50) PRIMARY KEY REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    ten_shop NVARCHAR(150),
    loai_khach_hang VARCHAR(50) NOT NULL,
    la_tai_khoan_ngam BIT NOT NULL DEFAULT 0,
    ngay_kich_hoat DATETIME
);

CREATE TABLE so_dia_chi (
    ma_dia_chi VARCHAR(50) PRIMARY KEY,
    ma_khach_hang VARCHAR(50) NOT NULL REFERENCES khach_hang(ma_nguoi_dung) ON DELETE CASCADE,
    ten_nguoi_nhan NVARCHAR(150) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    dia_chi_chi_tiet NVARCHAR(MAX) NOT NULL,
    phuong_xa NVARCHAR(100) NOT NULL,
    quan_huyen NVARCHAR(100) NOT NULL,
    la_mac_dinh BIT NOT NULL DEFAULT 0
);

CREATE TABLE tai_khoan_ngan_hang (
    ma_tk_ngan_hang VARCHAR(50) PRIMARY KEY,
    ma_khach_hang VARCHAR(50) NOT NULL REFERENCES khach_hang(ma_nguoi_dung) ON DELETE CASCADE,
    ma_ngan_hang_dm VARCHAR(50) NOT NULL REFERENCES ngan_hang(ma_ngan_hang_dm),
    so_tai_khoan VARCHAR(50) NOT NULL,
    ten_chu_tai_khoan NVARCHAR(150) NOT NULL,
    la_mac_dinh_cod BIT NOT NULL DEFAULT 0
);

CREATE TABLE nhan_vien (
    ma_nhan_vien VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL UNIQUE REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    ma_buu_cuc VARCHAR(50) NOT NULL REFERENCES buu_cuc(ma_buu_cuc),
    loai_nhan_vien VARCHAR(50) NOT NULL,
    ngay_vao_lam DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE nhan_vien_quay (
    ma_nhan_vien VARCHAR(50) PRIMARY KEY REFERENCES nhan_vien(ma_nhan_vien) ON DELETE CASCADE
);

CREATE TABLE shipper (
    ma_nhan_vien VARCHAR(50) PRIMARY KEY REFERENCES nhan_vien(ma_nhan_vien) ON DELETE CASCADE,
    bien_so_xe VARCHAR(30),
    trang_thai_nhan_don VARCHAR(50) NOT NULL,
    ti_le_giao_thanh_cong FLOAT NOT NULL DEFAULT 100.0
);

CREATE TABLE tieu_tuyen (
    ma_tieu_tuyen VARCHAR(50) PRIMARY KEY,
    ma_tuyen VARCHAR(50) NOT NULL REFERENCES tuyen_giao_hang(ma_tuyen) ON DELETE CASCADE,
    ma_shipper VARCHAR(50) REFERENCES shipper(ma_nhan_vien) ON DELETE SET NULL,
    ten_tieu_tuyen NVARCHAR(150) NOT NULL
);

CREATE TABLE chi_tiet_tieu_tuyen (
    ma_tieu_tuyen VARCHAR(50) NOT NULL REFERENCES tieu_tuyen(ma_tieu_tuyen) ON DELETE CASCADE,
    quan_huyen NVARCHAR(100) NOT NULL,
    phuong_xa NVARCHAR(100) NOT NULL,
    PRIMARY KEY (ma_tieu_tuyen, quan_huyen, phuong_xa)
);

CREATE TABLE vi_cong_no_shipper (
    ma_vi VARCHAR(50) PRIMARY KEY,
    ma_shipper VARCHAR(50) NOT NULL UNIQUE REFERENCES shipper(ma_nhan_vien) ON DELETE CASCADE,
    tong_no_luy_ke NUMERIC(18,2) NOT NULL DEFAULT 0,
    thoi_diem_phat_sinh_no DATETIME,
    da_khoa_nhan_don BIT NOT NULL DEFAULT 0
);

-- V. BẢNG GIÁ CƯỚC
CREATE TABLE bang_gia_cuoc (
    ma_bang_gia VARCHAR(50) PRIMARY KEY,
    ten_bang_gia NVARCHAR(150) NOT NULL,
    ngay_hieu_luc DATETIME NOT NULL,
    dang_kich_hoat BIT NOT NULL DEFAULT 1,
    he_so_quy_doi_kich_thuoc FLOAT NOT NULL DEFAULT 6000
);

CREATE TABLE chi_tiet_bang_gia (
    ma_bang_gia VARCHAR(50) NOT NULL REFERENCES bang_gia_cuoc(ma_bang_gia) ON DELETE CASCADE,
    ma_vung_tuyen VARCHAR(50) NOT NULL REFERENCES vung_tuyen(ma_vung_tuyen),
    ma_goi_dich_vu VARCHAR(50) NOT NULL REFERENCES goi_dich_vu(ma_goi_dich_vu),
    cuoc_san NUMERIC(18,2) NOT NULL,
    khoi_luong_san_kg FLOAT NOT NULL,
    don_gia_vuot_moi_kg NUMERIC(18,2) NOT NULL,
    phu_phi_de_vo NUMERIC(18,2) NOT NULL DEFAULT 0,
    ty_le_phi_cod FLOAT NOT NULL DEFAULT 0,
    PRIMARY KEY (ma_bang_gia, ma_vung_tuyen, ma_goi_dich_vu)
);

-- VI. ĐƠN HÀNG & LỊCH SỬ
CREATE TABLE don_hang (
    ma_van_don VARCHAR(50) PRIMARY KEY,
    ma_khach_hang VARCHAR(50) NOT NULL REFERENCES khach_hang(ma_nguoi_dung),
    ma_buu_cuc_hien_tai VARCHAR(50) NOT NULL REFERENCES buu_cuc(ma_buu_cuc),
    ma_shipper VARCHAR(50) REFERENCES shipper(ma_nhan_vien),
    ma_bang_gia VARCHAR(50) NOT NULL REFERENCES bang_gia_cuoc(ma_bang_gia),
    ma_vung_tuyen VARCHAR(50) NOT NULL REFERENCES vung_tuyen(ma_vung_tuyen),
    ma_goi_dich_vu VARCHAR(50) NOT NULL REFERENCES goi_dich_vu(ma_goi_dich_vu),
    ma_loai_hang VARCHAR(50) NOT NULL REFERENCES loai_hang_hoa(ma_loai_hang),
    nguoi_gui_sdt VARCHAR(20) NOT NULL,
    nguoi_nhan_ten NVARCHAR(150) NOT NULL,
    nguoi_nhan_sdt VARCHAR(20) NOT NULL,
    dia_chi_giao_chi_tiet NVARCHAR(MAX) NOT NULL,
    phuong_xa_giao NVARCHAR(100) NOT NULL,
    quan_huyen_giao NVARCHAR(100) NOT NULL,
    trong_luong_thuc FLOAT NOT NULL,
    chieu_dai FLOAT NOT NULL DEFAULT 0,
    chieu_rong FLOAT NOT NULL DEFAULT 0,
    chieu_cao FLOAT NOT NULL DEFAULT 0,
    trong_luong_tinh_cuoc FLOAT NOT NULL,
    la_hang_de_vo BIT NOT NULL DEFAULT 0,
    la_hang_cong_kenh BIT NOT NULL DEFAULT 0,
    tien_cod NUMERIC(18,2) NOT NULL DEFAULT 0,
    nguoi_tra_cuoc VARCHAR(50) NOT NULL,
    hinh_thuc_thanh_toan VARCHAR(50) NOT NULL,
    cuoc_san NUMERIC(18,2) NOT NULL DEFAULT 0,
    cuoc_vuot_can NUMERIC(18,2) NOT NULL DEFAULT 0,
    phu_phi NUMERIC(18,2) NOT NULL DEFAULT 0,
    phi_cod NUMERIC(18,2) NOT NULL DEFAULT 0,
    tong_cuoc NUMERIC(18,2) NOT NULL DEFAULT 0,
    trang_thai VARCHAR(50) NOT NULL,
    so_lan_giao_that_bai INT NOT NULL DEFAULT 0,
    ngay_tao DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE bang_chung_giao_hang (
    ma_pod VARCHAR(50) PRIMARY KEY,
    ma_van_don VARCHAR(50) NOT NULL UNIQUE REFERENCES don_hang(ma_van_don) ON DELETE CASCADE,
    anh_chup_goi_hang NVARCHAR(MAX) NOT NULL,
    toa_do_gps VARCHAR(100),
    thoi_gian_chup DATETIME NOT NULL,
    chu_ky_dien_tu NVARCHAR(MAX),
    ten_nguoi_ky NVARCHAR(150)
);

CREATE TABLE lich_su_hanh_trinh (
    ma_hanh_trinh VARCHAR(50) PRIMARY KEY,
    ma_van_don VARCHAR(50) NOT NULL REFERENCES don_hang(ma_van_don) ON DELETE CASCADE,
    ma_buu_cuc VARCHAR(50) REFERENCES buu_cuc(ma_buu_cuc),
    ma_nhan_vien_thuc_hien VARCHAR(50) REFERENCES nhan_vien(ma_nhan_vien),
    thoi_gian DATETIME NOT NULL DEFAULT GETDATE(),
    trang_thai_ghi_nhan VARCHAR(50) NOT NULL,
    mo_ta_chi_tiet NVARCHAR(MAX)
);

CREATE TABLE lich_hen_giao_lai (
    ma_lich_hen VARCHAR(50) PRIMARY KEY,
    ma_van_don VARCHAR(50) NOT NULL REFERENCES don_hang(ma_van_don) ON DELETE CASCADE,
    lan_giao_thu INT NOT NULL,
    ly_do_that_bai NVARCHAR(MAX) NOT NULL,
    ngay_hen_giao_lai DATETIME,
    ghi_chu NVARCHAR(MAX)
);

CREATE TABLE nhat_ky_in_tem (
    ma_nhat_ky VARCHAR(50) PRIMARY KEY,
    ma_van_don VARCHAR(50) NOT NULL REFERENCES don_hang(ma_van_don) ON DELETE CASCADE,
    ma_nhan_vien_quay VARCHAR(50) NOT NULL REFERENCES nhan_vien_quay(ma_nhan_vien),
    thoi_gian_in DATETIME NOT NULL DEFAULT GETDATE(),
    so_lan_in INT NOT NULL DEFAULT 1,
    loai_in VARCHAR(50) NOT NULL,
    ly_do_in_lai NVARCHAR(MAX)
);

CREATE TABLE giao_dich_viet_qr (
    ma_giao_dich_qr VARCHAR(50) PRIMARY KEY,
    ma_van_don VARCHAR(50) NOT NULL REFERENCES don_hang(ma_van_don) ON DELETE CASCADE,
    so_tien NUMERIC(18,2) NOT NULL,
    noi_dung_chuyen_khoan NVARCHAR(MAX) NOT NULL,
    trang_thai VARCHAR(50) NOT NULL,
    ma_giao_dich_ngan_hang VARCHAR(100) UNIQUE,
    thoi_gian_tao DATETIME NOT NULL DEFAULT GETDATE(),
    thoi_gian_xac_nhan DATETIME
);

-- VII. CHỨNG TỪ KHO
CREATE TABLE manifest (
    ma_manifest VARCHAR(50) PRIMARY KEY,
    ma_buu_cuc_di VARCHAR(50) NOT NULL REFERENCES buu_cuc(ma_buu_cuc),
    ma_buu_cuc_den VARCHAR(50) NOT NULL REFERENCES buu_cuc(ma_buu_cuc),
    ma_nhan_vien_lap VARCHAR(50) NOT NULL REFERENCES nhan_vien(ma_nhan_vien),
    ngay_lap DATETIME NOT NULL DEFAULT GETDATE(),
    tong_so_kien INT NOT NULL DEFAULT 0,
    trang_thai VARCHAR(50) NOT NULL
);

CREATE TABLE chi_tiet_manifest (
    ma_manifest VARCHAR(50) NOT NULL REFERENCES manifest(ma_manifest) ON DELETE CASCADE,
    ma_van_don VARCHAR(50) NOT NULL REFERENCES don_hang(ma_van_don) ON DELETE CASCADE,
    da_quet_nhap BIT NOT NULL DEFAULT 0,
    thoi_gian_quet DATETIME,
    PRIMARY KEY (ma_manifest, ma_van_don)
);

CREATE TABLE phieu_xuat_kho (
    ma_phieu_xuat VARCHAR(50) PRIMARY KEY,
    ma_buu_cuc VARCHAR(50) NOT NULL REFERENCES buu_cuc(ma_buu_cuc),
    ma_nhan_vien_kho VARCHAR(50) NOT NULL REFERENCES nhan_vien(ma_nhan_vien),
    ma_shipper VARCHAR(50) NOT NULL REFERENCES shipper(ma_nhan_vien),
    thoi_gian_xuat DATETIME NOT NULL DEFAULT GETDATE(),
    tong_so_don INT NOT NULL DEFAULT 0,
    tong_tien_cod_phai_thu NUMERIC(18,2) NOT NULL DEFAULT 0,
    shipper_da_xac_nhan BIT NOT NULL DEFAULT 0
);

CREATE TABLE chi_tiet_phieu_xuat (
    ma_phieu_xuat VARCHAR(50) NOT NULL REFERENCES phieu_xuat_kho(ma_phieu_xuat) ON DELETE CASCADE,
    ma_van_don VARCHAR(50) NOT NULL REFERENCES don_hang(ma_van_don) ON DELETE CASCADE,
    ghi_chu_ban_giao NVARCHAR(MAX),
    PRIMARY KEY (ma_phieu_xuat, ma_van_don)
);

CREATE TABLE bien_ban_bat_thuong (
    ma_bien_ban VARCHAR(50) PRIMARY KEY,
    ma_van_don VARCHAR(50) NOT NULL REFERENCES don_hang(ma_van_don) ON DELETE CASCADE,
    ma_nhan_vien_kho_lap VARCHAR(50) NOT NULL REFERENCES nhan_vien(ma_nhan_vien),
    ma_quan_ly_duyet VARCHAR(50) REFERENCES nhan_vien(ma_nhan_vien),
    loai_bat_thuong NVARCHAR(100) NOT NULL,
    can_nang_thuc_te FLOAT,
    hinh_anh_bang_chung NVARCHAR(MAX) NOT NULL,
    mo_ta NVARCHAR(MAX) NOT NULL,
    phuong_an_xu_ly NVARCHAR(MAX),
    trang_thai_duyet VARCHAR(50) NOT NULL DEFAULT 'ChoXuLy'
);

-- VIII. ĐỐI SOÁT & BÁO CÁO
CREATE TABLE phieu_doi_soat_shipper (
    ma_doi_soat VARCHAR(50) PRIMARY KEY,
    ma_shipper VARCHAR(50) NOT NULL REFERENCES shipper(ma_nhan_vien),
    ma_nhan_vien_quay VARCHAR(50) NOT NULL REFERENCES nhan_vien_quay(ma_nhan_vien),
    ngay_doi_soat DATETIME NOT NULL DEFAULT GETDATE(),
    tong_don_thanh_cong INT NOT NULL DEFAULT 0,
    tong_tien_cod NUMERIC(18,2) NOT NULL DEFAULT 0,
    tong_cuoc_mat NUMERIC(18,2) NOT NULL DEFAULT 0,
    tong_phai_nop NUMERIC(18,2) NOT NULL DEFAULT 0,
    so_tien_thuc_nop NUMERIC(18,2) NOT NULL DEFAULT 0,
    so_tien_thieu NUMERIC(18,2) NOT NULL DEFAULT 0,
    trang_thai VARCHAR(50) NOT NULL
);

CREATE TABLE bien_ban_chot_quy (
    ma_bien_ban_quy VARCHAR(50) PRIMARY KEY,
    ma_buu_cuc VARCHAR(50) NOT NULL REFERENCES buu_cuc(ma_buu_cuc),
    ma_nhan_vien_quay_lap VARCHAR(50) NOT NULL REFERENCES nhan_vien_quay(ma_nhan_vien),
    ma_quan_ly_ky VARCHAR(50) REFERENCES nhan_vien(ma_nhan_vien),
    ngay_chot DATETIME NOT NULL DEFAULT GETDATE(),
    tien_cuoc_quay NUMERIC(18,2) NOT NULL DEFAULT 0,
    tien_shipper_nop NUMERIC(18,2) NOT NULL DEFAULT 0,
    tong_tien_so_sach NUMERIC(18,2) NOT NULL DEFAULT 0,
    tien_thuc_kiem_ke NUMERIC(18,2) NOT NULL DEFAULT 0,
    chenh_lech NUMERIC(18,2) NOT NULL DEFAULT 0,
    ly_do_chenh_lech NVARCHAR(MAX),
    da_khoa_so BIT NOT NULL DEFAULT 0
);

CREATE TABLE ky_quyet_toan_cod (
    ma_ky VARCHAR(50) PRIMARY KEY,
    ma_quan_ly_lap VARCHAR(50) NOT NULL REFERENCES nhan_vien(ma_nhan_vien),
    loai_ky_thanh_toan VARCHAR(50) NOT NULL,
    tu_ngay DATETIME NOT NULL,
    den_ngay DATETIME NOT NULL,
    trang_thai VARCHAR(50) NOT NULL
);

CREATE TABLE bang_ke_quyet_toan_shop (
    ma_bang_ke VARCHAR(50) PRIMARY KEY,
    ma_ky VARCHAR(50) NOT NULL REFERENCES ky_quyet_toan_cod(ma_ky) ON DELETE CASCADE,
    ma_khach_hang VARCHAR(50) NOT NULL REFERENCES khach_hang(ma_nguoi_dung),
    ma_tai_khoan_ngan_hang VARCHAR(50) REFERENCES tai_khoan_ngan_hang(ma_tk_ngan_hang),
    tong_cod NUMERIC(18,2) NOT NULL DEFAULT 0,
    tong_cuoc_tru NUMERIC(18,2) NOT NULL DEFAULT 0,
    thuc_tra NUMERIC(18,2) NOT NULL DEFAULT 0,
    trang_thai_thanh_toan VARCHAR(50) NOT NULL,
    ma_giao_dich_ngan_hang VARCHAR(100)
);

CREATE TABLE bao_cao_doanh_thu (
    ma_bao_cao VARCHAR(50) PRIMARY KEY,
    ma_buu_cuc VARCHAR(50) NOT NULL REFERENCES buu_cuc(ma_buu_cuc),
    tu_ngay DATETIME NOT NULL,
    den_ngay DATETIME NOT NULL,
    doanh_thu_cuoc NUMERIC(18,2) NOT NULL DEFAULT 0,
    tien_cod_trung_chuyen NUMERIC(18,2) NOT NULL DEFAULT 0,
    tong_san_luong_don INT NOT NULL DEFAULT 0,
    ty_le_tien_mat FLOAT NOT NULL DEFAULT 0,
    ty_le_viet_qr FLOAT NOT NULL DEFAULT 0
);

CREATE TABLE danh_gia_kpi (
    ma_kpi VARCHAR(50) PRIMARY KEY,
    ma_shipper VARCHAR(50) NOT NULL REFERENCES shipper(ma_nhan_vien),
    ky_danh_gia VARCHAR(50) NOT NULL,
    ty_le_giao_thanh_cong FLOAT NOT NULL DEFAULT 0,
    ty_le_dung_hen_sla FLOAT NOT NULL DEFAULT 0,
    san_luong_don_binh_quan INT NOT NULL DEFAULT 0,
    diem_tong_ket FLOAT NOT NULL DEFAULT 0,
    xep_loai VARCHAR(50) NOT NULL
);
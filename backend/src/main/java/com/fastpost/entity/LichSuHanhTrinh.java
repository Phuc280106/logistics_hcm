package com.fastpost.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lich_su_hanh_trinh")
public class LichSuHanhTrinh {
    @Id
    @Column(name = "ma_hanh_trinh", length = 50)
    private String maHanhTrinh;

    @Column(name = "ma_van_don", length = 50, nullable = false)
    private String maVanDon;

    @Column(name = "ma_buu_cuc", length = 50)
    private String maBuuCuc;

    @Column(name = "ma_nhan_vien_thuc_hien", length = 50)
    private String maNhanVienThucHien;

    @Column(name = "thoi_gian", nullable = false)
    private LocalDateTime thoiGian = LocalDateTime.now();

    @Column(name = "trang_thai_ghi_nhan", length = 50, nullable = false)
    private String trangThaiGhiNhan;

    @Column(name = "mo_ta_chi_tiet")
    private String moTaChiTiet;

    public String getMaHanhTrinh() { return maHanhTrinh; }
    public void setMaHanhTrinh(String maHanhTrinh) { this.maHanhTrinh = maHanhTrinh; }
    public String getMaVanDon() { return maVanDon; }
    public void setMaVanDon(String maVanDon) { this.maVanDon = maVanDon; }
    public String getMaBuuCuc() { return maBuuCuc; }
    public void setMaBuuCuc(String maBuuCuc) { this.maBuuCuc = maBuuCuc; }
    public String getMaNhanVienThucHien() { return maNhanVienThucHien; }
    public void setMaNhanVienThucHien(String maNhanVienThucHien) { this.maNhanVienThucHien = maNhanVienThucHien; }
    public LocalDateTime getThoiGian() { return thoiGian; }
    public void setThoiGian(LocalDateTime thoiGian) { this.thoiGian = thoiGian; }
    public String getTrangThaiGhiNhan() { return trangThaiGhiNhan; }
    public void setTrangThaiGhiNhan(String trangThaiGhiNhan) { this.trangThaiGhiNhan = trangThaiGhiNhan; }
    public String getMoTaChiTiet() { return moTaChiTiet; }
    public void setMoTaChiTiet(String moTaChiTiet) { this.moTaChiTiet = moTaChiTiet; }
}

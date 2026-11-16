package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "bien_ban_bat_thuong")
public class BienBanBatThuong {
    @Id
    @Column(name = "ma_bien_ban", length = 50)
    private String maBienBan;

    @Column(name = "ma_van_don", length = 50, nullable = false)
    private String maVanDon;

    @Column(name = "ma_nhan_vien_kho_lap", length = 50, nullable = false)
    private String maNhanVienKhoLap;

    @Column(name = "ma_quan_ly_duyet", length = 50)
    private String maQuanLyDuyet;

    @Column(name = "loai_bat_thuong", length = 100, nullable = false)
    private String loaiBatThuong;

    @Column(name = "can_nang_thuc_te")
    private Double canNangThucTe;

    @Column(name = "hinh_anh_bang_chung", nullable = false)
    private String hinhAnhBangChung;

    @Column(name = "mo_ta", nullable = false)
    private String moTa;

    @Column(name = "phuong_an_xu_ly")
    private String phuongAnXuLy;

    @Column(name = "trang_thai_duyet", length = 50, nullable = false)
    private String trangThaiDuyet = "ChoXuLy";

    public String getMaBienBan() { return maBienBan; }
    public void setMaBienBan(String maBienBan) { this.maBienBan = maBienBan; }
    public String getMaVanDon() { return maVanDon; }
    public void setMaVanDon(String maVanDon) { this.maVanDon = maVanDon; }
    public String getMaNhanVienKhoLap() { return maNhanVienKhoLap; }
    public void setMaNhanVienKhoLap(String maNhanVienKhoLap) { this.maNhanVienKhoLap = maNhanVienKhoLap; }
    public String getMaQuanLyDuyet() { return maQuanLyDuyet; }
    public void setMaQuanLyDuyet(String maQuanLyDuyet) { this.maQuanLyDuyet = maQuanLyDuyet; }
    public String getLoaiBatThuong() { return loaiBatThuong; }
    public void setLoaiBatThuong(String loaiBatThuong) { this.loaiBatThuong = loaiBatThuong; }
    public Double getCanNangThucTe() { return canNangThucTe; }
    public void setCanNangThucTe(Double canNangThucTe) { this.canNangThucTe = canNangThucTe; }
    public String getHinhAnhBangChung() { return hinhAnhBangChung; }
    public void setHinhAnhBangChung(String hinhAnhBangChung) { this.hinhAnhBangChung = hinhAnhBangChung; }
    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }
    public String getPhuongAnXuLy() { return phuongAnXuLy; }
    public void setPhuongAnXuLy(String phuongAnXuLy) { this.phuongAnXuLy = phuongAnXuLy; }
    public String getTrangThaiDuyet() { return trangThaiDuyet; }
    public void setTrangThaiDuyet(String trangThaiDuyet) { this.trangThaiDuyet = trangThaiDuyet; }
}

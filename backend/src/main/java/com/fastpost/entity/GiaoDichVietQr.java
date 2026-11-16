package com.fastpost.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "giao_dich_viet_qr")
public class GiaoDichVietQr {
    @Id
    @Column(name = "ma_giao_dich_qr", length = 50)
    private String maGiaoDichQr;

    @Column(name = "ma_van_don", length = 50, nullable = false)
    private String maVanDon;

    @Column(name = "so_tien", precision = 18, scale = 2, nullable = false)
    private BigDecimal soTien;

    @Column(name = "noi_dung_chuyen_khoan", nullable = false)
    private String noiDungChuyenKhoan;

    @Column(name = "trang_thai", length = 50, nullable = false)
    private String trangThai;

    @Column(name = "ma_giao_dich_ngan_hang", length = 100, unique = true)
    private String maGiaoDichNganHang;

    @Column(name = "thoi_gian_tao", nullable = false)
    private LocalDateTime thoiGianTao = LocalDateTime.now();

    @Column(name = "thoi_gian_xac_nhan")
    private LocalDateTime thoiGianXacNhan;

    public String getMaGiaoDichQr() { return maGiaoDichQr; }
    public void setMaGiaoDichQr(String maGiaoDichQr) { this.maGiaoDichQr = maGiaoDichQr; }
    public String getMaVanDon() { return maVanDon; }
    public void setMaVanDon(String maVanDon) { this.maVanDon = maVanDon; }
    public BigDecimal getSoTien() { return soTien; }
    public void setSoTien(BigDecimal soTien) { this.soTien = soTien; }
    public String getNoiDungChuyenKhoan() { return noiDungChuyenKhoan; }
    public void setNoiDungChuyenKhoan(String noiDungChuyenKhoan) { this.noiDungChuyenKhoan = noiDungChuyenKhoan; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public String getMaGiaoDichNganHang() { return maGiaoDichNganHang; }
    public void setMaGiaoDichNganHang(String maGiaoDichNganHang) { this.maGiaoDichNganHang = maGiaoDichNganHang; }
    public LocalDateTime getThoiGianTao() { return thoiGianTao; }
    public void setThoiGianTao(LocalDateTime thoiGianTao) { this.thoiGianTao = thoiGianTao; }
    public LocalDateTime getThoiGianXacNhan() { return thoiGianXacNhan; }
    public void setThoiGianXacNhan(LocalDateTime thoiGianXacNhan) { this.thoiGianXacNhan = thoiGianXacNhan; }
}

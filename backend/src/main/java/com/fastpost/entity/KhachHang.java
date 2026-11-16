package com.fastpost.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "khach_hang")
public class KhachHang {
    @Id
    @Column(name = "ma_nguoi_dung", length = 50)
    private String maNguoiDung;

    @Column(name = "ten_shop", length = 150)
    private String tenShop;

    @Column(name = "loai_khach_hang", length = 50, nullable = false)
    private String loaiKhachHang;

    @Column(name = "la_tai_khoan_ngam", nullable = false)
    private boolean laTaiKhoanNgam;

    @Column(name = "ngay_kich_hoat")
    private LocalDateTime ngayKichHoat;

    public String getMaNguoiDung() { return maNguoiDung; }
    public void setMaNguoiDung(String maNguoiDung) { this.maNguoiDung = maNguoiDung; }
    public String getTenShop() { return tenShop; }
    public void setTenShop(String tenShop) { this.tenShop = tenShop; }
    public String getLoaiKhachHang() { return loaiKhachHang; }
    public void setLoaiKhachHang(String loaiKhachHang) { this.loaiKhachHang = loaiKhachHang; }
    public boolean isLaTaiKhoanNgam() { return laTaiKhoanNgam; }
    public void setLaTaiKhoanNgam(boolean laTaiKhoanNgam) { this.laTaiKhoanNgam = laTaiKhoanNgam; }
    public LocalDateTime getNgayKichHoat() { return ngayKichHoat; }
    public void setNgayKichHoat(LocalDateTime ngayKichHoat) { this.ngayKichHoat = ngayKichHoat; }
}

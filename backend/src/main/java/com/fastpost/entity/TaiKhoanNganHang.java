package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tai_khoan_ngan_hang")
public class TaiKhoanNganHang {
    @Id
    @Column(name = "ma_tk_ngan_hang", length = 50)
    private String maTkNganHang;

    @Column(name = "ma_khach_hang", length = 50, nullable = false)
    private String maKhachHang;

    @Column(name = "ma_ngan_hang_dm", length = 50, nullable = false)
    private String maNganHangDm;

    @Column(name = "so_tai_khoan", length = 50, nullable = false)
    private String soTaiKhoan;

    @Column(name = "ten_chu_tai_khoan", length = 150, nullable = false)
    private String tenChuTaiKhoan;

    @Column(name = "la_mac_dinh_cod", nullable = false)
    private boolean laMacDinhCod;

    public String getMaTkNganHang() { return maTkNganHang; }
    public void setMaTkNganHang(String maTkNganHang) { this.maTkNganHang = maTkNganHang; }
    public String getMaKhachHang() { return maKhachHang; }
    public void setMaKhachHang(String maKhachHang) { this.maKhachHang = maKhachHang; }
    public String getMaNganHangDm() { return maNganHangDm; }
    public void setMaNganHangDm(String maNganHangDm) { this.maNganHangDm = maNganHangDm; }
    public String getSoTaiKhoan() { return soTaiKhoan; }
    public void setSoTaiKhoan(String soTaiKhoan) { this.soTaiKhoan = soTaiKhoan; }
    public String getTenChuTaiKhoan() { return tenChuTaiKhoan; }
    public void setTenChuTaiKhoan(String tenChuTaiKhoan) { this.tenChuTaiKhoan = tenChuTaiKhoan; }
    public boolean isLaMacDinhCod() { return laMacDinhCod; }
    public void setLaMacDinhCod(boolean laMacDinhCod) { this.laMacDinhCod = laMacDinhCod; }
}

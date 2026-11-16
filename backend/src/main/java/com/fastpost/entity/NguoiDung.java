package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "nguoi_dung")
public class NguoiDung {
    @Id
    @Column(name = "ma_nguoi_dung", length = 50)
    private String maNguoiDung;

    @Column(name = "so_dien_thoai", length = 20, nullable = false, unique = true)
    private String soDienThoai;

    @Column(name = "ho_ten", length = 150, nullable = false)
    private String hoTen;

    @Column(name = "email", length = 150, unique = true)
    private String email;

    @Column(name = "mat_khau")
    private String matKhau;

    @Column(name = "trang_thai", length = 50, nullable = false)
    private String trangThai;

    public String getMaNguoiDung() { return maNguoiDung; }
    public void setMaNguoiDung(String maNguoiDung) { this.maNguoiDung = maNguoiDung; }
    public String getSoDienThoai() { return soDienThoai; }
    public void setSoDienThoai(String soDienThoai) { this.soDienThoai = soDienThoai; }
    public String getHoTen() { return hoTen; }
    public void setHoTen(String hoTen) { this.hoTen = hoTen; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMatKhau() { return matKhau; }
    public void setMatKhau(String matKhau) { this.matKhau = matKhau; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}

package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "so_dia_chi")
public class SoDiaChi {
    @Id
    @Column(name = "ma_dia_chi", length = 50)
    private String maDiaChi;

    @Column(name = "ma_khach_hang", length = 50, nullable = false)
    private String maKhachHang;

    @Column(name = "ten_nguoi_nhan", length = 150, nullable = false)
    private String tenNguoiNhan;

    @Column(name = "so_dien_thoai", length = 20, nullable = false)
    private String soDienThoai;

    @Column(name = "dia_chi_chi_tiet", nullable = false)
    private String diaChiChiTiet;

    @Column(name = "phuong_xa", length = 100, nullable = false)
    private String phuongXa;

    @Column(name = "quan_huyen", length = 100, nullable = false)
    private String quanHuyen;

    @Column(name = "la_mac_dinh", nullable = false)
    private boolean laMacDinh;

    public String getMaDiaChi() { return maDiaChi; }
    public void setMaDiaChi(String maDiaChi) { this.maDiaChi = maDiaChi; }
    public String getMaKhachHang() { return maKhachHang; }
    public void setMaKhachHang(String maKhachHang) { this.maKhachHang = maKhachHang; }
    public String getTenNguoiNhan() { return tenNguoiNhan; }
    public void setTenNguoiNhan(String tenNguoiNhan) { this.tenNguoiNhan = tenNguoiNhan; }
    public String getSoDienThoai() { return soDienThoai; }
    public void setSoDienThoai(String soDienThoai) { this.soDienThoai = soDienThoai; }
    public String getDiaChiChiTiet() { return diaChiChiTiet; }
    public void setDiaChiChiTiet(String diaChiChiTiet) { this.diaChiChiTiet = diaChiChiTiet; }
    public String getPhuongXa() { return phuongXa; }
    public void setPhuongXa(String phuongXa) { this.phuongXa = phuongXa; }
    public String getQuanHuyen() { return quanHuyen; }
    public void setQuanHuyen(String quanHuyen) { this.quanHuyen = quanHuyen; }
    public boolean isLaMacDinh() { return laMacDinh; }
    public void setLaMacDinh(boolean laMacDinh) { this.laMacDinh = laMacDinh; }
}

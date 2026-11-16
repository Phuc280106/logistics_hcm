package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "loai_hang_hoa")
public class LoaiHangHoa {
    @Id
    @Column(name = "ma_loai_hang", length = 50)
    private String maLoaiHang;

    @Column(name = "ten_loai_hang", length = 100, nullable = false)
    private String tenLoaiHang;

    @Column(name = "mo_ta")
    private String moTa;

    public String getMaLoaiHang() { return maLoaiHang; }
    public void setMaLoaiHang(String maLoaiHang) { this.maLoaiHang = maLoaiHang; }
    public String getTenLoaiHang() { return tenLoaiHang; }
    public void setTenLoaiHang(String tenLoaiHang) { this.tenLoaiHang = tenLoaiHang; }
    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }
}

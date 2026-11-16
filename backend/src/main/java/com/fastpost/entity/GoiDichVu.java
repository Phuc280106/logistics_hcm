package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "goi_dich_vu")
public class GoiDichVu {
    @Id
    @Column(name = "ma_goi_dich_vu", length = 50)
    private String maGoiDichVu;

    @Column(name = "ten_goi_dich_vu", length = 100, nullable = false)
    private String tenGoiDichVu;

    @Column(name = "mo_ta")
    private String moTa;

    public String getMaGoiDichVu() { return maGoiDichVu; }
    public void setMaGoiDichVu(String maGoiDichVu) { this.maGoiDichVu = maGoiDichVu; }
    public String getTenGoiDichVu() { return tenGoiDichVu; }
    public void setTenGoiDichVu(String tenGoiDichVu) { this.tenGoiDichVu = tenGoiDichVu; }
    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }
}

package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vung_tuyen")
public class VungTuyen {
    @Id
    @Column(name = "ma_vung_tuyen", length = 50)
    private String maVungTuyen;

    @Column(name = "ten_vung_tuyen", length = 100, nullable = false)
    private String tenVungTuyen;

    @Column(name = "mo_ta")
    private String moTa;

    public String getMaVungTuyen() { return maVungTuyen; }
    public void setMaVungTuyen(String maVungTuyen) { this.maVungTuyen = maVungTuyen; }
    public String getTenVungTuyen() { return tenVungTuyen; }
    public void setTenVungTuyen(String tenVungTuyen) { this.tenVungTuyen = tenVungTuyen; }
    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }
}

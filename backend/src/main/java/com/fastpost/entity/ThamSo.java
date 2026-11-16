package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tham_so")
public class ThamSo {
    @Id
    @Column(name = "ma_tham_so", length = 50)
    private String maThamSo;

    @Column(name = "ten_tham_so", length = 150, nullable = false)
    private String tenThamSo;

    @Column(name = "kieu", length = 50, nullable = false)
    private String kieu;

    @Column(name = "gia_tri", length = 255, nullable = false)
    private String giaTri;

    @Column(name = "tinh_trang", length = 50, nullable = false)
    private String tinhTrang;

    public String getMaThamSo() { return maThamSo; }
    public void setMaThamSo(String maThamSo) { this.maThamSo = maThamSo; }
    public String getTenThamSo() { return tenThamSo; }
    public void setTenThamSo(String tenThamSo) { this.tenThamSo = tenThamSo; }
    public String getKieu() { return kieu; }
    public void setKieu(String kieu) { this.kieu = kieu; }
    public String getGiaTri() { return giaTri; }
    public void setGiaTri(String giaTri) { this.giaTri = giaTri; }
    public String getTinhTrang() { return tinhTrang; }
    public void setTinhTrang(String tinhTrang) { this.tinhTrang = tinhTrang; }
}

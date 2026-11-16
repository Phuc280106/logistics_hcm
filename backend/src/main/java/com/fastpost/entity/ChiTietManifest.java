package com.fastpost.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chi_tiet_manifest")
@IdClass(ChiTietManifestId.class)
public class ChiTietManifest {
    @Id
    @Column(name = "ma_manifest", length = 50)
    private String maManifest;

    @Id
    @Column(name = "ma_van_don", length = 50)
    private String maVanDon;

    @Column(name = "da_quet_nhap", nullable = false)
    private Boolean daQuetNhap = false;

    @Column(name = "thoi_gian_quet")
    private LocalDateTime thoiGianQuet;

    public String getMaManifest() { return maManifest; }
    public void setMaManifest(String maManifest) { this.maManifest = maManifest; }
    public String getMaVanDon() { return maVanDon; }
    public void setMaVanDon(String maVanDon) { this.maVanDon = maVanDon; }
    public Boolean getDaQuetNhap() { return daQuetNhap; }
    public void setDaQuetNhap(Boolean daQuetNhap) { this.daQuetNhap = daQuetNhap; }
    public LocalDateTime getThoiGianQuet() { return thoiGianQuet; }
    public void setThoiGianQuet(LocalDateTime thoiGianQuet) { this.thoiGianQuet = thoiGianQuet; }
}

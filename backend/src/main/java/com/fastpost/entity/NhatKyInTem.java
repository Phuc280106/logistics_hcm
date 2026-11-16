package com.fastpost.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "nhat_ky_in_tem")
public class NhatKyInTem {
    @Id
    @Column(name = "ma_nhat_ky", length = 50)
    private String maNhatKy;

    @Column(name = "ma_van_don", length = 50, nullable = false)
    private String maVanDon;

    @Column(name = "ma_nhan_vien_quay", length = 50, nullable = false)
    private String maNhanVienQuay;

    @Column(name = "thoi_gian_in", nullable = false)
    private LocalDateTime thoiGianIn = LocalDateTime.now();

    @Column(name = "so_lan_in", nullable = false)
    private int soLanIn = 1;

    @Column(name = "loai_in", length = 50, nullable = false)
    private String loaiIn;

    @Column(name = "ly_do_in_lai")
    private String lyDoInLai;

    public String getMaNhatKy() { return maNhatKy; }
    public void setMaNhatKy(String maNhatKy) { this.maNhatKy = maNhatKy; }
    public String getMaVanDon() { return maVanDon; }
    public void setMaVanDon(String maVanDon) { this.maVanDon = maVanDon; }
    public String getMaNhanVienQuay() { return maNhanVienQuay; }
    public void setMaNhanVienQuay(String maNhanVienQuay) { this.maNhanVienQuay = maNhanVienQuay; }
    public LocalDateTime getThoiGianIn() { return thoiGianIn; }
    public void setThoiGianIn(LocalDateTime thoiGianIn) { this.thoiGianIn = thoiGianIn; }
    public int getSoLanIn() { return soLanIn; }
    public void setSoLanIn(int soLanIn) { this.soLanIn = soLanIn; }
    public String getLoaiIn() { return loaiIn; }
    public void setLoaiIn(String loaiIn) { this.loaiIn = loaiIn; }
    public String getLyDoInLai() { return lyDoInLai; }
    public void setLyDoInLai(String lyDoInLai) { this.lyDoInLai = lyDoInLai; }
}

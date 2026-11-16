package com.fastpost.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lich_hen_giao_lai")
public class LichHenGiaoLai {
    @Id
    @Column(name = "ma_lich_hen", length = 50)
    private String maLichHen;

    @Column(name = "ma_van_don", length = 50, nullable = false)
    private String maVanDon;

    @Column(name = "lan_giao_thu", nullable = false)
    private Integer lanGiaoThu;

    @Column(name = "ly_do_that_bai", nullable = false)
    private String lyDoThatBai;

    @Column(name = "ngay_hen_giao_lai")
    private LocalDateTime ngayHenGiaoLai;

    @Column(name = "ghi_chu")
    private String ghiChu;

    public String getMaLichHen() { return maLichHen; }
    public void setMaLichHen(String maLichHen) { this.maLichHen = maLichHen; }
    public String getMaVanDon() { return maVanDon; }
    public void setMaVanDon(String maVanDon) { this.maVanDon = maVanDon; }
    public Integer getLanGiaoThu() { return lanGiaoThu; }
    public void setLanGiaoThu(Integer lanGiaoThu) { this.lanGiaoThu = lanGiaoThu; }
    public String getLyDoThatBai() { return lyDoThatBai; }
    public void setLyDoThatBai(String lyDoThatBai) { this.lyDoThatBai = lyDoThatBai; }
    public LocalDateTime getNgayHenGiaoLai() { return ngayHenGiaoLai; }
    public void setNgayHenGiaoLai(LocalDateTime ngayHenGiaoLai) { this.ngayHenGiaoLai = ngayHenGiaoLai; }
    public String getGhiChu() { return ghiChu; }
    public void setGhiChu(String ghiChu) { this.ghiChu = ghiChu; }
}

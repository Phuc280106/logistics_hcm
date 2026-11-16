package com.fastpost.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "chi_tiet_bang_gia")
@IdClass(ChiTietBangGiaId.class)
public class ChiTietBangGia {
    @Id
    @Column(name = "ma_bang_gia", length = 50)
    private String maBangGia;

    @Id
    @Column(name = "ma_vung_tuyen", length = 50)
    private String maVungTuyen;

    @Id
    @Column(name = "ma_goi_dich_vu", length = 50)
    private String maGoiDichVu;

    @Column(name = "cuoc_san", precision = 18, scale = 2, nullable = false)
    private BigDecimal cuocSan;

    @Column(name = "khoi_luong_san_kg", nullable = false)
    private Double khoiLuongSanKg;

    @Column(name = "don_gia_vuot_moi_kg", precision = 18, scale = 2, nullable = false)
    private BigDecimal donGiaVuotMoiKg;

    @Column(name = "phu_phi_de_vo", precision = 18, scale = 2, nullable = false)
    private BigDecimal phuPhiDeVo = BigDecimal.ZERO;

    @Column(name = "ty_le_phi_cod", nullable = false)
    private Double tyLePhiCod = 0.0;

    public String getMaBangGia() { return maBangGia; }
    public void setMaBangGia(String maBangGia) { this.maBangGia = maBangGia; }
    public String getMaVungTuyen() { return maVungTuyen; }
    public void setMaVungTuyen(String maVungTuyen) { this.maVungTuyen = maVungTuyen; }
    public String getMaGoiDichVu() { return maGoiDichVu; }
    public void setMaGoiDichVu(String maGoiDichVu) { this.maGoiDichVu = maGoiDichVu; }
    public BigDecimal getCuocSan() { return cuocSan; }
    public void setCuocSan(BigDecimal cuocSan) { this.cuocSan = cuocSan; }
    public Double getKhoiLuongSanKg() { return khoiLuongSanKg; }
    public void setKhoiLuongSanKg(Double khoiLuongSanKg) { this.khoiLuongSanKg = khoiLuongSanKg; }
    public BigDecimal getDonGiaVuotMoiKg() { return donGiaVuotMoiKg; }
    public void setDonGiaVuotMoiKg(BigDecimal donGiaVuotMoiKg) { this.donGiaVuotMoiKg = donGiaVuotMoiKg; }
    public BigDecimal getPhuPhiDeVo() { return phuPhiDeVo; }
    public void setPhuPhiDeVo(BigDecimal phuPhiDeVo) { this.phuPhiDeVo = phuPhiDeVo; }
    public Double getTyLePhiCod() { return tyLePhiCod; }
    public void setTyLePhiCod(Double tyLePhiCod) { this.tyLePhiCod = tyLePhiCod; }
}

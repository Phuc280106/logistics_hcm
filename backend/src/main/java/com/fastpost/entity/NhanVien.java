package com.fastpost.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "nhan_vien")
public class NhanVien {
    @Id
    @Column(name = "ma_nhan_vien", length = 50)
    private String maNhanVien;

    @Column(name = "ma_nguoi_dung", length = 50, nullable = false, unique = true)
    private String maNguoiDung;

    @Column(name = "ma_buu_cuc", length = 50, nullable = false)
    private String maBuuCuc;

    @Column(name = "loai_nhan_vien", length = 50, nullable = false)
    private String loaiNhanVien;

    @Column(name = "ngay_vao_lam", nullable = false)
    private LocalDateTime ngayVaoLam = LocalDateTime.now();

    public String getMaNhanVien() { return maNhanVien; }
    public void setMaNhanVien(String maNhanVien) { this.maNhanVien = maNhanVien; }
    public String getMaNguoiDung() { return maNguoiDung; }
    public void setMaNguoiDung(String maNguoiDung) { this.maNguoiDung = maNguoiDung; }
    public String getMaBuuCuc() { return maBuuCuc; }
    public void setMaBuuCuc(String maBuuCuc) { this.maBuuCuc = maBuuCuc; }
    public String getLoaiNhanVien() { return loaiNhanVien; }
    public void setLoaiNhanVien(String loaiNhanVien) { this.loaiNhanVien = loaiNhanVien; }
    public LocalDateTime getNgayVaoLam() { return ngayVaoLam; }
    public void setNgayVaoLam(LocalDateTime ngayVaoLam) { this.ngayVaoLam = ngayVaoLam; }
}

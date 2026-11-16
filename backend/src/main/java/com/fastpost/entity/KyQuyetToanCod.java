package com.fastpost.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ky_quyet_toan_cod")
public class KyQuyetToanCod {
    @Id
    @Column(name = "ma_ky", length = 50)
    private String maKy;

    @Column(name = "ma_quan_ly_lap", length = 50, nullable = false)
    private String maQuanLyLap;

    @Column(name = "loai_ky_thanh_toan", length = 50, nullable = false)
    private String loaiKyThanhToan;

    @Column(name = "tu_ngay", nullable = false)
    private LocalDateTime tuNgay;

    @Column(name = "den_ngay", nullable = false)
    private LocalDateTime denNgay;

    @Column(name = "trang_thai", length = 50, nullable = false)
    private String trangThai;

    public String getMaKy() { return maKy; }
    public void setMaKy(String maKy) { this.maKy = maKy; }
    public String getMaQuanLyLap() { return maQuanLyLap; }
    public void setMaQuanLyLap(String maQuanLyLap) { this.maQuanLyLap = maQuanLyLap; }
    public String getLoaiKyThanhToan() { return loaiKyThanhToan; }
    public void setLoaiKyThanhToan(String loaiKyThanhToan) { this.loaiKyThanhToan = loaiKyThanhToan; }
    public LocalDateTime getTuNgay() { return tuNgay; }
    public void setTuNgay(LocalDateTime tuNgay) { this.tuNgay = tuNgay; }
    public LocalDateTime getDenNgay() { return denNgay; }
    public void setDenNgay(LocalDateTime denNgay) { this.denNgay = denNgay; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}

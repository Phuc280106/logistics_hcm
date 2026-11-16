package com.fastpost.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bang_gia_cuoc")
public class BangGiaCuoc {
    @Id
    @Column(name = "ma_bang_gia", length = 50)
    private String maBangGia;

    @Column(name = "ten_bang_gia", length = 150, nullable = false)
    private String tenBangGia;

    @Column(name = "ngay_hieu_luc", nullable = false)
    private LocalDateTime ngayHieuLuc;

    @Column(name = "dang_kich_hoat", nullable = false)
    private Boolean dangKichHoat = true;

    @Column(name = "he_so_quy_doi_kich_thuoc", nullable = false)
    private Double heSoQuyDoiKichThuoc = 6000.0;

    public String getMaBangGia() { return maBangGia; }
    public void setMaBangGia(String maBangGia) { this.maBangGia = maBangGia; }
    public String getTenBangGia() { return tenBangGia; }
    public void setTenBangGia(String tenBangGia) { this.tenBangGia = tenBangGia; }
    public LocalDateTime getNgayHieuLuc() { return ngayHieuLuc; }
    public void setNgayHieuLuc(LocalDateTime ngayHieuLuc) { this.ngayHieuLuc = ngayHieuLuc; }
    public Boolean getDangKichHoat() { return dangKichHoat; }
    public void setDangKichHoat(Boolean dangKichHoat) { this.dangKichHoat = dangKichHoat; }
    public Double getHeSoQuyDoiKichThuoc() { return heSoQuyDoiKichThuoc; }
    public void setHeSoQuyDoiKichThuoc(Double heSoQuyDoiKichThuoc) { this.heSoQuyDoiKichThuoc = heSoQuyDoiKichThuoc; }
}

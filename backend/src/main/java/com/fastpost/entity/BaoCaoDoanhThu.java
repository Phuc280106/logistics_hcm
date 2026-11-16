package com.fastpost.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bao_cao_doanh_thu")
public class BaoCaoDoanhThu {
    @Id
    @Column(name = "ma_bao_cao", length = 50)
    private String maBaoCao;

    @Column(name = "ma_buu_cuc", length = 50, nullable = false)
    private String maBuuCuc;

    @Column(name = "tu_ngay", nullable = false)
    private LocalDateTime tuNgay;

    @Column(name = "den_ngay", nullable = false)
    private LocalDateTime denNgay;

    @Column(name = "doanh_thu_cuoc", precision = 18, scale = 2, nullable = false)
    private BigDecimal doanhThuCuoc = BigDecimal.ZERO;

    @Column(name = "tien_cod_trung_chuyen", precision = 18, scale = 2, nullable = false)
    private BigDecimal tienCodTrungChuyen = BigDecimal.ZERO;

    @Column(name = "tong_san_luong_don", nullable = false)
    private Integer tongSanLuongDon = 0;

    @Column(name = "ty_le_tien_mat", nullable = false)
    private Double tyLeTienMat = 0.0;

    @Column(name = "ty_le_viet_qr", nullable = false)
    private Double tyLeVietQr = 0.0;

    public String getMaBaoCao() { return maBaoCao; }
    public void setMaBaoCao(String maBaoCao) { this.maBaoCao = maBaoCao; }
    public String getMaBuuCuc() { return maBuuCuc; }
    public void setMaBuuCuc(String maBuuCuc) { this.maBuuCuc = maBuuCuc; }
    public LocalDateTime getTuNgay() { return tuNgay; }
    public void setTuNgay(LocalDateTime tuNgay) { this.tuNgay = tuNgay; }
    public LocalDateTime getDenNgay() { return denNgay; }
    public void setDenNgay(LocalDateTime denNgay) { this.denNgay = denNgay; }
    public BigDecimal getDoanhThuCuoc() { return doanhThuCuoc; }
    public void setDoanhThuCuoc(BigDecimal doanhThuCuoc) { this.doanhThuCuoc = doanhThuCuoc; }
    public BigDecimal getTienCodTrungChuyen() { return tienCodTrungChuyen; }
    public void setTienCodTrungChuyen(BigDecimal tienCodTrungChuyen) { this.tienCodTrungChuyen = tienCodTrungChuyen; }
    public Integer getTongSanLuongDon() { return tongSanLuongDon; }
    public void setTongSanLuongDon(Integer tongSanLuongDon) { this.tongSanLuongDon = tongSanLuongDon; }
    public Double getTyLeTienMat() { return tyLeTienMat; }
    public void setTyLeTienMat(Double tyLeTienMat) { this.tyLeTienMat = tyLeTienMat; }
    public Double getTyLeVietQr() { return tyLeVietQr; }
    public void setTyLeVietQr(Double tyLeVietQr) { this.tyLeVietQr = tyLeVietQr; }
}

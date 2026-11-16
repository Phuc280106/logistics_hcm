package com.fastpost.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "phieu_doi_soat_shipper")
public class PhieuDoiSoatShipper {
    @Id
    @Column(name = "ma_doi_soat", length = 50)
    private String maDoiSoat;

    @Column(name = "ma_shipper", length = 50, nullable = false)
    private String maShipper;

    @Column(name = "ma_nhan_vien_quay", length = 50, nullable = false)
    private String maNhanVienQuay;

    @Column(name = "ngay_doi_soat", nullable = false)
    private LocalDateTime ngayDoiSoat = LocalDateTime.now();

    @Column(name = "tong_don_thanh_cong", nullable = false)
    private Integer tongDonThanhCong = 0;

    @Column(name = "tong_tien_cod", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongTienCod = BigDecimal.ZERO;

    @Column(name = "tong_cuoc_mat", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongCuocMat = BigDecimal.ZERO;

    @Column(name = "tong_phai_nop", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongPhaiNop = BigDecimal.ZERO;

    @Column(name = "so_tien_thuc_nop", precision = 18, scale = 2, nullable = false)
    private BigDecimal soTienThucNop = BigDecimal.ZERO;

    @Column(name = "so_tien_thieu", precision = 18, scale = 2, nullable = false)
    private BigDecimal soTienThieu = BigDecimal.ZERO;

    @Column(name = "trang_thai", length = 50, nullable = false)
    private String trangThai;

    public String getMaDoiSoat() { return maDoiSoat; }
    public void setMaDoiSoat(String maDoiSoat) { this.maDoiSoat = maDoiSoat; }
    public String getMaShipper() { return maShipper; }
    public void setMaShipper(String maShipper) { this.maShipper = maShipper; }
    public String getMaNhanVienQuay() { return maNhanVienQuay; }
    public void setMaNhanVienQuay(String maNhanVienQuay) { this.maNhanVienQuay = maNhanVienQuay; }
    public LocalDateTime getNgayDoiSoat() { return ngayDoiSoat; }
    public void setNgayDoiSoat(LocalDateTime ngayDoiSoat) { this.ngayDoiSoat = ngayDoiSoat; }
    public Integer getTongDonThanhCong() { return tongDonThanhCong; }
    public void setTongDonThanhCong(Integer tongDonThanhCong) { this.tongDonThanhCong = tongDonThanhCong; }
    public BigDecimal getTongTienCod() { return tongTienCod; }
    public void setTongTienCod(BigDecimal tongTienCod) { this.tongTienCod = tongTienCod; }
    public BigDecimal getTongCuocMat() { return tongCuocMat; }
    public void setTongCuocMat(BigDecimal tongCuocMat) { this.tongCuocMat = tongCuocMat; }
    public BigDecimal getTongPhaiNop() { return tongPhaiNop; }
    public void setTongPhaiNop(BigDecimal tongPhaiNop) { this.tongPhaiNop = tongPhaiNop; }
    public BigDecimal getSoTienThucNop() { return soTienThucNop; }
    public void setSoTienThucNop(BigDecimal soTienThucNop) { this.soTienThucNop = soTienThucNop; }
    public BigDecimal getSoTienThieu() { return soTienThieu; }
    public void setSoTienThieu(BigDecimal soTienThieu) { this.soTienThieu = soTienThieu; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}

package com.fastpost.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "don_hang")
public class DonHang {
    @Id
    @Column(name = "ma_van_don", length = 50)
    private String maVanDon;

    @Column(name = "ma_khach_hang", length = 50, nullable = false)
    private String maKhachHang;

    @Column(name = "ma_buu_cuc_hien_tai", length = 50, nullable = false)
    private String maBuuCucHienTai;

    @Column(name = "ma_shipper", length = 50)
    private String maShipper;

    @Column(name = "ma_bang_gia", length = 50, nullable = false)
    private String maBangGia = "BG_2026";

    @Column(name = "ma_vung_tuyen", length = 50, nullable = false)
    private String maVungTuyen = "VT_NOITINH";

    @Column(name = "ma_goi_dich_vu", length = 50, nullable = false)
    private String maGoiDichVu = "GDV_TIEUCHUAN";

    @Column(name = "ma_loai_hang", length = 50, nullable = false)
    private String maLoaiHang = "LHH_THUONG";

    @Column(name = "nguoi_gui_sdt", length = 20, nullable = false)
    private String nguoiGuiSdt;

    @Column(name = "nguoi_nhan_ten", length = 150, nullable = false)
    private String nguoiNhanTen;

    @Column(name = "nguoi_nhan_sdt", length = 20, nullable = false)
    private String nguoiNhanSdt;

    @Column(name = "dia_chi_giao_chi_tiet", nullable = false)
    private String diaChiGiaoChiTiet;

    @Column(name = "phuong_xa_giao", length = 100, nullable = false)
    private String phuongXaGiao;

    @Column(name = "quan_huyen_giao", length = 100, nullable = false)
    private String quanHuyenGiao;

    @Column(name = "trong_luong_thuc", nullable = false)
    private Double trongLuongThuc;

    @Column(name = "chieu_dai", nullable = false)
    private Double chieuDai = 0.0;

    @Column(name = "chieu_rong", nullable = false)
    private Double chieuRong = 0.0;

    @Column(name = "chieu_cao", nullable = false)
    private Double chieuCao = 0.0;

    @Column(name = "trong_luong_tinh_cuoc", nullable = false)
    private Double trongLuongTinhCuoc;

    @Column(name = "la_hang_de_vo", nullable = false)
    private Boolean laHangDeVo = false;

    @Column(name = "la_hang_cong_kenh", nullable = false)
    private Boolean laHangCongKenh = false;

    @Column(name = "tien_cod", precision = 18, scale = 2, nullable = false)
    private BigDecimal tienCod = BigDecimal.ZERO;

    @Column(name = "nguoi_tra_cuoc", length = 50, nullable = false)
    private String nguoiTraCuoc = "NguoiGui";

    @Column(name = "hinh_thuc_thanh_toan", length = 50, nullable = false)
    private String hinhThucThanhToan = "TienMat";

    @Column(name = "cuoc_san", precision = 18, scale = 2, nullable = false)
    private BigDecimal cuocSan = BigDecimal.ZERO;

    @Column(name = "cuoc_vuot_can", precision = 18, scale = 2, nullable = false)
    private BigDecimal cuocVuotCan = BigDecimal.ZERO;

    @Column(name = "phu_phi", precision = 18, scale = 2, nullable = false)
    private BigDecimal phuPhi = BigDecimal.ZERO;

    @Column(name = "phi_cod", precision = 18, scale = 2, nullable = false)
    private BigDecimal phiCod = BigDecimal.ZERO;

    @Column(name = "tong_cuoc", precision = 18, scale = 2, nullable = false)
    private BigDecimal tongCuoc = BigDecimal.ZERO;

    @Column(name = "trang_thai", length = 50, nullable = false)
    private String trangThai;

    @Column(name = "so_lan_giao_that_bai", nullable = false)
    private Integer soLanGiaoThatBai = 0;

    @Column(name = "ngay_tao", nullable = false)
    private LocalDateTime ngayTao = LocalDateTime.now();

    public String getMaVanDon() { return maVanDon; }
    public void setMaVanDon(String maVanDon) { this.maVanDon = maVanDon; }
    public String getMaKhachHang() { return maKhachHang; }
    public void setMaKhachHang(String maKhachHang) { this.maKhachHang = maKhachHang; }
    public String getMaBuuCucHienTai() { return maBuuCucHienTai; }
    public void setMaBuuCucHienTai(String maBuuCucHienTai) { this.maBuuCucHienTai = maBuuCucHienTai; }
    public String getMaShipper() { return maShipper; }
    public void setMaShipper(String maShipper) { this.maShipper = maShipper; }
    public String getMaBangGia() { return maBangGia; }
    public void setMaBangGia(String maBangGia) { this.maBangGia = maBangGia; }
    public String getMaVungTuyen() { return maVungTuyen; }
    public void setMaVungTuyen(String maVungTuyen) { this.maVungTuyen = maVungTuyen; }
    public String getMaGoiDichVu() { return maGoiDichVu; }
    public void setMaGoiDichVu(String maGoiDichVu) { this.maGoiDichVu = maGoiDichVu; }
    public String getMaLoaiHang() { return maLoaiHang; }
    public void setMaLoaiHang(String maLoaiHang) { this.maLoaiHang = maLoaiHang; }
    public String getNguoiGuiSdt() { return nguoiGuiSdt; }
    public void setNguoiGuiSdt(String nguoiGuiSdt) { this.nguoiGuiSdt = nguoiGuiSdt; }
    public String getNguoiNhanTen() { return nguoiNhanTen; }
    public void setNguoiNhanTen(String nguoiNhanTen) { this.nguoiNhanTen = nguoiNhanTen; }
    public String getNguoiNhanSdt() { return nguoiNhanSdt; }
    public void setNguoiNhanSdt(String nguoiNhanSdt) { this.nguoiNhanSdt = nguoiNhanSdt; }
    public String getDiaChiGiaoChiTiet() { return diaChiGiaoChiTiet; }
    public void setDiaChiGiaoChiTiet(String diaChiGiaoChiTiet) { this.diaChiGiaoChiTiet = diaChiGiaoChiTiet; }
    public String getPhuongXaGiao() { return phuongXaGiao; }
    public void setPhuongXaGiao(String phuongXaGiao) { this.phuongXaGiao = phuongXaGiao; }
    public String getQuanHuyenGiao() { return quanHuyenGiao; }
    public void setQuanHuyenGiao(String quanHuyenGiao) { this.quanHuyenGiao = quanHuyenGiao; }
    public Double getTrongLuongThuc() { return trongLuongThuc; }
    public void setTrongLuongThuc(Double trongLuongThuc) { this.trongLuongThuc = trongLuongThuc; }
    public Double getChieuDai() { return chieuDai; }
    public void setChieuDai(Double chieuDai) { this.chieuDai = chieuDai; }
    public Double getChieuRong() { return chieuRong; }
    public void setChieuRong(Double chieuRong) { this.chieuRong = chieuRong; }
    public Double getChieuCao() { return chieuCao; }
    public void setChieuCao(Double chieuCao) { this.chieuCao = chieuCao; }
    public Double getTrongLuongTinhCuoc() { return trongLuongTinhCuoc; }
    public void setTrongLuongTinhCuoc(Double trongLuongTinhCuoc) { this.trongLuongTinhCuoc = trongLuongTinhCuoc; }
    public Boolean getLaHangDeVo() { return laHangDeVo; }
    public void setLaHangDeVo(Boolean laHangDeVo) { this.laHangDeVo = laHangDeVo; }
    public Boolean getLaHangCongKenh() { return laHangCongKenh; }
    public void setLaHangCongKenh(Boolean laHangCongKenh) { this.laHangCongKenh = laHangCongKenh; }
    public BigDecimal getTienCod() { return tienCod; }
    public void setTienCod(BigDecimal tienCod) { this.tienCod = tienCod; }
    public String getNguoiTraCuoc() { return nguoiTraCuoc; }
    public void setNguoiTraCuoc(String nguoiTraCuoc) { this.nguoiTraCuoc = nguoiTraCuoc; }
    public String getHinhThucThanhToan() { return hinhThucThanhToan; }
    public void setHinhThucThanhToan(String hinhThucThanhToan) { this.hinhThucThanhToan = hinhThucThanhToan; }
    public BigDecimal getCuocSan() { return cuocSan; }
    public void setCuocSan(BigDecimal cuocSan) { this.cuocSan = cuocSan; }
    public BigDecimal getCuocVuotCan() { return cuocVuotCan; }
    public void setCuocVuotCan(BigDecimal cuocVuotCan) { this.cuocVuotCan = cuocVuotCan; }
    public BigDecimal getPhuPhi() { return phuPhi; }
    public void setPhuPhi(BigDecimal phuPhi) { this.phuPhi = phuPhi; }
    public BigDecimal getPhiCod() { return phiCod; }
    public void setPhiCod(BigDecimal phiCod) { this.phiCod = phiCod; }
    public BigDecimal getTongCuoc() { return tongCuoc; }
    public void setTongCuoc(BigDecimal tongCuoc) { this.tongCuoc = tongCuoc; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public Integer getSoLanGiaoThatBai() { return soLanGiaoThatBai; }
    public void setSoLanGiaoThatBai(Integer soLanGiaoThatBai) { this.soLanGiaoThatBai = soLanGiaoThatBai; }
    public LocalDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; }
}

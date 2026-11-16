package com.fastpost.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "danh_gia_kpi")
public class DanhGiaKpi {
    @Id
    @Column(name = "ma_kpi", length = 50)
    private String maKpi;

    @Column(name = "ma_shipper", length = 50, nullable = false)
    private String maShipper;

    @Column(name = "ky_danh_gia", length = 50, nullable = false)
    private String kyDanhGia;

    @Column(name = "ty_le_giao_thanh_cong", nullable = false)
    private Double tyLeGiaoThanhCong = 0.0;

    @Column(name = "ty_le_dung_hen_sla", nullable = false)
    private Double tyLeDungHenSla = 0.0;

    @Column(name = "san_luong_don_binh_quan", nullable = false)
    private Integer sanLuongDonBinhQuan = 0;

    @Column(name = "diem_tong_ket", nullable = false)
    private Double diemTongKet = 0.0;

    @Column(name = "xep_loai", length = 50, nullable = false)
    private String xepLoai;

    public String getMaKpi() { return maKpi; }
    public void setMaKpi(String maKpi) { this.maKpi = maKpi; }
    public String getMaShipper() { return maShipper; }
    public void setMaShipper(String maShipper) { this.maShipper = maShipper; }
    public String getKyDanhGia() { return kyDanhGia; }
    public void setKyDanhGia(String kyDanhGia) { this.kyDanhGia = kyDanhGia; }
    public Double getTyLeGiaoThanhCong() { return tyLeGiaoThanhCong; }
    public void setTyLeGiaoThanhCong(Double tyLeGiaoThanhCong) { this.tyLeGiaoThanhCong = tyLeGiaoThanhCong; }
    public Double getTyLeDungHenSla() { return tyLeDungHenSla; }
    public void setTyLeDungHenSla(Double tyLeDungHenSla) { this.tyLeDungHenSla = tyLeDungHenSla; }
    public Integer getSanLuongDonBinhQuan() { return sanLuongDonBinhQuan; }
    public void setSanLuongDonBinhQuan(Integer sanLuongDonBinhQuan) { this.sanLuongDonBinhQuan = sanLuongDonBinhQuan; }
    public Double getDiemTongKet() { return diemTongKet; }
    public void setDiemTongKet(Double diemTongKet) { this.diemTongKet = diemTongKet; }
    public String getXepLoai() { return xepLoai; }
    public void setXepLoai(String xepLoai) { this.xepLoai = xepLoai; }
}

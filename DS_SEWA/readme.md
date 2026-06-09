# Modul 1: Dashboard Peminjaman iPhone (DS_SEWA)

## Gambaran Umum
Modul ini mengelola siklus penuh peminjaman unit iPhone: dari pencatatan unit masuk, transaksi pinjam, monitoring masa pinjam, sistem peringatan pengembalian otomatis, hingga penutupan transaksi.

---

## Fitur Utama

### M1-01 · Manajemen Unit iPhone
- **Tujuan:** Inventaris semua unit iPhone yang tersedia untuk dipinjam.
- **Model Data:**
  - `id_unit`, `nama_model`, `imei`, `kapasitas`, `warna`, `kondisi_awal`, `kondisi_sekarang`, `foto_unit` (min. 4 foto), `nilai_unit` (untuk deposit), `harga_sewa_per_hari`, `status` (`TERSEDIA`/`DIPINJAM`/`MAINTENANCE`/`HILANG`), `catatan`, `tanggal_masuk`.
- **Tampilan:** Grid/list unit dengan filter status, badge warna (hijau/kuning/merah), detail spesifikasi + galeri foto + history pinjam.

### M1-02 · Transaksi Peminjaman
- **Model Data:**
  - `kode_pinjam` (PJM-YYYYMMDD-XXXX), `id_customer`, `id_unit`, `tanggal_pinjam`, `tanggal_kembali_rencana`, `tanggal_kembali_aktual`, `durasi_hari`, `biaya_sewa`, `nominal_deposit`, `deposit_dikembalikan` (Boolean), `denda_per_hari`, `total_denda`, `total_tagihan`, `status_bayar` (`BELUM`/`DP`/`LUNAS`), `status_transaksi` (`AKTIF`/`SELESAI`/`DIBATALKAN`), `kondisi_saat_kembali`.
- **Alur Proses:**
  1. Input Transaksi Baru (Pilih customer + unit TERSEDIA -> set tanggal -> hitung biaya & deposit).
  2. Unit Diserahkan (Foto serah terima -> status DIPINJAM -> countdown timer mulai -> catat mutasi masuk).
  3. Pengembalian Unit (Cek kondisi -> hitung denda jika terlambat -> refund deposit jika oke -> status TERSEDIA/MAINTENANCE -> transaksi SELESAI -> catat mutasi keluar).

### M1-03 · Sistem Peringatan Pengembalian ⚠️
- **Konfigurasi Notifikasi:**
  - **H-3**: WhatsApp/SMS pengingat ramah ke customer.
  - **H-1**: WhatsApp/SMS reminder tegas + banner kuning di dashboard.
  - **Hari-H (08:00)**: WhatsApp/SMS final + alert merah di dashboard.
  - **Terlambat (H+1 dst)**: Auto-hitung denda harian + eskalasi ke admin.
- **Tampilan Widget:** Countdown timer sisa hari & jam per transaksi aktif dengan badge warna indikator.

### M1-04 · Laporan & KPI Peminjaman
- **KPI Cards:** Total Unit, Unit Dipinjam, Unit Tersedia, Unit Maintenance, Pendapatan Bulan Ini, Deposit Outstanding, Jatuh Tempo Hari Ini, Terlambat.
- **Laporan:** Transaksi per periode, unit terpopuler, customer teraktif, export Excel/PDF.

---

## Modul Bersama (Shared Modules)
Semua transaksi keuangan dari modul sewa wajib tercatat secara terpusat pada **SM-01 · Mutasi Keuangan Terpusat** (kategori: *Deposit Pinjam*, *Biaya Sewa*, *Denda*, *Refund Deposit*). Data pelanggan terintegrasi pada **SM-02 · Customer Database**.

# Modul 3: Dashboard Jual Beli iPhone (DS_STORE)

## Gambaran Umum
Modul ini mengelola transaksi pembelian iPhone dari customer/supplier (stok masuk) dan penjualan iPhone ke customer (stok keluar), beserta manajemen inventaris, harga, dan laporan keuangan.

---

## Fitur Utama

### M3-01 · Manajemen Inventaris / Stok
- **Model Data:**
  - `kode_stok` (STK-XXXX), `model`, `imei`, `kapasitas`, `warna`, `kondisi` (`BARU`/`LIKE NEW`/`SECOND`), `grade` (`A`/`B`/`C` untuk second), `harga_beli`, `harga_jual`, `sumber` (`BELI_DARI_CUSTOMER`/`SUPPLIER`/`DARI_PEMINJAMAN`), `foto`, `kelengkapan` (charger, box, dll), `status` (`TERSEDIA`/`TERJUAL`/`RESERVED`), `catatan`, `tanggal_masuk`.
- **Fitur:** Filter stok terperinci, detail unit + kalkulasi margin keuntungan, pengaturan harga jual, dan opsi penandaan status "Reserved".

### M3-02 · Transaksi Pembelian (Stok Masuk)
- **Tujuan:** Mencatat iPhone yang dibeli dari customer (perorangan) atau supplier resmi.
- **Model Data:**
  - `kode_beli` (BLI-YYYYMMDD-XXXX), `tipe_sumber` (`CUSTOMER`/`SUPPLIER`), `id_customer` (jika perorangan), `nama_supplier` (jika supplier), `daftar_unit` (list unit), `total_harga_beli`, `metode_bayar`, `tanggal_beli`, `dicatat_oleh`.
- **Alur:** Input transaksi -> isi spesifikasi unit -> simpan & bayar -> status stok otomatis `TERSEDIA` -> catat mutasi pengeluaran.

### M3-03 · Transaksi Penjualan (Stok Keluar)
- **Tujuan:** Mencatat iPhone yang berhasil terjual ke customer.
- **Model Data:**
  - `kode_jual` (JUL-YYYYMMDD-XXXX), `id_customer`, `daftar_unit`, `harga_jual_final` (mendukung hasil negosiasi), `diskon`, `total_bayar`, `metode_bayar`, `dp` (uang muka), `sisa_bayar`, `status_bayar` (`BELUM`/`DP`/`LUNAS`), `tanggal_jual`, `dicatat_oleh`.
- **Alur:** Pilih unit `TERSEDIA` -> pilih/daftarkan customer -> set harga final -> simpan transaksi -> status stok berubah menjadi `TERJUAL` -> print nota (opsional) -> catat mutasi pemasukan.

### M3-04 · Laporan & KPI Jual Beli
- **KPI Cards:** Total Stok, Stok Tersedia, Unit Terjual Bulan Ini, Pendapatan Bulan Ini, Modal Tertanam, Keuntungan Bulan Ini, Piutang (Belum Lunas).
- **Laporan:** Nilai modal stok aktif, histori penjualan, detail margin keuntungan, customer teraktif, model terlaris.

---

## Modul Bersama (Shared Modules)
Semua transaksi keuangan dari modul toko wajib tercatat secara terpusat pada **SM-01 · Mutasi Keuangan Terpusat** (kategori: *Beli iPhone*, *Jual iPhone*). Data pelanggan terintegrasi pada **SM-02 · Customer Database**.

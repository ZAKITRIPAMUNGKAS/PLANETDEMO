# Modul 2: Dashboard Service iPhone (DS_SERVICE)

## Gambaran Umum
Modul ini mengelola antrian servis, tracking progres tiap tiket oleh teknisi, estimasi biaya, dan pengiriman link tracking otomatis ke customer agar bisa memantau progress perbaikan secara mandiri.

---

## Fitur Utama

### M2-01 · Manajemen Tiket Servis
- **Model Data:**
  - `kode_tiket` (SRV-YYYYMMDD-XXXX), `id_customer`, `model_iphone`, `imei` (opsional), `keluhan`, `kondisi_fisik`, `foto_masuk`, `id_teknisi`, `prioritas` (`NORMAL`/`EXPRESS`), `estimasi_selesai`, `estimasi_biaya`, `biaya_final`, `status_acc_customer` (`MENUNGGU`/`ACC`/`TOLAK`), `status_tiket`, `tracking_token` (UUID).
- **Status Tiket (Alur Tahapan):**
  1. `DITERIMA` -> Unit masuk, data dicatat, foto diambil.
  2. `DIAGNOSA` -> Teknisi cek masalah, tulis estimasi biaya.
  3. `MENUNGGU_ACC` -> Estimasi dikirim ke customer via WA + link tracking.
  4. `MENUNGGU_PART` -> Customer ACC, part dipesan (jika perlu).
  5. `PROSES` -> Teknisi sedang mengerjakan perbaikan.
  6. `QC_TESTING` -> Cek hasil perbaikan, pastikan normal.
  7. `SELESAI` -> Unit siap diambil, notif dikirim ke customer.
  8. `DIAMBIL` -> Customer ambil unit, pembayaran lunas, transaksi tutup.
  9. `DIBATALKAN` -> Customer tolak estimasi/batal di tengah jalan.

### M2-02 · Progres Tahapan Servis
- **Tujuan:** Mencatat log detail perpindahan status beserta timestamp dan catatan teknisi.
- **Model Data:** `id_tiket`, `status_sebelum`, `status_sesudah`, `catatan_teknisi`, `foto_progres` (opsional), `diubah_oleh`, `timestamp`.
- **Tampilan:** Timeline vertikal progres per tiket servis.

### M2-03 · Link Tracking Otomatis untuk Customer 🔗
- **Cara Kerja:** Sistem secara otomatis membuat URL tracking publik (contoh: `domain.com/track/{token}`) saat tiket dibuat. Setiap perubahan status akan memicu pengiriman pesan WhatsApp otomatis ke customer berisi status terbaru dan link tersebut.
- **Halaman Publik:** Halaman web sederhana tanpa login untuk menampilkan status saat ini dan timeline progres servis unit.

### M2-04 · Manajemen Sparepart
- **Model Data:** `nama_part`, `kompatibel_dengan` (list model iPhone), `harga_beli`, `harga_jual`, `stok`, `stok_minimum`, `supplier`.
- **Fitur:** Alert stok menipis (jika ≤ stok_minimum), pencatatan pemakaian part per tiket servis, auto-pengurangan stok.

### M2-05 · Keuangan & Laporan Service
- **KPI Cards:** Total Tiket Aktif, Menunggu ACC, Selesai Hari Ini, Pendapatan Hari Ini, Pendapatan Bulan Ini, Stok Part Menipis.
- **Laporan:** Produktivitas per teknisi, pendapatan servis, penggunaan sparepart, customer teraktif.

---

## Modul Bersama (Shared Modules)
Semua transaksi keuangan dari modul servis wajib tercatat secara terpusat pada **SM-01 · Mutasi Keuangan Terpusat** (kategori: *Jasa Service*, *Penjualan Part*, *Beli Part*). Data pelanggan terintegrasi pada **SM-02 · Customer Database**.

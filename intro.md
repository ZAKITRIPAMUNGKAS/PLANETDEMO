<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# hai perplex

buat kamu seolah partner kerjaku
aku sebagai web developer
dan kamu jadi asistenku
nah aku baru masuk pesanana 3 dashboard website
yaitu dashboard buat peminjaman iphone, dashboard service iphone, dan dashboard jual beli iphone
coba kamu cari referensinya dulu
untuk sedikit detailnya
semua harus ada mutasi keuangan
untuk yang service nanti ada output otomatis kirim link buat data tracking udah sampai proses apa ke customer
buat peminjaman ada peringatan pengembalian

Siap! Sekarang aku akan langsung build ketiga dashboard ini jadi satu sistem terintegrasi yang keren.
<span style="display:none">[^1_1][^1_10][^1_11][^1_12][^1_13][^1_14][^1_15][^1_2][^1_3][^1_4][^1_5][^1_6][^1_7][^1_8][^1_9]</span>

<div align="center">⁂</div>

[^1_1]: https://www.instagram.com/reel/DTXClGQjH4B/

[^1_2]: https://dribbble.com/shots/24274936-Car-renting-dashboard-ui-design

[^1_3]: https://www.tiktok.com/@janm_ux/video/7413736454855118113

[^1_4]: https://www.mockplus.com/blog/post/dashboard-design-best-practices-examples

[^1_5]: https://apps.apple.com/in/app/my-rental-home/id6475304720

[^1_6]: https://globalticketsystem.com/iphone-repair-ticket-system/

[^1_7]: https://www.magnific.com/free-photos-vectors/iphone-dashboard-template

[^1_8]: https://muz.li/inspiration/dashboard-inspiration/

[^1_9]: https://bugsnag.com

[^1_10]: https://dribbble.com/tags/mobile-dashboard

[^1_11]: https://www.behance.net/gallery/220788601/Car-Rental-Dashboard

[^1_12]: https://www.repairdesk.co

[^1_13]: https://www.figma.com/templates/dashboard-designs/

[^1_14]: https://clockify.me

[^1_15]: https://wrappixel.com/admin-dashboard-templates


---

# Analisis Sistem Dashboard iPhone — Peminjaman, Service \& Jual Beli

**Dokumen Analisis Kebutuhan Sistem**
Proyek: Triple Dashboard iPhone Management System
Dibuat: 27 Mei 2026

***

## 1. Ringkasan Eksekutif

Sistem ini terdiri dari tiga modul dashboard yang saling terintegrasi namun berdiri sendiri secara fungsi:

1. **Dashboard Peminjaman iPhone** — Kelola unit yang dipinjam, jadwal pengembalian, dan deposit
2. **Dashboard Service iPhone** — Kelola antrian servis, tracking progres, dan notifikasi customer
3. **Dashboard Jual Beli iPhone** — Kelola stok, transaksi beli/jual, dan laporan keuangan

Ketiganya berbagi sistem **mutasi keuangan terpusat** dan menggunakan desain visual yang konsisten.

***

## 2. Arsitektur Sistem

### 2.1 Struktur Navigasi Global

```
App Shell
├── Sidebar Navigation
│   ├── Overview (Summary 3 modul)
│   ├── 📦 Peminjaman
│   ├── 🔧 Service
│   └── 💰 Jual Beli
├── Top Bar
│   ├── Notifikasi (badge count)
│   ├── Search global
│   └── User menu
└── Main Content Area
```


### 2.2 Shared Modules (Digunakan di 3 Dashboard)

| Modul Bersama | Fungsi | Dipakai oleh |
| :-- | :-- | :-- |
| Mutasi Keuangan | Catat semua pemasukan \& pengeluaran | Semua modul |
| Notifikasi System | Alert, reminder, broadcast | Peminjaman, Service |
| Customer Database | Data pelanggan terpusat | Semua modul |
| Unit/Stok Tracker | Monitoring unit iPhone | Peminjaman, Jual Beli |


***

## 3. Analisis Per Modul


***

### 3.1 Dashboard Peminjaman iPhone

#### Tujuan Utama

Memantau unit iPhone yang sedang dipinjam, mengontrol jadwal pengembalian, dan mencegah keterlambatan via sistem peringatan otomatis.

#### Entitas Data

| Entitas | Field Utama |
| :-- | :-- |
| Unit iPhone | ID unit, model, IMEI, kondisi, status (tersedia/dipinjam) |
| Transaksi Pinjam | ID transaksi, customer, unit, tgl pinjam, tgl kembali, deposit, biaya sewa |
| Customer | Nama, KTP, no HP, alamat, riwayat pinjam |
| Peringatan | Tipe (H-3, H-1, H+0, Terlambat), status kirim, channel |

#### Fitur Utama

**A. Manajemen Unit**

- Daftar semua unit iPhone + status real-time (tersedia, dipinjam, maintenance)
- Detail tiap unit: spesifikasi, kondisi sebelum/sesudah, foto dokumentasi
- History penggunaan per unit

**B. Transaksi Peminjaman**

- Form input pinjam: pilih customer, pilih unit, set durasi, hitung biaya otomatis
- Kalkulasi deposit otomatis berdasarkan model iPhone
- Print/export surat perjanjian peminjaman (PDF)

**C. Sistem Peringatan Pengembalian** ⚠️ *(Fitur Kritis)*

- **H-3 hari**: Notifikasi pertama via WhatsApp/SMS ke customer
- **H-1 hari**: Notifikasi reminder kedua + tampil banner di dashboard
- **Hari-H**: Alert merah di dashboard, trigger notif terakhir
- **Terlambat (H+1, H+2, dst)**: Auto-eskalasi ke admin, hitung denda per hari
- Dashboard menampilkan countdown timer untuk setiap unit yang dipinjam

**D. Mutasi Keuangan Peminjaman**

- Catat: Penerimaan deposit, biaya sewa, denda keterlambatan
- Catat: Pengembalian deposit saat unit kembali
- Laporan: Pendapatan sewa per periode, deposit outstanding


#### KPI Cards yang Diperlukan

- Total Unit | Unit Dipinjam | Unit Tersedia | Unit Maintenance
- Pendapatan Bulan Ini | Deposit Outstanding | Total Denda Aktif
- Peminjaman Jatuh Tempo Hari Ini (highlight merah jika > 0)


#### Flow Utama

```
Buat Transaksi → Pilih Unit + Customer → Set Durasi → Konfirmasi Deposit
→ Unit Status: "Dipinjam" → Sistem mulai countdown
→ H-3: Auto notif → H-1: Reminder → H+0: Alert
→ Customer kembali unit → Cek kondisi → Kembalikan deposit (jika oke)
→ Tutup transaksi → Catat ke mutasi keuangan
```


***

### 3.2 Dashboard Service iPhone

#### Tujuan Utama

Mengelola antrian perbaikan iPhone, melacak progres setiap pekerjaan secara real-time, dan mengirimkan link tracking otomatis kepada customer.

#### Entitas Data

| Entitas | Field Utama |
| :-- | :-- |
| Tiket Servis | ID tiket, customer, model iPhone, keluhan, teknisi, status, estimasi selesai |
| Progres Tahapan | ID tahap, nama tahap, timestamp mulai, timestamp selesai, catatan teknisi |
| Sparepart | ID part, nama, harga beli, harga jual, stok |
| Biaya Servis | Biaya jasa, biaya part, total, status pembayaran |
| Tracking Link | Token unik per tiket, URL publik, log akses customer |

#### Alur Tahapan Servis (Status Progres)

```
[1] Diterima         → Unit masuk, dicatat keluhan & kondisi awal
[2] Diagnosa         → Teknisi cek masalah, estimasi biaya dibuat
[3] Menunggu ACC     → Kirim estimasi ke customer, tunggu persetujuan
[4] Menunggu Part    → Part dipesan (jika perlu)
[5] Proses Perbaikan → Teknisi sedang mengerjakan
[6] QC / Testing     → Cek hasil perbaikan
[7] Selesai          → Unit siap diambil
[8]```


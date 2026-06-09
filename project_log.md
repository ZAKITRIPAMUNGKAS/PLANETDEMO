# Project Log & Guidelines — Triple Dashboard iPhone

File ini berfungsi sebagai acuan utama, catatan perubahan (changelog), dan dokumentasi error/bug untuk memastikan kualitas pengembangan tetap konsisten, elegan, dan premium.

> [!IMPORTANT]  
> **ATURAN WAJIB BAGI AI (ANTIGRAVITY):**  
> Sebelum memproses instruksi atau menulis kode baru pada prompt berikutnya, kamu **wajib membaca file ini** (`project_log.md`) untuk memahami status proyek saat ini, aturan desain, dan riwayat error agar tidak mengulangi kesalahan yang sama.

---

## 1. Aturan Dasar Pengembangan

1. **Struktur Modul Terpisah**:
   - Setiap dashboard (`DS_SEWA`, `DS_SERVICE`, `DS_STORE`) bersifat **independen dan terpisah**. Jangan mencampur kode antar dashboard kecuali ditentukan lain.
2. **Perbedaan APP dan DEMO**:
   - **DEMO**: Fokus hanya pada tampilan visual (HTML & CSS murni + micro-interaction JS sederhana). Berfungsi untuk persetujuan klien dan penyesuaian UI/UX.
   - **APP**: Wadah utuh sistem jadi (yang nantinya akan didiskusikan framework-nya setelah tahap DEMO selesai).
3. **Kualitas Desain & UX (Elegant & Premium)**:
   - Tampilan harus *clean*, elegan, modern, dan sangat mudah digunakan (user-friendly) karena akan digunakan oleh banyak pengguna.
   - Gunakan tipografi modern (seperti Inter atau Outfit via Google Fonts).
   - Gunakan palet warna premium (bukan warna dasar/primer murni). Contoh: warna gelap elegan (slate/neutral-900), accent warna khas Apple (seperti deep space gray, subtle gold, royal blue, emerald green lembut).
   - Tambahkan animasi mikro (hover effect, smooth transitions) agar terasa responsif dan hidup.

---

## 2. Status Proyek Saat Ini

- **Modul Peminjaman (`DS_SEWA`)**:
  - `DEMO/index.html`: Selesai (Tema Brutalist Hitam-Putih-Biru, Kalkulator Sewa/Deposit, Auto-Denda, Struk Kasir)
  - `APP/index.html`: Belum dimulai (Kosong)
- **Modul Service (`DS_SERVICE`)**:
  - `DEMO/index.html`: Selesai (Interaktif & Responsif — Termasuk Fitur Kunci Layar Pattern & Dokumentasi Foto)
  - `DEMO/tracking.html`: Selesai (Interaktif & Responsif)
  - `APP/index.html`: Belum dimulai (Kosong)
- **Modul Jual Beli (`DS_STORE`)**:
  - `DEMO/index.html`: Selesai (Tema Brutalist Hitam-Putih-Biru, Inventaris Margin Untung, Beli Stok Masuk, Jual Stok Keluar, Laporan/KPI)
  - `APP/index.html`: Belum dimulai (Kosong)

---

## 3. Catatan Perubahan (Changelog)

Semua perubahan yang dilakukan pada berkas kode harus dicatat di sini secara kronologis.

| Tanggal | Fitur / Perubahan | Lokasi File | Deskripsi |
| :--- | :--- | :--- | :--- |
| 2026-05-27 | Inisialisasi Project Log | `/project_log.md` | Membuat file panduan dasar dan catatan log awal proyek. |
| 2026-05-27 | Pembuatan README Modul | `/DS_SEWA/readme.md`, `/DS_SERVICE/readme.md`, `/DS_STORE/readme.md` | Menulis spesifikasi detail dan identitas untuk masing-masing modul dashboard. |
| 2026-05-27 | Pembuatan Modul DEMO Servis | `/DS_SERVICE/DEMO/` | Membuat seluruh komponen UI & logika data untuk DEMO DS_SERVICE (HTML, CSS, JS, database mock). |
| 2026-05-27 | Update Palet & Logo | `/DS_SERVICE/DEMO/` | Mengintegrasikan Logo dari BRANDING_KIT dan memperbarui palet warna (Hitam, Ungu Astronaut, Orange Saturn). |
| 2026-05-27 | Redesain Premium & Hapus Emoji | `/DS_SERVICE/DEMO/` | Memoles UI dengan custom scrollbars, glassmorphism, background radial-gradients, dan mengganti emoji murahan dengan ikon line-SVG profesional agar tampilan terlihat buatan desainer manusia, bukan template AI generik. |
| 2026-05-27 | Perluasan Fitur Lengkap Modul | `/DS_SERVICE/DEMO/` | Menambahkan Halaman Login (`login.html`), Panel Manajemen Teknisi, dan Ledger Mutasi Keuangan Otomatis/Manual (SM-01). |
| 2026-05-27 | Redesain Clean Light Theme | `/DS_SERVICE/DEMO/` | Mengubah seluruh tema warna sistem menjadi dominan putih/terang yang premium, minimalis, dan ber-kontras tinggi demi keterbacaan yang lebih baik. |
| 2026-05-27 | Integrasi Navigasi Sidebar | `/DS_SERVICE/DEMO/` | Memindahkan tab menu switch sections (Antrian, Sparepart, Teknisi, Mutasi) langsung ke menu navigasi sidebar agar UI lebih clean dan navigasi lebih intuitif. |
| 2026-05-27 | Proteksi Akses & Perbaikan Usability | `/DS_SERVICE/DEMO/` | Membatasi akses peran TEKNISI (menyembunyikan tombol Buat Tiket & Tambah Teknisi) dan merapatkan padding tabel agar kolom berbaris rapi tanpa overflow. |
| 2026-05-27 | Perbaikan Layout Topbar Actions | `/DS_SERVICE/DEMO/` | Menambahkan pembungkus flexbox dengan gap horizontal 12px pada aksi header topbar agar elemen-elemen tombol berjejer lurus dan presisi. |
| 2026-05-27 | Resolusi SyntaxError & Dekorasi Sidebar | `/DS_SERVICE/DEMO/` | Mengatasi Uncaught SyntaxError (btnOpenCreate dideklarasikan ulang) di admin.js, mengaktifkan klik sidebar switcher, serta menghapus garis bawah (underline) link sidebar. |
| 2026-05-27 | Perbaikan Render Kolom Teknisi | `/DS_SERVICE/DEMO/` | Menghapus kotak pembungkus (border box) ber-padding sempit pada nama teknisi di tabel antrian guna mencegah nama terpotong (word wrap / clipped). |
| 2026-05-27 | Perbaikan Akses Scroll Modal Form | `/DS_SERVICE/DEMO/` | Mengaktifkan scrolling vertikal pada overlay modal (`overflow-y: auto`) dan menata elemen `<form>` agar konten form isian tiket baru bisa digulir dengan sempurna di layar kecil. |
| 2026-05-27 | Perapian Styling Tombol Batal/Tutup | `/DS_SERVICE/DEMO/` | Menyesuaikan selector `.modal-close` dengan `:not(.btn)` agar tombol batal dan tutup di footer modal tidak mewarisi properti ikon close (tanpa border, tanpa padding, & ukuran font terlalu besar). |
| 2026-05-27 | Fitur Unggah Foto & Track Record Teknisi | `/DS_SERVICE/DEMO/` | Menambahkan input unggah foto profil (FileReader base64), input no WA teknisi, seeder profil awal, dan modal interaktif detail riwayat servis & aktivitas per-teknisi. |
| 2026-05-27 | Seeder Foto Profil Teknisi Gemini | `/BRANDING_KIT/` | Menghasilkan foto profil AI realistis untuk Rian, Dani, dan Bagas menggunakan Gemini Image Generator dan menyimpannya ke dalam direktori aset bersama. |
| 2026-05-27 | Migrasi Skema LocalStorage | `/DS_SERVICE/DEMO/` | Menambahkan deteksi migrasi skema data teknisi pada initDatabase guna mencegah nilai undefined pada browser yang masih menyimpan cache data lama. |
| 2026-05-27 | Perapian Tabel Log Aktivitas Teknisi | `/DS_SERVICE/DEMO/` | Memperbaiki perataan kolom, menambah lebar maksimal teks log, dan merapikan visual badge status agar tidak mengalami pemotongan teks (clipped) di sisi kanan. |
| 2026-05-27 | Fitur Cetak Laporan Log Teknisi | `/DS_SERVICE/DEMO/` | Menambahkan tombol 'Cetak Log' pada detail profil teknisi, merender template laporan cetak A4, dan mengontrol visibilitas print layout secara dinamis melalui kelas CSS body. |
| 2026-05-27 | Perbaikan Teks Log Terpotong | `/DS_SERVICE/DEMO/` | Menghapus pembatasan `white-space: nowrap` dan `ellipsis` pada log aktivitas teknisi agar teks panjang membungkus otomatis (wrap) serta menambahkan scroll horizontal pada penampung tabel log. |
| 2026-05-27 | Penambahan Favicon Logo | `/DS_SERVICE/DEMO/` | Menambahkan link favicon di index.html, login.html, dan tracking.html yang mengarah ke logo utama Planet Store. |
| 2026-05-27 | Shortcut Klik Tiket di Log Teknisi | `/DS_SERVICE/DEMO/` | Menambahkan event listener pada kolom nomor tiket di tabel riwayat servis teknisi agar ketika di-klik, modal teknisi ditutup dan modal detail tiket yang bersangkutan langsung terbuka. |
| 2026-05-27 | Perbaikan Tumpang Tindih Cetak | `/DS_SERVICE/DEMO/` | Memperbaiki tumpang tindih tata letak cetak dengan mengganti logika `visibility: hidden` menjadi `display: none !important` pada print stylesheet untuk mengisolasi area cetak secara penuh. |
| 2026-05-27 | Restorasi Lacak Progres & Token Secure | `/DS_SERVICE/DEMO/` | Mengembalikan link tracking publik bagi pelanggan, namun mengamankan parameter token menggunakan UUID acak yang tidak dapat ditebak (*cryptographically secure*) untuk mencegah manipulasi URL oleh pihak ketiga. |
| 2026-05-27 | Landing Dashboard & Grafik SVG | `/DS_SERVICE/DEMO/` | Mengembangkan tab landing page Ringkasan Dashboard eksekutif yang memuat KPI performa, grafik arus kas 7 hari interaktif berbasis SVG asli, serta panel penjelasan rumus algoritma sistem. |
| 2026-05-28 | Dok kondisi unit & sandi layar | `/DS_SERVICE/DEMO/` | Menambahkan fitur pengunggahan foto kondisi unit awal (Depan, Belakang, Samping, Kelengkapan), foto bersama customer (serah terima), pilihan tipe kunci layar, serta pattern lock grid interaktif 3x3 pada pembuatan tiket baru dan visualisasinya di detail modal. |
| 2026-05-28 | Fitur preview foto upload | `/DS_SERVICE/DEMO/` | Menambahkan container preview gambar instan di bawah input file masing-masing foto saat pembuatan tiket servis agar mempermudah verifikasi sebelum data disimpan. |
| 2026-05-28 | Redesain Clean Premium SaaS Theme | `/DS_SERVICE/DEMO/` | Mengubah tema dashboard secara menyeluruh menjadi Clean Premium SaaS dengan font tunggal Plus Jakarta Sans, aksen warna Indigo/Amber, dan gaya border/padding yang lebih minimalis dan elegan. |
| 2026-05-28 | Penyederhanaan Grafik Net Profit | `/DS_SERVICE/DEMO/` | Menghapus grafik batang (pemasukan/pengeluaran) untuk tampilan chart yang lebih bersih, memfokuskan visualisasi hanya pada garis keuntungan bersih (Net Profit) dengan drop shadow glow modern dan marker titik bulat yang elegan. |
| 2026-05-28 | Format Axis Label Grafik Rapih | `/DS_SERVICE/DEMO/` | Mengubah format penomoran Rupiah sumbu Y menggunakan singkatan Juta (Jt) dan Ribu (Rb), serta menggeser posisi label tanggal sumbu X agar lebih rapi tanpa tumpang tindih. |
| 2026-05-28 | Perbaikan Layout & Alignment Dashboard | `/DS_SERVICE/DEMO/` | Mengatasi overlapping teks pada legenda metode pembayaran dengan flexbox spacing, serta memperlebar margin kiri (left padding) chart Y-axis agar nominal Rupiah negatif tidak terpotong (clipped). |
| 2026-05-28 | Penambahan Sandi Login Teknisi | `/DS_SERVICE/DEMO/` | Menambahkan kolom kata sandi login pada form pendaftaran teknisi baru, menginisialisasi password seeder awal, dan menyematkan display sandi pada profil detail teknisi demi kebutuhan otentikasi login. |
| 2026-05-28 | Pemisahan Fungsi Admin & Teknisi | `/DS_SERVICE/DEMO/` | Menerapkan pemisahan dashboard berdasarkan role: admin memiliki kontrol penuh, teknisi hanya bisa melihat tiket miliknya, memproses update status, dan membuat tiket antrean baru (yang otomatis memilih namanya sebagai penanggung jawab). Mengaktifkan otentikasi login teknisi dinamis berbasis database localStorage. |
| 2026-05-28 | Fitur Autocomplete Model Device | `/DS_SERVICE/DEMO/` | Menambahkan elemen datalist berisi rekomendasi model iPhone (dari iPhone X hingga iPhone 16 Pro Max) pada input Model Device saat membuat tiket servis baru untuk mempermudah indexing/pengetikan. |
| 2026-05-28 | Format Otomatis Input Nominal Uang | `/DS_SERVICE/DEMO/` | Mengubah tipe input estimasi biaya dan nominal kas dari number menjadi text dengan filter inputmode numeric, serta menerapkan fungsi format mata uang otomatis (thousand separator titik) real-time saat pengguna mengetik angka nominal. |
| 2026-05-28 | Penyempurnaan Fitur Servis (DS_SERVICE) | `/DS_SERVICE/DEMO/` | Menyempurnakan modul servis: (1) Mengurutkan antrean aktif dengan prioritas EXPRESS di atas. (2) Menambahkan modal edit lengkap untuk memperbarui detail tiket. (3) Menambahkan input rating kepuasan (bintang 1-5) saat pengambilan unit yang langsung mengkalkulasi rata-rata skor performa teknisi secara dinamis. |
| 2026-05-28 | Pembuatan Modul Peminjaman (DS_SEWA) | `/DS_SEWA/DEMO/` | Membuat lengkap file index.html, style.css, database.js, dan admin.js untuk demo sewa iPhone. Fitur mencakup manajemen unit grid, form sewa baru otomatis kalkulator sewa/deposit, pengembalian unit & denda telat otomatis, reminder banner (H-3/H-1/Hari-H) dengan WhatsApp simulator toasts, struk kasir thermal print layout, dan ledger mutasi keuangan sewa. |
| 2026-05-28 | Pembuatan Modul Jual Beli (DS_STORE) | `/DS_STORE/DEMO/` | Membuat lengkap file index.html, style.css, database.js, dan admin.js untuk demo jual beli iPhone. Fitur mencakup manajemen inventaris stok (rekomendasi harga & margin untung), transaksi pembelian (stok masuk), transaksi penjualan (stok keluar & piutang), detail penjualan cetak nota struk, database customer terintegrasi, ledger mutasi kas toko, charts visualisasi harian, dan export CSV laporan. |

---

## 4. Log Kesalahan & Solusi (Error & Bug Registry)

Gunakan tabel ini untuk mencatat setiap error/bug yang ditemui selama proses development agar tidak terulang di masa mendatang.

| ID | Tanggal | Deskripsi Error | Penyebab | Solusi / Cara Mengatasi |
| :--- | :--- | :--- | :--- | :--- |
| ERR-01 | 2026-05-27 | Uncaught SyntaxError: Identifier 'btnOpenCreate' has already been declared | Deklarasi ganda variabel DOM elements di `admin.js` saat inisialisasi proteksi peran teknisi. | Menghapus deklarasi redundan dan menyatukan referensi variabel DOM di awal file script. |
| ERR-02 | 2026-05-27 | Sidebar navigation membeku (tidak merespon klik) | Eror sintaksis `SyntaxError` memblokir jalannya penafsiran JavaScript di `admin.js`. | Memperbaiki letak kode deklarasi variabel dan memverifikasi konsol browser bersih dari eror merah. |
| ERR-03 | 2026-05-27 | Desain tombol 'Batal' dan 'Tutup' di footer modal rusak (tanpa border, teks sangat besar) | Kebocoran gaya (.style leakage) akibat class `.modal-close` mewarisi properti ikon silang (x) di header. | Menggunakan pseudo-selector `:not(.btn)` pada deklarasi `.modal-close` untuk memisahkan gaya ikon silang dari tombol biasa. |
| ERR-04 | 2026-05-27 | Struk thermal dan laporan log teknisi tercetak bersamaan (double print) | Penggunaan `visibility: hidden` pada print media query tidak menyembunyikan kontainer cetak lain secara penuh. | Mengubah logika sembunyi cetak menggunakan `display: none !important` pada wrapper utama dan hanya mengaktifkan kontainer cetak target sesuai kelas body. |
| ERR-05 | 2026-05-28 | Uncaught SyntaxError: Unexpected token ':' di database.js:139 | Kesalahan ketik tanda titik dua `:` sebagai pengganti koma `,` atau di luar format objek yang valid pada array data seeder. | Memperbaiki struktur data objek seeder pada database.js agar menggunakan sintaksis JS Object yang valid. |
| ERR-06 | 2026-05-28 | Uncaught ReferenceError: getTechnicians is not defined di admin.js:79 | Gagalnya pemuatan database.js akibat SyntaxError (ERR-05), menyebabkan fungsi getTechnicians tidak terdefinisi saat admin.js dieksekusi. | Menyelesaikan SyntaxError pada database.js (ERR-05), sehingga seluruh script termuat dengan sukses dan fungsi global dapat diakses secara normal. |
| ERR-07 | 2026-05-28 | Garis tren grafik profit keluar batas (out of bounds) | Kalkulasi koordinat Y (`getY`) tidak mengakomodasi nilai negatif ketika pengeluaran melebihi pemasukan. | Memperkenalkan minVal (nilai terendah net profit, bisa < 0), menghitung rentang nilai (range = maxVal - minVal), serta menyesuaikan penggambaran baseline X-axis dan grid lines berdasarkan level nol (0) dinamis. |
| ERR-08 | 2026-05-29 | Modal Form Entry Sewa Baru tidak bisa di-scroll / tombol simpan terpotong | Kontainer modal memiliki max-height dan overflow:hidden, sementara form di dalamnya tidak menggunakan flex layout sehingga meluber keluar layar. | Mengatur `.modal-container form` agar menggunakan flex layout (flex-direction: column) dan overflow:hidden, agar `.modal-body { overflow-y: auto }` dapat berfungsi dengan semestinya. |
| 2026-05-28 | Penyesuaian Desain Seragam (Clean Light Theme - Biru) | `/DS_SEWA/DEMO/`, `/DS_STORE/DEMO/`, `/DS_SERVICE/DEMO/` | Menyeragamkan seluruh modul dashboard menggunakan basis style Clean Light Theme (dari DS_SERVICE), mengganti semua aksen warna ungu/indigo menjadi biru (`#0052FF`), serta mencatat dokumentasi desain lama di bagian log. |
| 2026-05-28 | Redesain Kartu Portal Utama | `/index.html` | Menghapus judul/keterangan teks pada modul demo dan meredesain kartu menjadi tampilan gambar branding kit penuh (full-bleed) berskala hover efek. |
| 2026-05-28 | Redesain Navbar Portal Utama | `/index.html` | Mengubah header portal menjadi sticky glassmorphic navigation bar dengan ping status indicator ber-efek ping animasi live serta aksen gradasi border pada logo. |
| 2026-05-28 | Penyelarasan Tema Login | `/DS_SEWA/DEMO/login.html`, `/DS_STORE/DEMO/login.html` | Mengubah struktur HTML, CSS internal, dan dependensi kelas elemen form agar persis identik dengan halaman login DS_SERVICE (Clean Light Theme). |
| 2026-05-28 | Integrasi Logo Modul di Login | `/DS_SEWA/DEMO/login.html`, `/DS_SERVICE/DEMO/login.html`, `/DS_STORE/DEMO/login.html` | Menerapkan logo branding spesifik masing-masing modul (`rental.png`, `service.png`, `store.png`) pada halaman login terkait. |
| 2026-05-28 | Unifikasi Desain Utama Dashboard | `/DS_SEWA/DEMO/index.html`, `/DS_STORE/DEMO/index.html` | Mengganti seluruh kelas brutalist (border tebal kaku, sudut siku-siku, shadow offset keras) dengan layout premium Clean Light SaaS (rounded-xl/2xl, border-soft, shadow-md, font Plus Jakarta Sans) agar identik dengan DS_SERVICE. |
| 2026-05-28 | Harmonisasi Desain Login | `/DS_SEWA/DEMO/login.html`, `/DS_STORE/DEMO/login.html` | Menyeragamkan tampilan login untuk semua modul dengan menghapus CSS inline yang tidak konsisten dan menerapkan tema utama secara konsisten. |
| 2026-05-28 | Penyelesaian Error Chart.js | `/DS_SEWA/DEMO/`, `/DS_STORE/DEMO/` | Menghapus elemen `<canvas>` Chart.js yang rusak dan menyebabkan ReferenceError yang memblokir inisialisasi database di admin.js. |
| 2026-05-28 | Integrasi Chart SVG Native | `/DS_SEWA/DEMO/`, `/DS_STORE/DEMO/` | Mengintegrasikan *renderer* grafik garis SVG asli tanpa dependensi (milik modul Service) untuk menampilkan data pendapatan secara dinamis. |
| 2026-05-29 | Perbaikan Layout Legenda Metode Pembayaran | `/DS_SEWA/DEMO/js/admin.js`, `/DS_STORE/DEMO/js/admin.js` | Mengganti class Tailwind CSS yang tidak ter-load dengan class CSS Vanilla standar dari style.css, serta mewarnai tengah SVG donut chart mengikuti warna permukaan card dasbor. |
| 2026-05-29 | Fungsionalitas Ekspor Excel & Cetak PDF | Semua Modul / DEMO | Menambahkan tombol Excel (ekspor CSV kompatibel Excel) dan PDF di header topbar untuk semua data tabel aktif, lengkap dengan format kop surat resmi Planet Store, metadata, dan kolom tanda tangan manajer. |
| 2026-05-29 | Resolusi Bug Scroll Modal Form | Semua Modul / DEMO | Menambahkan CSS rule `.modal-container form` dengan flex layout untuk memperbaiki modal isian yang tidak bisa di-scroll (ERR-08) pada resolusi layar sedang/kecil. |
| 2026-05-29 | Foto Dokumentasi Wajib Sewa | `/DS_SEWA/DEMO/` | Menambahkan input foto kondisi iPhone, foto orang bawa iPhone, dan foto KTP pelanggan pada form sewa baru beserta preview instan, penyimpanan base64 di localStorage, dan penayangan di detail modal sewa. |
| 2026-05-29 | Redesain Galeri Armada & Detail Unit | `/DS_SEWA/DEMO/` | Mengubah placeholder SVG pada unit sewa dengan link gambar Unsplash iPhone berkualitas tinggi, memperbaiki margin & padding cover card unit sewa, serta meredesain modal detail unit dari gaya brutalist kaku menjadi Clean Light SaaS premium. |
| 2026-05-29 | Foto di Detail Unit | `/DS_SEWA/DEMO/` | Menampilkan foto unit iPhone secara dinamis di bagian paling atas modal detail unit sewa. |
| 2026-06-06 | Integrasi IMEI, iCloud Status, Garansi Toko & Slow-Moving Alert | `/DS_STORE/DEMO/` | Menambahkan status IMEI, status iCloud, pemilihan & pencetakan masa Garansi Toko, serta penghitungan masa mengendap unit (Ageing/Slow-Moving Stock) pada inventaris toko. |

---

## 5. Dokumentasi Desain Lama (Design Backup Registry)
Gunakan bagian ini untuk memulihkan gaya visual jika diperlukan di masa mendatang.

### A. Desain Brutalist Awal (DS_SEWA & DS_STORE)
* **Karakteristik:** Font JetBrains Mono & Inter, border kaku dan tebal (`border-2 border-planet-dark`), shadow offset mentah (`shadow-[4px_4px_0px_0px_rgba(9,9,11,1)]`), palet warna primer/solid dengan warna latar belakang putih bersih berkontras sangat tinggi.
* **Tokens Warna CSS Variables Awal:**
  ```css
  --accent-orange: #0052FF;
  --accent-blue: #0052FF;
  --primary-purple: #0052FF;
  --bg-dark: #09090B;
  --bg-base: #F4F4F5;
  --border-hard: #09090B;
  ```

### B. Desain Indigo / Amber Awal (DS_SERVICE)
* **Karakteristik:** Clean Light Theme premium, bayangan melayang lembut (`--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.05)`), border-radius membulat (`border-radius: 16px`), dengan visual aksen ungu/indigo.
* **Tokens Warna CSS Variables Awal:**
  ```css
  --primary-purple: #4F46E5;
  --primary-purple-hover: #4338CA;
  --accent-orange: #F59E0B;
  --accent-orange-hover: #D97706;
  ```

---

*(Log ini akan diperbarui secara aktif oleh AI di setiap langkah pengembangan)*

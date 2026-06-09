/* ==========================================================================
   Planet Store Boyolali — DS_SERVICE Database Logic (localStorage)
   ========================================================================== */

// Config & Mock Data Initializer
const DB_KEYS = {
    TICKETS: 'planet_store_service_tickets',
    SPAREPARTS: 'planet_store_service_spareparts',
    TECHNICIANS: 'planet_store_service_technicians',
    MUTATIONS: 'planet_store_service_mutations'
};

const INITIAL_SPAREPARTS = [
    { id: 'p1', name: 'LCD iPhone 11 (Premium)', compatible: ['iPhone 11'], price_buy: 350000, price_sell: 650000, stock: 12, min_stock: 5, supplier: 'IndoPart' },
    { id: 'p2', name: 'LCD iPhone 12 Pro Max (Original)', compatible: ['iPhone 12 Pro Max'], price_buy: 1200000, price_sell: 1850000, stock: 3, min_stock: 4, supplier: 'Apple Distributor' },
    { id: 'p3', name: 'Baterai iPhone 13 (Kapasitas Tinggi)', compatible: ['iPhone 13'], price_buy: 200000, price_sell: 450000, stock: 8, min_stock: 5, supplier: 'BateraiHub' },
    { id: 'p4', name: 'Konektor Charger Samsung S23', compatible: ['Samsung Galaxy S23'], price_buy: 80000, price_sell: 250000, stock: 2, min_stock: 3, supplier: 'PartAndroid' },
    { id: 'p5', name: 'Kamera Belakang iPhone 12 Pro Max', compatible: ['iPhone 12 Pro Max'], price_buy: 600000, price_sell: 1100000, stock: 5, min_stock: 2, supplier: 'Apple Distributor' }
];

const INITIAL_TECHNICIANS = [
    { id: 'tech1', name: 'Rian', specialty: 'iPhone & iOS Spec.', status: 'AKTIF', rating: 4.8, active_jobs: 1, phone: '087815970535', photo: '../../BRANDING_KIT/tech_rian.png', password: 'rian123' },
    { id: 'tech2', name: 'Dani', specialty: 'Android & Software', status: 'AKTIF', rating: 4.6, active_jobs: 2, phone: '089522994849', photo: '../../BRANDING_KIT/tech_dani.png', password: 'dani123' },
    { id: 'tech3', name: 'Bagas', specialty: 'Hardware & Soldering', status: 'AKTIF', rating: 4.9, active_jobs: 2, phone: '081234567890', photo: '../../BRANDING_KIT/tech_bagas.png', password: 'bagas123' }
];

const INITIAL_MUTATIONS = [
    { id: 'm-1', date: '2026-05-26T10:00:00+07:00', module: 'SERVICE', ref_id: 'SRV-20260525-0010', type: 'MASUK', category: 'Biaya Servis', amount: 350000, pay_method: 'QRIS', note: 'Servis iPhone XR ganti konektor & cleaning', logged_by: 'admin' },
    { id: 'm-2', date: '2026-05-26T14:30:00+07:00', module: 'SERVICE', ref_id: 'SRV-20260525-0012', type: 'MASUK', category: 'Biaya Servis', amount: 850000, pay_method: 'TRANSFER', note: 'Ganti LCD iPhone 11', logged_by: 'admin' },
    { id: 'm-3', date: '2026-05-27T11:00:00+07:00', module: 'SERVICE', ref_id: 'SUPPLIER-023', type: 'KELUAR', category: 'Beli Part', amount: 1500000, pay_method: 'TRANSFER', note: 'Restock LCD iPhone 12 Pro Max & baterai', logged_by: 'admin' }
];

const INITIAL_TICKETS = [
    {
        id: 't1',
        code: 'SRV-20260527-0001',
        customer_name: 'Aditya Pratama',
        customer_phone: '081234567890',
        model: 'iPhone 13',
        imei: '358923102938475',
        complaint: 'Battery Health 72% dan sering mati sendiri',
        condition: 'Mulus, lecet halus pemakaian wajar di pinggir',
        technician: 'Rian',
        priority: 'NORMAL',
        estimated_date: '2026-05-29',
        estimated_cost: 450000,
        final_cost: 450000,
        status_acc: 'ACC',
        status: 'PROSES',
        token: 'uuid-8f4b2a8d-192a-4bc3-95cf-2357ef091a11',
        date_entered: '2026-05-27T09:00:00+07:00',
        date_completed: null,
        parts: [
            { id: 'p3', name: 'Baterai iPhone 13 (Kapasitas Tinggi)', quantity: 1, price: 450000 }
        ],
        logs: [
            { id: 'l1', prev_status: null, next_status: 'DITERIMA', note: 'Unit masuk ke konter Planet Store Boyolali. Diterima oleh admin.', technician: 'System', timestamp: '2026-05-27T09:00:00+07:00' },
            { id: 'l2', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'Teknisi Rian mulai pengecekan fisik & performa baterai.', technician: 'Rian', timestamp: '2026-05-27T10:30:00+07:00' },
            { id: 'l3', prev_status: 'DIAGNOSA', next_status: 'MENUNGGU_ACC', note: 'Diagnosa selesai. Battery Health memang drop (72%). Diperlukan penggantian baterai baru.', technician: 'Rian', timestamp: '2026-05-27T11:00:00+07:00' },
            { id: 'l4', prev_status: 'MENUNGGU_ACC', next_status: 'PROSES', note: 'Customer menyetujui estimasi biaya Rp 450.000 via WhatsApp.', technician: 'Rian', timestamp: '2026-05-27T11:15:00+07:00' }
        ]
    },
    {
        id: 't2',
        code: 'SRV-20260527-0002',
        customer_name: 'Budi Santoso',
        customer_phone: '085799988877',
        model: 'Samsung Galaxy S23',
        imei: '356712398456123',
        complaint: 'Layar bergaris hijau vertikal (greenline)',
        condition: 'Ada retak sedikit di pojok kanan bawah backglass',
        technician: 'Dani',
        priority: 'NORMAL',
        estimated_date: '2026-05-30',
        estimated_cost: 2450000,
        final_cost: null,
        status_acc: 'MENUNGGU',
        status: 'MENUNGGU_ACC',
        token: 'uuid-3c4a2b9d-283a-4ef4-87be-12a837ff22b8',
        date_entered: '2026-05-27T10:00:00+07:00',
        date_completed: null,
        parts: [],
        logs: [
            { id: 'l5', prev_status: null, next_status: 'DITERIMA', note: 'Device diterima di toko. Keluhan greenline setelah update software.', technician: 'System', timestamp: '2026-05-27T10:00:00+07:00' },
            { id: 'l6', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'Pengecekan LCD Samsung S23. Flexibel aman, panel AMOLED rusak sehingga harus diganti fullset LCD.', technician: 'Dani', timestamp: '2026-05-27T13:00:00+07:00' },
            { id: 'l7', prev_status: 'DIAGNOSA', next_status: 'MENUNGGU_ACC', note: 'Estimasi biaya servis LCD fullset Samsung S23 Rp 2.450.000. Sedang menunggu konfirmasi customer.', technician: 'Dani', timestamp: '2026-05-27T13:20:00+07:00' }
        ]
    },
    {
        id: 't3',
        code: 'SRV-20260527-0003',
        customer_name: 'Siti Rahma',
        customer_phone: '089522334455',
        model: 'iPhone 12 Pro Max',
        imei: '352938475610293',
        complaint: 'Kamera belakang bergetar keras dan gambar buram',
        condition: 'Mulus, terpasang case spigen',
        technician: 'Bagas',
        priority: 'EXPRESS',
        estimated_date: '2026-05-28',
        estimated_cost: 1350000,
        final_cost: 1350000,
        status_acc: 'ACC',
        status: 'QC_TESTING',
        token: 'uuid-9e8d7c6b-54a2-4fb3-a9d7-83c92ff983e2',
        date_entered: '2026-05-27T11:30:00+07:00',
        date_completed: null,
        parts: [
            { id: 'p5', name: 'Kamera Belakang iPhone 12 Pro Max', quantity: 1, price: 1100000 }
        ],
        logs: [
            { id: 'l8', prev_status: null, next_status: 'DITERIMA', note: 'Device masuk dengan prioritas Express. Masalah modul kamera.', technician: 'System', timestamp: '2026-05-27T11:30:00+07:00' },
            { id: 'l9', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'Stabilizer OIS modul kamera pecah. Wajib ganti modul kamera original.', technician: 'Bagas', timestamp: '2026-05-27T12:00:00+07:00' },
            { id: 'l10', prev_status: 'DIAGNOSA', next_status: 'MENUNGGU_ACC', note: 'Menghubungi customer untuk ACC modul kamera Rp 1.100.000 + jasa pasang Rp 250.000.', technician: 'Bagas', timestamp: '2026-05-27T12:15:00+07:00' },
            { id: 'l11', prev_status: 'MENUNGGU_ACC', next_status: 'PROSES', note: 'Customer menyetujui estimasi biaya total Rp 1.350.000.', technician: 'Bagas', timestamp: '2026-05-27T12:30:00+07:00' },
            { id: 'l12', prev_status: 'PROSES', next_status: 'QC_TESTING', note: 'Modul kamera baru selesai dipasang. Kamera berfungsi normal, fokus tajam, OIS stabil. Sedang pengetesan berkala.', technician: 'Bagas', timestamp: '2026-05-27T15:45:00+07:00' }
        ]
    },
    {
        id: 't4',
        code: 'SRV-20260527-0004',
        customer_name: 'Rico Wijaya',
        customer_phone: '087812984534',
        model: 'Redmi Note 13',
        imei: '861029384756193',
        complaint: 'Colokan charger longgar, tidak bisa masuk daya',
        condition: 'Banyak baret halus di panel belakang',
        technician: 'Dani',
        priority: 'NORMAL',
        estimated_date: '2026-05-27',
        estimated_cost: 250000,
        final_cost: 250000,
        status_acc: 'ACC',
        status: 'SELESAI',
        token: 'uuid-4d5e6f7a-8901-2345-6789-abcdef123456',
        date_entered: '2026-05-27T12:00:00+07:00',
        date_completed: '2026-05-27T16:00:00+07:00',
        parts: [],
        logs: [
            { id: 'l13', prev_status: null, next_status: 'DITERIMA', note: 'Unit masuk. Colokan longgar.', technician: 'System', timestamp: '2026-05-27T12:00:00+07:00' },
            { id: 'l14', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'Port charger kotor dan longgar. Perlu ganti board charging.', technician: 'Dani', timestamp: '2026-05-27T13:00:00+07:00' },
            { id: 'l15', prev_status: 'DIAGNOSA', next_status: 'MENUNGGU_ACC', note: 'Biaya Rp 250.000.', technician: 'Dani', timestamp: '2026-05-27T13:30:00+07:00' },
            { id: 'l16', prev_status: 'MENUNGGU_ACC', next_status: 'PROSES', note: 'Customer setuju.', technician: 'Dani', timestamp: '2026-05-27T14:00:00+07:00' },
            { id: 'l17', prev_status: 'PROSES', next_status: 'SELESAI', note: 'Board charger baru, charging normal.', technician: 'Dani', timestamp: '2026-05-27T16:00:00+07:00' }
        ]
    },
    {
        id: 't5',
        code: 'SRV-20260527-0005',
        customer_name: 'Novianti',
        customer_phone: '085211223344',
        model: 'iPhone 11',
        imei: '351920394857291',
        complaint: 'Mati total setelah terjatuh ke air kolam',
        condition: 'Ada indikasi air di dalam lensa kamera depan',
        technician: 'Bagas',
        priority: 'NORMAL',
        estimated_date: '2026-05-30',
        estimated_cost: 0,
        final_cost: 0,
        status_acc: 'MENUNGGU',
        status: 'DIAGNOSA',
        token: 'uuid-1a2b3c4d-5e6f-7a8b-9c0d-77bbcc88ee3d',
        date_entered: '2026-05-27T13:30:00+07:00',
        date_completed: null,
        parts: [],
        logs: [
            { id: 'l18', prev_status: null, next_status: 'DITERIMA', note: 'Unit masuk dengan keluhan kena air (water damage). Langsung dimatikan paksa.', technician: 'System', timestamp: '2026-05-27T13:30:00+07:00' },
            { id: 'l19', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'Membongkar unit, pembersihan air pada mesin utama dengan cairan pembersih khusus. Sedang melacak jalur kelistrikan short circuit pada komponen.', technician: 'Bagas', timestamp: '2026-05-27T16:00:00+07:00' }
        ]
    },
    {
        id: 't-h1',
        code: 'SRV-20260521-0001',
        customer_name: 'Aditya Pratama',
        customer_phone: '081234567890',
        model: 'iPhone XR',
        imei: '358923102938111',
        complaint: 'Speaker bawah mati total, suara hanya keluar dari earpiece',
        condition: 'Mulus, ada screen protector',
        technician: 'Rian',
        priority: 'NORMAL',
        estimated_date: '2026-05-23',
        estimated_cost: 280000,
        final_cost: 280000,
        status_acc: 'ACC',
        status: 'DIAMBIL',
        token: 'uuid-a1b2c3d4-5e6f-7890-abcd-111111111111',
        date_entered: '2026-05-21T10:00:00+07:00',
        date_completed: '2026-05-22T16:00:00+07:00',
        parts: [],
        logs: [
            { id: 'lh1', prev_status: null, next_status: 'DITERIMA', note: 'Unit masuk. Keluhan speaker bawah mati.', technician: 'System', timestamp: '2026-05-21T10:00:00+07:00' },
            { id: 'lh2', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'Membongkar unit, speaker bawah rusak perlu ganti.', technician: 'Rian', timestamp: '2026-05-21T14:00:00+07:00' },
            { id: 'lh3', prev_status: 'DIAGNOSA', next_status: 'PROSES', note: 'Customer ACC biaya Rp 280.000.', technician: 'Rian', timestamp: '2026-05-21T15:00:00+07:00' },
            { id: 'lh4', prev_status: 'PROSES', next_status: 'SELESAI', note: 'Speaker baru terpasang, uji suara OK.', technician: 'Rian', timestamp: '2026-05-22T14:00:00+07:00' },
            { id: 'lh5', prev_status: 'SELESAI', next_status: 'DIAMBIL', note: 'Unit diambil oleh pelanggan. Lunas.', technician: 'System', timestamp: '2026-05-22T16:00:00+07:00' }
        ]
    },
    {
        id: 't-h2',
        code: 'SRV-20260522-0001',
        customer_name: 'Linda Kusuma',
        customer_phone: '082155667788',
        model: 'Samsung Galaxy A54',
        imei: '356712398456999',
        complaint: 'Layar sentuh tidak responsif di bagian bawah',
        condition: 'Ada goresan halus di layar',
        technician: 'Dani',
        priority: 'NORMAL',
        estimated_date: '2026-05-24',
        estimated_cost: 750000,
        final_cost: 750000,
        status_acc: 'ACC',
        status: 'DIAMBIL',
        token: 'uuid-b2c3d4e5-6f78-9012-bcde-222222222222',
        date_entered: '2026-05-22T09:00:00+07:00',
        date_completed: '2026-05-23T15:00:00+07:00',
        parts: [],
        logs: [
            { id: 'lh6', prev_status: null, next_status: 'DITERIMA', note: 'Unit masuk, touchscreen bermasalah bagian bawah.', technician: 'System', timestamp: '2026-05-22T09:00:00+07:00' },
            { id: 'lh7', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'Digitizer rusak, perlu ganti LCD fullset.', technician: 'Dani', timestamp: '2026-05-22T11:00:00+07:00' },
            { id: 'lh8', prev_status: 'DIAGNOSA', next_status: 'PROSES', note: 'Customer ACC biaya Rp 750.000.', technician: 'Dani', timestamp: '2026-05-22T13:00:00+07:00' },
            { id: 'lh9', prev_status: 'PROSES', next_status: 'SELESAI', note: 'LCD baru terpasang. Touch test 100% responsif.', technician: 'Dani', timestamp: '2026-05-23T14:00:00+07:00' },
            { id: 'lh10', prev_status: 'SELESAI', next_status: 'DIAMBIL', note: 'Unit diambil. Lunas via Transfer.', technician: 'System', timestamp: '2026-05-23T15:00:00+07:00' }
        ]
    },
    {
        id: 't-h3',
        code: 'SRV-20260523-0001',
        customer_name: 'Budi Santoso',
        customer_phone: '085799988877',
        model: 'OPPO Reno 10',
        imei: '861029384756222',
        complaint: 'Baterai cepat habis, hanya tahan 2 jam pemakaian normal',
        condition: 'Mulus, pemakaian wajar',
        technician: 'Bagas',
        priority: 'NORMAL',
        estimated_date: '2026-05-25',
        estimated_cost: 180000,
        final_cost: 180000,
        status_acc: 'ACC',
        status: 'DIAMBIL',
        token: 'uuid-c3d4e5f6-7890-1234-cdef-333333333333',
        date_entered: '2026-05-23T08:30:00+07:00',
        date_completed: '2026-05-24T11:00:00+07:00',
        parts: [],
        logs: [
            { id: 'lh11', prev_status: null, next_status: 'DITERIMA', note: 'Unit masuk. Keluhan baterai boros.', technician: 'System', timestamp: '2026-05-23T08:30:00+07:00' },
            { id: 'lh12', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'Battery health 68%, perlu penggantian baterai.', technician: 'Bagas', timestamp: '2026-05-23T10:00:00+07:00' },
            { id: 'lh13', prev_status: 'DIAGNOSA', next_status: 'PROSES', note: 'Customer ACC Rp 180.000 langsung.', technician: 'Bagas', timestamp: '2026-05-23T10:30:00+07:00' },
            { id: 'lh14', prev_status: 'PROSES', next_status: 'SELESAI', note: 'Baterai baru terpasang, health 100%.', technician: 'Bagas', timestamp: '2026-05-24T10:00:00+07:00' },
            { id: 'lh15', prev_status: 'SELESAI', next_status: 'DIAMBIL', note: 'Unit diambil. Lunas via QRIS.', technician: 'System', timestamp: '2026-05-24T11:00:00+07:00' }
        ]
    },
    {
        id: 't-h4',
        code: 'SRV-20260524-0001',
        customer_name: 'Dewi Lestari',
        customer_phone: '087899112233',
        model: 'Vivo V29',
        imei: '352938475610555',
        complaint: 'Kamera depan blur dan tidak bisa fokus selfie',
        condition: 'Mulus, pakai case',
        technician: 'Rian',
        priority: 'EXPRESS',
        estimated_date: '2026-05-25',
        estimated_cost: 950000,
        final_cost: 950000,
        status_acc: 'ACC',
        status: 'DIAMBIL',
        token: 'uuid-d4e5f6a7-8901-2345-def0-444444444444',
        date_entered: '2026-05-24T09:00:00+07:00',
        date_completed: '2026-05-25T13:00:00+07:00',
        parts: [],
        logs: [
            { id: 'lh16', prev_status: null, next_status: 'DITERIMA', note: 'Unit masuk EXPRESS. Masalah kamera depan.', technician: 'System', timestamp: '2026-05-24T09:00:00+07:00' },
            { id: 'lh17', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'Modul kamera depan rusak, perlu ganti.', technician: 'Rian', timestamp: '2026-05-24T10:00:00+07:00' },
            { id: 'lh18', prev_status: 'DIAGNOSA', next_status: 'PROSES', note: 'ACC total Rp 950.000.', technician: 'Rian', timestamp: '2026-05-24T11:00:00+07:00' },
            { id: 'lh19', prev_status: 'PROSES', next_status: 'SELESAI', note: 'Kamera depan baru terpasang. Selfie test OK.', technician: 'Rian', timestamp: '2026-05-25T12:00:00+07:00' },
            { id: 'lh20', prev_status: 'SELESAI', next_status: 'DIAMBIL', note: 'Lunas via Transfer.', technician: 'System', timestamp: '2026-05-25T13:00:00+07:00' }
        ]
    },
    {
        id: 't-h5',
        code: 'SRV-20260525-0001',
        customer_name: 'Siti Rahma',
        customer_phone: '089522334455',
        model: 'iPhone SE 2020',
        imei: '351920394857999',
        complaint: 'Layar pecah dan LCD bergaris setelah terjatuh',
        condition: 'Pecah layar parah',
        technician: 'Bagas',
        priority: 'NORMAL',
        estimated_date: '2026-05-27',
        estimated_cost: 850000,
        final_cost: null,
        status_acc: 'TOLAK',
        status: 'DIBATALKAN',
        token: 'uuid-e5f6a7b8-9012-3456-ef01-555555555555',
        date_entered: '2026-05-25T11:00:00+07:00',
        date_completed: '2026-05-25T15:00:00+07:00',
        parts: [],
        logs: [
            { id: 'lh21', prev_status: null, next_status: 'DITERIMA', note: 'Unit masuk. LCD pecah parah.', technician: 'System', timestamp: '2026-05-25T11:00:00+07:00' },
            { id: 'lh22', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'LCD + touchscreen rusak total, frame bent. Estimasi Rp 850.000.', technician: 'Bagas', timestamp: '2026-05-25T13:00:00+07:00' },
            { id: 'lh23', prev_status: 'DIAGNOSA', next_status: 'DIBATALKAN', note: 'Customer menolak biaya perbaikan. Unit dikembalikan apa adanya.', technician: 'System', timestamp: '2026-05-25T15:00:00+07:00' }
        ]
    },
    {
        id: 't-h6',
        code: 'SRV-20260526-0001',
        customer_name: 'Ahmad Fauzi',
        customer_phone: '081377889900',
        model: 'Redmi Note 12',
        imei: '867294710583621',
        complaint: 'Fingerprint sensor tidak terbaca sama sekali',
        condition: 'Ada baret di layar',
        technician: 'Dani',
        priority: 'NORMAL',
        estimated_date: '2026-05-28',
        estimated_cost: 320000,
        final_cost: 320000,
        status_acc: 'ACC',
        status: 'SELESAI',
        token: 'uuid-f6a7b8c9-0123-4567-f012-666666666666',
        date_entered: '2026-05-26T08:00:00+07:00',
        date_completed: '2026-05-27T10:00:00+07:00',
        parts: [],
        logs: [
            { id: 'lh24', prev_status: null, next_status: 'DITERIMA', note: 'Unit masuk. Fingerprint sensor error.', technician: 'System', timestamp: '2026-05-26T08:00:00+07:00' },
            { id: 'lh25', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'Sensor fingerprint rusak hardware.', technician: 'Dani', timestamp: '2026-05-26T10:00:00+07:00' },
            { id: 'lh26', prev_status: 'DIAGNOSA', next_status: 'PROSES', note: 'Customer ACC Rp 320.000.', technician: 'Dani', timestamp: '2026-05-26T12:00:00+07:00' },
            { id: 'lh27', prev_status: 'PROSES', next_status: 'SELESAI', note: 'Sensor fingerprint baru terpasang. Test unlock OK.', technician: 'Dani', timestamp: '2026-05-27T10:00:00+07:00' }
        ]
    },
    {
        id: 't-h7',
        code: 'SRV-20260524-0002',
        customer_name: 'Hendra Saputra',
        customer_phone: '082344556677',
        model: 'Xiaomi 13T',
        imei: '864501928374650',
        complaint: 'HP restart sendiri terus-menerus saat charging',
        condition: 'Ada penyok kecil di frame kanan',
        technician: 'Bagas',
        priority: 'NORMAL',
        estimated_date: '2026-05-26',
        estimated_cost: 450000,
        final_cost: null,
        status_acc: 'ACC',
        status: 'PROSES',
        token: 'uuid-a7b8c9d0-1234-5678-0123-777777777777',
        date_entered: '2026-05-24T14:00:00+07:00',
        date_completed: null,
        parts: [],
        logs: [
            { id: 'lh28', prev_status: null, next_status: 'DITERIMA', note: 'Unit masuk. HP restart loop saat charging.', technician: 'System', timestamp: '2026-05-24T14:00:00+07:00' },
            { id: 'lh29', prev_status: 'DITERIMA', next_status: 'DIAGNOSA', note: 'IC charging kemungkinan short. Butuh soldering ulang.', technician: 'Bagas', timestamp: '2026-05-25T09:00:00+07:00' },
            { id: 'lh30', prev_status: 'DIAGNOSA', next_status: 'PROSES', note: 'Customer ACC Rp 450.000.', technician: 'Bagas', timestamp: '2026-05-25T10:00:00+07:00' }
        ]
    }
];

// Helper database functions
function initDatabase() {
    const DB_VERSION = '2.1_enhanced';
    const storedVersion = localStorage.getItem('planet_store_db_version');
    
    if (storedVersion !== DB_VERSION) {
        // Force re-seed all data for new version
        localStorage.setItem(DB_KEYS.SPAREPARTS, JSON.stringify(INITIAL_SPAREPARTS));
        localStorage.setItem(DB_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
        localStorage.setItem(DB_KEYS.TECHNICIANS, JSON.stringify(INITIAL_TECHNICIANS));
        localStorage.setItem(DB_KEYS.MUTATIONS, JSON.stringify(INITIAL_MUTATIONS));
        localStorage.setItem('planet_store_db_version', DB_VERSION);
        return;
    }
    
    if (!localStorage.getItem(DB_KEYS.SPAREPARTS)) {
        localStorage.setItem(DB_KEYS.SPAREPARTS, JSON.stringify(INITIAL_SPAREPARTS));
    }
    if (!localStorage.getItem(DB_KEYS.TICKETS)) {
        localStorage.setItem(DB_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
    }
    if (!localStorage.getItem(DB_KEYS.TECHNICIANS)) {
        localStorage.setItem(DB_KEYS.TECHNICIANS, JSON.stringify(INITIAL_TECHNICIANS));
    }
    if (!localStorage.getItem(DB_KEYS.MUTATIONS)) {
        localStorage.setItem(DB_KEYS.MUTATIONS, JSON.stringify(INITIAL_MUTATIONS));
    }
}

function getTickets() {
    return JSON.parse(localStorage.getItem(DB_KEYS.TICKETS)) || [];
}

function getSpareparts() {
    return JSON.parse(localStorage.getItem(DB_KEYS.SPAREPARTS)) || [];
}

function getTechnicians() {
    return JSON.parse(localStorage.getItem(DB_KEYS.TECHNICIANS)) || [];
}

function getMutations() {
    return JSON.parse(localStorage.getItem(DB_KEYS.MUTATIONS)) || [];
}

function saveTickets(tickets) {
    localStorage.setItem(DB_KEYS.TICKETS, JSON.stringify(tickets));
}

function saveSpareparts(parts) {
    localStorage.setItem(DB_KEYS.SPAREPARTS, JSON.stringify(parts));
}

function saveTechnicians(techs) {
    localStorage.setItem(DB_KEYS.TECHNICIANS, JSON.stringify(techs));
}

function saveMutations(muts) {
    localStorage.setItem(DB_KEYS.MUTATIONS, JSON.stringify(muts));
}

// Generate secure, cryptographically random, unguessable token
function generateToken() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return Array.from({length: 4}, () => Math.random().toString(36).substring(2, 15)).join('-');
}

function addTicket(ticketData) {
    const tickets = getTickets();
    const date = new Date();
    const formattedDate = date.getFullYear() + 
        String(date.getMonth() + 1).padStart(2, '0') + 
        String(date.getDate()).padStart(2, '0');
    
    // Generate counter code (SRV-YYYYMMDD-XXXX)
    const dailyCount = tickets.filter(t => t.code.includes(`SRV-${formattedDate}`)).length + 1;
    const counterCode = String(dailyCount).padStart(4, '0');
    const ticketCode = `SRV-${formattedDate}-${counterCode}`;

    const newTicket = {
        id: 't-' + Date.now(),
        code: ticketCode,
        customer_name: ticketData.customer_name,
        customer_phone: ticketData.customer_phone,
        model: ticketData.model,
        imei: ticketData.imei || '',
        complaint: ticketData.complaint,
        condition: ticketData.condition || 'Mulus wajar',
        technician: ticketData.technician || 'Belum Ditunjuk',
        priority: ticketData.priority || 'NORMAL',
        estimated_date: ticketData.estimated_date || '',
        estimated_cost: ticketData.estimated_cost ? parseFloat(ticketData.estimated_cost) : null,
        final_cost: null,
        status_acc: ticketData.estimated_cost ? 'MENUNGGU' : 'MENUNGGU',
        status: 'DITERIMA',
        token: generateToken(),
        date_entered: new Date().toISOString(),
        date_completed: null,
        parts: [],
        
        // Added fields for initial device check photos, customer photo & device credentials
        photo_front: ticketData.photo_front || '',
        photo_back: ticketData.photo_back || '',
        photo_side: ticketData.photo_side || '',
        photo_accessories: ticketData.photo_accessories || '',
        photo_customer: ticketData.photo_customer || '',
        device_lock_type: ticketData.device_lock_type || 'NONE', // PIN, PATTERN, PASSWORD, NONE
        device_lock_code: ticketData.device_lock_code || '',

        logs: [
            {
                id: 'log-' + Date.now(),
                prev_status: null,
                next_status: 'DITERIMA',
                note: `Tiket servis baru dibuat. Masalah: ${ticketData.complaint}`,
                technician: 'System',
                timestamp: new Date().toISOString()
            }
        ]
    };

    tickets.unshift(newTicket); // Add to the top of list
    saveTickets(tickets);
    
    // Increase active jobs for technician
    const techs = getTechnicians();
    const techObj = techs.find(tc => tc.name === ticketData.technician);
    if (techObj) {
        techObj.active_jobs = (techObj.active_jobs || 0) + 1;
        saveTechnicians(techs);
    }
    
    return newTicket;
}

function updateTicketStatus(ticketId, nextStatus, note, technicianName) {
    const tickets = getTickets();
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    
    if (ticketIndex !== -1) {
        const ticket = tickets[ticketIndex];
        const prevStatus = ticket.status;
        ticket.status = nextStatus;
        
        // Custom actions based on status
        if (nextStatus === 'SELESAI') {
            ticket.date_completed = new Date().toISOString();
            if (ticket.estimated_cost && !ticket.final_cost) {
                ticket.final_cost = ticket.estimated_cost;
            }
            
            // Reduce active job for technician
            const techs = getTechnicians();
            const techObj = techs.find(tc => tc.name === ticket.technician);
            if (techObj) {
                techObj.active_jobs = Math.max(0, (techObj.active_jobs || 1) - 1);
                saveTechnicians(techs);
            }
        } else if (nextStatus === 'DIAMBIL') {
            ticket.status_acc = 'ACC';
            
            // AUTOMATED FINANCIAL LEDGER INTEGRATION (SM-01)
            const mutations = getMutations();
            const cost = ticket.final_cost || ticket.estimated_cost || 0;
            if (cost > 0) {
                const sessionUser = JSON.parse(sessionStorage.getItem('active_user')) || { username: 'admin' };
                mutations.unshift({
                    id: 'm-' + Date.now(),
                    date: new Date().toISOString(),
                    module: 'SERVICE',
                    ref_id: ticket.code,
                    type: 'MASUK',
                    category: 'Biaya Servis',
                    amount: cost,
                    pay_method: 'QRIS', // Default QRIS for cash flow simulation
                    note: `Pelunasan servis HP ${ticket.model} atas nama ${ticket.customer_name}`,
                    logged_by: sessionUser.username
                });
                saveMutations(mutations);
            }
        }
        
        ticket.logs.push({
            id: 'log-' + Date.now(),
            prev_status: prevStatus,
            next_status: nextStatus,
            note: note,
            technician: technicianName,
            timestamp: new Date().toISOString()
        });
        
        saveTickets(tickets);
        return ticket;
    }
    return null;
}

// Add technician helper
function addTechnician(techData) {
    const techs = getTechnicians();
    const defaultPhoto = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%2371717A"><circle cx="50" cy="35" r="25"/><path d="M15 85c0-20 15-30 35-30s35 10 35 30H15z"/></svg>';
    
    const newTech = {
        id: 'tech-' + Date.now(),
        name: techData.name,
        specialty: techData.specialty,
        phone: techData.phone || '',
        photo: techData.photo || defaultPhoto,
        password: techData.password || 'password123',
        status: 'AKTIF',
        rating: 5.0,
        active_jobs: 0
    };
    techs.push(newTech);
    saveTechnicians(techs);
    return newTech;
}

// Add custom mutation helper
function addMutation(mutData) {
    const mutations = getMutations();
    const sessionUser = JSON.parse(sessionStorage.getItem('active_user')) || { username: 'admin' };
    const newMut = {
        id: 'm-' + Date.now(),
        date: new Date().toISOString(),
        module: 'SERVICE',
        ref_id: mutData.ref_id || 'MANUAL',
        type: mutData.type, // 'MASUK' or 'KELUAR'
        category: mutData.category,
        amount: parseFloat(mutData.amount),
        pay_method: mutData.pay_method,
        note: mutData.note,
        logged_by: sessionUser.username
    };
    
    // If it is purchasing parts, deduct stock from inventory if simulated
    mutations.unshift(newMut);
    saveMutations(mutations);
    return newMut;
}

// Allocate spare part to ticket
function addPartToTicket(ticketId, partId, quantity) {
    const tickets = getTickets();
    const spareparts = getSpareparts();
    
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    const partIndex = spareparts.findIndex(p => p.id === partId);
    
    if (ticketIndex !== -1 && partIndex !== -1) {
        const ticket = tickets[ticketIndex];
        const part = spareparts[partIndex];
        
        if (part.stock >= quantity) {
            // Deduct stock
            part.stock -= quantity;
            saveSpareparts(spareparts);
            
            // Add to ticket
            const itemCost = part.price_sell * quantity;
            ticket.parts.push({
                id: part.id,
                name: part.name,
                quantity: quantity,
                price: part.price_sell
            });
            
            // Update estimates
            ticket.estimated_cost = (ticket.estimated_cost || 0) + itemCost;
            
            // Log it
            ticket.logs.push({
                id: 'log-' + Date.now(),
                prev_status: ticket.status,
                next_status: ticket.status,
                note: `Menambahkan sparepart: ${part.name} (x${quantity})`,
                technician: ticket.technician,
                timestamp: new Date().toISOString()
            });
            
            saveTickets(tickets);
            return { ticket, part };
        }
    }
    return null;
}

// Initialize on script load
initDatabase();

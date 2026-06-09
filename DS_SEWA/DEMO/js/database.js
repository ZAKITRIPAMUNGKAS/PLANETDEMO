/* ==========================================================================
   Planet Store Boyolali — DS_SEWA Database Logic (localStorage)
   ========================================================================== */

const DB_KEYS = {
    UNITS: 'planet_store_sewa_units',
    TRANSACTIONS: 'planet_store_sewa_transactions',
    CUSTOMERS: 'planet_store_sewa_customers',
    MUTATIONS: 'planet_store_sewa_mutations'
};

const INITIAL_UNITS = [
    { id: 'u1', name: 'iPhone 11', imei: '358923102938111', capacity: '128GB', color: 'Black', initial_condition: 'Mulus 95%, Battery Health 88%', current_condition: 'Mulus 95%, Battery Health 88%', rent_price: 75000, deposit: 500000, status: 'TERSEDIA', notes: 'Kamera jernih, charger bawaan', photo: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=400&q=80' },
    { id: 'u2', name: 'iPhone 12 Pro Max', imei: '356712398456222', capacity: '256GB', color: 'Pacific Blue', initial_condition: 'Layar terpasang tempered glass, casing mulus', current_condition: 'Layar terpasang tempered glass, casing mulus', rent_price: 150000, deposit: 1000000, status: 'DIPINJAM', notes: 'Unit premium, performa optimal', photo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80' },
    { id: 'u3', name: 'iPhone 13 Pro', imei: '861029384756333', capacity: '128GB', color: 'Sierra Blue', initial_condition: 'Mulus tanpa lecet, terpasang pelindung kamera', current_condition: 'Mulus tanpa lecet, terpasang pelindung kamera', rent_price: 180000, deposit: 1200000, status: 'TERSEDIA', notes: 'ProMotion display aktif', photo: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=400&q=80' },
    { id: 'u4', name: 'iPhone 14 Pro Max', imei: '352938475610444', capacity: '256GB', color: 'Deep Purple', initial_condition: 'Mulus 99% seperti baru', current_condition: 'Mulus 99% seperti baru', rent_price: 250000, deposit: 1500000, status: 'DIPINJAM', notes: 'Dynamic Island, kamera 48MP', photo: 'https://images.unsplash.com/photo-1673847401561-fcd75a7888c5?auto=format&fit=crop&w=400&q=80' },
    { id: 'u5', name: 'iPhone 15 Pro', imei: '352938475610555', capacity: '128GB', color: 'Natural Titanium', initial_condition: 'Bahan titanium ringan, terpasang pelindung layar', current_condition: 'Bahan titanium ringan, terpasang pelindung layar', rent_price: 280000, deposit: 1800000, status: 'MAINTENANCE', notes: 'Port USB-C, tombol Action', photo: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80' }
];

const INITIAL_CUSTOMERS = [
    { id: 'c1', name: 'Rendra Wijaya', phone: '081234567890', address: 'Jln. Pandanaran No. 12, Boyolali', identity_type: 'KTP', identity_no: '3309121804950002', guarantee: 'KTP + STNK Asli' },
    { id: 'c2', name: 'Dewi Lestari', phone: '087899112233', address: 'Perum Geriya Indah Blok C5, Boyolali', identity_type: 'KTP', identity_no: '3309154508970001', guarantee: 'KTP + NPWP' },
    { id: 'c3', name: 'Budi Santoso', phone: '085799988877', address: 'Kec. Musuk, Boyolali', identity_type: 'KTP', identity_no: '3309101202900003', guarantee: 'KTP + SIM A' }
];

const INITIAL_TRANSACTIONS = [
    {
        id: 't1',
        code: 'PJM-20260525-0001',
        customer_id: 'c1',
        customer_name: 'Rendra Wijaya',
        customer_phone: '081234567890',
        unit_id: 'u2',
        unit_name: 'iPhone 12 Pro Max',
        rent_date: '2026-05-25T10:00:00+07:00',
        planned_return_date: '2026-05-28T10:00:00+07:00',
        actual_return_date: null,
        duration_days: 3,
        rent_fee: 450000,
        deposit_amount: 1000000,
        deposit_refunded: false,
        late_fee_per_day: 150000,
        total_late_fee: 0,
        total_bill: 1450000, // rent + deposit
        payment_status: 'LUNAS', // Sewa + Deposit lunas didepan
        transaction_status: 'AKTIF',
        return_condition: '',
        notes: 'Sewa untuk dokumentasi acara pernikahan'
    },
    {
        id: 't2',
        code: 'PJM-20260520-0001',
        customer_id: 'c2',
        customer_name: 'Dewi Lestari',
        customer_phone: '087899112233',
        unit_id: 'u4',
        unit_name: 'iPhone 14 Pro Max',
        rent_date: '2026-05-20T09:00:00+07:00',
        planned_return_date: '2026-05-25T09:00:00+07:00',
        actual_return_date: null,
        duration_days: 5,
        rent_fee: 1250000,
        deposit_amount: 1500000,
        deposit_refunded: false,
        late_fee_per_day: 250000,
        total_late_fee: 750000, // Telat 3 hari (dari 25 Mei ke 28 Mei)
        total_bill: 2750000,
        payment_status: 'DP', // Masih ada outstanding
        transaction_status: 'AKTIF', // Masih aktif karena belum dipulangkan
        return_condition: '',
        notes: 'Sewa liburan ke Bali'
    },
    {
        id: 't3',
        code: 'PJM-20260522-0001',
        customer_id: 'c3',
        customer_name: 'Budi Santoso',
        customer_phone: '085799988877',
        unit_id: 'u1',
        unit_name: 'iPhone 11',
        rent_date: '2026-05-22T08:00:00+07:00',
        planned_return_date: '2026-05-24T08:00:00+07:00',
        actual_return_date: '2026-05-24T15:00:00+07:00',
        duration_days: 2,
        rent_fee: 150000,
        deposit_amount: 500000,
        deposit_refunded: true,
        late_fee_per_day: 75000,
        total_late_fee: 0,
        total_bill: 650000,
        payment_status: 'LUNAS',
        transaction_status: 'SELESAI',
        return_condition: 'Mulus sesuai kondisi awal',
        notes: 'Kembali tepat waktu'
    }
];

const INITIAL_MUTATIONS = [
    { id: 'm-1', date: '2026-05-25T10:00:00+07:00', module: 'RENT', ref_id: 'PJM-20260525-0001', type: 'MASUK', category: 'Biaya Sewa', amount: 450000, pay_method: 'TRANSFER', note: 'Sewa iPhone 12 Pro Max - Rendra Wijaya', logged_by: 'admin' },
    { id: 'm-2', date: '2026-05-25T10:00:00+07:00', module: 'RENT', ref_id: 'PJM-20260525-0001', type: 'MASUK', category: 'Deposit Pinjam', amount: 1000000, pay_method: 'TRANSFER', note: 'Deposit iPhone 12 Pro Max - Rendra Wijaya', logged_by: 'admin' },
    { id: 'm-3', date: '2026-05-20T09:00:00+07:00', module: 'RENT', ref_id: 'PJM-20260520-0001', type: 'MASUK', category: 'Biaya Sewa', amount: 1250000, pay_method: 'TUNAI', note: 'DP Sewa iPhone 14 Pro Max - Dewi Lestari', logged_by: 'admin' },
    { id: 'm-4', date: '2026-05-24T15:00:00+07:00', module: 'RENT', ref_id: 'PJM-20260522-0001', type: 'KELUAR', category: 'Refund Deposit', amount: 500000, pay_method: 'TUNAI', note: 'Refund deposit iPhone 11 - Budi Santoso', logged_by: 'admin' }
];

function initSewaDatabase() {
    const DB_VERSION = '1.1_sewa';
    const storedVersion = localStorage.getItem('planet_store_sewa_db_version');
    
    if (storedVersion !== DB_VERSION) {
        localStorage.setItem(DB_KEYS.UNITS, JSON.stringify(INITIAL_UNITS));
        localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
        localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
        localStorage.setItem(DB_KEYS.MUTATIONS, JSON.stringify(INITIAL_MUTATIONS));
        localStorage.setItem('planet_store_sewa_db_version', DB_VERSION);
        return;
    }

    if (!localStorage.getItem(DB_KEYS.UNITS)) {
        localStorage.setItem(DB_KEYS.UNITS, JSON.stringify(INITIAL_UNITS));
    }
    if (!localStorage.getItem(DB_KEYS.TRANSACTIONS)) {
        localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    }
    if (!localStorage.getItem(DB_KEYS.CUSTOMERS)) {
        localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(DB_KEYS.MUTATIONS)) {
        localStorage.setItem(DB_KEYS.MUTATIONS, JSON.stringify(INITIAL_MUTATIONS));
    }
}

function getUnits() {
    return JSON.parse(localStorage.getItem(DB_KEYS.UNITS)) || [];
}

function saveUnits(units) {
    localStorage.setItem(DB_KEYS.UNITS, JSON.stringify(units));
}

function getTransactions() {
    return JSON.parse(localStorage.getItem(DB_KEYS.TRANSACTIONS)) || [];
}

function saveTransactions(transactions) {
    localStorage.setItem(DB_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

function getCustomers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.CUSTOMERS)) || [];
}

function saveCustomers(customers) {
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(customers));
}

function getMutations() {
    return JSON.parse(localStorage.getItem(DB_KEYS.MUTATIONS)) || [];
}

function saveMutations(mutations) {
    localStorage.setItem(DB_KEYS.MUTATIONS, JSON.stringify(mutations));
}

initSewaDatabase();

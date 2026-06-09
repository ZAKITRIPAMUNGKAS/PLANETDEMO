/* ==========================================================================
   Planet Store Boyolali — DS_STORE Database Logic (localStorage)
   ========================================================================== */

const DB_KEYS = {
    STOCK: 'planet_store_jual_stock',
    BUY_TRANSACTIONS: 'planet_store_jual_buy_transactions',
    SELL_TRANSACTIONS: 'planet_store_jual_sell_transactions',
    CUSTOMERS: 'planet_store_sewa_customers', // Shared customer database
    MUTATIONS: 'planet_store_jual_mutations'
};

const INITIAL_STOCK = [
    { id: 'stk1', code: 'STK-0001', model: 'iPhone 11', imei: '358923102938111', capacity: '128GB', color: 'Black', condition: 'SECOND', grade: 'A', purchase_price: 3800000, selling_price: 4500000, source: 'BELI_DARI_CUSTOMER', kelengkapan: 'Box + OEM Charger', status: 'TERSEDIA', notes: 'Baterai Health 89%, layar original, mulus', date_entered: '2026-05-20T10:00:00+07:00', photo: '../../BRANDING_KIT/iphone11.png' },
    { id: 'stk2', code: 'STK-0002', model: 'iPhone 12 Pro Max', imei: '356712398456222', capacity: '256GB', color: 'Pacific Blue', condition: 'SECOND', grade: 'A', purchase_price: 7500000, selling_price: 8900000, source: 'SUPPLIER', kelengkapan: 'Box + Fullset Original', status: 'TERSEDIA', notes: 'Mulus 99% BH 91%', date_entered: '2026-05-22T14:30:00+07:00', photo: '../../BRANDING_KIT/iphone12.png' },
    { id: 'stk3', code: 'STK-0003', model: 'iPhone 13 Pro', imei: '861029384756333', capacity: '128GB', color: 'Sierra Blue', condition: 'SECOND', grade: 'B', purchase_price: 9200000, selling_price: 10800000, source: 'BELI_DARI_CUSTOMER', kelengkapan: 'Hanya Unit (Batangan)', status: 'RESERVED', notes: 'BH 84%, ada lecet kecil di frame', date_entered: '2026-05-24T11:00:00+07:00', photo: '../../BRANDING_KIT/iphone13.png' },
    { id: 'stk4', code: 'STK-0004', model: 'iPhone 14 Pro Max', imei: '352938475610444', capacity: '256GB', color: 'Deep Purple', condition: 'SECOND', grade: 'A', purchase_price: 13500000, selling_price: 15400000, source: 'SUPPLIER', kelengkapan: 'Box + Original Cable', status: 'TERJUAL', notes: 'BH 95%, mulus like new', date_entered: '2026-05-25T15:20:00+07:00', photo: '../../BRANDING_KIT/iphone14.png' },
    { id: 'stk5', code: 'STK-0005', model: 'iPhone 15 Pro', imei: '352938475610555', capacity: '128GB', color: 'Natural Titanium', condition: 'BARU', grade: '-', purchase_price: 17200000, selling_price: 19100000, source: 'SUPPLIER', kelengkapan: 'Brand New In Box (BNIB)', status: 'TERSEDIA', notes: 'Garansi resmi iBox 1 tahun', date_entered: '2026-05-26T09:00:00+07:00', photo: '../../BRANDING_KIT/iphone15.png' }
];

const INITIAL_BUY_TRANSACTIONS = [
    {
        id: 'b1',
        code: 'BLI-20260520-0001',
        source_type: 'CUSTOMER',
        customer_id: 'c1',
        customer_name: 'Rendra Wijaya',
        supplier_name: '',
        units: [{ model: 'iPhone 11', imei: '358923102938111', price: 3800000 }],
        total_buy_price: 3800000,
        pay_method: 'TRANSFER',
        date: '2026-05-20T10:00:00+07:00',
        logged_by: 'admin'
    },
    {
        id: 'b2',
        code: 'BLI-20260522-0001',
        source_type: 'SUPPLIER',
        customer_id: '',
        supplier_name: 'PT Sinar Abadi',
        units: [{ model: 'iPhone 12 Pro Max', imei: '356712398456222', price: 7500000 }],
        total_buy_price: 7500000,
        pay_method: 'TRANSFER',
        date: '2026-05-22T14:30:00+07:00',
        logged_by: 'admin'
    }
];

const INITIAL_SELL_TRANSACTIONS = [
    {
        id: 's1',
        code: 'JUL-20260525-0001',
        customer_id: 'c2',
        customer_name: 'Dewi Lestari',
        customer_phone: '087899112233',
        units: [{ stock_id: 'stk4', model: 'iPhone 14 Pro Max', imei: '352938475610444', price: 15400000 }],
        discount: 200000,
        total_pay: 15200000,
        pay_method: 'TRANSFER',
        dp_amount: 15200000,
        remaining_bill: 0,
        payment_status: 'LUNAS',
        date: '2026-05-25T15:20:00+07:00',
        logged_by: 'admin'
    }
];

const INITIAL_MUTATIONS = [
    { id: 'm-j1', date: '2026-05-20T10:00:00+07:00', module: 'STORE', ref_id: 'BLI-20260520-0001', type: 'KELUAR', category: 'Beli iPhone', amount: 3800000, pay_method: 'TRANSFER', note: 'Beli iPhone 11 - Rendra Wijaya', logged_by: 'admin' },
    { id: 'm-j2', date: '2026-05-22T14:30:00+07:00', module: 'STORE', ref_id: 'BLI-20260522-0001', type: 'KELUAR', category: 'Beli iPhone', amount: 7500000, pay_method: 'TRANSFER', note: 'Beli iPhone 12 Pro Max - PT Sinar Abadi', logged_by: 'admin' },
    { id: 'm-j3', date: '2026-05-25T15:20:00+07:00', module: 'STORE', ref_id: 'JUL-20260525-0001', type: 'MASUK', category: 'Jual iPhone', amount: 15200000, pay_method: 'TRANSFER', note: 'Jual iPhone 14 Pro Max - Dewi Lestari', logged_by: 'admin' }
];

const INITIAL_CUSTOMERS = [
    { id: 'c1', name: 'Rendra Wijaya', phone: '081234567890', address: 'Jln. Pandanaran No. 12, Boyolali', identity_type: 'KTP', identity_no: '3309121804950002', guarantee: 'KTP + STNK Asli' },
    { id: 'c2', name: 'Dewi Lestari', phone: '087899112233', address: 'Perum Geriya Indah Blok C5, Boyolali', identity_type: 'KTP', identity_no: '3309154508970001', guarantee: 'KTP + NPWP' },
    { id: 'c3', name: 'Budi Santoso', phone: '085799988877', address: 'Kec. Musuk, Boyolali', identity_type: 'KTP', identity_no: '3309101202900003', guarantee: 'KTP + SIM A' }
];

function initStoreDatabase() {
    const DB_VERSION = '1.1_store';
    const storedVersion = localStorage.getItem('planet_store_jual_db_version');

    if (storedVersion !== DB_VERSION) {
        localStorage.setItem(DB_KEYS.STOCK, JSON.stringify(INITIAL_STOCK));
        localStorage.setItem(DB_KEYS.BUY_TRANSACTIONS, JSON.stringify(INITIAL_BUY_TRANSACTIONS));
        localStorage.setItem(DB_KEYS.SELL_TRANSACTIONS, JSON.stringify(INITIAL_SELL_TRANSACTIONS));
        localStorage.setItem(DB_KEYS.MUTATIONS, JSON.stringify(INITIAL_MUTATIONS));
        localStorage.setItem('planet_store_jual_db_version', DB_VERSION);
    }

    if (!localStorage.getItem(DB_KEYS.CUSTOMERS)) {
        localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(DB_KEYS.STOCK)) {
        localStorage.setItem(DB_KEYS.STOCK, JSON.stringify(INITIAL_STOCK));
    }
    if (!localStorage.getItem(DB_KEYS.BUY_TRANSACTIONS)) {
        localStorage.setItem(DB_KEYS.BUY_TRANSACTIONS, JSON.stringify(INITIAL_BUY_TRANSACTIONS));
    }
    if (!localStorage.getItem(DB_KEYS.SELL_TRANSACTIONS)) {
        localStorage.setItem(DB_KEYS.SELL_TRANSACTIONS, JSON.stringify(INITIAL_SELL_TRANSACTIONS));
    }
    if (!localStorage.getItem(DB_KEYS.MUTATIONS)) {
        localStorage.setItem(DB_KEYS.MUTATIONS, JSON.stringify(INITIAL_MUTATIONS));
    }
}

function getStock() {
    return JSON.parse(localStorage.getItem(DB_KEYS.STOCK)) || [];
}

function saveStock(stock) {
    localStorage.setItem(DB_KEYS.STOCK, JSON.stringify(stock));
}

function getBuyTransactions() {
    return JSON.parse(localStorage.getItem(DB_KEYS.BUY_TRANSACTIONS)) || [];
}

function saveBuyTransactions(txs) {
    localStorage.setItem(DB_KEYS.BUY_TRANSACTIONS, JSON.stringify(txs));
}

function getSellTransactions() {
    return JSON.parse(localStorage.getItem(DB_KEYS.SELL_TRANSACTIONS)) || [];
}

function saveSellTransactions(txs) {
    localStorage.setItem(DB_KEYS.SELL_TRANSACTIONS, JSON.stringify(txs));
}

function getMutations() {
    return JSON.parse(localStorage.getItem(DB_KEYS.MUTATIONS)) || [];
}

function saveMutations(mutations) {
    localStorage.setItem(DB_KEYS.MUTATIONS, JSON.stringify(mutations));
}

function getCustomers() {
    return JSON.parse(localStorage.getItem(DB_KEYS.CUSTOMERS)) || [];
}

function saveCustomers(customers) {
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(customers));
}

initStoreDatabase();

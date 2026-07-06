/* ==========================================================================
   Planet Store Boyolali — DS_STORE Database Logic (localStorage)
   ========================================================================== */

const DB_KEYS = {
    STOCK: 'planet_store_jual_stock',
    BUY_TRANSACTIONS: 'planet_store_jual_buy_transactions',
    SELL_TRANSACTIONS: 'planet_store_jual_sell_transactions',
    CUSTOMERS: 'planet_store_sewa_customers', // Shared customer database
    MUTATIONS: 'planet_store_jual_mutations',
    SUPPLIERS: 'planet_store_jual_suppliers',
    DEBTS: 'planet_store_jual_debts',
    RECEIVABLES: 'planet_store_jual_receivables',
    BANK_ACCOUNTS: 'planet_store_jual_bank_accounts',
    BANK_MUTATIONS: 'planet_store_jual_bank_mutations',
    LOG_BARANG: 'planet_store_jual_log_barang',
    RETUR_BELI: 'planet_store_jual_retur_beli',
    RETUR_JUAL: 'planet_store_jual_retur_jual',
    PHONE_TYPES: 'planet_store_jual_phone_types'
};

const INITIAL_SUPPLIERS = [
    { id: 'spl1', name: 'PT Sinar Abadi', phone: '08122334455', address: 'Semarang, Jawa Tengah' },
    { id: 'spl2', name: 'Erajaya Distributor', phone: '08211223344', address: 'Jakarta Selatan' },
    { id: 'spl3', name: 'Planet Grosir Solo', phone: '08566778899', address: 'Solo, Jawa Tengah' }
];

const INITIAL_STOCK = [
    // HANDPHONE
    { id: 'stk1', type: 'HANDPHONE', code: 'STK-0001', model: 'iPhone 11', imei: '358923102938111', capacity: '128GB', color: 'Black', condition: 'SECOND', grade: 'A', purchase_price: 3800000, selling_price: 4500000, supplier_id: 'spl1', status: 'TERSEDIA', notes: 'BH 89%, mulus', date_entered: '2026-06-20T10:00:00+07:00' },
    { id: 'stk2', type: 'HANDPHONE', code: 'STK-0002', model: 'iPhone 12 Pro Max', imei: '356712398456222', capacity: '256GB', color: 'Pacific Blue', condition: 'SECOND', grade: 'A', purchase_price: 7500000, selling_price: 8900000, supplier_id: 'spl1', status: 'TERSEDIA', notes: 'BH 91%, fullset', date_entered: '2026-06-22T14:30:00+07:00' },
    { id: 'stk3', type: 'HANDPHONE', code: 'STK-0003', model: 'iPhone 13 Pro', imei: '861029384756333', capacity: '128GB', color: 'Sierra Blue', condition: 'SECOND', grade: 'B', purchase_price: 9200000, selling_price: 10800000, supplier_id: 'spl3', status: 'RESERVED', notes: 'BH 84%, lecet tipis', date_entered: '2026-06-24T11:00:00+07:00' },
    { id: 'stk4', type: 'HANDPHONE', code: 'STK-0004', model: 'iPhone 11', imei: '352938475610444', capacity: '128GB', color: 'White', condition: 'SECOND', grade: 'A', purchase_price: 3800000, selling_price: 4500000, supplier_id: 'spl3', status: 'TERJUAL', notes: 'BH 95%, mulus', date_entered: '2026-06-25T15:20:00+07:00' },
    { id: 'stk5', type: 'HANDPHONE', code: 'STK-0005', model: 'iPhone 15 Pro', imei: '352938475610555', capacity: '128GB', color: 'Natural Titanium', condition: 'BARU', grade: '-', purchase_price: 17200000, selling_price: 19100000, supplier_id: 'spl2', status: 'TERSEDIA', notes: 'BNIB Garansi iBox 1 Thn', date_entered: '2026-06-26T09:00:00+07:00' },
    // SIMCARD
    { id: 'stk6', type: 'SIMCARD', code: 'SIM-0001', model: 'Telkomsel Kuota 50GB', imei: '6281211112222', capacity: 'Perdana', color: 'Merah', condition: 'BARU', grade: '-', purchase_price: 75000, selling_price: 95000, supplier_id: 'spl3', status: 'TERSEDIA', notes: 'Aktif s.d 30 Sept 2026', date_entered: '2026-06-26T09:30:00+07:00' },
    { id: 'stk7', type: 'SIMCARD', code: 'SIM-0002', model: 'XL Axiata Akrab 30GB', imei: '6287733334444', capacity: 'Perdana', color: 'Biru', condition: 'BARU', grade: '-', purchase_price: 45000, selling_price: 60000, supplier_id: 'spl3', status: 'TERSEDIA', notes: 'Aktif s.d 15 Des 2026', date_entered: '2026-06-26T09:40:00+07:00' },
    // ACCESSORIES
    { id: 'stk8', type: 'ACCESSORIES', code: 'ACC-0001', model: 'Casing Silicone MagSafe iPhone 15 Pro', imei: 'CS-15P-MAG', capacity: 'Aksesoris', color: 'Clear/Transparan', condition: 'BARU', grade: '-', purchase_price: 150000, selling_price: 250000, supplier_id: 'spl2', status: 'TERSEDIA', notes: 'Original OEM Pack', date_entered: '2026-06-26T10:00:00+07:00' },
    { id: 'stk9', type: 'ACCESSORIES', code: 'ACC-0002', model: 'Adapter Apple USB-C 20W Power Adapter', imei: 'AD-20W-USB', capacity: 'Aksesoris', color: 'White', condition: 'BARU', grade: '-', purchase_price: 200000, selling_price: 350000, supplier_id: 'spl2', status: 'TERSEDIA', notes: 'Original iBox Pack', date_entered: '2026-06-26T10:15:00+07:00' }
];

const INITIAL_BUY_TRANSACTIONS = [
    {
        id: 'b1',
        code: 'BLI-20260620-0001',
        source_type: 'CUSTOMER',
        customer_id: 'c1',
        customer_name: 'Rendra Wijaya',
        supplier_id: '',
        supplier_name: '',
        item_type: 'HANDPHONE',
        units: [{ model: 'iPhone 11', imei: '358923102938111', price: 3800000 }],
        total_buy_price: 3800000,
        pay_method: 'TRANSFER',
        bank_account: 'BCA',
        date: '2026-06-20T10:00:00+07:00',
        logged_by: 'admin'
    },
    {
        id: 'b2',
        code: 'BLI-20260622-0001',
        source_type: 'SUPPLIER',
        customer_id: '',
        customer_name: '',
        supplier_id: 'spl1',
        supplier_name: 'PT Sinar Abadi',
        item_type: 'HANDPHONE',
        units: [{ model: 'iPhone 12 Pro Max', imei: '356712398456222', price: 7500000 }],
        total_buy_price: 7500000,
        pay_method: 'UTANG',
        bank_account: '',
        date: '2026-06-22T14:30:00+07:00',
        logged_by: 'admin'
    }
];

const INITIAL_SELL_TRANSACTIONS = [
    {
        id: 's1',
        code: 'JUL-20260625-0001',
        customer_id: 'c2',
        customer_name: 'Dewi Lestari',
        customer_phone: '087899112233',
        item_type: 'HANDPHONE',
        units: [{ stock_id: 'stk4', model: 'iPhone 11', imei: '352938475610444', price: 4500000 }],
        discount: 0,
        total_pay: 4500000,
        pay_method: 'PIUTANG',
        dp_amount: 1500000,
        remaining_bill: 3000000,
        payment_status: 'DP',
        date: '2026-06-25T15:20:00+07:00',
        logged_by: 'admin'
    }
];

const INITIAL_MUTATIONS = [
    { id: 'm-j1', date: '2026-06-20T10:00:00+07:00', module: 'STORE', ref_id: 'BLI-20260620-0001', type: 'KELUAR', category: 'Pembelian HP', amount: 3800000, pay_method: 'TRANSFER', note: 'Beli iPhone 11 - Rendra Wijaya', logged_by: 'admin' },
    { id: 'm-j2', date: '2026-06-25T15:20:00+07:00', module: 'STORE', ref_id: 'JUL-20260625-0001', type: 'MASUK', category: 'Uang Muka Penjualan', amount: 1500000, pay_method: 'TRANSFER', note: 'DP Penjualan iPhone 11 - Dewi Lestari', logged_by: 'admin' }
];

const INITIAL_CUSTOMERS = [
    { id: 'c1', name: 'Rendra Wijaya', phone: '081234567890', address: 'Jln. Pandanaran No. 12, Boyolali', identity_type: 'KTP', identity_no: '3309121804950002', guarantee: 'KTP + STNK Asli' },
    { id: 'c2', name: 'Dewi Lestari', phone: '087899112233', address: 'Perum Geriya Indah Blok C5, Boyolali', identity_type: 'KTP', identity_no: '3309154508970001', guarantee: 'KTP + NPWP' },
    { id: 'c3', name: 'Budi Santoso', phone: '085799988877', address: 'Kec. Musuk, Boyolali', identity_type: 'KTP', identity_no: '3309101202900003', guarantee: 'KTP + SIM A' }
];

const INITIAL_DEBTS = [
    { id: 'deb1', code: 'BLI-20260622-0001', supplier_id: 'spl1', supplier_name: 'PT Sinar Abadi', total_amount: 7500000, paid_amount: 0, due_date: '2026-07-22', status: 'BELUM LUNAS', date: '2026-06-22T14:30:00+07:00' }
];

const INITIAL_RECEIVABLES = [
    { id: 'rec1', code: 'JUL-20260625-0001', customer_id: 'c2', customer_name: 'Dewi Lestari', total_amount: 4500000, paid_amount: 1500000, due_date: '2026-07-25', status: 'DP', date: '2026-06-25T15:20:00+07:00' }
];

const INITIAL_BANK_ACCOUNTS = [
    { id: 'bca', name: 'BCA (Planet Store)', account_number: '128-099-0099', balance: 99000000 },
    { id: 'mandiri', name: 'MANDIRI (Planet)', account_number: '138-000-111222', balance: 3000000 },
    { id: 'cash', name: 'Kas Kecil (Cash)', account_number: 'CASH-DRAWER', balance: 1500000 }
];

const INITIAL_LOG_BARANG = [
    { id: 'log1', stock_code: 'STK-0001', model: 'iPhone 11', action: 'PEMBELIAN', date: '2026-06-20T10:00:00+07:00', user: 'admin', description: 'Masuk melalui transaksi beli dari Rendra Wijaya' },
    { id: 'log2', stock_code: 'STK-0002', model: 'iPhone 12 Pro Max', action: 'PEMBELIAN', date: '2026-06-22T14:30:00+07:00', user: 'admin', description: 'Masuk dari PT Sinar Abadi' },
    { id: 'log3', stock_code: 'STK-0004', model: 'iPhone 11', action: 'PEMBELIAN', date: '2026-06-25T12:00:00+07:00', user: 'admin', description: 'Masuk dari Supplier' },
    { id: 'log4', stock_code: 'STK-0004', model: 'iPhone 11', action: 'PENJUALAN', date: '2026-06-25T15:20:00+07:00', user: 'admin', description: 'Terjual ke Dewi Lestari' }
];

const INITIAL_PHONE_TYPES = [
    { id: 'pt1', brand: 'Apple', model: 'iPhone 11', capacity: '64GB/128GB/256GB' },
    { id: 'pt2', brand: 'Apple', model: 'iPhone 12 Pro Max', capacity: '128GB/256GB/512GB' },
    { id: 'pt3', brand: 'Apple', model: 'iPhone 13 Pro', capacity: '128GB/256GB/512GB/1TB' },
    { id: 'pt4', brand: 'Apple', model: 'iPhone 15 Pro', capacity: '128GB/256GB/512GB/1TB' }
];

const INITIAL_RETUR_BELI = [
    {
        id: 'rbl1',
        code: 'RBL-20260703-0001',
        buy_code: 'BLI-20260703-0012',
        stock_id: 'stk3',
        model: 'iPhone 11 128GB',
        imei: '356712398455113',
        supplier_name: 'CV INDO MULTIMEDIA',
        amount: 3800000,
        reason: 'LCD Cacat Produksi',
        date: new Date(Date.now() - 3*24*60*60*1000).toISOString()
    }
];

const INITIAL_RETUR_JUAL = [
    {
        id: 'rjl1',
        code: 'RJL-20260704-0001',
        sell_code: 'JUL-20260704-0021',
        stock_id: 'stk4',
        model: 'iPhone 15 Pro Max',
        imei: '356712398455120',
        customer_name: 'Budi Santoso',
        amount: 14500000,
        reason: 'Salah beli kapasitas (minta 256GB)',
        date: new Date(Date.now() - 2*24*60*60*1000).toISOString()
    }
];

function initStoreDatabase() {
    const DB_VERSION = '2.1_store_retur_updates';
    const storedVersion = localStorage.getItem('planet_store_jual_db_version');

    if (storedVersion !== DB_VERSION) {
        localStorage.setItem(DB_KEYS.STOCK, JSON.stringify(INITIAL_STOCK));
        localStorage.setItem(DB_KEYS.BUY_TRANSACTIONS, JSON.stringify(INITIAL_BUY_TRANSACTIONS));
        localStorage.setItem(DB_KEYS.SELL_TRANSACTIONS, JSON.stringify(INITIAL_SELL_TRANSACTIONS));
        localStorage.setItem(DB_KEYS.MUTATIONS, JSON.stringify(INITIAL_MUTATIONS));
        localStorage.setItem(DB_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
        localStorage.setItem(DB_KEYS.DEBTS, JSON.stringify(INITIAL_DEBTS));
        localStorage.setItem(DB_KEYS.RECEIVABLES, JSON.stringify(INITIAL_RECEIVABLES));
        localStorage.setItem(DB_KEYS.BANK_ACCOUNTS, JSON.stringify(INITIAL_BANK_ACCOUNTS));
        localStorage.setItem(DB_KEYS.LOG_BARANG, JSON.stringify(INITIAL_LOG_BARANG));
        localStorage.setItem(DB_KEYS.PHONE_TYPES, JSON.stringify(INITIAL_PHONE_TYPES));
        localStorage.setItem(DB_KEYS.RETUR_BELI, JSON.stringify(INITIAL_RETUR_BELI));
        localStorage.setItem(DB_KEYS.RETUR_JUAL, JSON.stringify(INITIAL_RETUR_JUAL));
        localStorage.setItem(DB_KEYS.BANK_MUTATIONS, JSON.stringify([]));
        localStorage.setItem('planet_store_jual_db_version', DB_VERSION);
    }

    // Ensure all DB_KEYS exist
    Object.keys(DB_KEYS).forEach(key => {
        if (!localStorage.getItem(DB_KEYS[key])) {
            localStorage.setItem(DB_KEYS[key], JSON.stringify([]));
        }
    });

    // Make sure customer DB is loaded
    if (!localStorage.getItem(DB_KEYS.CUSTOMERS)) {
        localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
}

// Global functions to read/write database tables
function getStock() { return JSON.parse(localStorage.getItem(DB_KEYS.STOCK)) || []; }
function saveStock(data) { localStorage.setItem(DB_KEYS.STOCK, JSON.stringify(data)); }

function getBuyTransactions() { return JSON.parse(localStorage.getItem(DB_KEYS.BUY_TRANSACTIONS)) || []; }
function saveBuyTransactions(data) { localStorage.setItem(DB_KEYS.BUY_TRANSACTIONS, JSON.stringify(data)); }

function getSellTransactions() { return JSON.parse(localStorage.getItem(DB_KEYS.SELL_TRANSACTIONS)) || []; }
function saveSellTransactions(data) { localStorage.setItem(DB_KEYS.SELL_TRANSACTIONS, JSON.stringify(data)); }

function getMutations() { return JSON.parse(localStorage.getItem(DB_KEYS.MUTATIONS)) || []; }
function saveMutations(data) { localStorage.setItem(DB_KEYS.MUTATIONS, JSON.stringify(data)); }

// Shared/Common Database handlers
function getCustomers() { return JSON.parse(localStorage.getItem(DB_KEYS.CUSTOMERS)) || []; }
function saveCustomers(data) { localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(data)); }

function getSuppliers() { return JSON.parse(localStorage.getItem(DB_KEYS.SUPPLIERS)) || []; }
function saveSuppliers(data) { localStorage.setItem(DB_KEYS.SUPPLIERS, JSON.stringify(data)); }

function getDebts() { return JSON.parse(localStorage.getItem(DB_KEYS.DEBTS)) || []; }
function saveDebts(data) { localStorage.setItem(DB_KEYS.DEBTS, JSON.stringify(data)); }

function getReceivables() { return JSON.parse(localStorage.getItem(DB_KEYS.RECEIVABLES)) || []; }
function saveReceivables(data) { localStorage.setItem(DB_KEYS.RECEIVABLES, JSON.stringify(data)); }

function getBankAccounts() { return JSON.parse(localStorage.getItem(DB_KEYS.BANK_ACCOUNTS)) || []; }
function saveBankAccounts(data) { localStorage.setItem(DB_KEYS.BANK_ACCOUNTS, JSON.stringify(data)); }

function getBankMutations() { return JSON.parse(localStorage.getItem(DB_KEYS.BANK_MUTATIONS)) || []; }
function saveBankMutations(data) { localStorage.setItem(DB_KEYS.BANK_MUTATIONS, JSON.stringify(data)); }

function getLogBarang() { return JSON.parse(localStorage.getItem(DB_KEYS.LOG_BARANG)) || []; }
function saveLogBarang(data) { localStorage.setItem(DB_KEYS.LOG_BARANG, JSON.stringify(data)); }

function getReturBeli() { return JSON.parse(localStorage.getItem(DB_KEYS.RETUR_BELI)) || []; }
function saveReturBeli(data) { localStorage.setItem(DB_KEYS.RETUR_BELI, JSON.stringify(data)); }

function getReturJual() { return JSON.parse(localStorage.getItem(DB_KEYS.RETUR_JUAL)) || []; }
function saveReturJual(data) { localStorage.setItem(DB_KEYS.RETUR_JUAL, JSON.stringify(data)); }

function getPhoneTypes() { return JSON.parse(localStorage.getItem(DB_KEYS.PHONE_TYPES)) || []; }
function savePhoneTypes(data) { localStorage.setItem(DB_KEYS.PHONE_TYPES, JSON.stringify(data)); }

// Initialize DB
initStoreDatabase();

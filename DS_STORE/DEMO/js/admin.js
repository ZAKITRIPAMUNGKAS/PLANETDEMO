/* ==========================================================================
   Planet Store Boyolali — DS_STORE Frontend Controller Logic
   ========================================================================== */

let currentFilter = 'ALL';
let currentPurchaseCategory = 'ALL';
let currentReportSection = 'beli';

// Helper to format currency to IDR
function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(num || 0);
}

// Format date to readable string
function formatDateTime(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Generate unique transaction codes
function generateTransactionCode(prefix) {
    const today = new Date();
    const yyyymmdd = today.toISOString().slice(0,10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${yyyymmdd}-${rand}`;
}

// Switch tabs directly
function showTabDirect(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    const target = document.getElementById(`tab-content-${tabId}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        }
    });

    // Populate dropdowns & trigger view renders
    if (tabId === 'purchases') {
        populateSupplierSelect();
        populateCustomerSelect('buy-customer-id');
    } else if (tabId === 'sales') {
        populateCustomerSelect('sell-customer-id');
        populateStockSelect();
    }

    renderView(tabId);
}

// Router to render correct tab views
function renderView(viewName) {
    switch(viewName) {
        case 'overview':
            renderDashboard();
            break;
        case 'stock':
            renderStockTable();
            break;
        case 'purchases':
            renderPembelianTable();
            break;
        case 'sales':
            renderPenjualanTable();
            break;
        case 'pembayaran':
            renderUtangTable();
            renderPiutangTable();
            break;
        case 'riwayat-barang':
            renderLogBarangTable();
            break;
        case 'customers':
            renderCustomerTable();
            break;
        case 'mutations':
            renderMutasiTable();
            break;
        case 'laporan':
            renderReportView();
            break;
    }
}

// Dashboard Calculation & Chart rendering
function renderDashboard() {
    const buyTxs = getBuyTransactions();
    const sellTxs = getSellTransactions();
    const debts = getDebts();
    const receivables = getReceivables();
    const mutations = getMutations();
    const bankAccounts = getBankAccounts();
    const stock = getStock();

    // Sum totals
    const totalBeli = buyTxs.reduce((sum, tx) => sum + tx.total_buy_price, 0);
    const totalJual = sellTxs.reduce((sum, tx) => sum + tx.total_pay, 0);
    const totalUtang = debts.reduce((sum, d) => d.status !== 'LUNAS' ? sum + (d.total_amount - d.paid_amount) : sum, 0);
    const totalPiutang = receivables.reduce((sum, r) => r.status !== 'LUNAS' ? sum + (r.total_amount - r.paid_amount) : sum, 0);

    // Bank Cash Balance
    const cashBal = bankAccounts.reduce((sum, b) => sum + b.balance, 0);
    
    // Income vs Outcome
    const totalInc = mutations.reduce((sum, m) => m.type === 'MASUK' ? sum + m.amount : sum, 0);
    const totalOut = mutations.reduce((sum, m) => m.type === 'KELUAR' ? sum + m.amount : sum, 0);
    const grossProfit = totalJual - buyTxs.reduce((sum, tx) => sum + tx.total_buy_price, 0);

    // Update HTML Metrics
    document.getElementById('metric-total-beli').innerText = formatRupiah(totalBeli);
    document.getElementById('metric-total-jual').innerText = formatRupiah(totalJual);
    document.getElementById('metric-utang').innerText = formatRupiah(totalUtang);
    document.getElementById('metric-piutang').innerText = formatRupiah(totalPiutang);

    document.getElementById('cash-balance').innerText = formatRupiah(cashBal);
    document.getElementById('total-income').innerText = formatRupiah(totalInc);
    document.getElementById('total-outcome').innerText = formatRupiah(totalOut);
    document.getElementById('gross-profit').innerText = formatRupiah(grossProfit > 0 ? grossProfit : 0);

    // Update Product Info
    const hpStock = stock.filter(item => item.type === 'HANDPHONE' && item.status === 'TERSEDIA');
    const accStock = stock.filter(item => item.type === 'ACCESSORIES' && item.status === 'TERSEDIA');
    
    document.getElementById('top-phone-month').innerText = hpStock.length > 0 ? `${hpStock[0].model} (${hpStock.length} unit ready)` : 'Semua Terjual';
    document.getElementById('top-acc-month').innerText = accStock.length > 0 ? `${accStock[0].model} (${accStock.length} unit ready)` : 'Semua Terjual';

    // Draw Top 3 Sales Chart (SVG)
    drawTopSalesChart();
}

// Draws the Top 3 Sales graph
function drawTopSalesChart() {
    const svg = document.getElementById('top-sales-chart');
    if (!svg) return;

    const data = [
        { name: 'AJIK', value: 17 },
        { name: 'RYAN', value: 4 }
    ];

    svg.innerHTML = `
        <!-- Grid Lines -->
        <line x1="30" y1="50" x2="380" y2="50" stroke="#f1f5f9" stroke-dasharray="4" />
        <line x1="30" y1="110" x2="380" y2="110" stroke="#f1f5f9" stroke-dasharray="4" />
        <line x1="30" y1="170" x2="380" y2="170" stroke="#cbd5e1" stroke-width="1" />
    `;
    
    let xOffset = 80;
    const chartHeight = 130;
    const maxVal = 20;

    data.forEach((item, index) => {
        const barHeight = (item.value / maxVal) * chartHeight;
        const x = xOffset + (index * 130);
        const y = 170 - barHeight;

        // Draw bar rectangle
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', y);
        rect.setAttribute('width', '45');
        rect.setAttribute('height', barHeight);
        rect.setAttribute('fill', '#2563EB'); 
        rect.setAttribute('rx', '6');
        
        // Draw Label Text
        const textName = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textName.setAttribute('x', x + 22.5);
        textName.setAttribute('y', 188);
        textName.setAttribute('text-anchor', 'middle');
        textName.setAttribute('fill', '#64748b');
        textName.setAttribute('font-size', '11px');
        textName.setAttribute('font-weight', '700');
        textName.textContent = item.name;

        // Draw Value Text
        const textVal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textVal.setAttribute('x', x + 22.5);
        textVal.setAttribute('y', y - 8);
        textVal.setAttribute('text-anchor', 'middle');
        textVal.setAttribute('fill', '#0f172a');
        textVal.setAttribute('font-size', '11px');
        textVal.setAttribute('font-weight', '800');
        textVal.textContent = `${item.value} Unit`;

        svg.appendChild(rect);
        svg.appendChild(textName);
        svg.appendChild(textVal);
    });
}

// Modal Controllers
function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Dynamic Option Populators
function populateSupplierSelect() {
    const sel = document.getElementById('buy-supplier-id');
    if (!sel) return;
    const suppliers = getSuppliers();
    sel.innerHTML = suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function populateCustomerSelect(selectId) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const customers = getCustomers();
    sel.innerHTML = customers.map(c => `<option value="${c.id}">${c.name} (${c.phone})</option>`).join('');
}

function populateStockSelect() {
    const sel = document.getElementById('sell-stock-id');
    if (!sel) return;
    const stock = getStock().filter(item => item.status === 'TERSEDIA');
    sel.innerHTML = stock.map(s => `<option value="${s.id}">${s.code} - ${s.model} [${s.imei}] - ${formatRupiah(s.selling_price)}</option>`).join('');
    
    if (stock.length > 0) {
        document.getElementById('sell-price-final').value = stock[0].selling_price;
    }
    
    sel.onchange = function() {
        const selected = stock.find(item => item.id === sel.value);
        if (selected) {
            document.getElementById('sell-price-final').value = selected.selling_price;
        }
    };
}

function toggleBuySource() {
    const type = document.getElementById('buy-source-type').value;
    if (type === 'CUSTOMER') {
        document.getElementById('buy-customer-group').style.display = 'block';
        document.getElementById('buy-supplier-group').style.display = 'none';
    } else {
        document.getElementById('buy-customer-group').style.display = 'none';
        document.getElementById('buy-supplier-group').style.display = 'block';
    }
}

function toggleSellPayment() {
    const method = document.getElementById('sell-pay-method').value;
    const dpGroup = document.getElementById('sell-dp-group');
    if (method === 'PIUTANG') {
        dpGroup.style.display = 'block';
    } else {
        dpGroup.style.display = 'none';
    }
}

// Table Renderers
function renderStockTable() {
    const body = document.getElementById('stock-table-body');
    if (!body) return;
    const stock = getStock();
    
    const query = document.getElementById('stock-search').value.toLowerCase();
    
    const filtered = stock.filter(s => {
        const matchesFilter = currentFilter === 'ALL' || s.status === currentFilter;
        const matchesQuery = s.model.toLowerCase().includes(query) || s.imei.toLowerCase().includes(query) || s.code.toLowerCase().includes(query);
        return matchesFilter && matchesQuery;
    });

    body.innerHTML = filtered.map(s => `
        <tr>
            <td><strong>${s.code}</strong></td>
            <td><span class="badge badge-info">${s.type}</span></td>
            <td>${s.model} [${s.capacity} - ${s.color}]</td>
            <td><span class="font-mono">${s.imei}</span></td>
            <td>${s.condition} (${s.grade})</td>
            <td>${formatRupiah(s.purchase_price)}</td>
            <td><strong>${formatRupiah(s.selling_price)}</strong></td>
            <td><span class="badge ${s.status === 'TERSEDIA' ? 'badge-success' : 'badge-danger'}">${s.status}</span></td>
            <td><button class="btn btn-secondary" onclick="viewStockDetail('${s.id}')">Detail</button></td>
        </tr>
    `).join('');
}

function viewStockDetail(id) {
    const s = getStock().find(item => item.id === id);
    if (!s) return;

    // Calculate margin
    const marginNominal = s.selling_price - s.purchase_price;
    const marginPercent = s.purchase_price > 0 ? Math.round((marginNominal / s.purchase_price) * 100) : 0;

    const statusBadge = s.status === 'TERSEDIA' ? 
        '<span class="badge badge-success">Tersedia</span>' : 
        '<span class="badge badge-danger">Terjual</span>';

    document.getElementById('stock-detail-body').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Header Info -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-soft); padding-bottom: 12px;">
                <div>
                    <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-title); margin:0;">${s.model}</h3>
                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${s.code} · ${s.type}</span>
                </div>
                <div>
                    ${statusBadge}
                </div>
            </div>

            <!-- Detail Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <!-- Left Side: Specs -->
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div class="info-block">
                        <span class="info-label">IMEI / SN / Barcode</span>
                        <span class="info-value" style="font-family: 'Space Grotesk', monospace; font-size: 0.9rem;">${s.imei}</span>
                    </div>
                    <div class="info-block">
                        <span class="info-label">Spesifikasi</span>
                        <span class="info-value">${s.capacity} · ${s.color}</span>
                    </div>
                    <div class="info-block">
                        <span class="info-label">Kondisi / Grade</span>
                        <span class="info-value">${s.condition} (Grade ${s.grade})</span>
                    </div>
                </div>

                <!-- Right Side: Pricing -->
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <div class="info-block">
                        <span class="info-label">Harga Beli (Modal)</span>
                        <span class="info-value" style="color: var(--text-title);">${formatRupiah(s.purchase_price)}</span>
                    </div>
                    <div class="info-block">
                        <span class="info-label">Harga Jual</span>
                        <span class="info-value" style="color: var(--accent);">${formatRupiah(s.selling_price)}</span>
                    </div>
                    <div class="info-block" style="background-color: var(--accent-light); border-color: rgba(0,82,255,0.15);">
                        <span class="info-label" style="color: var(--accent);">Estimasi Margin Laba</span>
                        <span class="info-value" style="color: var(--accent);">${formatRupiah(marginNominal)} (${marginPercent}%)</span>
                    </div>
                </div>
            </div>

            <!-- Notes QC -->
            <div class="info-block" style="width: 100%;">
                <span class="info-label">Catatan QC / Keterangan</span>
                <span class="info-value" style="font-weight: 500; font-size: 0.85rem; line-height: 1.5; color: var(--text-body);">${s.notes || 'Tidak ada catatan QC.'}</span>
            </div>
        </div>
    `;
    openModal('modal-stock-detail');
}

function filterStock(status) {
    currentFilter = status;
    
    // Toggle active class on filters
    const btns = document.querySelectorAll('#tab-content-stock .filter-options button');
    btns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(status)) {
            btn.classList.add('active');
        }
    });

    renderStockTable();
}

function filterPurchaseCategory(category) {
    currentPurchaseCategory = category;
    
    // Toggle active class on sub-tab-btns
    const btns = document.querySelectorAll('#tab-content-purchases .sub-tabs-container button');
    btns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(category)) {
            btn.classList.add('active');
        }
    });

    renderPembelianTable();
}

function renderPembelianTable() {
    const body = document.getElementById('pembelian-table-body');
    if (!body) return;
    const buyTxs = getBuyTransactions();
    
    const filtered = buyTxs.filter(tx => currentPurchaseCategory === 'ALL' || tx.item_type === currentPurchaseCategory);

    body.innerHTML = filtered.map(tx => `
        <tr>
            <td><strong>${tx.code}</strong></td>
            <td><span class="badge ${tx.source_type === 'SUPPLIER' ? 'badge-info' : 'badge-warning'}">${tx.source_type}</span></td>
            <td>${tx.source_type === 'SUPPLIER' ? tx.supplier_name : tx.customer_name}</td>
            <td><span class="badge badge-success">${tx.item_type}</span></td>
            <td>${tx.units.map(u => u.model).join(', ')}</td>
            <td><strong>${formatRupiah(tx.total_buy_price)}</strong></td>
            <td><span class="badge badge-info">${tx.pay_method}</span></td>
            <td>${formatDateTime(tx.date)}</td>
        </tr>
    `).join('');
}

function renderPenjualanTable() {
    const body = document.getElementById('penjualan-table-body');
    if (!body) return;
    const sellTxs = getSellTransactions();
    body.innerHTML = sellTxs.map(tx => `
        <tr>
            <td><strong>${tx.code}</strong></td>
            <td>${tx.customer_name}</td>
            <td>${tx.units.map(u => u.model).join(', ')}</td>
            <td><strong>${formatRupiah(tx.total_pay)}</strong></td>
            <td>${formatRupiah(tx.remaining_bill)}</td>
            <td><span class="badge ${tx.payment_status === 'LUNAS' ? 'badge-success' : 'badge-warning'}">${tx.payment_status}</span></td>
            <td>${formatDateTime(tx.date)}</td>
            <td>
                <button class="btn btn-secondary" onclick="viewReceipt('${tx.id}')">
                    <i class="ph ph-printer"></i> Nota
                </button>
            </td>
        </tr>
    `).join('');
}

function renderUtangTable() {
    const body = document.getElementById('utang-table-body');
    if (!body) return;
    const debts = getDebts();
    body.innerHTML = debts.map(d => `
        <tr>
            <td><strong>${d.code}</strong></td>
            <td>${d.supplier_name}</td>
            <td><strong>${formatRupiah(d.total_amount)}</strong></td>
            <td>${formatRupiah(d.paid_amount)}</td>
            <td>
                ${d.status !== 'LUNAS' ? `<button class="btn btn-success" onclick="payDebt('${d.id}')">Bayar Lunas</button>` : 'Lunas'}
            </td>
        </tr>
    `).join('');
}

function renderPiutangTable() {
    const body = document.getElementById('piutang-table-body');
    if (!body) return;
    const receivables = getReceivables();
    body.innerHTML = receivables.map(r => `
        <tr>
            <td><strong>${r.code}</strong></td>
            <td>${r.customer_name}</td>
            <td><strong>${formatRupiah(r.total_amount)}</strong></td>
            <td>${formatRupiah(r.paid_amount)}</td>
            <td>
                ${r.status !== 'LUNAS' ? `<button class="btn btn-success" onclick="collectReceivable('${r.id}')">Pelunasan</button>` : 'Lunas'}
            </td>
        </tr>
    `).join('');
}

function renderMutasiTable() {
    const body = document.getElementById('mutasi-table-body');
    if (!body) return;
    const mutations = getMutations();
    body.innerHTML = mutations.map(m => `
        <tr>
            <td>${formatDateTime(m.date)}</td>
            <td><strong>${m.ref_id || '-'}</strong></td>
            <td>${m.category}</td>
            <td><span class="badge ${m.type === 'MASUK' ? 'badge-success' : 'badge-danger'}">${m.type}</span></td>
            <td><strong>${formatRupiah(m.amount)}</strong></td>
            <td><span class="badge badge-info">${m.pay_method}</span></td>
            <td>${m.note}</td>
        </tr>
    `).join('');
}

function renderLogBarangTable() {
    const body = document.getElementById('log-barang-table-body');
    if (!body) return;
    const logs = getLogBarang();
    body.innerHTML = logs.map(l => `
        <tr>
            <td>${formatDateTime(l.date)}</td>
            <td><strong>${l.stock_code}</strong></td>
            <td>${l.model}</td>
            <td><span class="badge badge-info">${l.action}</span></td>
            <td>${l.user}</td>
            <td>${l.description}</td>
        </tr>
    `).join('');
}

function renderCustomerTable() {
    const body = document.getElementById('customer-table-body');
    if (!body) return;
    const customers = getCustomers();
    body.innerHTML = customers.map(c => `
        <tr>
            <td><strong>${c.name}</strong></td>
            <td>${c.phone}</td>
            <td>${c.address}</td>
            <td>${c.identity_type || 'KTP'}: ${c.identity_no || '-'}</td>
        </tr>
    `).join('');
}

function switchReportTab(reportName) {
    currentReportSection = reportName;
    
    // Toggle active class
    const btns = document.querySelectorAll('#tab-content-laporan .sub-tabs-container button');
    btns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(reportName)) {
            btn.classList.add('active');
        }
    });

    // Show/hide sections
    document.querySelectorAll('.report-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    const target = document.getElementById(`report-${reportName}`);
    if (target) target.style.display = 'block';

    renderReportView();
}

// Switch nested report sub-views
let currentStokReportView = 'global';
let currentPayReportView = 'utang';
let currentReturReportView = 'beli';

function toggleStokReportView(type) {
    currentStokReportView = type;
    document.getElementById('stok-rep-global-btn').classList.toggle('active', type === 'global');
    document.getElementById('stok-rep-detail-btn').classList.toggle('active', type === 'detail');
    document.getElementById('stok-report-global-view').style.display = type === 'global' ? 'block' : 'none';
    document.getElementById('stok-report-detail-view').style.display = type === 'detail' ? 'block' : 'none';
    renderReportView();
}

function togglePayReportView(type) {
    currentPayReportView = type;
    document.getElementById('pay-rep-utang-btn').classList.toggle('active', type === 'utang');
    document.getElementById('pay-rep-piutang-btn').classList.toggle('active', type === 'piutang');
    document.getElementById('pay-report-utang-view').style.display = type === 'utang' ? 'block' : 'none';
    document.getElementById('pay-report-piutang-view').style.display = type === 'piutang' ? 'block' : 'none';
    renderReportView();
}

function toggleReturReportView(type) {
    currentReturReportView = type;
    document.getElementById('retur-rep-beli-btn').classList.toggle('active', type === 'beli');
    document.getElementById('retur-rep-jual-btn').classList.toggle('active', type === 'jual');
    document.getElementById('retur-report-beli-view').style.display = type === 'beli' ? 'block' : 'none';
    document.getElementById('retur-report-jual-view').style.display = type === 'jual' ? 'block' : 'none';
    renderReportView();
}

function renderReportView() {
    if (currentReportSection === 'beli') {
        const body = document.getElementById('report-beli-table-body');
        if (!body) return;
        const buyTxs = getBuyTransactions();
        body.innerHTML = buyTxs.map(tx => `
            <tr>
                <td><strong>${tx.code}</strong></td>
                <td><span class="badge badge-info">${tx.item_type}</span></td>
                <td>${tx.units.map(u => u.model).join(', ')}</td>
                <td><strong>${formatRupiah(tx.total_buy_price)}</strong></td>
                <td>${tx.pay_method}</td>
                <td>${formatDateTime(tx.date)}</td>
            </tr>
        `).join('');
    } else if (currentReportSection === 'jual') {
        const body = document.getElementById('report-jual-table-body');
        if (!body) return;
        const sellTxs = getSellTransactions();
        body.innerHTML = sellTxs.map(tx => `
            <tr>
                <td><strong>${tx.code}</strong></td>
                <td>${tx.customer_name}</td>
                <td>${tx.units.map(u => u.model).join(', ')}</td>
                <td><strong>${formatRupiah(tx.total_pay)}</strong></td>
                <td><span class="badge badge-success">${tx.payment_status}</span></td>
                <td>${formatDateTime(tx.date)}</td>
            </tr>
        `).join('');
    } else if (currentReportSection === 'stok') {
        if (currentStokReportView === 'global') {
            const body = document.getElementById('report-stok-global-body');
            if (!body) return;
            const stock = getStock().filter(item => item.status === 'TERSEDIA');
            
            // Group by model
            const groups = {};
            stock.forEach(item => {
                if (!groups[item.model]) {
                    groups[item.model] = { count: 0, cost: 0, val: 0 };
                }
                groups[item.model].count++;
                groups[item.model].cost += item.purchase_price;
                groups[item.model].val += item.selling_price;
            });

            body.innerHTML = Object.keys(groups).map(model => `
                <tr>
                    <td><strong>${model}</strong></td>
                    <td>${groups[model].count} Unit</td>
                    <td><strong>${formatRupiah(groups[model].cost)}</strong></td>
                    <td><strong>${formatRupiah(groups[model].val)}</strong></td>
                </tr>
            `).join('') || '<tr><td colspan="4" style="text-align:center;">Tidak ada stok tersedia.</td></tr>';
        } else {
            const body = document.getElementById('report-stok-detail-body');
            if (!body) return;
            const stock = getStock();
            body.innerHTML = stock.map(s => `
                <tr>
                    <td><strong>${s.code}</strong></td>
                    <td><span class="badge badge-info">${s.type}</span></td>
                    <td>${s.model}</td>
                    <td>${s.imei}</td>
                    <td><strong>${formatRupiah(s.purchase_price)}</strong></td>
                    <td><strong>${formatRupiah(s.selling_price)}</strong></td>
                    <td><span class="badge ${s.status === 'TERSEDIA' ? 'badge-success' : 'badge-danger'}">${s.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="7" style="text-align:center;">Tidak ada data stok.</td></tr>';
        }
    } else if (currentReportSection === 'pembayaran') {
        if (currentPayReportView === 'utang') {
            const body = document.getElementById('report-pay-utang-body');
            if (!body) return;
            const debts = getDebts();
            body.innerHTML = debts.map(d => `
                <tr>
                    <td><strong>${d.code}</strong></td>
                    <td>${d.supplier_name}</td>
                    <td><strong>${formatRupiah(d.total_amount)}</strong></td>
                    <td><strong>${formatRupiah(d.paid_amount)}</strong></td>
                    <td><strong>${formatRupiah(d.total_amount - d.paid_amount)}</strong></td>
                    <td>${d.due_date}</td>
                    <td><span class="badge ${d.status === 'LUNAS' ? 'badge-success' : 'badge-danger'}">${d.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="7" style="text-align:center;">Tidak ada data utang.</td></tr>';
        } else {
            const body = document.getElementById('report-pay-piutang-body');
            if (!body) return;
            const receivables = getReceivables();
            body.innerHTML = receivables.map(r => `
                <tr>
                    <td><strong>${r.code}</strong></td>
                    <td>${r.customer_name}</td>
                    <td><strong>${formatRupiah(r.total_amount)}</strong></td>
                    <td><strong>${formatRupiah(r.paid_amount)}</strong></td>
                    <td><strong>${formatRupiah(r.total_amount - r.paid_amount)}</strong></td>
                    <td>${r.due_date}</td>
                    <td><span class="badge ${r.status === 'LUNAS' ? 'badge-success' : 'badge-danger'}">${r.status}</span></td>
                </tr>
            `).join('') || '<tr><td colspan="7" style="text-align:center;">Tidak ada data piutang.</td></tr>';
        }
    } else if (currentReportSection === 'retur') {
        if (currentReturReportView === 'beli') {
            const body = document.getElementById('report-retur-beli-body');
            if (!body) return;
            const returBeli = getReturBeli();
            body.innerHTML = returBeli.map(r => `
                <tr>
                    <td><strong>${r.code}</strong></td>
                    <td>${r.buy_code}</td>
                    <td>${r.model}</td>
                    <td>${r.imei}</td>
                    <td>${r.supplier_name}</td>
                    <td><strong>${formatRupiah(r.amount)}</strong></td>
                    <td>${formatDateTime(r.date)}</td>
                    <td>${r.reason}</td>
                </tr>
            `).join('') || '<tr><td colspan="8" style="text-align:center;">Belum ada retur pembelian.</td></tr>';
        } else {
            const body = document.getElementById('report-retur-jual-body');
            if (!body) return;
            const returJual = getReturJual();
            body.innerHTML = returJual.map(r => `
                <tr>
                    <td><strong>${r.code}</strong></td>
                    <td>${r.sell_code}</td>
                    <td>${r.model}</td>
                    <td>${r.imei}</td>
                    <td>${r.customer_name}</td>
                    <td><strong>${formatRupiah(r.amount)}</strong></td>
                    <td>${formatDateTime(r.date)}</td>
                    <td>${r.reason}</td>
                </tr>
            `).join('') || '<tr><td colspan="8" style="text-align:center;">Belum ada retur penjualan.</td></tr>';
        }
    }
}

// Open multi-item purchase modal
function openBuyModal() {
    document.getElementById('buy-items-tbody').innerHTML = '';
    addPurchaseRow();
    document.getElementById('buy-total-display').textContent = 'Rp 0';
    openModal('modal-buy');
}

// Add a row to the purchase items table
function addPurchaseRow() {
    const tbody = document.getElementById('buy-items-tbody');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.className = 'purchase-item-row';
    tr.innerHTML = `
        <td style="padding: 6px 12px;">
            <select class="form-control buy-item-type-row" style="width: 100%; padding: 6px; border: 1px solid var(--border-soft); border-radius: 4px;">
                <option value="HANDPHONE">Handphone</option>
                <option value="SIMCARD">Simcard</option>
                <option value="ACCESSORIES">Accessories</option>
            </select>
        </td>
        <td style="padding: 6px 12px;">
            <input type="text" class="form-control buy-model-row" required placeholder="iPhone 13 / Kuota 50GB" style="width: 100%; padding: 6px; border: 1px solid var(--border-soft); border-radius: 4px;">
        </td>
        <td style="padding: 6px 12px;">
            <input type="text" class="form-control buy-imei-row" required placeholder="IMEI / SN / Barcode" style="width: 100%; padding: 6px; border: 1px solid var(--border-soft); border-radius: 4px;">
        </td>
        <td style="padding: 6px 12px;">
            <input type="text" class="form-control buy-spec-row" placeholder="128GB / Black" style="width: 100%; padding: 6px; border: 1px solid var(--border-soft); border-radius: 4px;">
        </td>
        <td style="padding: 6px 12px;">
            <select class="form-control buy-condition-row" style="width: 100%; padding: 6px; border: 1px solid var(--border-soft); border-radius: 4px;">
                <option value="BARU">BARU</option>
                <option value="SECOND">SECOND</option>
            </select>
        </td>
        <td style="padding: 6px 12px;">
            <input type="number" class="form-control buy-price-row" required placeholder="0" oninput="calculatePurchaseTotal()" style="width: 100%; padding: 6px; border: 1px solid var(--border-soft); border-radius: 4px;">
        </td>
        <td style="padding: 6px 12px;">
            <input type="number" class="form-control buy-sell-price-row" required placeholder="0" style="width: 100%; padding: 6px; border: 1px solid var(--border-soft); border-radius: 4px;">
        </td>
        <td style="padding: 6px 12px; text-align: center;">
            <button type="button" class="btn btn-danger" onclick="removePurchaseRow(this)" style="padding: 4px 8px; font-size: 11px;">✕</button>
        </td>
    `;
    tbody.appendChild(tr);
    calculatePurchaseTotal();
}

// Remove row
function removePurchaseRow(btn) {
    const row = btn.closest('tr');
    if (row) {
        row.remove();
        calculatePurchaseTotal();
    }
}

// Calculate aggregated total
function calculatePurchaseTotal() {
    let total = 0;
    document.querySelectorAll('.buy-price-row').forEach(input => {
        const val = parseFloat(input.value) || 0;
        total += val;
    });
    document.getElementById('buy-total-display').textContent = formatRupiah(total);
}

// Handle multi-item submit
function handleBuySubmit(event) {
    event.preventDefault();

    const sourceType = document.getElementById('buy-source-type').value;
    const supplierId = document.getElementById('buy-supplier-id').value;
    const customerId = document.getElementById('buy-customer-id').value;
    const payMethod = document.getElementById('buy-pay-method').value;

    const suppliers = getSuppliers();
    const customers = getCustomers();
    const stock = getStock();
    const buyTxs = getBuyTransactions();
    const mutations = getMutations();
    const logs = getLogBarang();
    const debts = getDebts();
    const bankAccounts = getBankAccounts();

    const rows = document.querySelectorAll('.purchase-item-row');
    if (rows.length === 0) {
        alert('Tambahkan setidaknya satu item barang!');
        return;
    }

    const buyCode = generateTransactionCode('BLI');
    let totalBuyPrice = 0;
    const itemsAdded = [];

    // Loop over rows to create stock items
    rows.forEach((row, index) => {
        const itemType = row.querySelector('.buy-item-type-row').value;
        const model = row.querySelector('.buy-model-row').value;
        const imei = row.querySelector('.buy-imei-row').value;
        const spec = row.querySelector('.buy-spec-row').value;
        const condition = row.querySelector('.buy-condition-row').value;
        const buyPrice = parseFloat(row.querySelector('.buy-price-row').value) || 0;
        const sellPrice = parseFloat(row.querySelector('.buy-sell-price-row').value) || 0;

        totalBuyPrice += buyPrice;

        const newStockId = 'stk' + (stock.length + 1 + index);
        const newStockCode = (itemType === 'HANDPHONE' ? 'STK-' : itemType === 'SIMCARD' ? 'SIM-' : 'ACC-') + String(stock.length + 1 + index).padStart(4, '0');

        const newStock = {
            id: newStockId,
            type: itemType,
            code: newStockCode,
            model: model,
            imei: imei,
            capacity: spec || 'N/A',
            color: spec ? spec.split('/')[1] || 'N/A' : 'N/A',
            condition: condition,
            grade: condition === 'BARU' ? '-' : 'A',
            purchase_price: buyPrice,
            selling_price: sellPrice,
            supplier_id: sourceType === 'SUPPLIER' ? supplierId : '',
            status: 'TERSEDIA',
            notes: 'Terinput dari pembelian ' + buyCode,
            date_entered: new Date().toISOString()
        };
        stock.push(newStock);

        itemsAdded.push({ model: model, imei: imei, price: buyPrice });

        // Log item history
        logs.push({
            id: 'log' + (logs.length + 1),
            stock_code: newStockCode,
            model: model,
            action: 'PEMBELIAN',
            date: new Date().toISOString(),
            user: 'admin',
            description: `Masuk melalui pembelian ${buyCode}`
        });
    });

    saveStock(stock);
    saveLogBarang(logs);

    const secondPartyName = sourceType === 'SUPPLIER' ? 
        (suppliers.find(s => s.id === supplierId)?.name || 'Supplier') : 
        (customers.find(c => c.id === customerId)?.name || 'Customer');

    // Save Buy Transaction (aggregated)
    const newTx = {
        id: 'b' + (buyTxs.length + 1),
        code: buyCode,
        source_type: sourceType,
        customer_id: sourceType === 'CUSTOMER' ? customerId : '',
        customer_name: sourceType === 'CUSTOMER' ? secondPartyName : '',
        supplier_id: sourceType === 'SUPPLIER' ? supplierId : '',
        supplier_name: sourceType === 'SUPPLIER' ? secondPartyName : '',
        units: itemsAdded,
        total_buy_price: totalBuyPrice,
        pay_method: payMethod,
        date: new Date().toISOString(),
        logged_by: 'admin'
    };
    if (rows.length > 1) {
        newTx.item_type = 'MULTI';
    } else {
        newTx.item_type = rows[0].querySelector('.buy-item-type-row').value;
    }
    buyTxs.push(newTx);
    saveBuyTransactions(buyTxs);

    // Save cash mutation or debt
    if (payMethod !== 'UTANG') {
        mutations.push({
            id: 'm-b' + (mutations.length + 1),
            date: new Date().toISOString(),
            module: 'STORE',
            ref_id: buyCode,
            type: 'KELUAR',
            category: 'Pembelian Multi-Item',
            amount: totalBuyPrice,
            pay_method: payMethod,
            note: `Pembelian ${itemsAdded.length} item - ${secondPartyName}`,
            logged_by: 'admin'
        });
        saveMutations(mutations);

        const account = bankAccounts.find(b => b.id === (payMethod === 'TRANSFER' ? 'bca' : 'cash'));
        if (account) {
            account.balance -= totalBuyPrice;
            saveBankAccounts(bankAccounts);
        }
    } else {
        debts.push({
            id: 'deb' + (debts.length + 1),
            code: buyCode,
            supplier_id: supplierId,
            supplier_name: secondPartyName,
            total_amount: totalBuyPrice,
            paid_amount: 0,
            due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10),
            status: 'BELUM LUNAS',
            date: new Date().toISOString()
        });
        saveDebts(debts);
    }

    closeModal('modal-buy');
    document.getElementById('form-buy').reset();
    showTabDirect('purchases');
}

function handleSellSubmit(event) {
    event.preventDefault();

    const customerId = document.getElementById('sell-customer-id').value;
    const stockId = document.getElementById('sell-stock-id').value;
    const finalPrice = parseFloat(document.getElementById('sell-price-final').value);
    const payMethod = document.getElementById('sell-pay-method').value;
    const dpAmount = parseFloat(document.getElementById('sell-dp-amount').value || 0);

    const customers = getCustomers();
    const stock = getStock();
    const sellTxs = getSellTransactions();
    const mutations = getMutations();
    const logs = getLogBarang();
    const receivables = getReceivables();
    const bankAccounts = getBankAccounts();

    const sellCode = generateTransactionCode('JUL');
    const selectedItem = stock.find(item => item.id === stockId);
    if (!selectedItem) return;

    selectedItem.status = 'TERJUAL';
    saveStock(stock);

    const customer = customers.find(c => c.id === customerId);
    const customerName = customer ? customer.name : 'Umum';

    const remaining = payMethod === 'PIUTANG' ? (finalPrice - dpAmount) : 0;
    const statusBayar = payMethod === 'PIUTANG' ? (dpAmount > 0 ? 'DP' : 'BELUM LUNAS') : 'LUNAS';

    const newTx = {
        id: 's' + (sellTxs.length + 1),
        code: sellCode,
        customer_id: customerId,
        customer_name: customerName,
        customer_phone: customer ? customer.phone : '',
        item_type: selectedItem.type,
        units: [{ stock_id: stockId, model: selectedItem.model, imei: selectedItem.imei, price: finalPrice }],
        discount: 0,
        total_pay: finalPrice,
        pay_method: payMethod,
        dp_amount: dpAmount,
        remaining_bill: remaining,
        payment_status: statusBayar,
        date: new Date().toISOString(),
        logged_by: 'admin'
    };
    sellTxs.push(newTx);
    saveSellTransactions(sellTxs);

    logs.push({
        id: 'log' + (logs.length + 1),
        stock_code: selectedItem.code,
        model: selectedItem.model,
        action: 'PENJUALAN',
        date: new Date().toISOString(),
        user: 'admin',
        description: `Terjual ke ${customerName} dengan nota ${sellCode}`
    });
    saveLogBarang(logs);

    const receiveAmount = payMethod === 'PIUTANG' ? dpAmount : finalPrice;
    if (receiveAmount > 0) {
        mutations.push({
            id: 'm-s' + (mutations.length + 1),
            date: new Date().toISOString(),
            module: 'STORE',
            ref_id: sellCode,
            type: 'MASUK',
            category: payMethod === 'PIUTANG' ? 'Uang Muka Penjualan' : 'Penjualan ' + selectedItem.type,
            amount: receiveAmount,
            pay_method: payMethod === 'PIUTANG' ? 'TRANSFER' : payMethod,
            note: `Penjualan ${selectedItem.model} - ${customerName}`,
            logged_by: 'admin'
        });
        saveMutations(mutations);

        const account = bankAccounts.find(b => b.id === (payMethod === 'CASH' ? 'cash' : 'bca'));
        if (account) {
            account.balance += receiveAmount;
            saveBankAccounts(bankAccounts);
        }
    }

    if (payMethod === 'PIUTANG') {
        receivables.push({
            id: 'rec' + (receivables.length + 1),
            code: sellCode,
            customer_id: customerId,
            customer_name: customerName,
            total_amount: finalPrice,
            paid_amount: dpAmount,
            due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10),
            status: statusBayar,
            date: new Date().toISOString()
        });
        saveReceivables(receivables);
    }

    closeModal('modal-sell');
    document.getElementById('form-sell').reset();
    showTabDirect('sales');
}

function handleCustomerSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    const ktp = document.getElementById('cust-ktp').value;

    const customers = getCustomers();
    customers.push({
        id: 'c' + (customers.length + 1),
        name: name,
        phone: phone,
        address: address,
        identity_type: 'KTP',
        identity_no: ktp
    });
    saveCustomers(customers);

    closeModal('modal-add-cust');
    document.getElementById('form-customer').reset();
    showTabDirect('customers');
}

function handleMutationSubmit(event) {
    event.preventDefault();
    const type = document.getElementById('mut-type').value;
    const cat = document.getElementById('mut-cat').value;
    const amount = parseFloat(document.getElementById('mut-amount').value);
    const method = document.getElementById('mut-method').value;
    const note = document.getElementById('mut-note').value;

    const mutations = getMutations();
    const bankAccounts = getBankAccounts();

    mutations.push({
        id: 'm-man' + (mutations.length + 1),
        date: new Date().toISOString(),
        module: 'STORE',
        ref_id: '',
        type: type,
        category: cat,
        amount: amount,
        pay_method: method,
        note: note,
        logged_by: 'admin'
    });
    saveMutations(mutations);

    const account = bankAccounts.find(b => b.id === (method === 'TRANSFER' ? 'bca' : 'cash'));
    if (account) {
        if (type === 'MASUK') account.balance += amount;
        else account.balance -= amount;
        saveBankAccounts(bankAccounts);
    }

    closeModal('modal-create-mutation');
    document.getElementById('form-mutation').reset();
    showTabDirect('mutations');
}

function payDebt(id) {
    const debts = getDebts();
    const bankAccounts = getBankAccounts();
    const mutations = getMutations();
    const d = debts.find(item => item.id === id);
    if (!d) return;

    const unpaid = d.total_amount - d.paid_amount;
    d.paid_amount = d.total_amount;
    d.status = 'LUNAS';
    saveDebts(debts);

    mutations.push({
        id: 'm-d' + (mutations.length + 1),
        date: new Date().toISOString(),
        module: 'STORE',
        ref_id: d.code,
        type: 'KELUAR',
        category: 'Pelunasan Utang',
        amount: unpaid,
        pay_method: 'TRANSFER',
        note: `Pelunasan utang ke ${d.supplier_name}`,
        logged_by: 'admin'
    });
    saveMutations(mutations);

    const bca = bankAccounts.find(b => b.id === 'bca');
    if (bca) {
        bca.balance -= unpaid;
        saveBankAccounts(bankAccounts);
    }

    renderView('pembayaran');
}

function collectReceivable(id) {
    const receivables = getReceivables();
    const bankAccounts = getBankAccounts();
    const mutations = getMutations();
    const sellTxs = getSellTransactions();
    const r = receivables.find(item => item.id === id);
    if (!r) return;

    const unpaid = r.total_amount - r.paid_amount;
    r.paid_amount = r.total_amount;
    r.status = 'LUNAS';
    saveReceivables(receivables);

    const tx = sellTxs.find(t => t.code === r.code);
    if (tx) {
        tx.remaining_bill = 0;
        tx.payment_status = 'LUNAS';
        saveSellTransactions(sellTxs);
    }

    mutations.push({
        id: 'm-r' + (mutations.length + 1),
        date: new Date().toISOString(),
        module: 'STORE',
        ref_id: r.code,
        type: 'MASUK',
        category: 'Pelunasan Piutang',
        amount: unpaid,
        pay_method: 'TRANSFER',
        note: `Pelunasan piutang dari ${r.customer_name}`,
        logged_by: 'admin'
    });
    saveMutations(mutations);

    const bca = bankAccounts.find(b => b.id === 'bca');
    if (bca) {
        bca.balance += unpaid;
        saveBankAccounts(bankAccounts);
    }

    renderView('pembayaran');
}

function viewReceipt(id) {
    const tx = getSellTransactions().find(t => t.id === id);
    if (!tx) return;

    const printBody = document.getElementById('invoice-print-area');
    if (!printBody) return;

    printBody.innerHTML = `
        <div style="font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4; color: #000;">
            <div style="text-align: center; margin-bottom: 10px;">
                <h4 style="margin: 0; font-size: 14px; font-weight: bold;">PLANET STORE</h4>
                <p style="margin: 2px 0;">Pusat iPhone & Aksesoris</p>
                <p style="margin: 2px 0;">Jl. Pandanaran, Boyolali</p>
                <p style="margin: 2px 0;">Telp: 0895-2299-4849</p>
            </div>
            <hr style="border-top: 1px dashed #000; margin: 8px 0;">
            <p style="margin: 2px 0;">Nota: ${tx.code}</p>
            <p style="margin: 2px 0;">Kasir: FAJAR</p>
            <p style="margin: 2px 0;">Pelanggan: ${tx.customer_name}</p>
            <p style="margin: 2px 0;">Waktu: ${formatDateTime(tx.date)}</p>
            <hr style="border-top: 1px dashed #000; margin: 8px 0;">
            
            ${tx.units.map(u => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>1x ${u.model}</span>
                    <span>${formatRupiah(u.price)}</span>
                </div>
            `).join('')}
            
            <hr style="border-top: 1px dashed #000; margin: 8px 0;">
            <div style="display: flex; justify-content: space-between;">
                <span>Subtotal:</span>
                <span>${formatRupiah(tx.total_pay)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>TOTAL:</span>
                <span>${formatRupiah(tx.total_pay)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Metode:</span>
                <span>${tx.pay_method}</span>
            </div>
            ${tx.remaining_bill > 0 ? `
                <div style="display: flex; justify-content: space-between; font-weight: bold;">
                    <span>Sisa Piutang:</span>
                    <span>${formatRupiah(tx.remaining_bill)}</span>
                </div>
            ` : ''}
            <hr style="border-top: 1px dashed #000; margin: 8px 0;">
            <div style="text-align: center; margin-top: 15px;">
                <p style="margin: 2px 0; font-weight: bold;">Terima Kasih</p>
                <p style="margin: 2px 0;">Barang Ter QC & Bergaransi</p>
            </div>
        </div>
    `;
    openModal('modal-sell-detail');
}

function backupDatabase() {
    const data = {};
    Object.keys(DB_KEYS).forEach(key => {
        data[DB_KEYS[key]] = localStorage.getItem(DB_KEYS[key]);
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PLANET_STORE_DB_BACKUP_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function logoutUser() {
    alert('Logout demo berhasil.');
    window.location.href = 'login.html';
}

function initLiveClock() {
    const el = document.getElementById('live-time-display');
    if (!el) return;

    setInterval(() => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        const timeStr = now.toTimeString().split(' ')[0];
        el.textContent = `${dateStr} ${timeStr}`;
    }, 1000);
}

// Bind Sidebar Tab Clicks
function initSidebarEvents() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            showTabDirect(tabId);
        });
    });

    const btnOpenSell = document.getElementById('btn-open-sell');
    if (btnOpenSell) {
        btnOpenSell.addEventListener('click', () => {
            showTabDirect('sales');
            openModal('modal-sell');
        });
    }

    const searchInput = document.getElementById('stock-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderStockTable();
        });
    }
}

// ==================== NEW ERP CONTROLLERS ====================

// --- RETUR PEMBELIAN (Supplier) ---
function openReturBuyModal() {
    const selTx = document.getElementById('retur-buy-tx-id');
    if (!selTx) return;
    const buyTxs = getBuyTransactions();
    selTx.innerHTML = '<option value="">-- Pilih Transaksi Beli --</option>' + 
        buyTxs.map(tx => `<option value="${tx.id}">${tx.code} - ${tx.supplier_name}</option>`).join('');
    document.getElementById('retur-buy-stock-id').innerHTML = '<option value="">-- Pilih Unit --</option>';
    document.getElementById('retur-buy-reason').value = '';
    document.getElementById('retur-buy-refund').value = '';
    openModal('modal-retur-buy');
}

function populateReturBuyItems() {
    const txId = document.getElementById('retur-buy-tx-id').value;
    const selStock = document.getElementById('retur-buy-stock-id');
    if (!selStock) return;
    if (!txId) {
        selStock.innerHTML = '<option value="">-- Pilih Unit --</option>';
        return;
    }
    const buyTxs = getBuyTransactions();
    const tx = buyTxs.find(t => t.id === txId);
    if (!tx) return;

    const stock = getStock();
    const availableImeis = stock.filter(s => s.status === 'TERSEDIA').map(s => s.imei);
    const returnableUnits = tx.units.filter(u => availableImeis.includes(u.imei));

    if (returnableUnits.length === 0) {
        selStock.innerHTML = '<option value="">-- Tidak ada unit tersedia untuk diretur --</option>';
        return;
    }

    selStock.innerHTML = returnableUnits.map(u => {
        const matchedItem = stock.find(s => s.imei === u.imei);
        return `<option value="${matchedItem.id}">${matchedItem.code} - ${u.model} [${u.imei}]</option>`;
    }).join('');
}

function handleReturBuySubmit(event) {
    event.preventDefault();
    const txId = document.getElementById('retur-buy-tx-id').value;
    const stockId = document.getElementById('retur-buy-stock-id').value;
    const reason = document.getElementById('retur-buy-reason').value;
    const refund = parseFloat(document.getElementById('retur-buy-refund').value) || 0;

    const buyTxs = getBuyTransactions();
    const tx = buyTxs.find(t => t.id === txId);
    const stock = getStock();
    const item = stock.find(s => s.id === stockId);
    if (!tx || !item) return;

    item.status = 'RETUR_BELI';
    item.notes = `Diretur: ${reason}`;
    saveStock(stock);

    const returBeli = getReturBeli();
    const returCode = generateTransactionCode('RBL');
    returBeli.push({
        id: 'rbl' + (returBeli.length + 1),
        code: returCode,
        buy_code: tx.code,
        stock_id: item.id,
        model: item.model,
        imei: item.imei,
        supplier_name: tx.supplier_name,
        amount: refund,
        reason: reason,
        date: new Date().toISOString()
    });
    saveReturBeli(returBeli);

    const logs = getLogBarang();
    logs.push({
        id: 'log' + (logs.length + 1),
        stock_code: item.code,
        model: item.model,
        action: 'RETUR_BELI',
        date: new Date().toISOString(),
        user: 'admin',
        description: `Retur pembelian ke supplier. Alasan: ${reason}`
    });
    saveLogBarang(logs);

    const mutations = getMutations();
    mutations.push({
        id: 'm-r' + (mutations.length + 1),
        date: new Date().toISOString(),
        module: 'STORE',
        ref_id: returCode,
        type: 'MASUK',
        category: 'Retur Pembelian',
        amount: refund,
        pay_method: tx.pay_method === 'UTANG' ? 'CASH' : tx.pay_method,
        note: `Refund retur ${item.model} dari ${tx.supplier_name}`,
        logged_by: 'admin'
    });
    saveMutations(mutations);

    const bankAccounts = getBankAccounts();
    const account = bankAccounts.find(b => b.id === (tx.pay_method === 'TRANSFER' ? 'bca' : 'cash'));
    if (account) {
        account.balance += refund;
        saveBankAccounts(bankAccounts);
    }

    closeModal('modal-retur-buy');
    alert(`Retur Pembelian ${returCode} berhasil disimpan.`);
    renderDashboard();
    renderStockTable();
}

// --- RETUR PENJUALAN (Customer) ---
function openReturSellModal() {
    const selTx = document.getElementById('retur-sell-tx-id');
    if (!selTx) return;
    const sellTxs = getSellTransactions();
    selTx.innerHTML = '<option value="">-- Pilih Transaksi Jual --</option>' + 
        sellTxs.map(tx => `<option value="${tx.id}">${tx.code} - ${tx.customer_name}</option>`).join('');
    document.getElementById('retur-sell-stock-id').innerHTML = '<option value="">-- Pilih Unit --</option>';
    document.getElementById('retur-sell-reason').value = '';
    document.getElementById('retur-sell-refund').value = '';
    openModal('modal-retur-sell');
}

function populateReturSellItems() {
    const txId = document.getElementById('retur-sell-tx-id').value;
    const selStock = document.getElementById('retur-sell-stock-id');
    if (!selStock) return;
    if (!txId) {
        selStock.innerHTML = '<option value="">-- Pilih Unit --</option>';
        return;
    }
    const sellTxs = getSellTransactions();
    const tx = sellTxs.find(t => t.id === txId);
    if (!tx) return;

    const stock = getStock();
    const soldImeis = tx.units.map(u => u.imei);
    const returnableUnits = stock.filter(s => s.status === 'TERJUAL' && soldImeis.includes(s.imei));

    if (returnableUnits.length === 0) {
        selStock.innerHTML = '<option value="">-- Tidak ada unit yang bisa diretur --</option>';
        return;
    }

    selStock.innerHTML = returnableUnits.map(u => `
        <option value="${u.id}">${u.code} - ${u.model} [${u.imei}]</option>
    `).join('');
}

function handleReturSellSubmit(event) {
    event.preventDefault();
    const txId = document.getElementById('retur-sell-tx-id').value;
    const stockId = document.getElementById('retur-sell-stock-id').value;
    const reason = document.getElementById('retur-sell-reason').value;
    const refund = parseFloat(document.getElementById('retur-sell-refund').value) || 0;

    const sellTxs = getSellTransactions();
    const tx = sellTxs.find(t => t.id === txId);
    const stock = getStock();
    const item = stock.find(s => s.id === stockId);
    if (!tx || !item) return;

    item.status = 'TERSEDIA';
    item.notes = `Diretur pelanggan: ${reason}`;
    saveStock(stock);

    const returJual = getReturJual();
    const returCode = generateTransactionCode('RJL');
    returJual.push({
        id: 'rjl' + (returJual.length + 1),
        code: returCode,
        sell_code: tx.code,
        stock_id: item.id,
        model: item.model,
        imei: item.imei,
        customer_name: tx.customer_name,
        amount: refund,
        reason: reason,
        date: new Date().toISOString()
    });
    saveReturJual(returJual);

    const logs = getLogBarang();
    logs.push({
        id: 'log' + (logs.length + 1),
        stock_code: item.code,
        model: item.model,
        action: 'RETUR_JUAL',
        date: new Date().toISOString(),
        user: 'admin',
        description: `Retur penjualan dari customer. Alasan: ${reason}`
    });
    saveLogBarang(logs);

    const mutations = getMutations();
    mutations.push({
        id: 'm-rj' + (mutations.length + 1),
        date: new Date().toISOString(),
        module: 'STORE',
        ref_id: returCode,
        type: 'KELUAR',
        category: 'Retur Penjualan',
        amount: refund,
        pay_method: tx.pay_method === 'PIUTANG' ? 'CASH' : tx.pay_method,
        note: `Pengembalian retur ${item.model} ke ${tx.customer_name}`,
        logged_by: 'admin'
    });
    saveMutations(mutations);

    const bankAccounts = getBankAccounts();
    const account = bankAccounts.find(b => b.id === (tx.pay_method === 'TRANSFER' ? 'bca' : 'cash'));
    if (account) {
        account.balance -= refund;
        saveBankAccounts(bankAccounts);
    }

    closeModal('modal-retur-sell');
    alert(`Retur Penjualan ${returCode} berhasil disimpan.`);
    renderDashboard();
    renderStockTable();
}

// --- PENGATURAN TIPE PONSEL ---
function openPhoneTypesModal() {
    renderPhoneTypesList();
    openModal('modal-phone-types');
}

function renderPhoneTypesList() {
    const tbody = document.getElementById('phone-types-table-body');
    if (!tbody) return;
    const types = getPhoneTypes();
    tbody.innerHTML = types.map((t, index) => `
        <tr>
            <td><strong>${t.name || t}</strong></td>
            <td style="text-align: center;">
                <button class="btn btn-danger" onclick="deletePhoneType(${index})" style="padding: 4px 8px; font-size: 11px;">Hapus</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="2" style="text-align:center;">Belum ada tipe ponsel master.</td></tr>';
}

function handlePhoneTypeSubmit(event) {
    event.preventDefault();
    const modelInput = document.getElementById('new-phone-model');
    const modelName = modelInput.value.trim();
    if (!modelName) return;

    const types = getPhoneTypes();
    types.push({ name: modelName });
    savePhoneTypes(types);

    modelInput.value = '';
    renderPhoneTypesList();
    alert('Model master tipe ponsel ditambahkan.');
}

function deletePhoneType(index) {
    if (!confirm('Hapus tipe ponsel ini dari database master?')) return;
    const types = getPhoneTypes();
    types.splice(index, 1);
    savePhoneTypes(types);
    renderPhoneTypesList();
}

// --- SETTING KERTAS PRINTER ---
function openSetPrintingModal() {
    const savedSize = localStorage.getItem('print_paper_size') || '58mm';
    document.getElementById('printing-paper-size').value = savedSize;
    openModal('modal-set-printing');
}

function handleSetPrintingSubmit(event) {
    event.preventDefault();
    const size = document.getElementById('printing-paper-size').value;
    localStorage.setItem('print_paper_size', size);
    
    applyPrintingStyles(size);
    
    closeModal('modal-set-printing');
    alert(`Ukuran kertas cetak struk diset ke: ${size}`);
}

function applyPrintingStyles(size) {
    let styleEl = document.getElementById('printing-custom-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'printing-custom-style';
        document.head.appendChild(styleEl);
    }
    
    if (size === '58mm') {
        styleEl.innerHTML = `
            @media print {
                body * { visibility: hidden; }
                #invoice-print-area, #invoice-print-area * { visibility: visible; }
                #invoice-print-area {
                    position: absolute;
                    left: 0; top: 0;
                    width: 58mm;
                    font-size: 9px;
                    line-height: 1.2;
                    padding: 0;
                }
            }
        `;
    } else if (size === '80mm') {
        styleEl.innerHTML = `
            @media print {
                body * { visibility: hidden; }
                #invoice-print-area, #invoice-print-area * { visibility: visible; }
                #invoice-print-area {
                    position: absolute;
                    left: 0; top: 0;
                    width: 80mm;
                    font-size: 11px;
                    line-height: 1.3;
                    padding: 0;
                }
            }
        `;
    } else {
        styleEl.innerHTML = `
            @media print {
                body * { visibility: hidden; }
                #invoice-print-area, #invoice-print-area * { visibility: visible; }
                #invoice-print-area {
                    position: absolute;
                    left: 0; top: 0;
                    width: 100%;
                    font-size: 13px;
                    line-height: 1.4;
                    padding: 20px;
                }
            }
        `;
    }
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    initLiveClock();
    initSidebarEvents();
    renderDashboard();
    applyPrintingStyles(localStorage.getItem('print_paper_size') || '58mm');
});

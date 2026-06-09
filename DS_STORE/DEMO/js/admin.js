/* ==========================================================================
   Planet Store Boyolali — DS_STORE Admin Dashboard Interaction Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Session Authentication Validation Check
    const activeUser = sessionStorage.getItem('active_user_store');
    if (!activeUser) {
        window.location.href = 'login.html';
        return;
    }

    const IPHONE_DATABASE = {
        "iPhone 17 Seri": {
            models: {
                "iPhone 17 Pro Max": ["Oranye Kosmik", "Biru Pekat", "Perak"],
                "iPhone 17 Pro": ["Oranye Kosmik", "Biru Pekat", "Perak"],
                "iPhone 17 Air": ["Biru Langit", "Emas Muda", "Putih Awan", "Hitam Angkasa"],
                "iPhone 17": ["Lavender", "Hijau Sage", "Biru Kabut", "Putih", "Hitam"],
                "iPhone 17e": ["Pink", "Putih", "Hitam"]
            }
        },
        "iPhone 16 Seri": {
            models: {
                "iPhone 16 Pro Max": ["Titanium Hitam", "Titanium Putih", "Titanium Alami", "Titanium Gurun"],
                "iPhone 16 Pro": ["Titanium Hitam", "Titanium Putih", "Titanium Alami", "Titanium Gurun"],
                "iPhone 16 Plus": ["Hitam", "Putih", "Merah Muda", "Teal", "Ultramarine"],
                "iPhone 16": ["Hitam", "Putih", "Merah Muda", "Teal", "Ultramarine"],
                "iPhone 16e": ["Hitam", "Putih"]
            }
        },
        "iPhone 15 Seri": {
            models: {
                "iPhone 15 Pro Max": ["Titanium Hitam", "Titanium Putih", "Titanium Biru", "Titanium Alami"],
                "iPhone 15 Pro": ["Titanium Hitam", "Titanium Putih", "Titanium Biru", "Titanium Alami"],
                "iPhone 15 Plus": ["Hitam", "Biru", "Hijau", "Kuning", "Merah Muda"],
                "iPhone 15": ["Hitam", "Biru", "Hijau", "Kuning", "Merah Muda"]
            }
        },
        "iPhone 14/SE3 Seri": {
            models: {
                "iPhone 14 Pro Max": ["Perak", "Emas", "Hitam Pekat", "Ungu Tua"],
                "iPhone 14 Pro": ["Perak", "Emas", "Hitam Pekat", "Ungu Tua"],
                "iPhone 14 Plus": ["Midnight", "Starlight", "RED", "Biru", "Ungu", "Kuning"],
                "iPhone 14": ["Midnight", "Starlight", "RED", "Biru", "Ungu", "Kuning"],
                "iPhone SE (Gen. 3)": ["RED", "Starlight", "Midnight"]
            }
        },
        "iPhone 13 Seri": {
            models: {
                "iPhone 13 Pro Max": ["Grafit", "Emas", "Perak", "Biru Sierra", "Hijau Alpine"],
                "iPhone 13 Pro": ["Grafit", "Emas", "Perak", "Biru Sierra", "Hijau Alpine"],
                "iPhone 13": ["RED", "Starlight", "Midnight", "Biru", "Merah Muda", "Hijau"],
                "iPhone 13 mini": ["RED", "Starlight", "Midnight", "Biru", "Merah Muda", "Hijau"]
            }
        },
        "iPhone 12/SE2 Seri": {
            models: {
                "iPhone 12 Pro Max": ["Perak", "Grafit", "Emas", "Biru Pasifik"],
                "iPhone 12 Pro": ["Perak", "Grafit", "Emas", "Biru Pasifik"],
                "iPhone 12": ["Hitam", "Putih", "RED", "Hijau", "Biru", "Ungu"],
                "iPhone 12 mini": ["Hitam", "Putih", "RED", "Hijau", "Biru", "Ungu"],
                "iPhone SE (Gen. 2)": ["Putih", "Hitam", "RED"]
            }
        },
        "iPhone 11 Seri": {
            models: {
                "iPhone 11 Pro Max": ["Perak", "Abu-abu", "Emas", "Hijau Gelap"],
                "iPhone 11 Pro": ["Perak", "Abu-abu", "Emas", "Hijau Gelap"],
                "iPhone 11": ["Ungu", "Hijau", "Kuning", "Hitam", "Putih", "RED"]
            }
        },
        "iPhone X/XS/XR Seri": {
            models: {
                "iPhone XS Max": ["Perak", "Abu-abu", "Emas"],
                "iPhone XS": ["Perak", "Abu-abu", "Emas"],
                "iPhone XR": ["Hitam", "Putih", "Biru", "Kuning", "Koral", "RED"],
                "iPhone X": ["Perak", "Abu-abu"]
            }
        },
        "iPhone 8/7 Seri": {
            models: {
                "iPhone 8 Plus": ["Emas", "Perak", "Abu-abu", "RED"],
                "iPhone 8": ["Emas", "Perak", "Abu-abu", "RED"],
                "iPhone 7 Plus": ["Hitam", "Hitam Pekat", "Emas", "Emas Rose", "Perak", "RED"],
                "iPhone 7": ["Hitam", "Hitam Pekat", "Emas", "Emas Rose", "Perak", "RED"]
            }
        },
        "iPhone Klasik": {
            models: {
                "iPhone SE (Gen. 1)": ["Abu-abu", "Perak", "Emas", "Emas Rose"],
                "iPhone 6s Plus": ["Abu-abu", "Perak", "Emas", "Emas Rose"],
                "iPhone 6s": ["Abu-abu", "Perak", "Emas", "Emas Rose"],
                "iPhone 6 Plus": ["Space Gray", "Silver", "Gold"],
                "iPhone 6": ["Space Gray", "Silver", "Gold"],
                "iPhone 5s": ["Space Gray", "Silver", "Gold"],
                "iPhone 5c": ["Putih", "Biru", "Pink", "Hijau", "Kuning"],
                "iPhone 5": ["Hitam", "Putih"],
                "iPhone 4s": ["Hitam", "Putih"],
                "iPhone 4": ["Hitam", "Putih"],
                "iPhone 3GS": ["Hitam", "Putih"],
                "iPhone 3G": ["Hitam", "Putih"],
                "iPhone (Gen. 1)": ["Aluminium Silver"]
            }
        }
    };

    const IPHONE_CAPACITIES = ["64GB", "128GB", "256GB", "512GB", "1TB", "16GB", "32GB"];

    function setupCascadingDropdowns(prefix) {
        const seriesSelect = document.getElementById(`${prefix}-series`);
        const modelSelect = document.getElementById(`${prefix}-model`);
        const colorSelect = document.getElementById(`${prefix}-color`);
        const capacitySelect = document.getElementById(`${prefix}-capacity`);

        if (!seriesSelect || !modelSelect || !colorSelect || !capacitySelect) return;

        // Populate Series
        seriesSelect.innerHTML = '<option value="">-- Pilih Seri --</option>';
        Object.keys(IPHONE_DATABASE).forEach(series => {
            const opt = document.createElement('option');
            opt.value = series;
            opt.textContent = series;
            seriesSelect.appendChild(opt);
        });

        // Populate Capacities
        capacitySelect.innerHTML = '<option value="">-- Pilih Kapasitas --</option>';
        IPHONE_CAPACITIES.forEach(cap => {
            const opt = document.createElement('option');
            opt.value = cap;
            opt.textContent = cap;
            capacitySelect.appendChild(opt);
        });

        // Series change listener
        seriesSelect.addEventListener('change', () => {
            const selectedSeries = seriesSelect.value;
            modelSelect.innerHTML = '<option value="">-- Pilih Model --</option>';
            colorSelect.innerHTML = '<option value="">-- Pilih Warna --</option>';

            if (!selectedSeries) return;

            const models = IPHONE_DATABASE[selectedSeries].models;
            Object.keys(models).forEach(model => {
                const opt = document.createElement('option');
                opt.value = model;
                opt.textContent = model;
                modelSelect.appendChild(opt);
            });
        });

        // Model change listener
        modelSelect.addEventListener('change', () => {
            const selectedSeries = seriesSelect.value;
            const selectedModel = modelSelect.value;
            colorSelect.innerHTML = '<option value="">-- Pilih Warna --</option>';

            if (!selectedSeries || !selectedModel) return;

            const colors = IPHONE_DATABASE[selectedSeries].models[selectedModel];
            colors.forEach(color => {
                const opt = document.createElement('option');
                opt.value = color;
                opt.textContent = color;
                colorSelect.appendChild(opt);
            });
        });
    }

    // Initialize dropdowns
    setupCascadingDropdowns('buy-unit');
    setupCascadingDropdowns('edit-stock');

    // Populate User Display in topbar
    const userDisplayEl = document.getElementById('user-display');
    if (userDisplayEl && activeUser) {
        userDisplayEl.textContent = '@' + activeUser;
    }

    // DOM Elements
    const tabContents = document.querySelectorAll('.tab-content');
    const sidebarTabLinks = document.querySelectorAll('.sidebar .nav-item[data-tab]');
    const pageDisplayTitle = document.getElementById('page-display-title');
    
    // KPI elements
    const kpiTotalStock = document.getElementById('kpi-total-stock');
    const kpiReadyStock = document.getElementById('kpi-ready-stock');
    const kpiReservedStock = document.getElementById('kpi-reserved-stock');
    const kpiReceivable = document.getElementById('kpi-receivable');
    const kpiProfit = document.getElementById('kpi-profit');
    const kpiCapital = document.getElementById('kpi-capital');
    const kpiGrossRevenue = document.getElementById('kpi-gross-revenue');
    const kpiTotalStockSec = document.getElementById('kpi-total-stock-sec');

    // Modals
    const modalBuy = document.getElementById('modal-buy');
    const modalSell = document.getElementById('modal-sell');
    const modalSellDetail = document.getElementById('modal-sell-detail');
    const modalAddCust = document.getElementById('modal-add-cust');
    const modalCreateMutation = document.getElementById('modal-create-mutation');
    
    const btnOpenBuy = document.getElementById('btn-open-buy');
    const btnOpenSell = document.getElementById('btn-open-sell');
    const btnOpenAddCust = document.getElementById('btn-open-add-cust');
    const btnOpenAddMutation = document.getElementById('btn-open-add-mutation');
    const modalCloses = document.querySelectorAll('.modal-close');
    
    // Forms
    const formCreateBuy = document.getElementById('form-create-buy');
    const formCreateSell = document.getElementById('form-create-sell');
    const formAddCust = document.getElementById('form-add-cust');
    const formCreateMutation = document.getElementById('form-create-mutation');
    
    const buyCustomerSelect = document.getElementById('buy-customer');
    const sellCustomerSelect = document.getElementById('sell-customer');
    const sellStockSelect = document.getElementById('sell-stock');
    
    // State
    let selectedSellId = null;
    let currentDetailStockId = null;
    let currentStockFilter = 'ALL';

    // --- UTILITIES / FORMATTERS ---
    const fmt = {
        rupiah: (num) => `Rp ${Number(num || 0).toLocaleString('en-US')}`,
        rupiahShort: (num) => {
            const n = Number(num || 0);
            if (n >= 1000000) return `${(n / 1000000).toFixed(1)}Jt`;
            if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
            return `${n}`;
        },
        datetime: (isoStr) => {
            if (!isoStr) return '-';
            return new Date(isoStr).toLocaleString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        },
        date: (isoStr) => {
            if (!isoStr) return '-';
            return new Date(isoStr).toLocaleDateString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        }
    };

    function showFeedback(message, type = 'success') {
        const existing = document.getElementById('sys-feedback');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.id = 'sys-feedback';
        const bgColor = type === 'success' ? '#09090B' : '#DC2626';
        const borderColor = type === 'success' ? '#0052FF' : '#DC2626';
        const icon = type === 'success' ? '✓' : '✕';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: ${bgColor};
            color: #F4F4F5;
            border: 2px solid ${borderColor};
            padding: 12px 24px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            font-weight: 700;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 4px 4px 0px 0px rgba(9,9,11,1);
            animation: feedbackSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        `;
        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function createEmptyState(icon, title, body, ctaLabel = null, ctaCallback = null) {
        const div = document.createElement('div');
        div.className = 'col-span-1 md:col-span-2 xl:col-span-3 text-center py-12 px-6 border-2 border-dashed border-zinc-300 bg-zinc-50';
        div.innerHTML = `
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 2rem; margin-bottom: 12px; opacity: 0.3;">${icon}</div>
            <h3 style="font-weight: 700; font-size: 0.9rem; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">${title}</h3>
            <p style="font-size: 0.8rem; color: #71717A; max-width: 280px; margin: 0 auto 16px;">${body}</p>
            ${ctaLabel ? `<button id="empty-cta" class="px-4 py-2 bg-planet-dark text-white font-mono text-[11px] font-bold uppercase border-2 border-planet-dark cursor-pointer hover:bg-planet-accent hover:text-white transition-colors">${ctaLabel}</button>` : ''}
        `;
        if (ctaLabel && ctaCallback) {
            div.querySelector('#empty-cta').addEventListener('click', ctaCallback);
        }
        return div;
    }

    window.setStockFilter = function(btn, status) {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        currentStockFilter = status;
        renderStock();
    };

    // --- RENDER FUNCTIONS ---

    function renderKPIs() {
        const stock = getStock();
        const sales = getSellTransactions();
        const mutations = getMutations();

        const totalCount = stock.length;
        const readyCount = stock.filter(s => s.status === 'TERSEDIA').length;
        const reservedCount = stock.filter(s => s.status === 'RESERVED').length;
        const soldCount = stock.filter(s => s.status === 'TERJUAL').length;

        // Asymmetric Live Stock KPIs
        const elLiveSoldCount = document.getElementById('ov-live-sold-count');
        const elLiveTotalCount = document.getElementById('ov-live-total-count');
        const elLiveProgressFill = document.getElementById('ov-live-progress-fill');
        const elLivePercentSold = document.getElementById('ov-live-percent-sold');
        const elLivePercentReady = document.getElementById('ov-live-percent-ready');

        if (elLiveSoldCount) elLiveSoldCount.textContent = soldCount;
        if (elLiveTotalCount) elLiveTotalCount.textContent = totalCount;

        const soldPercent = totalCount > 0 ? Math.round((soldCount / totalCount) * 100) : 0;
        if (elLiveProgressFill) elLiveProgressFill.style.width = `${soldPercent}%`;
        if (elLivePercentSold) elLivePercentSold.textContent = `${soldPercent}% TERJUAL`;
        if (elLivePercentReady) elLivePercentReady.textContent = `${100 - soldPercent}% READY`;

        if (kpiTotalStock) kpiTotalStock.textContent = totalCount;
        if (kpiReadyStock) kpiReadyStock.textContent = readyCount;
        if (kpiReservedStock) kpiReservedStock.textContent = reservedCount;

        // Finance calculations
        let grossIn = 0;
        let capital = 0;
        let netProfit = 0;
        let receivable = 0;

        // Modal tertanam (Capital) = Sum purchase_price of active stock (TERSEDIA / RESERVED)
        stock.forEach(item => {
            if (item.status === 'TERSEDIA' || item.status === 'RESERVED') {
                capital += item.purchase_price;
            }
        });

        // Accounts Receivable (Piutang) = Sum of outstanding bill in active sales
        sales.forEach(s => {
            receivable += s.remaining_bill;
        });

        // Mutasi revenue
        mutations.forEach(m => {
            if (m.type === 'MASUK' && m.category === 'Jual iPhone') {
                grossIn += m.amount;
            }
        });

        // Net Profit = (Sell Price - Buy Price of Sold Units) - Discount
        sales.forEach(s => {
            s.units.forEach(u => {
                const originalUnit = stock.find(stk => stk.id === u.stock_id);
                if (originalUnit) {
                    netProfit += (u.price - originalUnit.purchase_price);
                }
            });
            netProfit -= s.discount;
        });

        if (kpiReceivable) kpiReceivable.textContent = fmt.rupiah(receivable);
        if (kpiCapital) kpiCapital.textContent = fmt.rupiah(capital);
        if (kpiGrossRevenue) kpiGrossRevenue.textContent = fmt.rupiah(grossIn);
        if (kpiProfit) kpiProfit.textContent = fmt.rupiah(netProfit);
    }

    function renderStock() {
        let stock = getStock();
        const container = document.getElementById('stock-cards-grid');
        if (!container) return;
        container.innerHTML = '';

        if (currentStockFilter !== 'ALL') {
            stock = stock.filter(s => s.status === currentStockFilter);
        }

        if (stock.length === 0) {
            container.appendChild(createEmptyState(
                '[ _ ]',
                `Tidak Ada Unit "${currentStockFilter}"`,
                'Tidak ditemukan stok iPhone dengan status terpilih.',
                currentStockFilter === 'ALL' ? '+ Tambah Stok Pertama' : null,
                currentStockFilter === 'ALL' ? () => btnOpenBuy.click() : null
            ));
            return;
        }

        stock.forEach(u => {
            const card = document.createElement('div');
            card.className = 'stock-card';
            
            let badgeClass = 'badge-tersedia';
            if (u.status === 'TERJUAL') badgeClass = 'badge-terjual';
            else if (u.status === 'RESERVED') badgeClass = 'badge-maintenance';

            // Calculate profit margin estimate
            const margin = u.selling_price - u.purchase_price;
            const marginPct = u.purchase_price > 0 ? Math.round((margin / u.purchase_price) * 100) : 0;

            // Calculate ageing / slow-moving stock (threshold: 7 days for demo)
            const daysInStock = Math.floor((new Date() - new Date(u.date_entered)) / (1000 * 60 * 60 * 24));
            const isSlowMoving = u.status === 'TERSEDIA' && daysInStock > 7;
            const slowMovingBadge = isSlowMoving ? `<span class="badge" style="background:#EF4444; color:#fff; position:absolute; top:8px; left:8px; font-size:8px; z-index:10; font-weight:800; border-radius:4px; padding:2px 6px;">LAMA (${daysInStock} HARI)</span>` : '';

            // IMEI & iCloud status styles
            const imeiStatusText = u.imei_status || 'TERDAFTAR';
            const icloudStatusText = u.icloud_status || 'CLEAN';

            let imeiStatusClass = 'background: rgba(16, 185, 129, 0.1); color: #10B981;';
            if (imeiStatusText === 'BLOKIR') imeiStatusClass = 'background: rgba(239, 68, 68, 0.1); color: #EF4444; font-weight:700;';
            else if (imeiStatusText === 'SMARTFREN') imeiStatusClass = 'background: rgba(245, 158, 11, 0.1); color: #F59E0B;';

            let icloudStatusClass = icloudStatusText === 'CLEAN' ? 'background: rgba(16, 185, 129, 0.1); color: #10B981;' : 'background: rgba(239, 68, 68, 0.1); color: #EF4444; font-weight:700;';

            const isSvg = u.photo && (u.photo.startsWith('data:image/svg') || u.photo.startsWith('<svg'));
            const photoHtml = isSvg ? u.photo : `<img src="${u.photo}" alt="${u.model}" style="width:100%; height:100%; object-fit:cover; display:block;" />`;

            card.innerHTML = `
                <div class="stock-card-img" style="position: relative; height: 160px; display: flex; align-items: center; justify-content: center; background: #F8FAFC;">
                    <span class="badge ${badgeClass} stock-card-badge">${u.status}</span>
                    ${slowMovingBadge}
                    <div style="width: 100%; height: 100%; display:flex; align-items:center; justify-content:center; padding:0;" class="inventory-photo">${photoHtml}</div>
                </div>
                <div class="stock-card-content flex-1 flex flex-col">
                    <h3 class="stock-card-title">${u.model}</h3>
                    <div class="stock-card-specs">${u.capacity} · ${u.color} · Grade: ${u.grade}</div>
                    
                    <div style="display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
                        <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; ${imeiStatusClass}">IMEI: ${imeiStatusText}</span>
                        <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; ${icloudStatusClass}">iCloud: ${icloudStatusText}</span>
                    </div>

                    <div class="stock-card-details">
                        <div class="stock-card-detail-item">
                            <span class="stock-card-price-label">Harga Beli (Modal):</span>
                            <span class="stock-card-price-val">${fmt.rupiah(u.purchase_price)}</span>
                        </div>
                        <div class="stock-card-detail-item">
                            <span class="stock-card-price-label">Harga Jual Rekomendasi:</span>
                            <span class="stock-card-price-val" style="color:var(--accent-blue)">${fmt.rupiah(u.selling_price)}</span>
                        </div>
                        <div class="stock-card-detail-item border-t border-dashed border-zinc-200 mt-2 pt-2 text-green-600 font-bold">
                            <span>Margin Untung:</span>
                            <span>${fmt.rupiah(margin)} (${marginPct}%)</span>
                        </div>
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-body); margin-bottom:12px; line-height:1.4;">
                        <strong>Kondisi Fisik:</strong><br>${u.condition} · ${u.notes || '-'}
                    </div>
                    <div class="stock-card-footer mt-auto flex justify-between font-mono text-[9px]">
                        <span>IMEI: ${u.imei}</span>
                        <span>Masuk: ${fmt.date(u.date_entered)}</span>
                    </div>
                </div>
            `;
            
            // Interaction to change status or show detail
            card.addEventListener('click', () => {
                openStockDetailModal(u);
            });

            container.appendChild(card);
        });
    }

    function openStockDetailModal(unit) {
        const stock = getStock();
        const u = stock.find(item => item.id === unit.id);
        if (!u) return;

        currentDetailStockId = u.id;

        // Reset display mode
        document.getElementById('stock-view-mode').classList.remove('hidden');
        document.getElementById('form-edit-stock').classList.add('hidden');
        document.getElementById('sd-footer-view').classList.remove('hidden');
        document.getElementById('sd-footer-edit').classList.add('hidden');

        // Set Title
        document.getElementById('stock-detail-title').textContent = `Detail Unit - ${u.model}`;

        // Photo
        const isSvg = u.photo && (u.photo.startsWith('data:image/svg') || u.photo.startsWith('<svg'));
        const photoHtml = isSvg ? u.photo : `<img src="${u.photo}" alt="${u.model}" style="max-width:100%; max-height:100%; object-fit:contain;" />`;
        document.getElementById('sd-photo-container').innerHTML = photoHtml;

        // Header info
        document.getElementById('sd-model').textContent = u.model;
        document.getElementById('sd-code').textContent = u.code;

        // Status Badge
        let badgeClass = 'badge-tersedia';
        if (u.status === 'TERJUAL') badgeClass = 'badge-terjual';
        else if (u.status === 'RESERVED') badgeClass = 'badge-maintenance';

        const badgeStatus = document.getElementById('sd-badge-status');
        badgeStatus.className = 'badge ' + badgeClass;
        badgeStatus.textContent = u.status;

        // Age Badge
        const daysInStock = Math.floor((new Date() - new Date(u.date_entered)) / (1000 * 60 * 60 * 24));
        const badgeAge = document.getElementById('sd-badge-age');
        badgeAge.textContent = `${daysInStock} Hari`;
        if (daysInStock > 7) {
            badgeAge.style.background = '#EF4444';
            badgeAge.style.color = '#fff';
        } else {
            badgeAge.style.background = 'var(--bg-surface-hover)';
            badgeAge.style.color = 'var(--text-body)';
        }

        // Ticket grids
        document.getElementById('sd-specs').textContent = `${u.capacity} · ${u.color} · Grade: ${u.grade}`;
        document.getElementById('sd-imei').textContent = u.imei;
        document.getElementById('sd-imei-icloud-status').textContent = `IMEI: ${u.imei_status || 'TERDAFTAR'} · iCloud: ${u.icloud_status || 'CLEAN'}`;
        document.getElementById('sd-condition-completeness').textContent = `${u.condition} · ${u.kelengkapan || '-'} · ${u.region || 'iBox / Resmi Indonesia'}`;
        document.getElementById('sd-purchase-price').textContent = fmt.rupiah(u.purchase_price);
        document.getElementById('sd-selling-price').textContent = fmt.rupiah(u.selling_price);

        // Notes
        document.getElementById('sd-notes').textContent = u.notes || 'Tidak ada catatan tambahan.';

        // Show Modal
        document.getElementById('modal-stock-detail').classList.add('active');
    }

    function renderPurchases() {
        const purchases = getBuyTransactions();
        const tbody = document.getElementById('purchases-table-body');
        const query = document.getElementById('buy-search').value.toLowerCase();
        
        if (!tbody) return;
        tbody.innerHTML = '';

        const filtered = purchases.filter(p => {
            return p.code.toLowerCase().includes(query) ||
                   p.supplier_name.toLowerCase().includes(query) ||
                   p.customer_name.toLowerCase().includes(query) ||
                   p.units.some(u => u.model.toLowerCase().includes(query));
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 32px; font-family: monospace;">Tidak ada transaksi pembelian ditemukan</td></tr>`;
            return;
        }

        filtered.forEach(p => {
            const tr = document.createElement('tr');
            const formattedDate = fmt.datetime(p.date);
            const unitNames = p.units.map(u => u.model).join(', ');

            tr.innerHTML = `
                <td style="font-weight:700; color:var(--accent-blue);" class="py-3 px-4 font-mono font-bold">${p.code}</td>
                <td class="py-3 px-4"><span class="badge ${p.source_type === 'SUPPLIER' ? 'badge-dipinjam' : 'badge-tersedia'}">${p.source_type}</span></td>
                <td class="py-3 px-4 font-semibold">${p.source_type === 'SUPPLIER' ? p.supplier_name : p.customer_name}</td>
                <td class="py-3 px-4">${unitNames}</td>
                <td style="font-weight:700;" class="py-3 px-4 font-mono text-right">${fmt.rupiah(p.total_buy_price)}</td>
                <td class="py-3 px-4 font-mono text-xs">${p.pay_method}</td>
                <td style="font-size:0.8rem; color:var(--text-body);" class="py-3 px-4">${formattedDate}</td>
                <td style="font-size:0.8rem; color:var(--text-muted);" class="py-3 px-4 font-mono">@${p.logged_by}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderSales() {
        const sales = getSellTransactions();
        const tbody = document.getElementById('sales-table-body');
        const query = document.getElementById('sell-search').value.toLowerCase();

        if (!tbody) return;
        tbody.innerHTML = '';

        const filtered = sales.filter(s => {
            return s.code.toLowerCase().includes(query) ||
                   s.customer_name.toLowerCase().includes(query) ||
                   s.units.some(u => u.model.toLowerCase().includes(query));
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted); padding: 32px; font-family: monospace;">Tidak ada transaksi penjualan ditemukan</td></tr>`;
            return;
        }

        filtered.forEach(s => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-zinc-50 cursor-pointer';
            const formattedDate = fmt.datetime(s.date);
            const unitNames = s.units.map(u => u.model).join(', ');

            let statusPayBadge = 'badge-lunas';
            if (s.payment_status === 'DP') statusPayBadge = 'badge-dp';
            else if (s.payment_status === 'BELUM') statusPayBadge = 'badge-belum';

            tr.innerHTML = `
                <td style="font-weight:700; color:var(--accent-blue);" class="py-3 px-4 font-mono font-bold">${s.code}</td>
                <td class="py-3 px-4 font-semibold">${s.customer_name}</td>
                <td class="py-3 px-4">${unitNames}</td>
                <td style="color:var(--text-secondary);" class="py-3 px-4 font-mono text-right">${fmt.rupiah(s.discount)}</td>
                <td style="font-weight:700; color:var(--status-tersedia);" class="py-3 px-4 font-mono text-right">${fmt.rupiah(s.total_pay)}</td>
                <td style="color:${s.remaining_bill > 0 ? 'var(--status-hilang)' : 'var(--text-muted)'}; font-weight:700;" class="py-3 px-4 font-mono text-right">${fmt.rupiah(s.remaining_bill)}</td>
                <td class="py-3 px-4 font-mono text-xs">${s.pay_method}</td>
                <td class="py-3 px-4"><span class="badge ${statusPayBadge}">${s.payment_status}</span></td>
                <td style="font-size:0.8rem; color:var(--text-body);" class="py-3 px-4">${formattedDate}</td>
                <td class="py-3 px-4">
                    <button class="btn-detail px-2 py-1 text-[10px] font-bold uppercase border border-planet-dark hover:bg-zinc-200 font-mono transition-colors" data-id="${s.id}">DETAIL</button>
                </td>
            `;

            tr.addEventListener('click', () => {
                openSellDetailModal(s.id);
            });
            tr.querySelector('.btn-detail').addEventListener('click', (e) => {
                e.stopPropagation();
                openSellDetailModal(s.id);
            });

            tbody.appendChild(tr);
        });
    }

    function renderCustomers() {
        const custs = getCustomers();
        const tbody = document.getElementById('cust-table-body');
        const query = document.getElementById('cust-search').value.toLowerCase();

        if (!tbody) return;
        tbody.innerHTML = '';

        const filtered = custs.filter(c => {
            return c.name.toLowerCase().includes(query) ||
                   c.phone.toLowerCase().includes(query) ||
                   c.address.toLowerCase().includes(query) ||
                   c.identity_no.toLowerCase().includes(query);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px; font-family: monospace;">Tidak ada customer ditemukan</td></tr>`;
            return;
        }

        filtered.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:600; color:var(--text-title);" class="py-3 px-4 font-semibold">${c.name}</td>
                <td style="font-weight:600; color:var(--accent-blue);" class="py-3 px-4 font-mono text-xs">${c.phone}</td>
                <td style="font-size:0.85rem; color:var(--text-secondary);" class="py-3 px-4">${c.address}</td>
                <td class="py-3 px-4"><span class="badge badge-tersedia">${c.identity_type}</span></td>
                <td style="font-family:monospace; font-size:0.85rem;" class="py-3 px-4 font-mono text-xs">${c.identity_no}</td>
                <td style="font-weight:500;" class="py-3 px-4 text-sm">${c.guarantee || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderMutations() {
        const mutations = getMutations();
        const tbody = document.getElementById('mutations-table-body');
        const finTotalIn = document.getElementById('fin-total-in');
        const finTotalOut = document.getElementById('fin-total-out');
        const finNetBal = document.getElementById('fin-net-balance');

        if (!tbody) return;
        tbody.innerHTML = '';

        const fromStr = document.getElementById('filter-mut-from')?.value;
        const toStr = document.getElementById('filter-mut-to')?.value;

        const filtered = mutations.filter(m => {
            if (fromStr && m.date < fromStr) return false;
            if (toStr && m.date > toStr + 'T23:59:59') return false;
            return true;
        });

        let sumIn = 0;
        let sumOut = 0;

        filtered.forEach(m => {
            if (m.type === 'MASUK') sumIn += m.amount;
            else sumOut += m.amount;

            const tr = document.createElement('tr');
            const formattedDate = fmt.datetime(m.date);
            
            tr.innerHTML = `
                <td style="color:var(--text-secondary); font-size:0.8rem;" class="py-3 px-4">${formattedDate}</td>
                <td style="font-weight:600; color:var(--text-title);" class="py-3 px-4 font-mono font-bold">${m.ref_id}</td>
                <td class="py-3 px-4"><span class="badge" style="background-color:${m.type === 'MASUK' ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.1)'}; color:${m.type === 'MASUK' ? 'var(--status-tersedia)' : 'var(--status-hilang)'}">${m.type}</span></td>
                <td class="py-3 px-4"><span style="font-weight:500;">${m.category}</span></td>
                <td style="font-weight:700; color:${m.type === 'MASUK' ? 'var(--status-tersedia)' : 'var(--status-hilang)'}" class="py-3 px-4 font-mono font-bold">${fmt.rupiah(m.amount)}</td>
                <td class="py-3 px-4"><span style="font-size:0.8rem; background:rgba(255,255,255,0.02); padding:4px 8px; border:1px solid var(--border-soft);" class="font-mono text-xs">${m.pay_method}</span></td>
                <td style="font-size:0.85rem; color:var(--text-secondary); max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" class="py-3 px-4 text-xs">${m.note}</td>
                <td style="font-size:0.8rem; color:var(--text-muted);" class="py-3 px-4 font-mono text-xs">@${m.logged_by}</td>
            `;
            tbody.appendChild(tr);
        });

        if (finTotalIn) finTotalIn.textContent = fmt.rupiah(sumIn);
        if (finTotalOut) finTotalOut.textContent = fmt.rupiah(sumOut);
        const net = sumIn - sumOut;
        if (finNetBal) {
            finNetBal.textContent = fmt.rupiah(net);
            finNetBal.style.color = net >= 0 ? 'var(--status-tersedia)' : 'var(--status-hilang)';
        }
    }

    // --- OVERVIEW DASHBOARD LOGIC ---

    function renderOverviewDashboard() {
        const sales = getSellTransactions();
        const mutations = getMutations();

        // 1. Chart
        renderOverviewChart(sales);

        // 2. Payment breakdown donut
        renderPaymentBreakdown(mutations);

        // 3. Model terlaris
        renderPopularUnits(sales);
    }

    function renderOverviewChart(sales) {
        const wrapper = document.getElementById('overview-chart-wrapper');
        if (!wrapper) return;

        wrapper.innerHTML = '';

        let tooltip = document.getElementById('chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chart-tooltip';
            tooltip.className = 'chart-tooltip';
            document.body.appendChild(tooltip);
        }

        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }

        const dailyData = dates.map(dateStr => {
            const daySales = sales.filter(s => s.date.split('T')[0] === dateStr);
            const totalRevenue = daySales.reduce((sum, s) => sum + (s.total_pay || 0), 0);
            const dObj = new Date(dateStr);
            const label = dObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            return { date: dateStr, label, revenue: totalRevenue };
        });

        const minVal = 0;
        const maxVal = Math.max(1000000, ...dailyData.map(d => d.revenue));
        const range = maxVal - minVal;

        const width = 500;
        const height = 240;
        const padding = { top: 20, right: 30, bottom: 40, left: 75 };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;

        const getY = (val) => padding.top + chartH - ((val - minVal) / range) * chartH;
        const getX = (index) => padding.left + (index * (chartW / (dates.length - 1)));

        const formatRupiahShort = (value) => {
            if (value === 0) return 'Rp 0';
            const absValue = Math.abs(value);
            let formatted = '';
            if (absValue >= 1000000) {
                formatted = (absValue / 1000000).toFixed(2).replace(/\.00$/, '').replace(/\.(\d)0$/, '.$1').replace('.', ',') + ' Jt';
            } else if (absValue >= 1000) {
                formatted = (absValue / 1000).toFixed(0) + ' Rb';
            } else {
                formatted = absValue.toString();
            }
            return `Rp ${formatted}`;
        };

        let gridHTML = '';
        const yTicks = 4;
        for (let i = 0; i <= yTicks; i++) {
            const val = minVal + (range / yTicks) * i;
            const y = getY(val);
            gridHTML += `<line class="chart-grid" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />`;
            gridHTML += `<text class="chart-axis-text" x="${padding.left - 10}" y="${y + 4}" text-anchor="end">${formatRupiahShort(val)}</text>`;
        }

        let linePoints = [];
        dailyData.forEach((d, idx) => {
            const cx = getX(idx);
            gridHTML += `<text class="chart-axis-text" x="${cx}" y="${height - padding.bottom + 20}" text-anchor="middle">${d.label}</text>`;
            linePoints.push(`${cx},${getY(d.revenue)}`);
        });

        const lineHTML = `<path class="chart-line" d="M ${linePoints.join(' L ')}" fill="none" filter="url(#chart-glow)" />`;

        let dotsHTML = '';
        dailyData.forEach((d, idx) => {
            const cx = getX(idx);
            const cy = getY(d.revenue);
            dotsHTML += `<circle class="chart-dot" cx="${cx}" cy="${cy}" r="5" data-title="${d.label}" data-desc="Omset Penjualan: Rp ${d.revenue.toLocaleString('id-ID')}" />`;
        });

        const yBaseline = getY(0);
        const firstX = getX(0);
        const lastX = getX(dailyData.length - 1);
        const areaPoints = `${firstX},${yBaseline} L ${linePoints.join(' L ')} L ${lastX},${yBaseline} Z`;
        const areaHTML = `<path d="M ${areaPoints}" fill="url(#chart-area-grad)" />`;

        wrapper.innerHTML = `
            <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
                <defs>
                    <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.25" />
                        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.0" />
                    </linearGradient>
                    <filter id="chart-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="var(--accent)" flood-opacity="0.15" />
                    </filter>
                </defs>
                ${gridHTML}
                ${areaHTML}
                ${lineHTML}
                ${dotsHTML}
                <line class="chart-axis" x1="${padding.left}" y1="${yBaseline}" x2="${width - padding.right}" y2="${yBaseline}" />
            </svg>
        `;

        const interactiveElements = wrapper.querySelectorAll('.chart-dot');
        interactiveElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const title = el.getAttribute('data-title');
                const desc = el.getAttribute('data-desc');
                tooltip.innerHTML = `
                    <div style="font-weight:700; border-bottom:1px solid rgba(255,255,255,0.2); padding-bottom:4px; margin-bottom:4px; color:var(--accent-orange);">${title}</div>
                    <div style="font-size:0.72rem;">${desc}</div>
                `;
                tooltip.style.opacity = '1';
                tooltip.style.left = `${e.pageX + 15}px`;
                tooltip.style.top = `${e.pageY - 25}px`;
            });

            el.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        });
    }

    function renderPaymentBreakdown(mutations) {
        const breakdownContainer = document.getElementById('ov-payment-breakdown');
        if (!breakdownContainer) return;

        const payments = mutations.filter(m => m.type === 'MASUK' && m.category === 'Jual iPhone');
        const totalPayAmount = payments.reduce((sum, m) => sum + m.amount, 0);
        
        const methods = { 'TUNAI': 0, 'TRANSFER': 0, 'QRIS': 0 };
        payments.forEach(p => {
            methods[p.pay_method] = (methods[p.pay_method] || 0) + p.amount;
        });

        breakdownContainer.innerHTML = '';
        const colors = { 'TUNAI': 'var(--status-diambil)', 'TRANSFER': 'var(--primary-purple)', 'QRIS': 'var(--accent-orange)' };

        const legendDiv = document.createElement('div');
        legendDiv.className = 'pay-legend';

        // SVG Donut implementation
        let donutSVG = `<svg viewBox="0 0 100 100" style="width: 100px; height: 100px; margin-right: 20px; flex-shrink: 0;">`;
        let accumulatedPercent = 0;
        const radius = 35;
        const circumference = 2 * Math.PI * radius;

        Object.keys(methods).forEach((method) => {
            const amount = methods[method];
            const percent = totalPayAmount > 0 ? (amount / totalPayAmount) : 0;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;

            const col = colors[method] || '#cbd5e1';
            donutSVG += `<circle cx="50" cy="50" r="${radius}" fill="none" stroke="${col}" stroke-width="14" stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}" transform="rotate(-90 50 50)" />`;

            const legendItem = document.createElement('div');
            legendItem.className = 'pay-legend-item';
            legendItem.innerHTML = `
                <div style="display:flex; align-items:center;">
                    <span class="pay-legend-dot" style="background:${col}"></span>
                    <span class="pay-legend-label">${method}</span>
                </div>
                <div style="display:flex; align-items:center;">
                    <span class="pay-legend-value">Rp ${amount.toLocaleString('id-ID')}</span>
                    <span class="pay-legend-pct">${Math.round(percent * 100)}%</span>
                </div>
            `;
            legendDiv.appendChild(legendItem);
        });

        donutSVG += `<circle cx="50" cy="50" r="25" fill="var(--bg-surface)" /></svg>`;

        const flexContainer = document.createElement('div');
        flexContainer.style = 'display:flex; align-items:center; gap:16px; width:100%;';
        flexContainer.innerHTML = donutSVG;
        flexContainer.appendChild(legendDiv);
        breakdownContainer.appendChild(flexContainer);
    }

    function renderPopularUnits(sales) {
        const container = document.getElementById('ov-popular-units');
        if (!container) return;

        const counts = {};
        sales.forEach(s => {
            s.units.forEach(u => {
                counts[u.model] = (counts[u.model] || 0) + 1;
            });
        });

        const sorted = Object.keys(counts).map(name => ({ name, count: counts[name] }))
                                         .sort((a, b) => b.count - a.count);

        container.innerHTML = '';
        if (sorted.length === 0) {
            container.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:10px 0;">Belum ada riwayat transaksi penjualan</div>`;
            return;
        }

        sorted.slice(0, 3).forEach(item => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center padding:8px 0; border-bottom:1px dashed var(--border-soft); font-mono text-xs';
            div.style.padding = '8px 0';
            div.innerHTML = `
                <span style="font-weight:600; color:var(--text-title);">${item.name}</span>
                <span style="background:rgba(0,82,255,0.08); color:var(--accent-blue); font-weight:700; padding:2px 10px; border:1px solid border-planet-dark;">${item.count}x Terjual</span>
            `;
            container.appendChild(div);
        });
    }

    // --- FORM INTERACTIONS & OPTIONS ---

    function populateBuyFormDropdowns() {
        if (!buyCustomerSelect) return;
        buyCustomerSelect.innerHTML = '<option value="">-- Pilih Customer --</option>';
        getCustomers().forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.name} (${c.phone})`;
            buyCustomerSelect.appendChild(opt);
        });
    }

    function populateSellFormDropdowns() {
        if (!sellCustomerSelect || !sellStockSelect) return;
        
        // Customers
        sellCustomerSelect.innerHTML = '<option value="">-- Pilih Customer --</option>';
        getCustomers().forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.name} (${c.phone})`;
            sellCustomerSelect.appendChild(opt);
        });

        // Ready units
        sellStockSelect.innerHTML = '<option value="">-- Pilih iPhone Ready --</option>';
        getStock().forEach(s => {
            if (s.status === 'TERSEDIA') {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = `${s.model} ${s.capacity} ${s.color} (Harga Beli: ${fmt.rupiah(s.purchase_price)})`;
                sellStockSelect.appendChild(opt);
            }
        });
    }

    // Sell dynamic fee preview calculators
    function calculateSaleEstimates() {
        const stockId = sellStockSelect.value;
        const finalPriceVal = parseFloat(document.getElementById('sell-price-final').value.replace(/\D/g, '')) || 0;
        const discountVal = parseFloat(document.getElementById('sell-discount').value.replace(/\D/g, '')) || 0;
        const dpVal = parseFloat(document.getElementById('sell-dp-amount').value.replace(/\D/g, '')) || 0;
        
        const elRemaining = document.getElementById('sell-remaining-bill');
        const elMargin = document.getElementById('sell-estimated-margin');

        // Dynamic summary labels
        const susSpecs = document.getElementById('sus-specs');
        const susCondition = document.getElementById('sus-condition');
        const susBuyPrice = document.getElementById('sus-buy-price');
        const susSellPrice = document.getElementById('sus-sell-price');
        const susImeiStatusDisplay = document.getElementById('sell-imei-status-display');

        if (!stockId) {
            susSpecs.textContent = '-';
            susCondition.textContent = '-';
            susBuyPrice.textContent = 'Rp 0';
            susSellPrice.textContent = 'Rp 0';
            elRemaining.textContent = 'Rp 0';
            elMargin.textContent = 'Rp 0';
            if (susImeiStatusDisplay) susImeiStatusDisplay.value = '-';
            return;
        }

        const stock = getStock();
        const u = stock.find(item => item.id === stockId);
        if (!u) return;

        susSpecs.textContent = `${u.model} · ${u.capacity} · ${u.color}`;
        susCondition.textContent = `${u.condition} (Grade: ${u.grade})`;
        susBuyPrice.textContent = fmt.rupiah(u.purchase_price);
        susSellPrice.textContent = fmt.rupiah(u.selling_price);
        if (susImeiStatusDisplay) {
            susImeiStatusDisplay.value = `IMEI: ${u.imei_status || 'TERDAFTAR'} | iCloud: ${u.icloud_status || 'CLEAN'}`;
        }

        const totalPay = Math.max(0, finalPriceVal - discountVal);
        const remainingBill = Math.max(0, totalPay - dpVal);
        const marginProfit = totalPay - u.purchase_price;

        elRemaining.textContent = fmt.rupiah(remainingBill);
        elMargin.textContent = fmt.rupiah(marginProfit);
        elMargin.style.color = marginProfit >= 0 ? 'var(--status-tersedia)' : 'var(--status-hilang)';
    }

    sellStockSelect.addEventListener('change', calculateSaleEstimates);
    document.getElementById('sell-price-final').addEventListener('input', calculateSaleEstimates);
    document.getElementById('sell-discount').addEventListener('input', calculateSaleEstimates);
    document.getElementById('sell-dp-amount').addEventListener('input', calculateSaleEstimates);

    // Form Buy Submit (Stock In)
    formCreateBuy.addEventListener('submit', (e) => {
        e.preventDefault();

        const sourceType = document.getElementById('buy-source-type').value;
        const custId = buyCustomerSelect.value;
        const supplierName = document.getElementById('buy-supplier').value;
        const model = document.getElementById('buy-unit-model').value;
        const color = document.getElementById('buy-unit-color').value;
        const capacity = document.getElementById('buy-unit-capacity').value;
        const region = document.getElementById('buy-unit-region').value;
        const imei = document.getElementById('buy-unit-imei').value;
        const condition = document.getElementById('buy-unit-condition').value;
        const grade = document.getElementById('buy-unit-grade').value;
        const kelengkapan = document.getElementById('buy-unit-kelengkapan').value;
        
        const buyPrice = parseFloat(document.getElementById('buy-price').value.replace(/\D/g, '')) || 0;
        const sellEstimate = parseFloat(document.getElementById('buy-sell-estimate').value.replace(/\D/g, '')) || 0;
        const payMethod = document.getElementById('buy-pay-method').value;
        const notes = document.getElementById('buy-notes').value;
        
        const imeiStatus = document.getElementById('buy-unit-imei-status').value;
        const icloudStatus = document.getElementById('buy-unit-icloud-status').value;

        if (!model || !color || !capacity) {
            showFeedback('Pilih Seri, Model, Warna, dan Kapasitas unit terlebih dahulu.', 'error');
            return;
        }

        if (sourceType === 'CUSTOMER' && !custId) {
            showFeedback('Pilih customer terlebih dahulu.', 'error');
            return;
        }
        if (sourceType === 'SUPPLIER' && !supplierName) {
            showFeedback('Nama supplier wajib diisi.', 'error');
            return;
        }
        if (buyPrice <= 0 || sellEstimate <= 0) {
            showFeedback('Nominal harga harus valid.', 'error');
            return;
        }

        const stock = getStock();
        const purchases = getBuyTransactions();
        const mutations = getMutations();

        // 1. Generate stock object
        const newStockId = 'stk-' + Date.now();
        const newStockCode = 'STK-' + String(stock.length + 1).padStart(4, '0');
        const colorsArr = ['%2309090B', '%230052FF', '%2371717A', '%236B21A8', '%2378350F'];
        const randomColor = colorsArr[Math.floor(Math.random() * colorsArr.length)];
        const photoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="${randomColor}"><rect x="28" y="8" width="44" height="84" rx="10" /><circle cx="50" cy="82" r="5" fill="%23fff"/><circle cx="40" cy="18" r="4" fill="%23fff"/><circle cx="50" cy="18" r="4" fill="%23fff"/></svg>`;

        const newStockItem = {
            id: newStockId,
            code: newStockCode,
            model,
            imei,
            imei_status: imeiStatus,
            icloud_status: icloudStatus,
            capacity,
            color,
            condition,
            grade,
            purchase_price: buyPrice,
            selling_price: sellEstimate,
            source: sourceType === 'CUSTOMER' ? 'BELI_DARI_CUSTOMER' : 'SUPPLIER',
            kelengkapan,
            region,
            status: 'TERSEDIA',
            notes,
            date_entered: new Date().toISOString(),
            photo: photoSvg
        };

        stock.push(newStockItem);
        saveStock(stock);

        // 2. Generate purchase transaction code
        const date = new Date();
        const formattedDate = date.getFullYear() + 
            String(date.getMonth() + 1).padStart(2, '0') + 
            String(date.getDate()).padStart(2, '0');
        const buyCode = `BLI-${formattedDate}-${String(purchases.length + 1).padStart(4, '0')}`;

        let customerNameSelected = '';
        if (sourceType === 'CUSTOMER') {
            const c = getCustomers().find(cust => cust.id === custId);
            if (c) customerNameSelected = c.name;
        }

        const newPurchase = {
            id: 'b-' + Date.now(),
            code: buyCode,
            source_type: sourceType,
            customer_id: custId,
            customer_name: customerNameSelected,
            supplier_name: supplierName,
            units: [{ model, imei, price: buyPrice }],
            total_buy_price: buyPrice,
            pay_method: payMethod,
            date: new Date().toISOString(),
            logged_by: 'admin'
        };

        purchases.unshift(newPurchase);
        saveBuyTransactions(purchases);

        // 3. Financial mutation record
        mutations.unshift({
            id: 'm-' + Date.now(),
            date: new Date().toISOString(),
            module: 'STORE',
            ref_id: buyCode,
            type: 'KELUAR',
            category: 'Beli iPhone',
            amount: buyPrice,
            pay_method: payMethod,
            note: `Pembelian iPhone ${model} dari ${sourceType === 'SUPPLIER' ? supplierName : customerNameSelected}`,
            logged_by: 'admin'
        });
        saveMutations(mutations);

        modalBuy.classList.remove('active');
        formCreateBuy.reset();

        // Refresh UI
        renderKPIs();
        renderStock();
        renderPurchases();
        renderMutations();
        renderOverviewDashboard();
        populateSellFormDropdowns();

        showFeedback(`Pembelian ${buyCode} berhasil dicatat.`);
    });

    // Form Sell Submit (Stock Out)
    formCreateSell.addEventListener('submit', (e) => {
        e.preventDefault();

        const custId = sellCustomerSelect.value;
        const stockId = sellStockSelect.value;
        const finalPrice = parseFloat(document.getElementById('sell-price-final').value.replace(/\D/g, '')) || 0;
        const discount = parseFloat(document.getElementById('sell-discount').value.replace(/\D/g, '')) || 0;
        const payStatus = document.getElementById('sell-pay-status').value;
        const dpAmount = parseFloat(document.getElementById('sell-dp-amount').value.replace(/\D/g, '')) || 0;
        const payMethod = document.getElementById('sell-pay-method').value;
        const warranty = document.getElementById('sell-warranty').value;

        if (!custId || !stockId || finalPrice <= 0) {
            showFeedback('Semua data wajib diisi dengan benar.', 'error');
            return;
        }

        const stock = getStock();
        const sales = getSellTransactions();
        const mutations = getMutations();
        const custs = getCustomers();

        const u = stock.find(item => item.id === stockId);
        const c = custs.find(cust => cust.id === custId);
        if (!u || !c) return;

        const totalPay = Math.max(0, finalPrice - discount);
        const remainingBill = Math.max(0, totalPay - dpAmount);

        // 1. Update unit status
        u.status = 'TERJUAL';
        saveStock(stock);

        // 2. Generate transaction code
        const date = new Date();
        const formattedDate = date.getFullYear() + 
            String(date.getMonth() + 1).padStart(2, '0') + 
            String(date.getDate()).padStart(2, '0');
        const sellCode = `JUL-${formattedDate}-${String(sales.length + 1).padStart(4, '0')}`;

        const newSale = {
            id: 's-' + Date.now(),
            code: sellCode,
            customer_id: custId,
            customer_name: c.name,
            customer_phone: c.phone,
            units: [{ stock_id: stockId, model: u.model, imei: u.imei, imei_status: u.imei_status || 'TERDAFTAR', icloud_status: u.icloud_status || 'CLEAN', price: finalPrice }],
            discount,
            total_pay: totalPay,
            pay_method: payMethod,
            dp_amount: dpAmount,
            remaining_bill: remainingBill,
            payment_status: payStatus,
            warranty: warranty,
            date: new Date().toISOString(),
            logged_by: 'admin'
        };

        sales.unshift(newSale);
        saveSellTransactions(sales);

        // 3. Financial mutation record
        if (dpAmount > 0) {
            mutations.unshift({
                id: 'm-' + Date.now(),
                date: new Date().toISOString(),
                module: 'STORE',
                ref_id: sellCode,
                type: 'MASUK',
                category: 'Jual iPhone',
                amount: dpAmount,
                pay_method: payMethod,
                note: `Penjualan iPhone ${u.model} ke customer ${c.name} (${payStatus})`,
                logged_by: 'admin'
            });
            saveMutations(mutations);
        }

        modalSell.classList.remove('active');
        formCreateSell.reset();

        // Refresh UI
        renderKPIs();
        renderStock();
        renderSales();
        renderMutations();
        renderOverviewDashboard();
        populateSellFormDropdowns();

        openSellDetailModal(newSale.id);
        showFeedback(`Penjualan ${sellCode} berhasil dicatat.`);
    });

    // Form Add Customer Submit
    formAddCust.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('c-name').value;
        const phone = document.getElementById('c-phone').value;
        const idType = document.getElementById('c-id-type').value;
        const idNo = document.getElementById('c-id-no').value;
        const address = document.getElementById('c-address').value;
        const guarantee = document.getElementById('c-guarantee').value;

        const custs = getCustomers();
        custs.push({
            id: 'c-' + Date.now(),
            name,
            phone,
            id_type: idType,
            id_no: idNo,
            address,
            guarantee
        });

        saveCustomers(custs);
        modalAddCust.classList.remove('active');
        formAddCust.reset();

        renderCustomers();
        populateBuyFormDropdowns();
        populateSellFormDropdowns();

        showFeedback(`Customer ${name} berhasil disimpan.`);
    });

    // Form Add Mutation Manual
    formCreateMutation.addEventListener('submit', (e) => {
        e.preventDefault();

        const type = document.getElementById('mut-type').value;
        const pay_method = document.getElementById('mut-pay-method').value;
        const category = document.getElementById('mut-category').value;
        const amount = parseFloat(document.getElementById('mut-amount').value.replace(/\D/g, '')) || 0;
        const note = document.getElementById('mut-note').value;

        const mutations = getMutations();
        mutations.unshift({
            id: 'm-' + Date.now(),
            date: new Date().toISOString(),
            module: 'STORE',
            ref_id: 'MANUAL',
            type,
            pay_method,
            category,
            amount,
            note,
            logged_by: 'admin'
        });

        saveMutations(mutations);
        modalCreateMutation.classList.remove('active');
        formCreateMutation.reset();

        renderKPIs();
        renderMutations();
        renderOverviewDashboard();

        showFeedback('Arus kas manual berhasil dicatat.');
    });

    // Detail Modal Opener
    function openSellDetailModal(saleId) {
        selectedSellId = saleId;
        const sales = getSellTransactions();
        const s = sales.find(item => item.id === saleId);
        if (!s) return;

        document.getElementById('det-j-code').textContent = s.code;
        document.getElementById('det-j-date').textContent = fmt.datetime(s.date);
        document.getElementById('det-j-cust').textContent = s.customer_name;
        document.getElementById('det-j-phone').textContent = s.customer_phone;

        const unit = s.units[0];
        document.getElementById('det-j-unit').textContent = unit.model;
        document.getElementById('det-j-imei').textContent = unit.imei;

        const imeiStatusEl = document.getElementById('det-j-imei-status');
        if (imeiStatusEl) {
            imeiStatusEl.textContent = `IMEI: ${unit.imei_status || 'TERDAFTAR'} | iCloud: ${unit.icloud_status || 'CLEAN'}`;
        }

        const warrantyEl = document.getElementById('det-j-warranty');
        if (warrantyEl) {
            warrantyEl.textContent = s.warranty || '7 Hari';
        }

        document.getElementById('det-j-price-final').textContent = fmt.rupiah(unit.price);
        document.getElementById('det-j-discount').textContent = fmt.rupiah(s.discount);
        document.getElementById('det-j-total-pay').textContent = fmt.rupiah(s.total_pay);

        const payStatusEl = document.getElementById('det-j-pay-status');
        let payColor = 'var(--status-tersedia)';
        if (s.payment_status === 'DP') payColor = 'var(--status-maintenance)';
        else if (s.payment_status === 'BELUM') payColor = 'var(--status-hilang)';
        payStatusEl.innerHTML = `<span style="color:${payColor}; font-weight:700;">${s.payment_status}</span>`;

        document.getElementById('det-j-remaining-bill').textContent = fmt.rupiah(s.remaining_bill);

        // Generate print receipt template
        renderReceiptContent(s);

        modalSellDetail.classList.add('active');
    }

    function renderReceiptContent(s) {
        const printArea = document.getElementById('thermal-receipt');
        if (!printArea) return;

        const printDate = new Date(s.date).toLocaleString('id-ID');

        printArea.innerHTML = `
            <div class="receipt-header">
                <div class="receipt-title">PLANET STORE BOYOLALI</div>
                <div class="receipt-subtitle">Divisi Toko Jual Beli iPhone</div>
                <div class="receipt-subtitle" style="font-size: 8pt;">Jalan Tentara Pelajar No.04, Boyolali</div>
                <div class="receipt-subtitle" style="font-size: 8pt;">WA: 0895-2299-4849 | IG: @planetstoreid</div>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-row">
                <span>Kode Jual:</span>
                <span class="receipt-col-label">${s.code}</span>
            </div>
            <div class="receipt-row">
                <span>Tanggal Jual:</span>
                <span>${printDate}</span>
            </div>
            <div class="receipt-row">
                <span>Pelanggan:</span>
                <span>${s.customer_name}</span>
            </div>
            <div class="receipt-row">
                <span>No HP:</span>
                <span>${s.customer_phone}</span>
            </div>
 
            <div class="receipt-divider"></div>
            
            <div style="font-weight: bold; margin-bottom: 4px;">Detail Pembelian:</div>
            <div>Model iPhone: ${s.units[0].model}</div>
            <div>IMEI: ${s.units[0].imei}</div>
            <div style="font-size: 8pt; color: #4b5563;">Status IMEI: ${s.units[0].imei_status || 'TERDAFTAR'} | iCloud: ${s.units[0].icloud_status || 'CLEAN'}</div>
            <div style="font-size: 8pt; color: #4b5563;">Garansi Toko: ${s.warranty || '7 Hari'}</div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-row">
                <span>Harga Unit:</span>
                <span>${fmt.rupiah(s.units[0].price)}</span>
            </div>
            <div class="receipt-row" style="color:red;">
                <span>Diskon:</span>
                <span>- ${fmt.rupiah(s.discount)}</span>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-row" style="font-size: 11pt; font-weight: bold;">
                <span>TOTAL AKHIR:</span>
                <span>${fmt.rupiah(s.total_pay)}</span>
            </div>
            <div class="receipt-row">
                <span>Kas Masuk / DP:</span>
                <span>${fmt.rupiah(s.dp_amount)}</span>
            </div>
            <div class="receipt-row" style="color:${s.remaining_bill > 0 ? 'red' : 'green'}; font-weight:bold;">
                <span>Sisa Tagihan:</span>
                <span>${fmt.rupiah(s.remaining_bill)}</span>
            </div>
            <div class="receipt-row">
                <span>Metode Bayar:</span>
                <span>${s.pay_method}</span>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-footer">
                <div>Syarat & Ketentuan Jual Beli:</div>
                <div style="font-size: 7.5pt; margin-top: 4px;">1. Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan kecuali ada kesepakatan garansi toko. 2. Garansi toko berlaku selama ${s.warranty || '7 Hari'} sejak tanggal nota pembelian untuk unit second.</div>
                <div style="margin-top: 6px;">Terima kasih atas kepercayaan Anda!</div>
            </div>
        `;
    }

    // Trigger Print
    document.getElementById('btn-print-receipt').addEventListener('click', () => {
        window.print();
    });

    // --- INTERACTIVE EVENTS ---

    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');
    if (btnToggleSidebar && sidebar) {
        btnToggleSidebar.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('flex');
        });
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 768 && !sidebar.classList.contains('hidden')) {
                if (!sidebar.contains(e.target) && e.target !== btnToggleSidebar) {
                    sidebar.classList.add('hidden');
                    sidebar.classList.remove('flex');
                }
            }
        });
    }

    // Source type switcher in Buy Form
    const buySourceType = document.getElementById('buy-source-type');
    const buyCustWrapper = document.getElementById('buy-customer-wrapper');
    const buySuppWrapper = document.getElementById('buy-supplier-wrapper');

    if (buySourceType) {
        buySourceType.addEventListener('change', () => {
            if (buySourceType.value === 'CUSTOMER') {
                buyCustWrapper.classList.remove('hidden');
                buySuppWrapper.classList.add('hidden');
            } else {
                buyCustWrapper.classList.add('hidden');
                buySuppWrapper.classList.remove('hidden');
            }
        });
    }

    // Search inputs
    document.getElementById('buy-search').addEventListener('input', renderPurchases);
    document.getElementById('sell-search').addEventListener('input', renderSales);
    document.getElementById('cust-search').addEventListener('input', renderCustomers);

    // Modal Control Openers
    btnOpenBuy.addEventListener('click', () => {
        populateBuyFormDropdowns();
        modalBuy.classList.add('active');
    });

    btnOpenSell.addEventListener('click', () => {
        populateSellFormDropdowns();
        modalSell.classList.add('active');
    });

    btnOpenAddCust.addEventListener('click', () => {
        modalAddCust.classList.add('active');
    });

    btnOpenAddMutation.addEventListener('click', () => {
        modalCreateMutation.classList.add('active');
    });

    // Modal Control Closers
    modalCloses.forEach(close => {
        close.addEventListener('click', () => {
            modalBuy.classList.remove('active');
            modalSell.classList.remove('active');
            modalSellDetail.classList.remove('active');
            modalAddCust.classList.remove('active');
            modalCreateMutation.classList.remove('active');
            
            const modalStockDetail = document.getElementById('modal-stock-detail');
            if (modalStockDetail) {
                modalStockDetail.classList.remove('active');
                document.getElementById('stock-view-mode').classList.remove('hidden');
                document.getElementById('form-edit-stock').classList.add('hidden');
                document.getElementById('sd-footer-view').classList.remove('hidden');
                document.getElementById('sd-footer-edit').classList.add('hidden');
                document.getElementById('form-edit-stock').reset();
            }
            
            formCreateBuy.reset();
            formCreateSell.reset();
            formAddCust.reset();
            formCreateMutation.reset();
            
            selectedSellId = null;
        });
    });

    // Setup money input formatting for edit stock inputs
    setupMoneyInputFormatter('edit-stock-purchase-price');
    setupMoneyInputFormatter('edit-stock-selling-price');

    // Switch to Edit Mode
    const btnSwitchEdit = document.getElementById('btn-switch-edit');
    if (btnSwitchEdit) {
        btnSwitchEdit.addEventListener('click', () => {
            const stock = getStock();
            const u = stock.find(item => item.id === currentDetailStockId);
            if (!u) return;

            // Populate Form Fields
            document.getElementById('edit-stock-id').value = u.id;
            
            const seriesSelect = document.getElementById('edit-stock-series');
            const modelSelect = document.getElementById('edit-stock-model');
            const colorSelect = document.getElementById('edit-stock-color');
            const capacitySelect = document.getElementById('edit-stock-capacity');
            const regionSelect = document.getElementById('edit-stock-region');

            // Find matching series based on u.model
            let matchedSeries = "";
            for (const [seriesName, seriesData] of Object.entries(IPHONE_DATABASE)) {
                if (seriesData.models[u.model]) {
                    matchedSeries = seriesName;
                    break;
                }
            }

            // Fallback match
            if (!matchedSeries) {
                const modelLower = u.model.toLowerCase();
                for (const [seriesName, seriesData] of Object.entries(IPHONE_DATABASE)) {
                    const found = Object.keys(seriesData.models).find(m => m.toLowerCase().includes(modelLower) || modelLower.includes(m.toLowerCase()));
                    if (found) {
                        matchedSeries = seriesName;
                        u.model = found;
                        break;
                    }
                }
            }

            if (matchedSeries) {
                seriesSelect.value = matchedSeries;
                seriesSelect.dispatchEvent(new Event('change'));
                
                modelSelect.value = u.model;
                modelSelect.dispatchEvent(new Event('change'));
                
                colorSelect.value = u.color;
            } else {
                seriesSelect.value = "";
                modelSelect.innerHTML = `<option value="${u.model}">${u.model}</option>`;
                modelSelect.value = u.model;
                colorSelect.innerHTML = `<option value="${u.color}">${u.color}</option>`;
                colorSelect.value = u.color;
            }

            capacitySelect.value = u.capacity;
            if (regionSelect) {
                regionSelect.value = u.region || 'iBox / Resmi Indonesia';
            }

            document.getElementById('edit-stock-imei').value = u.imei;
            document.getElementById('edit-stock-imei-status').value = u.imei_status || 'TERDAFTAR';
            document.getElementById('edit-stock-icloud-status').value = u.icloud_status || 'CLEAN';
            document.getElementById('edit-stock-condition').value = u.condition || 'SECOND';
            document.getElementById('edit-stock-grade').value = u.grade || '-';
            document.getElementById('edit-stock-kelengkapan').value = u.kelengkapan || '';
            document.getElementById('edit-stock-purchase-price').value = parseInt(u.purchase_price, 10).toLocaleString('en-US');
            document.getElementById('edit-stock-selling-price').value = parseInt(u.selling_price, 10).toLocaleString('en-US');
            document.getElementById('edit-stock-status').value = u.status || 'TERSEDIA';
            document.getElementById('edit-stock-notes').value = u.notes || '';

            // Toggle UI Visibility
            document.getElementById('stock-view-mode').classList.add('hidden');
            document.getElementById('form-edit-stock').classList.remove('hidden');
            document.getElementById('sd-footer-view').classList.add('hidden');
            document.getElementById('sd-footer-edit').classList.remove('hidden');
        });
    }

    // Cancel Edit Mode
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    if (btnCancelEdit) {
        btnCancelEdit.addEventListener('click', () => {
            document.getElementById('stock-view-mode').classList.remove('hidden');
            document.getElementById('form-edit-stock').classList.add('hidden');
            document.getElementById('sd-footer-view').classList.remove('hidden');
            document.getElementById('sd-footer-edit').classList.add('hidden');
        });
    }

    // Save Edit changes
    const btnSaveEdit = document.getElementById('btn-save-edit');
    if (btnSaveEdit) {
        btnSaveEdit.addEventListener('click', (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-stock-id').value;
            const model = document.getElementById('edit-stock-model').value.trim();
            const color = document.getElementById('edit-stock-color').value.trim();
            const capacity = document.getElementById('edit-stock-capacity').value.trim();
            const region = document.getElementById('edit-stock-region').value;
            const imei = document.getElementById('edit-stock-imei').value.trim();
            const imeiStatus = document.getElementById('edit-stock-imei-status').value;
            const icloudStatus = document.getElementById('edit-stock-icloud-status').value;
            const condition = document.getElementById('edit-stock-condition').value;
            const grade = document.getElementById('edit-stock-grade').value;
            const kelengkapan = document.getElementById('edit-stock-kelengkapan').value.trim();
            const rawPurchase = document.getElementById('edit-stock-purchase-price').value.replace(/\D/g, '');
            const rawSelling = document.getElementById('edit-stock-selling-price').value.replace(/\D/g, '');
            const status = document.getElementById('edit-stock-status').value;
            const notes = document.getElementById('edit-stock-notes').value.trim();
            const photoInput = document.getElementById('edit-stock-photo');
            const file = photoInput.files ? photoInput.files[0] : null;

            if (!model || !color || !capacity || !imei || !kelengkapan || !rawPurchase || !rawSelling) {
                showFeedback('Semua data wajib diisi dengan benar.', 'error');
                return;
            }

            const saveStockChanges = (base64Photo = null) => {
                const stock = getStock();
                const uIndex = stock.findIndex(item => item.id === id);
                if (uIndex === -1) {
                    showFeedback('Unit tidak ditemukan.', 'error');
                    return;
                }

                // Update item
                stock[uIndex].model = model;
                stock[uIndex].color = color;
                stock[uIndex].capacity = capacity;
                stock[uIndex].region = region;
                stock[uIndex].imei = imei;
                stock[uIndex].imei_status = imeiStatus;
                stock[uIndex].icloud_status = icloudStatus;
                stock[uIndex].condition = condition;
                stock[uIndex].grade = grade;
                stock[uIndex].kelengkapan = kelengkapan;
                stock[uIndex].purchase_price = parseInt(rawPurchase, 10);
                stock[uIndex].selling_price = parseInt(rawSelling, 10);
                stock[uIndex].status = status;
                stock[uIndex].notes = notes;
                
                if (base64Photo) {
                    stock[uIndex].photo = base64Photo;
                }

                // Save and update
                saveStock(stock);
                showFeedback('Perubahan data unit berhasil disimpan.');

                // Reset file input
                if (photoInput) photoInput.value = '';

                // Refresh UI
                renderKPIs();
                renderStock();
                populateSellFormDropdowns();

                // Return to view mode with updated details
                openStockDetailModal(stock[uIndex]);
            };

            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    saveStockChanges(event.target.result);
                };
                reader.onerror = function() {
                    showFeedback('Gagal membaca file gambar.', 'error');
                };
                reader.readAsDataURL(file);
            } else {
                saveStockChanges();
            }
        });
    }

    // Delete Unit
    const btnDeleteStock = document.getElementById('btn-delete-stock');
    if (btnDeleteStock) {
        btnDeleteStock.addEventListener('click', () => {
            const stock = getStock();
            const u = stock.find(item => item.id === currentDetailStockId);
            if (!u) return;

            if (confirm(`Apakah Anda yakin ingin menghapus unit "${u.model} (${u.code})" dari inventaris secara permanen?`)) {
                const updatedStock = stock.filter(item => item.id !== currentDetailStockId);
                saveStock(updatedStock);
                
                // Hide modal
                const modalStockDetail = document.getElementById('modal-stock-detail');
                if (modalStockDetail) {
                    modalStockDetail.classList.remove('active');
                }

                showFeedback('Unit berhasil dihapus dari inventaris.');

                // Refresh UI
                renderKPIs();
                renderStock();
                populateSellFormDropdowns();
            }
        });
    }

    // Sidebar navigation tabs switching
    sidebarTabLinks.forEach(tab => {
        tab.addEventListener('click', () => {
            sidebarTabLinks.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const tabName = tab.getAttribute('data-tab');
            const contentId = `tab-content-${tabName}`;
            const targetContent = document.getElementById(contentId);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            // Mobile view auto-hide sidebar when tab clicked
            if (window.innerWidth < 768 && sidebar) {
                sidebar.classList.add('hidden');
                sidebar.classList.remove('flex');
            }

            // Update Header Title dynamically
            if (tabName === 'overview') {
                pageDisplayTitle.textContent = 'Ringkasan Toko Jual Beli';
                renderOverviewDashboard();
            } else if (tabName === 'stock') {
                pageDisplayTitle.textContent = 'Manajemen Inventaris Stok';
                renderStock();
            } else if (tabName === 'purchases') {
                pageDisplayTitle.textContent = 'Daftar Transaksi Pembelian';
                renderPurchases();
            } else if (tabName === 'sales') {
                pageDisplayTitle.textContent = 'Daftar Transaksi Penjualan';
                renderSales();
            } else if (tabName === 'customers') {
                pageDisplayTitle.textContent = 'Database Customer Terdaftar';
                renderCustomers();
            } else if (tabName === 'mutations') {
                pageDisplayTitle.textContent = 'Ledger Mutasi Keuangan';
                renderMutations();
            }
        });
    });

    // Auto format money inputs
    function setupMoneyInputFormatter(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('input', () => {
            let cleanVal = input.value.replace(/\D/g, '');
            if (!cleanVal) {
                input.value = '';
                return;
            }
            let formatted = parseInt(cleanVal, 10).toLocaleString('en-US');
            input.value = formatted;
        });
    }

    setupMoneyInputFormatter('buy-price');
    setupMoneyInputFormatter('buy-sell-estimate');
    setupMoneyInputFormatter('sell-price-final');
    setupMoneyInputFormatter('sell-discount');
    setupMoneyInputFormatter('sell-dp-amount');
    setupMoneyInputFormatter('mut-amount');

    window.clearMutationFilter = function() {
        const fromInput = document.getElementById('filter-mut-from');
        const toInput = document.getElementById('filter-mut-to');
        if (fromInput) fromInput.value = '';
        if (toInput) toInput.value = '';
        renderMutations();
    };

    // --- CSV EXPORTS ---

    window.exportPurchasesCSV = function() {
        const purchases = getBuyTransactions();
        const headers = ['Kode Beli', 'Tipe Sumber', 'Supplier/Customer', 'Unit iPhone', 'Total Harga', 'Metode Bayar', 'Tanggal'];

        const rows = purchases.map(p => [
            p.code,
            p.source_type,
            p.source_type === 'SUPPLIER' ? p.supplier_name : p.customer_name,
            p.units.map(u => u.model).join('; '),
            p.total_buy_price,
            p.pay_method,
            fmt.datetime(p.date)
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `planet_store_pembelian_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        showFeedback('Data pembelian berhasil diekspor.');
    };

    window.exportSalesCSV = function() {
        const sales = getSellTransactions();
        const headers = ['Kode Jual', 'Customer', 'Unit iPhone', 'Diskon', 'Total Bayar', 'Sisa Tagihan', 'Metode', 'Status Bayar', 'Tanggal'];

        const rows = sales.map(s => [
            s.code,
            s.customer_name,
            s.units.map(u => u.model).join('; '),
            s.discount,
            s.total_pay,
            s.remaining_bill,
            s.pay_method,
            s.payment_status,
            fmt.datetime(s.date)
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `planet_store_penjualan_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        showFeedback('Data penjualan berhasil diekspor.');
    };

    window.exportMutationsCSV = function() {
        const mutations = getMutations();
        const headers = ['Waktu', 'Ref Transaksi', 'Tipe', 'Kategori', 'Nominal', 'Metode', 'Keterangan', 'Petugas'];

        const rows = mutations.map(m => [
            fmt.datetime(m.date),
            m.ref_id,
            m.type,
            m.category,
            m.amount,
            m.pay_method,
            m.note,
            m.logged_by
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `planet_store_mutasi_toko_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        showFeedback('Data mutasi toko berhasil diekspor.');
    };

    // === EXPORT EXCEL & PRINT PDF FUNCTIONALITY ===
    function getActiveTabName() {
        const activeTabItem = document.querySelector('.sidebar .nav-item.active');
        return activeTabItem ? activeTabItem.getAttribute('data-tab') : 'overview';
    }

    function exportToExcel() {
        const activeTab = getActiveTabName();
        let filename = `PlanetStore_Store_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
        
        const activeTabContent = document.querySelector('.tab-content.active');
        if (!activeTabContent) return;

        const table = activeTabContent.querySelector('table');
        if (!table) {
            alert('Tidak ada tabel data untuk diekspor di halaman ini!');
            return;
        }

        const rows = table.querySelectorAll('tr');
        if (rows.length <= 1) {
            alert('Tidak ada data untuk diekspor!');
            return;
        }

        let csvContent = '\uFEFF'; // Add BOM for Excel UTF-8 support

        rows.forEach(row => {
            if (row.style.display === 'none') return;
            
            const cols = row.querySelectorAll('th, td');
            const rowData = [];
            
            cols.forEach(col => {
                let text = col.innerText.trim();
                
                const actionBtns = col.querySelectorAll('.btn, button, a');
                if (actionBtns.length > 0) {
                    if (col.cellIndex === cols.length - 1) {
                        return; // Skip actions column
                    }
                }

                text = text.replace(/"/g, '""'); // Escape quotes
                rowData.push(`"${text}"`);
            });
            
            if (rowData.length > 0) {
                csvContent += rowData.join(',') + '\r\n';
            }
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function printPDF() {
        const activeTab = getActiveTabName();
        const activeTabContent = document.querySelector('.tab-content.active');
        if (!activeTabContent) return;

        const table = activeTabContent.querySelector('table');
        if (!table) {
            alert('Tidak ada tabel data untuk dicetak di halaman ini!');
            return;
        }

        const printArea = document.getElementById('table-print-area');
        if (!printArea) return;

        let title = 'Laporan Data';
        let moduleName = 'DS_STORE — Sistem Jual Beli';
        if (activeTab === 'stock') {
            title = 'Laporan Inventaris Stok iPhone';
        } else if (activeTab === 'purchases') {
            title = 'Laporan Transaksi Pembelian (Stok Masuk)';
        } else if (activeTab === 'sales') {
            title = 'Laporan Transaksi Penjualan (Stok Keluar)';
        } else if (activeTab === 'customers') {
            title = 'Laporan Database Pelanggan';
            moduleName = 'Shared Module — Customer Database';
        } else if (activeTab === 'mutations') {
            title = 'Laporan Ledger Mutasi Keuangan';
            moduleName = 'Shared Module — Mutasi Keuangan';
        }

        const tableClone = table.cloneNode(true);
        const headerRow = tableClone.querySelector('thead tr');
        if (headerRow) {
            const ths = headerRow.querySelectorAll('th');
            if (ths.length > 0 && (ths[ths.length - 1].innerText.trim() === 'Aksi' || ths[ths.length - 1].innerText.trim() === '')) {
                ths[ths.length - 1].remove();
            }
        }
        
        const bodyRows = tableClone.querySelectorAll('tbody tr');
        bodyRows.forEach(row => {
            if (row.style.display === 'none') {
                row.remove();
                return;
            }
            const tds = row.querySelectorAll('td');
            if (tds.length > 0) {
                tds[tds.length - 1].remove();
            }
        });

        printArea.innerHTML = `
            <div class="print-header">
                <img src="../../BRANDING_KIT/LOGO.jpg" class="print-logo" alt="Logo" onerror="this.src='https://ui-avatars.com/api/?name=PS&background=18181B&color=fff'">
                <div class="print-title">
                    <h1>${title}</h1>
                    <p>Planet Store Boyolali — ${moduleName}</p>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 8.5pt; color: #4b5563; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; font-family: 'Plus Jakarta Sans', sans-serif;">
                <div>
                    <strong>Unit Operasional:</strong> Konter Utama Boyolali<br>
                    <strong>Status Dokumen:</strong> LAPORAN RESMI & SAH
                </div>
                <div style="text-align: right;">
                    <strong>Tanggal Laporan:</strong> ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
                    <strong>Waktu Ekstraksi:</strong> ${new Date().toLocaleTimeString('id-ID')} WIB
                </div>
            </div>
            <div class="print-body">
                ${tableClone.outerHTML}
            </div>
            <div class="print-footer">
                <span>Dokumen laporan ini dihasilkan otomatis oleh sistem Planet Store. Halaman 1 dari 1</span>
                <span style="font-weight: 700; text-align: right;">Tanda Tangan Manajer:<br><br><br><br>_____________________</span>
            </div>
        `;

        document.body.classList.add('print-table');
        window.print();
        
        setTimeout(() => {
            document.body.classList.remove('print-table');
            printArea.innerHTML = '';
        }, 500);
    }

    const btnExport = document.getElementById('btn-export-excel');
    const btnPrint = document.getElementById('btn-print-pdf');
    if (btnExport) btnExport.addEventListener('click', exportToExcel);
    if (btnPrint) btnPrint.addEventListener('click', printPDF);

    // --- INITIAL RENDER ---
    renderKPIs();
    renderOverviewDashboard();
    renderStock();
    renderPurchases();
    renderSales();
    renderCustomers();
    renderMutations();
});

/* ==========================================================================
   Planet Store Boyolali — DS_SEWA Admin Dashboard Interaction Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Session Authentication Validation Check
    const activeUser = sessionStorage.getItem('active_user_sewa');
    if (!activeUser) {
        window.location.href = 'login.html';
        return;
    }

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
    const kpiTotalUnits = document.getElementById('kpi-total-units');
    const kpiRentedUnits = document.getElementById('kpi-rented-units');
    const kpiReadyUnits = document.getElementById('kpi-ready-units');
    const kpiMaintenanceUnits = document.getElementById('kpi-maintenance-units');
    const kpiRevenue = document.getElementById('kpi-revenue');
    const kpiOutstandingDeposit = document.getElementById('kpi-outstanding-deposit');
    const kpiDueToday = document.getElementById('kpi-due-today');
    const kpiOverdueCount = document.getElementById('kpi-overdue-count');
    
    // Modals
    const modalRent = document.getElementById('modal-rent');
    const modalReturn = document.getElementById('modal-return');
    const modalDetail = document.getElementById('modal-detail');
    const modalAddUnit = document.getElementById('modal-add-unit');
    const modalAddCust = document.getElementById('modal-add-cust');
    const modalCreateMutation = document.getElementById('modal-create-mutation');
    
    const btnOpenRent = document.getElementById('btn-open-rent');
    const btnOpenAddUnit = document.getElementById('btn-open-add-unit');
    const btnOpenAddCust = document.getElementById('btn-open-add-cust');
    const btnOpenAddMutation = document.getElementById('btn-open-add-mutation');
    const modalCloses = document.querySelectorAll('.modal-close');
    
    // Forms
    const formCreateRent = document.getElementById('form-create-rent');
    const formReturnUnit = document.getElementById('form-return-unit');
    const formAddUnit = document.getElementById('form-add-unit');
    const formAddCust = document.getElementById('form-add-cust');
    const formCreateMutation = document.getElementById('form-create-mutation');
    
    const rentCustomerSelect = document.getElementById('rent-customer');
    const rentUnitSelect = document.getElementById('rent-unit');
    
    const toastContainer = document.getElementById('toast-container');
    
    // State
    let selectedRentId = null;

    // --- RENDER FUNCTIONS ---

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
        },
        countdown: (plannedReturnIso, status) => {
            if (status !== 'AKTIF') return { text: 'Selesai', cssClass: 'countdown-done' };
            const now = new Date();
            const due = new Date(plannedReturnIso);
            const diffMs = due - now;
            if (diffMs < 0) {
                const days = Math.ceil(Math.abs(diffMs) / 86400000);
                return { text: `Terlambat ${days} Hari`, cssClass: 'countdown-overdue' };
            }
            const days = Math.floor(diffMs / 86400000);
            const hours = Math.floor((diffMs % 86400000) / 3600000);
            if (days === 0 && hours < 24) {
                return { text: `Sisa ${hours} Jam`, cssClass: 'countdown-today' };
            }
            return { text: `Sisa ${days}h ${hours}j`, cssClass: 'countdown-soon' };
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

    let currentUnitFilter = 'ALL';
    window.setUnitFilter = function(btn, status) {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        currentUnitFilter = status;
        renderUnits();
    };

    // --- RENDER FUNCTIONS ---

    function renderKPIs() {
        const units = getUnits();
        const txs = getTransactions();
        const mutations = getMutations();
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const totalCount = units.length;
        const rentedCount = units.filter(u => u.status === 'DIPINJAM').length;
        const readyCount = units.filter(u => u.status === 'TERSEDIA').length;
        const maintenanceCount = units.filter(u => u.status === 'MAINTENANCE').length;

        // Total Counts (Asymmetric KPIs)
        const elLiveOutCount = document.getElementById('ov-live-out-count');
        const elLiveTotalCount = document.getElementById('ov-live-total-count');
        const elLiveProgressFill = document.getElementById('ov-live-progress-fill');
        const elLivePercentOut = document.getElementById('ov-live-percent-out');
        const elLivePercentIn = document.getElementById('ov-live-percent-in');

        if (elLiveOutCount) elLiveOutCount.textContent = rentedCount;
        if (elLiveTotalCount) elLiveTotalCount.textContent = totalCount;
        
        const rentedPercent = totalCount > 0 ? Math.round((rentedCount / totalCount) * 100) : 0;
        if (elLiveProgressFill) elLiveProgressFill.style.width = `${rentedPercent}%`;
        if (elLivePercentOut) elLivePercentOut.textContent = `${rentedPercent}% KELUAR`;
        if (elLivePercentIn) elLivePercentIn.textContent = `${100 - rentedPercent}% GUDANG`;

        // Secondary cards
        if (kpiTotalUnits) kpiTotalUnits.textContent = totalCount;
        if (kpiReadyUnits) kpiReadyUnits.textContent = readyCount;
        if (kpiMaintenanceUnits) kpiMaintenanceUnits.textContent = maintenanceCount;

        // Finance calculations
        let revenue = 0;
        mutations.forEach(m => {
            if (m.type === 'MASUK' && (m.category === 'Biaya Sewa' || m.category === 'Denda')) {
                revenue += m.amount;
            }
        });
        if (kpiRevenue) kpiRevenue.textContent = fmt.rupiah(revenue);

        const activeTxs = txs.filter(t => t.transaction_status === 'AKTIF');
        const outstandingDeposit = activeTxs.reduce((sum, t) => sum + (t.deposit_refunded ? 0 : t.deposit_amount), 0);
        if (kpiOutstandingDeposit) kpiOutstandingDeposit.textContent = fmt.rupiah(outstandingDeposit);

        // Due & Overdue counts
        let dueTodayCount = 0;
        let overdueCount = 0;

        activeTxs.forEach(t => {
            const dueDate = new Date(t.planned_return_date);
            const isSameDay = dueDate.toISOString().split('T')[0] === todayStr;
            
            if (isSameDay) {
                dueTodayCount++;
            } else if (dueDate < now) {
                overdueCount++;
            }
        });

        if (kpiDueToday) kpiDueToday.textContent = dueTodayCount;
        if (kpiOverdueCount) kpiOverdueCount.textContent = overdueCount;
    }

    function renderUnits() {
        let units = getUnits();
        const container = document.getElementById('unit-cards-grid');
        if (!container) return;

        container.innerHTML = '';

        if (currentUnitFilter !== 'ALL') {
            units = units.filter(u => u.status === currentUnitFilter);
        }

        if (units.length === 0) {
            container.appendChild(createEmptyState(
                '[ _ ]',
                `Tidak Ada Unit "${currentUnitFilter}"`,
                'Tidak ditemukan armada unit iPhone dengan status terpilih.',
                currentUnitFilter === 'ALL' ? '+ Tambah Unit Pertama' : null,
                currentUnitFilter === 'ALL' ? () => btnOpenAddUnit.click() : null
            ));
            return;
        }

        units.forEach(u => {
            const card = document.createElement('div');
            card.className = 'unit-card';
            
            let badgeClass = 'badge-tersedia';
            if (u.status === 'DIPINJAM') badgeClass = 'badge-dipinjam';
            else if (u.status === 'MAINTENANCE') badgeClass = 'badge-maintenance';
            else if (u.status === 'HILANG') badgeClass = 'badge-hilang';

            // Check if rented by someone dynamically
            const activeTx = getTransactions().find(t => t.unit_id === u.id && t.transaction_status === 'AKTIF');
            const rentedByInfo = activeTx
                ? `<div class="mt-2 p-2 bg-blue-50 border-l-2 border-blue-600 font-mono text-[10px]">
                    Peminjam: <strong>${activeTx.customer_name}</strong><br>
                    Kembali: <span class="text-blue-600 font-bold">${fmt.date(activeTx.planned_return_date)}</span>
                   </div>`
                : '';

            const isSvg = u.photo.trim().startsWith('<svg') || u.photo.trim().startsWith('data:image/svg+xml');
            const photoEl = isSvg 
                ? `<div style="width: 80px; height: 120px; display:flex; align-items:center; justify-content:center;" class="inventory-photo">${u.photo}</div>`
                : `<img src="${u.photo}" style="width: 100%; height: 100%; object-fit: cover;" class="inventory-photo">`;

            card.innerHTML = `
                <div class="unit-card-img" style="overflow: hidden; padding: 0;">
                    <span class="badge ${badgeClass} unit-card-badge" style="z-index: 2;">${u.status}</span>
                    ${photoEl}
                </div>
                <div class="unit-card-content flex-1 flex flex-col" style="padding-top: 12px;">
                    <h3 class="unit-card-title">${u.name}</h3>
                    <div class="unit-card-specs">${u.capacity} · ${u.color} · IMEI: ${u.imei}</div>
                    <div class="unit-card-details">
                        <div class="unit-card-detail-item">
                            <span class="unit-card-price-label">Harga Sewa / Hari:</span>
                            <span class="unit-card-price-val">${fmt.rupiah(u.rent_price)}</span>
                        </div>
                        <div class="unit-card-detail-item">
                            <span class="unit-card-price-label">Deposit Wajib:</span>
                            <span class="unit-card-price-val" style="color:var(--primary-purple)">${fmt.rupiah(u.deposit)}</span>
                        </div>
                    </div>
                    <div style="font-size:0.75rem; color:var(--text-body); margin-bottom:12px; line-height:1.4;">
                        <strong>Kondisi Sekarang:</strong><br>${u.current_condition}
                    </div>
                    ${rentedByInfo}
                    <div class="unit-card-footer mt-auto">
                        <span>Catatan: ${u.notes || '-'}</span>
                    </div>
                </div>
            `;
            
            // Interaction: Open unit detail modal
            card.addEventListener('click', () => {
                openUnitDetailModal(u);
            });

            container.appendChild(card);
        });
    }

    function renderTransactions() {
        const txs = getTransactions();
        const tbody = document.getElementById('rent-table-body');
        const query = document.getElementById('rent-search').value.toLowerCase();
        const filterRent = document.getElementById('filter-rent-status').value;
        const filterPay = document.getElementById('filter-pay-status').value;
        
        if (!tbody) return;
        tbody.innerHTML = '';

        const now = new Date();

        const filtered = txs.filter(t => {
            const matchesQuery = t.code.toLowerCase().includes(query) ||
                                 t.customer_name.toLowerCase().includes(query) ||
                                 t.unit_name.toLowerCase().includes(query);
            const matchesRent = filterRent === 'ALL' || t.transaction_status === filterRent;
            const matchesPay = filterPay === 'ALL' || t.payment_status === filterPay;

            return matchesQuery && matchesRent && matchesPay;
        });

        // Sort by status: active first
        filtered.sort((a, b) => {
            if (a.transaction_status !== b.transaction_status) {
                return a.transaction_status === 'AKTIF' ? -1 : 1;
            }
            return new Date(b.rent_date) - new Date(a.rent_date);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 32px; font-family: monospace;">Tidak ada transaksi sewa ditemukan</td></tr>`;
            return;
        }

        filtered.forEach(t => {
            const tr = document.createElement('tr');
            
            let statusPayBadge = 'badge-lunas';
            if (t.payment_status === 'DP') statusPayBadge = 'badge-dp';
            else if (t.payment_status === 'BELUM') statusPayBadge = 'badge-belum';

            let statusTxBadge = 'badge-tersedia'; // SELESAI
            if (t.transaction_status === 'AKTIF') statusTxBadge = 'badge-dipinjam';
            else if (t.transaction_status === 'DIBATALKAN') statusTxBadge = 'badge-hilang';

            // Highlight overdue rows with red background
            const due = new Date(t.planned_return_date);
            const isOverdue = t.transaction_status === 'AKTIF' && due < now;
            if (isOverdue) {
                tr.style.backgroundColor = '#FEF2F2';
                tr.style.borderLeft = '4px solid #DC2626';
            }

            const cd = fmt.countdown(t.planned_return_date, t.transaction_status);
            const rentDateFormatted = fmt.datetime(t.rent_date);
            const dueDateFormatted = fmt.datetime(t.planned_return_date);

            tr.className = 'hover:bg-zinc-50 cursor-pointer';
            tr.innerHTML = `
                <td style="font-weight:700; color:var(--accent-blue);" class="py-3 px-4 font-mono font-bold">${t.code}</td>
                <td class="py-3 px-4">
                    <div style="font-weight:600;">${t.customer_name}</div>
                    <div style="font-size:0.75rem; color:var(--text-secondary);" class="font-mono">${t.customer_phone}</div>
                </td>
                <td style="font-weight:500;" class="py-3 px-4">${t.unit_name}</td>
                <td style="font-size:0.8rem; color:var(--text-body);" class="py-3 px-4">${rentDateFormatted}</td>
                <td style="font-size:0.8rem; color:var(--text-body); font-weight:600;" class="py-3 px-4">${dueDateFormatted}</td>
                <td class="py-3 px-4">
                    <div style="font-size:0.82rem;">Sewa: <strong>${fmt.rupiah(t.rent_fee)}</strong></div>
                    <div style="font-size:0.78rem; color:var(--text-secondary);">Depo: ${fmt.rupiah(t.deposit_amount)}</div>
                </td>
                <td class="py-3 px-4">
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <span class="badge ${statusTxBadge}" style="width:max-content;">${t.transaction_status}</span>
                        <span class="badge ${statusPayBadge}" style="width:max-content;">${t.payment_status}</span>
                    </div>
                </td>
                <td style="font-size:0.82rem;" class="py-3 px-4"><span class="${cd.cssClass}">${cd.text}</span></td>
                <td class="py-3 px-4">
                    <div class="flex gap-2">
                        <button class="btn-detail px-2 py-1 text-[10px] font-bold uppercase border border-planet-dark hover:bg-zinc-200 font-mono transition-colors" data-id="${t.id}">DETAIL</button>
                        ${t.transaction_status === 'AKTIF' ? `
                        <button class="btn-return px-2 py-1 text-[10px] font-bold uppercase bg-planet-dark text-white border border-planet-dark hover:bg-planet-accent font-mono transition-colors" data-id="${t.id}">KEMBALI</button>
                        ` : ''}
                    </div>
                </td>
            `;

            tr.addEventListener('click', () => {
                openDetailModal(t.id);
            });

            tr.querySelector('.btn-detail')?.addEventListener('click', (e) => {
                e.stopPropagation();
                openDetailModal(t.id);
            });

            tr.querySelector('.btn-return')?.addEventListener('click', (e) => {
                e.stopPropagation();
                openReturnModal(t.id);
            });

            tbody.appendChild(tr);
        });
    }

    function renderCustomers() {
        const custs = getCustomers();
        const tbody = document.getElementById('cust-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const searchQuery = document.getElementById('cust-search')?.value.toLowerCase() || '';
        const filtered = custs.filter(c => {
            return c.name.toLowerCase().includes(searchQuery) ||
                   c.phone.toLowerCase().includes(searchQuery) ||
                   c.address.toLowerCase().includes(searchQuery) ||
                   c.identity_no.toLowerCase().includes(searchQuery) ||
                   c.guarantee.toLowerCase().includes(searchQuery);
        });

        if (filtered.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="9" style="padding: 0;">
                    <div style="padding: 48px; text-align: center; font-family: 'JetBrains Mono', monospace;">
                        <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em;">
                            > QUERY: SELECT * FROM db.customers WHERE query LIKE '%${searchQuery}%'<br>
                            > RETURNED: 0 RECORDS
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
            return;
        }

        filtered.forEach(c => {
            const allTx = getTransactions().filter(t => t.customer_id === c.id);
            const totalSewa = allTx.length;
            const totalSpend = allTx.reduce((sum, t) => sum + t.rent_fee, 0);
            const isLate = allTx.some(t => t.total_late_fee > 0);

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-zinc-50 cursor-pointer';
            tr.innerHTML = `
                <td style="font-weight:600; color:var(--text-title);" class="py-3 px-4 font-semibold">${c.name}</td>
                <td style="font-weight:600; color:var(--accent-blue);" class="py-3 px-4 font-mono text-xs">${c.phone}</td>
                <td style="font-size:0.85rem; color:var(--text-secondary);" class="py-3 px-4">${c.address}</td>
                <td class="py-3 px-4"><span class="badge badge-tersedia">${c.identity_type}</span></td>
                <td style="font-family:monospace; font-size:0.85rem;" class="py-3 px-4 font-mono text-xs">${c.identity_no}</td>
                <td style="font-weight:700;" class="py-3 px-4 text-sm font-semibold">${c.guarantee}</td>
                <td class="py-3 px-4 font-mono text-xs text-right">${totalSewa}x</td>
                <td class="py-3 px-4 font-mono text-xs text-right">${fmt.rupiah(totalSpend)}</td>
                <td class="py-3 px-4">
                    ${isLate ? '<span class="badge badge-hilang">Pernah Telat</span>' : '<span class="badge badge-tersedia">Disiplin</span>'}
                </td>
            `;

            tr.addEventListener('click', () => {
                openCustomerHistory(c.id);
            });
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

        // Date range filtering
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
        const txs = getTransactions();
        const mutations = getMutations();
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // 1. Alert banners for loan count downs / late warnings
        const alertContainer = document.getElementById('countdown-reminder-alerts');
        if (alertContainer) {
            alertContainer.innerHTML = '';
            const activeTxs = txs.filter(t => t.transaction_status === 'AKTIF');
            
            const alertItems = [];
            activeTxs.forEach(t => {
                const dueDate = new Date(t.planned_return_date);
                const diffTime = dueDate - now;
                const dateOnlyStr = dueDate.toISOString().split('T')[0];

                if (diffTime < 0) {
                    const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));
                    alertItems.push({
                        id: t.id,
                        type: 'OVERDUE',
                        title: `TERLAMBAT ${diffDays} HARI`,
                        message: `iPhone <strong>${t.unit_name}</strong> (${t.customer_name}) terlambat kembali.`,
                        badgeClass: 'badge-hilang',
                        actionType: 'return'
                    });
                } else if (dateOnlyStr === todayStr) {
                    const dueTimeStr = dueDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                    alertItems.push({
                        id: t.id,
                        type: 'DUE_TODAY',
                        title: `HARI INI (Pkl ${dueTimeStr})`,
                        message: `iPhone <strong>${t.unit_name}</strong> (${t.customer_name}) jatuh tempo hari ini.`,
                        badgeClass: 'badge-maintenance',
                        actionType: 'wa',
                        waType: 'H0'
                    });
                } else {
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) {
                        alertItems.push({
                            id: t.id,
                            type: 'REMINDER_H1',
                            title: `SEWA H-1`,
                            message: `iPhone <strong>${t.unit_name}</strong> (${t.customer_name}) jatuh tempo besok pagi.`,
                            badgeClass: 'badge-maintenance',
                            actionType: 'wa',
                            waType: 'H1'
                        });
                    } else if (diffDays <= 3) {
                        alertItems.push({
                            id: t.id,
                            type: 'REMINDER_H3',
                            title: `SEWA H-${diffDays}`,
                            message: `iPhone <strong>${t.unit_name}</strong> (${t.customer_name}) jatuh tempo dalam ${diffDays} hari.`,
                            badgeClass: 'badge-tersedia',
                            actionType: 'wa',
                            waType: 'H3'
                        });
                    }
                }
            });

            if (alertItems.length > 0) {
                const alertCard = document.createElement('div');
                alertCard.className = 'table-container';
                alertCard.style.padding = '18px 24px';
                alertCard.style.marginBottom = '24px';
                
                let listHtml = '';
                alertItems.forEach((item, idx) => {
                    const isLast = idx === alertItems.length - 1;
                    const borderStyle = isLast ? '' : 'border-bottom: 1px solid var(--border-soft);';
                    const buttonHtml = item.actionType === 'return' 
                        ? `<button class="btn btn-secondary btn-return-trigger" style="padding: 6px 12px; font-size: 0.75rem;" data-id="${item.id}">Kembalikan Unit</button>`
                        : `<button class="btn btn-primary btn-wa-trigger" style="padding: 6px 12px; font-size: 0.75rem;" data-id="${item.id}" data-type="${item.waType}">Kirim WA</button>`;

                    listHtml += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; ${borderStyle}">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span class="badge ${item.badgeClass}" style="font-size: 0.65rem; padding: 4px 8px;">${item.title}</span>
                                <span style="font-size: 0.85rem; color: var(--text-body);">${item.message}</span>
                            </div>
                            <div>
                                ${buttonHtml}
                            </div>
                        </div>
                    `;
                });

                alertCard.innerHTML = `
                    <h3 style="font-size: 1.05rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; stroke: var(--status-dibatalkan);"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Notifikasi & Peringatan Aktif (${alertItems.length})
                    </h3>
                    <div style="display: flex; flex-direction: column;">
                        ${listHtml}
                    </div>
                `;
                
                alertContainer.appendChild(alertCard);

                // Bind triggers
                alertCard.querySelectorAll('.btn-return-trigger').forEach(btn => {
                    btn.addEventListener('click', () => {
                        openReturnModal(btn.getAttribute('data-id'));
                    });
                });
                alertCard.querySelectorAll('.btn-wa-trigger').forEach(btn => {
                    btn.addEventListener('click', () => {
                        sendWhatsAppSimulation(btn.getAttribute('data-id'), btn.getAttribute('data-type'));
                    });
                });
            }
        }

        // 2. SVG Line Chart
        renderOverviewChart(txs);

        // 3. Payment Method Donut
        renderPaymentBreakdown(mutations);

        // 4. Popular units
        renderPopularUnits(txs);
    }

    function renderOverviewChart(txs) {
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
            const dayTxs = txs.filter(t => t.rent_date.split('T')[0] === dateStr);
            const rentRevenue = dayTxs.reduce((sum, t) => sum + (t.rent_fee || 0), 0);
            const dObj = new Date(dateStr);
            const label = dObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            return { date: dateStr, label, revenue: rentRevenue };
        });

        const minVal = 0;
        const maxVal = Math.max(100000, ...dailyData.map(d => d.revenue));
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
            dotsHTML += `<circle class="chart-dot" cx="${cx}" cy="${cy}" r="5" data-title="${d.label}" data-desc="Omset Sewa: Rp ${d.revenue.toLocaleString('id-ID')}" />`;
        });

        const yBaseline = getY(0);

        wrapper.innerHTML = `
            <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
                <defs>
                    <filter id="chart-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="var(--primary-purple)" flood-opacity="0.15" />
                    </filter>
                </defs>
                ${gridHTML}
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

        const payments = mutations.filter(m => m.type === 'MASUK');
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

    function renderPopularUnits(txs) {
        const container = document.getElementById('ov-popular-units');
        if (!container) return;

        const counts = {};
        txs.forEach(t => {
            counts[t.unit_name] = (counts[t.unit_name] || 0) + 1;
        });

        const sorted = Object.keys(counts).map(name => ({ name, count: counts[name] }))
                                         .sort((a, b) => b.count - a.count);

        container.innerHTML = '';
        if (sorted.length === 0) {
            container.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:10px 0;">Belum ada riwayat transaksi rental</div>`;
            return;
        }

        sorted.slice(0, 3).forEach(item => {
            const div = document.createElement('div');
            div.style = 'display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dashed var(--border-soft);';
            div.innerHTML = `
                <span style="font-weight:600; color:var(--text-title);">${item.name}</span>
                <span style="background:rgba(79,70,229,0.08); color:var(--primary-purple); font-weight:700; font-size:0.75rem; padding:2px 10px; border-radius:12px;">${item.count}x Disewa</span>
            `;
            container.appendChild(div);
        });
    }

    // --- WHATSAPP SIMULATOR ---

    function sendWhatsAppSimulation(txId, type) {
        const txs = getTransactions();
        const t = txs.find(tx => tx.id === txId);
        if (!t) return;

        let message = '';
        const rentUrl = `${window.location.origin}/DS_SEWA/DEMO/receipt.html?code=${t.code}`; // Simulated URL

        if (type === 'H3') {
            message = `Halo Kak ${t.customer_name},\nKami dari Planet Store Boyolali ingin mengingatkan bahwa masa peminjaman unit iPhone *${t.unit_name}* (Ref: *${t.code}*) akan berakhir dalam *3 hari lagi* (Tenggat: ${new Date(t.planned_return_date).toLocaleDateString('id-ID')}).\nHarap menjaga kondisi unit agar tetap prima. Terima kasih!`;
        } else if (type === 'H1') {
            message = `Halo Kak ${t.customer_name},\nReminder H-1: Peminjaman unit iPhone *${t.unit_name}* dengan kode *${t.code}* akan jatuh tempo *besok pagi*. Harap melakukan pengembalian di konter Planet Store Boyolali sebelum jam sewa berakhir untuk menghindari denda keterlambatan Rp ${t.late_fee_per_day.toLocaleString('id-ID')}/hari.`;
        } else if (type === 'H0') {
            message = `Halo Kak ${t.customer_name},\nPemberitahuan penting! Masa sewa iPhone *${t.unit_name}* (Ref: *${t.code}*) jatuh tempo *HARI INI* pada jam *${new Date(t.planned_return_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB*. Mohon segera memulangkan unit ke konter kami. Terima kasih atas kerja samanya.`;
        } else if (type === 'SEWA') {
            message = `Halo Kak ${t.customer_name},\nTerima kasih telah menyewa unit iPhone *${t.unit_name}* di Planet Store Boyolali. Transaksi sewa Anda terdaftar dengan nomor *${t.code}* sebesar *Rp ${t.rent_fee.toLocaleString('id-ID')}* + jaminan deposit *Rp ${t.deposit_amount.toLocaleString('id-ID')}*. Tenggat kembali: ${new Date(t.planned_return_date).toLocaleString('id-ID')}.`;
        } else if (type === 'KEMBALI') {
            message = `Halo Kak ${t.customer_name},\nUnit iPhone *${t.unit_name}* (Ref: *${t.code}*) telah sukses kami terima kembali pada *${new Date().toLocaleString('id-ID')}* dalam kondisi *${t.return_condition || 'Baik'}*. Deposit Anda telah kami proses kembali/refund. Terima kasih telah berlangganan di Planet Store Boyolali!`;
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-wa-icon">
                <svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.59 2.028 14.108.99 11.487.99c-5.43 0-9.852 4.37-9.856 9.797-.001 1.77.472 3.497 1.372 5.044L1.968 22.1l6.23-1.616c-1.614.937-2.923 1.353-1.55 2.654z"/></svg>
            </div>
            <div class="toast-content">
                <div class="toast-header">
                    <span class="toast-sender">WhatsApp Simulator (ke: ${t.customer_phone})</span>
                    <span class="toast-time">Sekarang</span>
                </div>
                <div class="toast-body">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        toastContainer.appendChild(toast);
        setTimeout(() => { if (toast) toast.remove(); }, 12000);
    }

    // Image Preview Helper
    function setupImagePreview(inputId, previewContainerId) {
        const input = document.getElementById(inputId);
        const previewContainer = document.getElementById(previewContainerId);
        if (!input || !previewContainer) return;

        const img = previewContainer.querySelector('img');

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                img.src = '';
                previewContainer.style.display = 'none';
            }
        });
    }

    function readFileAsDataURL(file) {
        return new Promise((resolve) => {
            if (!file) {
                resolve('');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
        });
    }

    window.openRentPhoto = function(el) {
        const img = el.querySelector('img');
        if (img && img.src) {
            const w = window.open();
            w.document.write(`<img src="${img.src}" style="max-width:100%; max-height:100vh; display:block; margin:auto;">`);
            w.document.title = "Lihat Foto Dokumentasi";
        }
    };

    // Initialize photo previews
    setupImagePreview('rent-photo-unit', 'preview-rent-photo-unit');
    setupImagePreview('rent-photo-customer', 'preview-rent-photo-customer');
    setupImagePreview('rent-photo-ktp', 'preview-rent-photo-ktp');

    // --- FORM ACTIONS ---

    // Populate dropdowns for new rent
    function populateRentFormDropdowns() {
        if (!rentCustomerSelect || !rentUnitSelect) return;
        
        // 1. Customers
        rentCustomerSelect.innerHTML = '<option value="">-- Pilih Customer --</option>';
        getCustomers().forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = `${c.name} (${c.phone})`;
            rentCustomerSelect.appendChild(opt);
        });

        // 2. Units (only available ones)
        rentUnitSelect.innerHTML = '<option value="">-- Pilih iPhone Tersedia --</option>';
        getUnits().forEach(u => {
            if (u.status === 'TERSEDIA') {
                const opt = document.createElement('option');
                opt.value = u.id;
                opt.textContent = `${u.name} ${u.capacity} (Sewa: Rp ${u.rent_price.toLocaleString('id-ID')}/Hari)`;
                rentUnitSelect.appendChild(opt);
            }
        });
    }

    // Rent Fee Dynamic Calculator
    function calculateRentalEstimates() {
        const unitId = rentUnitSelect.value;
        const startStr = document.getElementById('rent-start-date').value;
        const endStr = document.getElementById('rent-end-date').value;

        const elDuration = document.getElementById('calc-duration');
        const elPriceDay = document.getElementById('calc-price-day');
        const elTotalRent = document.getElementById('calc-total-rent');
        const elDeposit = document.getElementById('calc-deposit');
        const elGrandTotal = document.getElementById('calc-grand-total');

        if (!unitId || !startStr || !endStr) {
            elDuration.textContent = '0 hari';
            elPriceDay.textContent = 'Rp 0';
            elTotalRent.textContent = 'Rp 0';
            elDeposit.textContent = 'Rp 0';
            elGrandTotal.textContent = 'Rp 0';
            return;
        }

        const units = getUnits();
        const u = units.find(unit => unit.id === unitId);
        if (!u) return;

        const start = new Date(startStr);
        const end = new Date(endStr);
        const diffTime = end - start;

        if (diffTime <= 0) {
            elDuration.textContent = 'Durasi tidak valid';
            elTotalRent.textContent = 'Rp 0';
            elGrandTotal.textContent = 'Rp 0';
            return;
        }

        // Calculate days (always round up to nearest day)
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        const totalRentFee = u.rent_price * diffDays;
        const grandTotal = totalRentFee + u.deposit;

        // Render global helper variable for modal detail reuse
        window.span_duration = String(diffDays);

        elDuration.textContent = `${diffDays} hari`;
        elPriceDay.textContent = `Rp ${u.rent_price.toLocaleString('id-ID')}`;
        elTotalRent.textContent = `Rp ${totalRentFee.toLocaleString('id-ID')}`;
        elDeposit.textContent = `Rp ${u.deposit.toLocaleString('id-ID')}`;
        elGrandTotal.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
    }

    rentUnitSelect.addEventListener('change', calculateRentalEstimates);
    document.getElementById('rent-start-date').addEventListener('change', calculateRentalEstimates);
    document.getElementById('rent-end-date').addEventListener('change', calculateRentalEstimates);

    // Form Rent Submit
    formCreateRent.addEventListener('submit', async (e) => {
        e.preventDefault();

        const custId = rentCustomerSelect.value;
        const unitId = rentUnitSelect.value;
        const startStr = document.getElementById('rent-start-date').value;
        const endStr = document.getElementById('rent-end-date').value;
        const payStatus = document.getElementById('rent-pay-status').value;
        const payMethod = document.getElementById('rent-pay-method').value;
        const notes = document.getElementById('rent-notes').value;

        // === VALIDATION ===
        if (!custId) {
            showFeedback('Pilih customer terlebih dahulu.', 'error');
            return;
        }
        if (!unitId) {
            showFeedback('Pilih unit iPhone yang tersedia.', 'error');
            return;
        }
        if (!startStr || !endStr) {
            showFeedback('Tanggal mulai dan kembali wajib diisi.', 'error');
            return;
        }

        const start = new Date(startStr);
        const end = new Date(endStr);

        if (end <= start) {
            showFeedback('Tanggal kembali harus setelah tanggal mulai.', 'error');
            document.getElementById('rent-end-date').focus();
            return;
        }

        const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        if (diffDays > 30) {
            showFeedback('Durasi sewa maksimal 30 hari.', 'error');
            return;
        }

        const custs = getCustomers();
        const units = getUnits();
        const c = custs.find(cust => cust.id === custId);
        const u = units.find(unit => unit.id === unitId);

        if (!c || !u) return;

        // Read Photo files
        const photoUnitFile = document.getElementById('rent-photo-unit').files[0];
        const photoCustomerFile = document.getElementById('rent-photo-customer').files[0];
        const photoKtpFile = document.getElementById('rent-photo-ktp').files[0];

        const [photoUnitBase64, photoCustomerBase64, photoKtpBase64] = await Promise.all([
            readFileAsDataURL(photoUnitFile),
            readFileAsDataURL(photoCustomerFile),
            readFileAsDataURL(photoKtpFile)
        ]);

        const totalRentFee = u.rent_price * diffDays;
        
        // Generate Transaction Code (PJM-YYYYMMDD-XXXX)
        const date = new Date();
        const formattedDate = date.getFullYear() + 
            String(date.getMonth() + 1).padStart(2, '0') + 
            String(date.getDate()).padStart(2, '0');
        
        const txs = getTransactions();
        const dailyCount = txs.filter(t => t.code.includes(`PJM-${formattedDate}`)).length + 1;
        const counterCode = String(dailyCount).padStart(4, '0');
        const txCode = `PJM-${formattedDate}-${counterCode}`;

        // Create transaction
        const newTx = {
            id: 't-' + Date.now(),
            code: txCode,
            customer_id: c.id,
            customer_name: c.name,
            customer_phone: c.phone,
            unit_id: u.id,
            unit_name: u.name,
            rent_date: new Date(startStr).toISOString(),
            planned_return_date: new Date(endStr).toISOString(),
            actual_return_date: null,
            duration_days: diffDays,
            rent_fee: totalRentFee,
            deposit_amount: u.deposit,
            deposit_refunded: false,
            late_fee_per_day: Math.round(u.rent_price * 1.5), // denda 1.5x harga harian
            total_late_fee: 0,
            total_bill: totalRentFee + u.deposit,
            payment_status: payStatus,
            transaction_status: 'AKTIF',
            return_condition: '',
            notes: notes,
            photo_unit: photoUnitBase64,
            photo_customer: photoCustomerBase64,
            photo_ktp: photoKtpBase64
        };

        // Add transaction
        txs.unshift(newTx);
        saveTransactions(txs);

        // Update unit status
        u.status = 'DIPINJAM';
        saveUnits(units);

        // Create Financial Ledger entries
        const mutations = getMutations();
        
        // 1. Rent Fee Mutation
        if (payStatus !== 'BELUM') {
            const rentPaidAmount = payStatus === 'DP' ? (totalRentFee * 0.5) : totalRentFee;
            mutations.unshift({
                id: 'm-' + Date.now(),
                date: new Date().toISOString(),
                module: 'RENT',
                ref_id: txCode,
                type: 'MASUK',
                category: 'Biaya Sewa',
                amount: rentPaidAmount,
                pay_method: payMethod,
                note: `Penerimaan sewa iPhone ${u.name} (${diffDays} hari) - ${c.name}`,
                logged_by: 'admin'
            });

            // 2. Deposit Mutation (only if paid)
            if (payStatus === 'LUNAS') {
                mutations.unshift({
                    id: 'm-' + (Date.now() + 1),
                    date: new Date().toISOString(),
                    module: 'RENT',
                    ref_id: txCode,
                    type: 'MASUK',
                    category: 'Deposit Pinjam',
                    amount: u.deposit,
                    pay_method: payMethod,
                    note: `Penerimaan jaminan deposit iPhone ${u.name} - ${c.name}`,
                    logged_by: 'admin'
                });
            }
        }
        saveMutations(mutations);

        // Close Modal
        modalRent.classList.remove('active');
        formCreateRent.reset();

        // Hide previews
        document.getElementById('preview-rent-photo-unit').style.display = 'none';
        document.getElementById('preview-rent-photo-customer').style.display = 'none';
        document.getElementById('preview-rent-photo-ktp').style.display = 'none';

        // Refresh UI
        renderKPIs();
        renderUnits();
        renderTransactions();
        renderMutations();
        renderOverviewDashboard();

        // Feedback toast
        showFeedback(`Transaksi ${txCode} berhasil dibuat.`);

        // Notification WA simulated
        sendWhatsAppSimulation(newTx.id, 'SEWA');
    });

    // Return unit modal opener
    function openReturnModal(txId) {
        selectedRentId = txId;
        const txs = getTransactions();
        const t = txs.find(tx => tx.id === txId);
        if (!t) return;

        document.getElementById('ret-code').textContent = t.code;
        document.getElementById('ret-cust').textContent = t.customer_name;
        document.getElementById('ret-unit-name').textContent = t.unit_name;
        document.getElementById('ret-due-date').textContent = new Date(t.planned_return_date).toLocaleString('id-ID');

        // Set return date input to current time
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('ret-date').value = now.toISOString().slice(0, 16);

        // Auto calculate late days and fees
        calculateReturnFees(t);

        modalReturn.classList.add('active');
    }

    // Dynamic fee calculator in return modal
    function calculateReturnFees(t) {
        const retDateStr = document.getElementById('ret-date').value;
        const elLateDays = document.getElementById('ret-late-days');
        const elDendaDay = document.getElementById('ret-denda-day');
        const elTotalDenda = document.getElementById('ret-total-denda');

        if (!retDateStr) return;

        const retDate = new Date(retDateStr);
        const dueDate = new Date(t.planned_return_date);
        const diffTime = retDate - dueDate;

        elDendaDay.textContent = `Rp ${t.late_fee_per_day.toLocaleString('id-ID')}`;

        if (diffTime <= 0) {
            elLateDays.textContent = '0 hari (Tepat Waktu)';
            elTotalDenda.textContent = 'Rp 0';
        } else {
            // Count late days
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const totalDenda = diffDays * t.late_fee_per_day;
            
            elLateDays.textContent = `${diffDays} hari`;
            elTotalDenda.textContent = `Rp ${totalDenda.toLocaleString('id-ID')}`;
        }
    }

    document.getElementById('ret-date').addEventListener('change', () => {
        if (!selectedRentId) return;
        const txs = getTransactions();
        const t = txs.find(tx => tx.id === selectedRentId);
        if (t) calculateReturnFees(t);
    });

    // Form Return Submit
    formReturnUnit.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedRentId) return;

        const retDateStr = document.getElementById('ret-date').value;
        const damageFee = parseFloat(document.getElementById('ret-damage-fee').value.replace(/\D/g, '')) || 0;
        const refundAction = document.getElementById('ret-refund-action').value;
        const returnCond = document.getElementById('ret-condition').value;
        const retNotes = document.getElementById('ret-notes').value;

        const txs = getTransactions();
        const t = txs.find(tx => tx.id === selectedRentId);
        if (!t) return;

        const units = getUnits();
        const u = units.find(unit => unit.id === t.unit_id);

        const retDate = new Date(retDateStr);
        const dueDate = new Date(t.planned_return_date);
        const diffTime = retDate - dueDate;
        let lateFeeTotal = 0;
        let lateDays = 0;

        if (diffTime > 0) {
            lateDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            lateFeeTotal = lateDays * t.late_fee_per_day;
        }

        // Update transaction properties
        t.actual_return_date = retDate.toISOString();
        t.total_late_fee = lateFeeTotal;
        t.return_condition = returnCond;
        t.transaction_status = 'SELESAI';
        t.payment_status = 'LUNAS';

        // Update unit status (if damage fee is substantial, send to maintenance)
        if (u) {
            u.status = damageFee > 100000 ? 'MAINTENANCE' : 'TERSEDIA';
            u.current_condition = returnCond;
            saveUnits(units);
        }

        // Ledger mutations update
        const mutations = getMutations();

        // 1. Process Refund Deposit / Deductions
        if (refundAction === 'REFUND') {
            t.deposit_refunded = true;
            mutations.unshift({
                id: 'm-' + Date.now(),
                date: new Date().toISOString(),
                module: 'RENT',
                ref_id: t.code,
                type: 'KELUAR',
                category: 'Refund Deposit',
                amount: t.deposit_amount,
                pay_method: 'TUNAI',
                note: `Refund deposit penuh sewa iPhone ${t.unit_name} - ${t.customer_name}`,
                logged_by: 'admin'
            });
        } else if (refundAction === 'POTONG') {
            t.deposit_refunded = true;
            const deductionTotal = lateFeeTotal + damageFee;
            const refundAmount = Math.max(0, t.deposit_amount - deductionTotal);
            
            // Record deposit refund cash out
            if (refundAmount > 0) {
                mutations.unshift({
                    id: 'm-' + Date.now(),
                    date: new Date().toISOString(),
                    module: 'RENT',
                    ref_id: t.code,
                    type: 'KELUAR',
                    category: 'Refund Deposit',
                    amount: refundAmount,
                    note: `Refund sisa deposit sewa iPhone ${t.unit_name} - ${t.customer_name} (setelah potong denda)`,
                    pay_method: 'TUNAI',
                    logged_by: 'admin'
                });
            }

            // Record income for deduction fees (Denda / Damage)
            if (deductionTotal > 0) {
                mutations.unshift({
                    id: 'm-' + (Date.now() + 1),
                    date: new Date().toISOString(),
                    module: 'RENT',
                    ref_id: t.code,
                    type: 'MASUK',
                    category: 'Denda',
                    amount: Math.min(t.deposit_amount, deductionTotal),
                    pay_method: 'TUNAI',
                    note: `Denda & biaya kerusakan dipotong dari deposit sewa - ${t.customer_name}`,
                    logged_by: 'admin'
                });
            }
        } else {
            // TAHAN (outstanding deposit stays active)
            t.deposit_refunded = false;
        }

        // 2. Late Fee cash in (only if paid separately cash/tf, not deducted from deposit)
        if (refundAction !== 'POTONG' && lateFeeTotal > 0) {
            mutations.unshift({
                id: 'm-' + (Date.now() + 2),
                date: new Date().toISOString(),
                module: 'RENT',
                ref_id: t.code,
                type: 'MASUK',
                category: 'Denda',
                amount: lateFeeTotal,
                pay_method: 'TUNAI',
                note: `Penerimaan denda terlambat ${lateDays} hari sewa iPhone ${t.unit_name} - ${t.customer_name}`,
                logged_by: 'admin'
            });
        }

        // 3. Damage fee cash in (paid separately)
        if (refundAction !== 'POTONG' && damageFee > 0) {
            mutations.unshift({
                id: 'm-' + (Date.now() + 3),
                date: new Date().toISOString(),
                module: 'RENT',
                ref_id: t.code,
                type: 'MASUK',
                category: 'Lainnya',
                amount: damageFee,
                pay_method: 'TUNAI',
                note: `Penerimaan klaim ganti rugi lecet/kerusakan - ${t.customer_name}`,
                logged_by: 'admin'
            });
        }

        saveTransactions(txs);
        saveMutations(mutations);

        // Reset & Close Modal
        modalReturn.classList.remove('active');
        formReturnUnit.reset();

        // Refresh UI
        renderKPIs();
        renderUnits();
        renderTransactions();
        renderMutations();
        renderOverviewDashboard();

        // Feedback toast
        showFeedback(`Pengembalian unit ${t.code} sukses.`);

        // Notification WA
        sendWhatsAppSimulation(t.id, 'KEMBALI');
    });

    // Form Add Unit Submit
    formAddUnit.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('u-name').value;
        const color = document.getElementById('u-color').value;
        const capacity = document.getElementById('u-capacity').value;
        const imei = document.getElementById('u-imei').value;
        const price = parseFloat(document.getElementById('u-rent-price').value.replace(/\D/g, '')) || 0;
        const deposit = parseFloat(document.getElementById('u-deposit').value.replace(/\D/g, '')) || 0;
        const condition = document.getElementById('u-condition').value;
        const notes = document.getElementById('u-notes').value;

        const units = getUnits();
        
        // Random colored SVG phone template
        const colorsArr = ['%234F46E5', '%230284C7', '%230F766E', '%236B21A8', '%2378350F'];
        const randomColor = colorsArr[Math.floor(Math.random() * colorsArr.length)];
        const photoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="${randomColor}"><rect x="28" y="8" width="44" height="84" rx="10" /><circle cx="50" cy="82" r="5" fill="%23fff"/><circle cx="40" cy="18" r="4" fill="%23fff"/><circle cx="50" cy="18" r="4" fill="%23fff"/></svg>`;

        units.push({
            id: 'u-' + Date.now(),
            name,
            imei,
            capacity,
            color,
            initial_condition: condition,
            current_condition: condition,
            rent_price: price,
            deposit,
            status: 'TERSEDIA',
            notes,
            photo: photoSvg
        });

        saveUnits(units);
        modalAddUnit.classList.remove('active');
        formAddUnit.reset();

        renderKPIs();
        renderUnits();
        populateRentFormDropdowns();

        showFeedback(`Unit ${name} berhasil didaftarkan.`);
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
        populateRentFormDropdowns();

        showFeedback(`Customer ${name} berhasil disimpan.`);
    });

    // Form Add Mutation (Manual) Submit
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
            module: 'RENT',
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
    function openDetailModal(txId) {
        selectedRentId = txId;
        const txs = getTransactions();
        const t = txs.find(tx => tx.id === txId);
        if (!t) return;

        document.getElementById('det-code').textContent = t.code;
        document.getElementById('det-customer').textContent = t.customer_name;
        document.getElementById('det-phone').textContent = t.customer_phone;
        document.getElementById('det-unit').textContent = t.unit_name;
        document.getElementById('det-notes').textContent = t.notes || '-';

        const rentDateFormatted = new Date(t.rent_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
        const dueDateFormatted = new Date(t.planned_return_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
        const returnDateFormatted = t.actual_return_date 
            ? new Date(t.actual_return_date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
            : '<span style="color:var(--text-muted)">Belum Kembali</span>';

        document.getElementById('det-rent-date').innerHTML = rentDateFormatted;
        document.getElementById('det-due-date').innerHTML = dueDateFormatted;
        document.getElementById('det-return-date').innerHTML = returnDateFormatted;

        // Fetch customer guarantee details
        const custs = getCustomers();
        const c = custs.find(cust => cust.id === t.customer_id);
        document.getElementById('det-guarantee').textContent = c ? c.guarantee : 'KTP';

        // Cost summaries
        document.getElementById('det-rent-fee').textContent = `Rp ${t.rent_fee.toLocaleString('id-ID')}`;
        document.getElementById('det-deposit').textContent = `Rp ${t.deposit_amount.toLocaleString('id-ID')}`;
        document.getElementById('det-late-fee').textContent = `Rp ${t.total_late_fee.toLocaleString('id-ID')}`;
        
        const netBill = t.rent_fee + t.total_late_fee; // Deposit outstanding excluded from net services cost display
        document.getElementById('det-total-bill').textContent = `Rp ${(netBill + t.deposit_amount).toLocaleString('id-ID')}`;

        // Statuses
        const statusPaySelect = document.getElementById('det-pay-status');
        let payColor = 'var(--status-tersedia)';
        if (t.payment_status === 'DP') payColor = 'var(--status-maintenance)';
        else if (t.payment_status === 'BELUM') payColor = 'var(--status-hilang)';
        document.getElementById('det-pay-status').innerHTML = `<span style="color:${payColor}; font-weight:700;">${t.payment_status}</span>`;

        let depColor = 'var(--status-tersedia)'; // Refunded
        let depLabel = 'KEMBALI (Refunded)';
        if (!t.deposit_refunded) {
            depColor = 'var(--status-dipinjam)';
            depLabel = 'DITAHAN (Outstanding)';
        }
        document.getElementById('det-deposit-status').innerHTML = `<span style="color:${depColor}; font-weight:700;">${depLabel}</span>`;

        // Render photos if exists
        const photosSection = document.getElementById('det-photos-section');
        if (photosSection) {
            if (t.photo_unit || t.photo_customer || t.photo_ktp) {
                document.getElementById('det-photo-unit-img').src = t.photo_unit || 'https://ui-avatars.com/api/?name=Unit&background=f1f5f9&color=64748b';
                document.getElementById('det-photo-customer-img').src = t.photo_customer || 'https://ui-avatars.com/api/?name=Cust&background=f1f5f9&color=64748b';
                document.getElementById('det-photo-ktp-img').src = t.photo_ktp || 'https://ui-avatars.com/api/?name=KTP&background=f1f5f9&color=64748b';
                photosSection.style.display = 'block';
            } else {
                photosSection.style.display = 'none';
            }
        }

        // Render printable Receipt Layout
        renderReceiptContent(t, c);

        modalDetail.classList.add('active');
    }

    // Receipt Thermal Generator
    function renderReceiptContent(t, c) {
        const printArea = document.getElementById('thermal-receipt');
        if (!printArea) return;

        const printDate = new Date(t.rent_date).toLocaleString('id-ID');
        const dueDate = new Date(t.planned_return_date).toLocaleString('id-ID');

        printArea.innerHTML = `
            <div class="receipt-header">
                <div class="receipt-title">PLANET STORE BOYOLALI</div>
                <div class="receipt-subtitle">Divisi Rental & Sewa iPhone</div>
                <div class="receipt-subtitle" style="font-size: 8pt;">Jalan Tentara Pelajar No.04, Boyolali</div>
                <div class="receipt-subtitle" style="font-size: 8pt;">WA: 0895-2299-4849 | IG: @planetstoreid</div>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-row">
                <span>Kode Pinjam:</span>
                <span class="receipt-col-label">${t.code}</span>
            </div>
            <div class="receipt-row">
                <span>Tanggal Sewa:</span>
                <span>${printDate}</span>
            </div>
            <div class="receipt-row">
                <span>Pelanggan:</span>
                <span>${t.customer_name}</span>
            </div>
            <div class="receipt-row">
                <span>No HP:</span>
                <span>${t.customer_phone}</span>
            </div>
            <div class="receipt-row">
                <span>Jaminan:</span>
                <span>${c ? c.guarantee : 'KTP'}</span>
            </div>

            <div class="receipt-divider"></div>
            
            <div style="font-weight: bold; margin-bottom: 4px;">Detail Peminjaman:</div>
            <div>Perangkat: ${t.unit_name}</div>
            <div>Durasi: ${t.duration_days} Hari</div>
            <div>Tenggat Kembali: ${dueDate}</div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-row">
                <span>Biaya Rental:</span>
                <span>Rp ${t.rent_fee.toLocaleString('id-ID')}</span>
            </div>
            <div class="receipt-row">
                <span>Uang Deposit:</span>
                <span>Rp ${t.deposit_amount.toLocaleString('id-ID')}</span>
            </div>
            ${t.total_late_fee > 0 ? `
            <div class="receipt-row" style="color:red;">
                <span>Denda Keterlambatan:</span>
                <span>Rp ${t.total_late_fee.toLocaleString('id-ID')}</span>
            </div>` : ''}
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-row" style="font-size: 11pt; font-weight: bold;">
                <span>TOTAL BAYAR:</span>
                <span>Rp ${(t.rent_fee + t.deposit_amount + t.total_late_fee).toLocaleString('id-ID')}</span>
            </div>
            <div class="receipt-row">
                <span>Status Sewa:</span>
                <span>${t.transaction_status}</span>
            </div>
            <div class="receipt-row">
                <span>Status Deposit:</span>
                <span>${t.deposit_refunded ? 'DIKEMBALIKAN (REFUND)' : 'DITAHAN (AKTIF)'}</span>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-footer">
                <div>Syarat & Ketentuan Sewa:</div>
                <div style="font-size: 7.5pt; margin-top: 4px;">1. Keterlambatan dikenakan denda harian sesuai tarif unit. 2. Kerusakan/lecet fisik unit menjadi tanggung jawab penuh penyewa. 3. Deposit dicairkan setelah pemeriksaan unit selesai.</div>
                <div class="receipt-qr" style="margin-top: 4px;">
                   [ PLANET STORE RENTAL ]<br>
                   ${t.code}
                </div>
                <div>Terima kasih atas kunjungan Anda!</div>
            </div>
        `;
    }

    // Trigger Print
    document.getElementById('btn-print-receipt').addEventListener('click', () => {
        document.body.classList.add('print-receipt');
        window.print();
        setTimeout(() => {
            document.body.classList.remove('print-receipt');
        }, 500);
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

    // Search and Filters
    document.getElementById('rent-search').addEventListener('input', renderTransactions);
    document.getElementById('filter-rent-status').addEventListener('change', renderTransactions);
    document.getElementById('filter-pay-status').addEventListener('change', renderTransactions);
    document.getElementById('cust-search')?.addEventListener('input', renderCustomers);

    // Modal Control Openers
    btnOpenRent.addEventListener('click', () => {
        populateRentFormDropdowns();
        modalRent.classList.add('active');
        
        // Default start date to now
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        document.getElementById('rent-start-date').value = now.toISOString().slice(0, 16);
    });
    
    btnOpenAddUnit.addEventListener('click', () => {
        modalAddUnit.classList.add('active');
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
            modalRent.classList.remove('active');
            modalReturn.classList.remove('active');
            modalDetail.classList.remove('active');
            modalAddUnit.classList.remove('active');
            modalAddCust.classList.remove('active');
            modalCreateMutation.classList.remove('active');
            
            formCreateRent.reset();
            formReturnUnit.reset();
            formAddUnit.reset();
            formAddCust.reset();
            formCreateMutation.reset();
            
            selectedRentId = null;
        });
    });

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
                pageDisplayTitle.textContent = 'Ringkasan Operasional Sewa';
                renderOverviewDashboard();
            } else if (tabName === 'units') {
                pageDisplayTitle.textContent = 'Galeri Armada Unit iPhone';
                renderUnits();
            } else if (tabName === 'transactions') {
                pageDisplayTitle.textContent = 'Riwayat Transaksi Peminjaman';
                renderTransactions();
            } else if (tabName === 'customers') {
                pageDisplayTitle.textContent = 'Database Customer Terdaftar';
                renderCustomers();
            } else if (tabName === 'mutations') {
                pageDisplayTitle.textContent = 'Ledger Cash Flow Rental';
                renderMutations();
            }
        });
    });

    // Auto format money inputs (Indonesian thousand separator)
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

    setupMoneyInputFormatter('u-rent-price');
    setupMoneyInputFormatter('u-deposit');
    setupMoneyInputFormatter('ret-damage-fee');
    setupMoneyInputFormatter('mut-amount');

    // --- REVISIONS MODALS & EXPORTS ---
    function openUnitDetailModal(unit) {
        let modal = document.getElementById('modal-unit-detail');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-unit-detail';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-container" style="max-width: 480px;">
                    <div class="modal-header">
                        <h3 id="udm-title">Detail Unit</h3>
                        <button id="udm-close" class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body" style="padding: 24px;" id="udm-body"></div>
                    <div class="modal-footer" style="justify-content: space-between;">
                        <button id="udm-btn-return" class="btn btn-primary" style="font-size: 0.85rem; padding: 10px 20px;">
                            Proses Kembali
                        </button>
                        <button id="udm-close-btn" class="btn btn-secondary" style="font-size: 0.85rem; padding: 10px 20px;">Tutup</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            modal.querySelector('#udm-close').addEventListener('click', () => modal.classList.remove('active'));
            modal.querySelector('#udm-close-btn').addEventListener('click', () => modal.classList.remove('active'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
        }

        const statusColors = {
            'TERSEDIA': 'var(--status-tersedia)',
            'DIPINJAM': 'var(--status-dipinjam)',
            'MAINTENANCE': 'var(--status-maintenance)',
            'HILANG': 'var(--status-hilang)'
        };

        modal.querySelector('#udm-title').textContent = unit.name;

        const isSvg = unit.photo.trim().startsWith('<svg') || unit.photo.trim().startsWith('data:image/svg+xml');
        const photoElHtml = isSvg
            ? `<div style="height: 160px; background-color: var(--bg-dark); display:flex; align-items:center; justify-content:center; border-radius: 12px; margin-bottom: 20px; overflow:hidden;">${unit.photo}</div>`
            : `<div style="height: 200px; border-radius: 12px; overflow:hidden; margin-bottom: 20px; border: 1px solid var(--border-soft);"><img src="${unit.photo}" style="width: 100%; height: 100%; object-fit: cover;"></div>`;

        modal.querySelector('#udm-body').innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 14px;">
                ${photoElHtml}
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-soft); padding-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">STATUS</span>
                    <strong style="color:${statusColors[unit.status] || '#09090B'}; font-size: 0.9rem;">${unit.status}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-soft); padding-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">IMEI</span>
                    <strong style="color: var(--text-title); font-size: 0.9rem; font-family: monospace;">${unit.imei}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-soft); padding-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">KAPASITAS</span>
                    <strong style="color: var(--text-title); font-size: 0.9rem;">${unit.capacity}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-soft); padding-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">WARNA</span>
                    <strong style="color: var(--text-title); font-size: 0.9rem;">${unit.color}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-soft); padding-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">SEWA / HARI</span>
                    <strong style="color: var(--text-title); font-size: 0.9rem; font-family: monospace;">${fmt.rupiah(unit.rent_price)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-soft); padding-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">DEPOSIT WAJIB</span>
                    <strong style="color: var(--primary-purple); font-size: 0.9rem; font-family: monospace;">${fmt.rupiah(unit.deposit)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-soft); padding-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">KONDISI UTAMA</span>
                    <strong style="color: var(--text-title); font-size: 0.9rem;">${unit.initial_condition || unit.current_condition}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-soft); padding-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">KONDISI SAAT INI</span>
                    <strong style="color: var(--text-title); font-size: 0.9rem;">${unit.current_condition}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--text-muted); font-size: 0.85rem;">CATATAN</span>
                    <strong style="color: var(--text-title); font-size: 0.9rem;">${unit.notes || '-'}</strong>
                </div>
            </div>
        `;

        const btnReturn = modal.querySelector('#udm-btn-return');
        if (unit.status === 'DIPINJAM') {
            btnReturn.style.display = 'block';
            const activeTx = getTransactions().find(t => t.unit_id === unit.id && t.transaction_status === 'AKTIF');
            if (activeTx) {
                btnReturn.onclick = () => {
                    modal.classList.remove('active');
                    openReturnModal(activeTx.id);
                };
            }
        } else {
            btnReturn.style.display = 'none';
        }

        modal.classList.add('active');
    }

    function openCustomerHistory(custId) {
        const c = getCustomers().find(x => x.id === custId);
        const txs = getTransactions().filter(t => t.customer_id === custId);
        if (!c) return;

        let modal = document.getElementById('modal-cust-history');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'modal-cust-history';
            modal.className = 'modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4';
            document.body.appendChild(modal);
            modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
        }

        const txRows = txs.length === 0
            ? `<tr><td colspan="4" style="text-align:center; padding:24px; color:var(--text-muted); font-size:0.8rem;">Belum ada transaksi</td></tr>`
            : txs.map(t => `
                <tr style="border-bottom: 1px solid #E4E4E7; font-size: 0.8rem;" class="font-mono">
                    <td style="padding: 8px; font-weight: 700; color: var(--accent-blue);">${t.code}</td>
                    <td style="padding: 8px; font-family: sans-serif;">${t.unit_name}</td>
                    <td style="padding: 8px;">${fmt.date(t.rent_date)}</td>
                    <td style="padding: 8px; font-weight: 700;">${fmt.rupiah(t.rent_fee)}</td>
                </tr>
            `).join('');

        modal.innerHTML = `
            <div class="modal-container bg-white w-full max-w-lg border-2 border-planet-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" style="max-height: 90vh; display: flex; flex-direction: column;">
                <div style="background: #09090B; color: white; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #09090B;">
                    <h3 style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">${c.name} — Riwayat Sewa</h3>
                    <button onclick="document.getElementById('modal-cust-history').classList.remove('active')" style="color: white; font-size: 1.2rem; background: none; border: none; cursor: pointer;" class="font-bold">✕</button>
                </div>
                <div style="overflow-y: auto; flex: 1; padding: 24px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: #71717A; border-bottom: 2px solid #09090B;">
                                <th style="padding: 8px; text-align: left;">Kode</th>
                                <th style="padding: 8px; text-align: left;">Unit</th>
                                <th style="padding: 8px; text-align: left;">Tanggal</th>
                                <th style="padding: 8px; text-align: left;">Biaya</th>
                            </tr>
                        </thead>
                        <tbody>${txRows}</tbody>
                    </table>
                </div>
            </div>
        `;
        modal.classList.add('active');
    }

    window.clearMutationFilter = function() {
        const fromInput = document.getElementById('filter-mut-from');
        const toInput = document.getElementById('filter-mut-to');
        if (fromInput) fromInput.value = '';
        if (toInput) toInput.value = '';
        renderMutations();
    };

    window.exportTransactionsCSV = function() {
        const txs = getTransactions();
        const headers = ['Kode', 'Customer', 'No HP', 'Unit', 'Tgl Pinjam', 'Tgl Kembali', 'Biaya Sewa', 'Deposit', 'Status Sewa', 'Status Bayar'];

        const rows = txs.map(t => [
            t.code,
            t.customer_name,
            t.customer_phone,
            t.unit_name,
            fmt.datetime(t.rent_date),
            fmt.datetime(t.planned_return_date),
            t.rent_fee,
            t.deposit_amount,
            t.transaction_status,
            t.payment_status
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `planet_store_transaksi_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        showFeedback('Data transaksi berhasil diekspor ke CSV.');
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
        link.download = `planet_store_mutasi_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        showFeedback('Data mutasi berhasil diekspor ke CSV.');
    };

    // === EXPORT EXCEL & PRINT PDF FUNCTIONALITY ===
    function getActiveTabName() {
        const activeTabItem = document.querySelector('.sidebar .nav-item.active');
        return activeTabItem ? activeTabItem.getAttribute('data-tab') : 'overview';
    }

    function exportToExcel() {
        const activeTab = getActiveTabName();
        let filename = `PlanetStore_Sewa_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
        
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
        let moduleName = 'DS_SEWA — Sistem Sewa';
        if (activeTab === 'units') {
            title = 'Laporan Inventaris Unit Sewa';
        } else if (activeTab === 'transactions') {
            title = 'Laporan Riwayat Peminjaman iPhone';
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
    renderUnits();
    renderTransactions();
    renderCustomers();
    renderMutations();
    populateRentFormDropdowns();
});

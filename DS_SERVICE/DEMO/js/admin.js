/* ==========================================================================
   Planet Store Boyolali — DS_SERVICE Admin Dashboard Interaction Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Session Validation and Display
    const activeUser = JSON.parse(sessionStorage.getItem('active_user'));
    if (!activeUser) {
        window.location.href = 'login.html';
        return;
    }

    const userDisplay = document.getElementById('user-display');
    const btnLogout = document.getElementById('btn-logout');
    
    userDisplay.textContent = `${activeUser.name} (${activeUser.role})`;
    
    btnLogout.addEventListener('click', () => {
        sessionStorage.removeItem('active_user');
        window.location.href = 'login.html';
    });

    // Role-based Access Control Simulation
    const tabOverviewLink = document.querySelector('.sidebar .nav-item[data-tab="overview"]');
    const tabTechsLink = document.querySelector('.sidebar .nav-item[data-tab="techs"]');
    const tabMutationsLink = document.getElementById('tab-mutations-link');
    const btnOpenCreate = document.getElementById('btn-open-create');
    const btnOpenCreateTech = document.getElementById('btn-open-create-tech');

    if (activeUser.role === 'TEKNISI') {
        // Hide administrative tabs entirely from technicians
        if (tabOverviewLink) {
            tabOverviewLink.style.display = 'none';
        }
        if (tabTechsLink) {
            tabTechsLink.style.display = 'none';
        }
        if (tabMutationsLink) {
            tabMutationsLink.style.display = 'none';
        }
        // Hide add technician button from technicians
        if (btnOpenCreateTech) {
            btnOpenCreateTech.style.display = 'none';
        }
        // NOTE: btnOpenCreate (Buat Tiket Servis) is kept visible so technicians can add queues!
    }

    // DOM Elements
    const ticketTableBody = document.getElementById('ticket-table-body');
    const kpiTotalActive = document.getElementById('kpi-total-active');
    const kpiWaitingAcc = document.getElementById('kpi-waiting-acc');
    const kpiCompletedToday = document.getElementById('kpi-completed-today');
    const kpiLowStock = document.getElementById('kpi-low-stock');
    const tabContents = document.querySelectorAll('.tab-content');
    const searchInput = document.getElementById('admin-search');
    const statusFilter = document.getElementById('filter-status');
    const priorityFilter = document.getElementById('filter-priority');
    
    // Modal Elements
    const createModal = document.getElementById('modal-create');
    const detailModal = document.getElementById('modal-detail');
    const createTechModal = document.getElementById('modal-create-tech');
    const createMutationModal = document.getElementById('modal-create-mutation');
    
    const btnOpenCreateMutation = document.getElementById('btn-open-create-mutation');
    const modalCloses = document.querySelectorAll('.modal-close');
    
    // Form Elements
    const formCreateTicket = document.getElementById('form-create-ticket');
    const formCreateTech = document.getElementById('form-create-tech');
    const formCreateMutation = document.getElementById('form-create-mutation');
    const technicianDropdown = document.getElementById('technician');
    
    // Toast Container
    const toastContainer = document.getElementById('toast-container');

    // State
    let selectedTicketId = null;

    // Populate Technicians Dropdown on Create Ticket Form
    function populateTechnicianDropdown() {
        if (!technicianDropdown) return;
        technicianDropdown.innerHTML = '';
        const techs = getTechnicians();
        techs.forEach(t => {
            if (t.status === 'AKTIF') {
                const opt = document.createElement('option');
                opt.value = t.name;
                opt.textContent = `${t.name} (Spesialis: ${t.specialty})`;
                if (activeUser.role === 'TEKNISI' && t.name === activeUser.name) {
                    opt.selected = true;
                }
                technicianDropdown.appendChild(opt);
            }
        });
    }

    // --- RENDER FUNCTIONS ---

    // Render KPI Metrics
    function renderKPIs() {
        const tickets = getTickets();
        const parts = getSpareparts();
        const todayStr = new Date().toISOString().split('T')[0];

        // Filter tickets if technician
        const displayTickets = activeUser.role === 'TEKNISI' 
            ? tickets.filter(t => t.technician === activeUser.name)
            : tickets;

        const activeCount = displayTickets.filter(t => t.status !== 'DIAMBIL' && t.status !== 'DIBATALKAN').length;
        const waitingAcc = displayTickets.filter(t => t.status === 'MENUNGGU_ACC').length;
        const completedToday = displayTickets.filter(t => {
            if (t.status === 'SELESAI' || t.status === 'DIAMBIL') {
                const compDate = t.date_completed ? t.date_completed.split('T')[0] : '';
                return compDate === todayStr;
            }
            return false;
        }).length;
        const lowStock = parts.filter(p => p.stock <= p.min_stock).length;

        kpiTotalActive.textContent = activeCount;
        kpiWaitingAcc.textContent = waitingAcc;
        kpiCompletedToday.textContent = completedToday;
        kpiLowStock.textContent = lowStock;
    }

    // Get Status Badge Class
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'DITERIMA': return 'badge-diterima';
            case 'DIAGNOSA': return 'badge-diagnosa';
            case 'MENUNGGU_ACC': return 'badge-menunggu-acc';
            case 'MENUNGGU_PART': return 'badge-menunggu-part';
            case 'PROSES': return 'badge-proses';
            case 'QC_TESTING': return 'badge-qc';
            case 'SELESAI': return 'badge-selesai';
            case 'DIAMBIL': return 'badge-diambil';
            case 'DIBATALKAN': return 'badge-dibatalkan';
            default: return 'badge-diterima';
        }
    }

    // Render Ticket Table
    function renderTicketTable() {
        const tickets = getTickets();
        const query = searchInput.value.toLowerCase();
        const statFilter = statusFilter.value;
        const priFilter = priorityFilter.value;

        ticketTableBody.innerHTML = '';

        // Filter tickets if technician
        const displayTickets = activeUser.role === 'TEKNISI' 
            ? tickets.filter(t => t.technician === activeUser.name)
            : tickets;

        const filtered = displayTickets.filter(t => {
            const matchesQuery = t.customer_name.toLowerCase().includes(query) ||
                                 t.code.toLowerCase().includes(query) ||
                                 t.model.toLowerCase().includes(query) ||
                                 t.customer_phone.includes(query);
            
            const matchesStatus = statFilter === 'ALL' || t.status === statFilter;
            const matchesPriority = priFilter === 'ALL' || t.priority === priFilter;

            return matchesQuery && matchesStatus && matchesPriority;
        });

        const statusPriority = {
            'DITERIMA': 1,
            'DIAGNOSA': 2,
            'MENUNGGU_ACC': 3,
            'MENUNGGU_PART': 4,
            'PROSES': 5,
            'QC_TESTING': 6,
            'SELESAI': 7,
            'DIAMBIL': 8,
            'DIBATALKAN': 9
        };

        const sorted = filtered.sort((a, b) => {
            // 1. Active vs Final (DIAMBIL / DIBATALKAN are final)
            const isAFinal = a.status === 'DIAMBIL' || a.status === 'DIBATALKAN';
            const isBFinal = b.status === 'DIAMBIL' || b.status === 'DIBATALKAN';
            if (isAFinal !== isBFinal) {
                return isAFinal ? 1 : -1;
            }

            // 2. Active EXPRESS priority globally among active tickets
            if (!isAFinal) {
                if (a.priority !== b.priority) {
                    return a.priority === 'EXPRESS' ? -1 : 1;
                }
            }

            // 3. Status order
            if (a.status !== b.status) {
                return statusPriority[a.status] - statusPriority[b.status];
            }

            // 4. Date entered (newest first)
            return new Date(b.date_entered) - new Date(a.date_entered);
        });

        if (sorted.length === 0) {
            ticketTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">Tidak ada data tiket servis ditemukan</td></tr>`;
            return;
        }

        sorted.forEach(t => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', t.id);
            tr.innerHTML = `
                <td data-label="No Tiket" style="font-weight: 700; color: var(--accent-orange);">${t.code}</td>
                <td data-label="Customer">
                    <div style="font-weight: 600;">${t.customer_name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${t.customer_phone}</div>
                </td>
                <td data-label="Device">${t.model}</td>
                <td data-label="Prioritas"><span class="badge ${t.priority === 'EXPRESS' ? 'badge-express' : 'badge-normal'}">${t.priority}</span></td>
                <td data-label="Teknisi" style="font-weight: 500; color: var(--text-body);">${t.technician}</td>
                <td data-label="Status"><span class="badge ${getStatusBadgeClass(t.status)}">${t.status.replace('_', ' ')}</span></td>
                <td data-label="Estimasi Selesai">${t.estimated_date ? t.estimated_date : '<span style="color:var(--text-muted)">-</span>'}</td>
            `;

            tr.addEventListener('click', () => {
                openDetailModal(t.id);
            });

            ticketTableBody.appendChild(tr);
        });
    }

    // Render Spareparts List
    function renderSpareparts() {
        const parts = getSpareparts();
        const partsTableBody = document.getElementById('parts-table-body');
        const lowStockContainer = document.getElementById('low-stock-warnings');
        
        partsTableBody.innerHTML = '';
        lowStockContainer.innerHTML = '';

        parts.forEach(p => {
            const isLow = p.stock <= p.min_stock;
            
            // Add warning card if low
            if (isLow) {
                const warnCard = document.createElement('div');
                warnCard.className = 'part-warning-card';
                warnCard.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="color:var(--status-dibatalkan); font-weight: bold; font-size: 1rem;">[!]</span>
                        <div>
                            <div style="font-weight:600; font-size:0.85rem;">Stok Menipis: ${p.name}</div>
                            <div style="font-size:0.75rem; color:var(--text-secondary);">Tersisa: ${p.stock} unit (Batas min: ${p.min_stock})</div>
                        </div>
                    </div>
                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="alert('Simulasi pemesanan stok ke supplier ${p.supplier} dikirim!')">Order</button>
                `;
                lowStockContainer.appendChild(warnCard);
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 600;">${p.name}</td>
                <td><div style="display:flex; flex-wrap:wrap; gap:4px;">${p.compatible.map(c => `<span style="font-size:0.7rem; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px;">${c}</span>`).join('')}</div></td>
                <td style="color:var(--text-secondary);">Rp ${p.price_buy.toLocaleString('id-ID')}</td>
                <td style="font-weight: 700; color:var(--accent-orange);">Rp ${p.price_sell.toLocaleString('id-ID')}</td>
                <td style="font-weight: 600; color: ${isLow ? 'var(--status-dibatalkan)' : 'var(--status-selesai)'}">${p.stock} unit</td>
                <td style="color:var(--text-muted); font-size:0.8rem;">${p.supplier}</td>
            `;
            partsTableBody.appendChild(tr);
        });
    }

    // Render Technicians (Tab 3)
    function renderTechnicians() {
        const techs = getTechnicians();
        const grid = document.getElementById('tech-cards-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        techs.forEach(t => {
            const card = document.createElement('div');
            card.className = 'kpi-card';
            card.style.cursor = 'pointer';
            card.style.transition = 'all 0.2s ease';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; gap: 12px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${t.photo}" alt="${t.name}" style="width: 44px; height: 44px; border-radius:50%; object-fit:cover; border:1.5px solid var(--primary-purple); background:#fff;">
                        <div>
                            <div style="font-weight:700; font-size:1.05rem; color:var(--text-title);">${t.name}</div>
                            <div style="font-size: 0.75rem; color:var(--text-muted);">${t.phone || '-'}</div>
                        </div>
                    </div>
                    <span class="badge ${t.status === 'AKTIF' ? 'badge-selesai' : 'badge-diterima'}">${t.status}</span>
                </div>
                <div style="font-size: 0.85rem; color:var(--text-body); margin-top:12px;">Keahlian: <strong>${t.specialty}</strong></div>
                <div style="margin-top:14px; display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-soft); padding-top:12px; font-size:0.82rem;">
                    <div>Rating: <span style="color:var(--accent-orange); font-weight:700;">★ ${t.rating}</span></div>
                    <div>Kerja Aktif: <span style="font-weight:700; color:var(--text-title);">${t.active_jobs || 0} unit</span></div>
                </div>
            `;
            
            // Attach click event to show tech track record & logs
            card.addEventListener('click', () => {
                openTechDetailModal(t);
            });
            grid.appendChild(card);
        });
    }

    // Modal Details & Track Record Logs for a Technician
    function openTechDetailModal(tech) {
        const techDetailModal = document.getElementById('modal-tech-detail');
        if (!techDetailModal) return;

        // Populate basic information
        document.getElementById('td-photo').src = tech.photo;
        document.getElementById('td-name').textContent = tech.name;
        document.getElementById('td-specialty').textContent = tech.specialty;
        document.getElementById('td-phone').textContent = `WhatsApp: ${tech.phone || '-'}`;
        document.getElementById('td-password').textContent = tech.password || 'password123';
        document.getElementById('td-rating').textContent = `★ ${tech.rating.toFixed(1)}`;

        const tickets = getTickets();
        
        // Filter tickets that are assigned to this technician
        const assignedTickets = tickets.filter(t => t.technician === tech.name);
        const activeJobs = assignedTickets.filter(t => t.status !== 'DIAMBIL' && t.status !== 'DIBATALKAN').length;
        const completedJobs = assignedTickets.filter(t => t.status === 'DIAMBIL' || t.status === 'SELESAI').length;

        document.getElementById('td-active-jobs').textContent = activeJobs;
        document.getElementById('td-completed-jobs').textContent = completedJobs;

        // Compile logs where the technician performed operations
        const tbody = document.getElementById('td-activity-tbody');
        tbody.innerHTML = '';

        let allLogs = [];
        assignedTickets.forEach(t => {
            t.logs.forEach(l => {
                if (l.technician === tech.name) {
                    allLogs.push({
                        ticketId: t.id,
                        timestamp: l.timestamp,
                        code: t.code,
                        model: t.model,
                        note: l.note,
                        status: l.next_status
                    });
                }
            });
        });

        // Sort logs by time (newest first)
        allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (allLogs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:20px;">Belum ada riwayat pengerjaan oleh teknisi ini.</td></tr>`;
        } else {
            allLogs.forEach(l => {
                const tr = document.createElement('tr');
                const timeStr = new Date(l.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                tr.innerHTML = `
                    <td style="color: var(--text-muted); font-size: 0.78rem; white-space: nowrap;">${timeStr}</td>
                    <td class="clickable-ticket" style="font-weight: 700; color: var(--accent-orange); white-space: nowrap; cursor: pointer; text-decoration: underline;" title="Klik untuk lihat detail tiket">${l.code}</td>
                    <td style="font-weight: 500; white-space: nowrap;">${l.model}</td>
                    <td style="color: var(--text-body); line-height: 1.4; min-width: 180px; word-break: break-word;">${l.note}</td>
                    <td style="text-align: right; white-space: nowrap;"><span class="badge ${getStatusBadgeClass(l.status)}" style="display: inline-flex; vertical-align: middle;">${l.status.replace('_', ' ')}</span></td>
                `;

                const ticketBtn = tr.querySelector('.clickable-ticket');
                if (ticketBtn) {
                    ticketBtn.addEventListener('click', () => {
                        const techDetailModal = document.getElementById('modal-tech-detail');
                        if (techDetailModal) techDetailModal.classList.remove('active');
                        openDetailModal(l.ticketId);
                    });
                }

                tbody.appendChild(tr);
            });
        }

        // Render printable content for technician report
        renderTechPrintContent(tech, activeJobs, completedJobs, allLogs);

        // Display Modal
        techDetailModal.classList.add('active');
    }

    function renderTechPrintContent(tech, activeJobs, completedJobs, allLogs) {
        const printArea = document.getElementById('tech-receipt-print');
        if (!printArea) return;

        const printDate = new Date().toLocaleString('id-ID');
        
        let logsRows = '';
        if (allLogs.length === 0) {
            logsRows = `<tr><td colspan="5" style="text-align: center; padding: 12px; color: #666;">Belum ada riwayat aktivitas.</td></tr>`;
        } else {
            allLogs.forEach(l => {
                const timeStr = new Date(l.timestamp).toLocaleDateString('id-ID', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                logsRows += `
                    <tr>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-size: 8.5pt;">${timeStr}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #e09400; font-size: 8.5pt;">${l.code}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-size: 8.5pt;">${l.model}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; font-size: 8.5pt;">${l.note}</td>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; font-size: 8.5pt;"><span style="display:inline-block; padding: 3px 6px; border-radius: 4px; font-weight: bold; font-size: 7.5pt; border: 1px solid #ccc; text-transform: uppercase;">${l.status.replace('_', ' ')}</span></td>
                    </tr>
                `;
            });
        }

        printArea.innerHTML = `
            <div style="border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0; font-size: 18pt; font-weight: bold; color: #7A3DB8;">PLANET STORE BOYOLALI</h2>
                    <p style="margin: 2px 0 0 0; font-size: 9pt; color: #555;">Pusat Servis & Jual Beli HP Murah & Bergaransi</p>
                </div>
                <div style="text-align: right;">
                    <h3 style="margin: 0; font-size: 12pt; color: #333;">LAPORAN KINERJA TEKNISI</h3>
                    <p style="margin: 2px 0 0 0; font-size: 8pt; color: #777;">Dicetak pada: ${printDate}</p>
                </div>
            </div>

            <div style="display: flex; gap: 30px; margin-bottom: 25px; background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eaeaea;">
                <div style="flex: 0 0 80px;">
                    <img src="${tech.photo}" alt="Profil ${tech.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #7A3DB8; background: #fff;">
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 14pt; font-weight: bold; color: #111;">${tech.name}</h4>
                    <p style="margin: 0 0 4px 0; font-size: 9.5pt; color: #7A3DB8; font-weight: 600;">Spesialis: ${tech.specialty}</p>
                    <p style="margin: 0; font-size: 9pt; color: #666;">No. WhatsApp: ${tech.phone || '-'}</p>
                </div>
                <div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; align-items: center;">
                    <div style="text-align: center; border-right: 1px solid #ddd; padding: 5px;">
                        <div style="font-size: 7.5pt; color: #777; font-weight: bold; text-transform: uppercase;">Kerja Aktif</div>
                        <div style="font-size: 14pt; font-weight: bold; margin-top: 3px; color: #333;">${activeJobs}</div>
                    </div>
                    <div style="text-align: center; border-right: 1px solid #ddd; padding: 5px;">
                        <div style="font-size: 7.5pt; color: #777; font-weight: bold; text-transform: uppercase;">Selesai/Lunas</div>
                        <div style="font-size: 14pt; font-weight: bold; margin-top: 3px; color: #16A34A;">${completedJobs}</div>
                    </div>
                    <div style="text-align: center; padding: 5px;">
                        <div style="font-size: 7.5pt; color: #777; font-weight: bold; text-transform: uppercase;">Rating</div>
                        <div style="font-size: 14pt; font-weight: bold; margin-top: 3px; color: #F5A300;">★ ${tech.rating.toFixed(1)}</div>
                    </div>
                </div>
            </div>

            <div>
                <h4 style="margin: 0 0 10px 0; font-size: 11pt; border-bottom: 1px solid #333; padding-bottom: 5px;">LOG AKTIVITAS & RIWAYAT PENGERJAAN</h4>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: #f1f1f1;">
                            <th style="padding: 8px; border-bottom: 1.5px solid #333; font-size: 8.5pt; font-weight: bold; text-transform: uppercase; width: 120px;">Waktu</th>
                            <th style="padding: 8px; border-bottom: 1.5px solid #333; font-size: 8.5pt; font-weight: bold; text-transform: uppercase; width: 90px;">No Tiket</th>
                            <th style="padding: 8px; border-bottom: 1.5px solid #333; font-size: 8.5pt; font-weight: bold; text-transform: uppercase; width: 120px;">Perangkat</th>
                            <th style="padding: 8px; border-bottom: 1.5px solid #333; font-size: 8.5pt; font-weight: bold; text-transform: uppercase;">Aktivitas Log</th>
                            <th style="padding: 8px; border-bottom: 1.5px solid #333; font-size: 8.5pt; font-weight: bold; text-transform: uppercase; text-align: right; width: 110px;">Status Akhir</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logsRows}
                    </tbody>
                </table>
            </div>

            <div style="margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 8pt; color: #777;">
                <div>Dokumen ini dihasilkan secara otomatis oleh Planet Store Boyolali Service System.</div>
                <div>Halaman 1 dari 1</div>
            </div>
        `;
    }

    // --- OVERVIEW DASHBOARD LOGIC ---
    function renderOverviewDashboard() {
        const tickets = getTickets();
        const parts = getSpareparts();
        const mutations = getMutations();
        const techs = getTechnicians();
        const todayStr = new Date().toISOString().split('T')[0];

        // === 1. Profit Hari Ini ===
        let todayIncome = 0, todayExpense = 0, todayInCount = 0, todayOutCount = 0;
        mutations.forEach(m => {
            const mDate = m.date.split('T')[0];
            if (mDate === todayStr) {
                if (m.type === 'MASUK') { todayIncome += m.amount; todayInCount++; }
                else { todayExpense += m.amount; todayOutCount++; }
            }
        });
        document.getElementById('ov-today-income').textContent = `Rp ${todayIncome.toLocaleString('id-ID')}`;
        document.getElementById('ov-today-expense').textContent = `Rp ${todayExpense.toLocaleString('id-ID')}`;
        const todayProfit = todayIncome - todayExpense;
        const profitEl = document.getElementById('ov-today-profit');
        profitEl.textContent = `Rp ${todayProfit.toLocaleString('id-ID')}`;
        document.getElementById('ov-today-income-count').textContent = `${todayInCount} transaksi masuk`;
        document.getElementById('ov-today-expense-count').textContent = `${todayOutCount} transaksi keluar`;

        // === 2. Success Rate ===
        const completed = tickets.filter(t => t.status === 'SELESAI' || t.status === 'DIAMBIL').length;
        const canceled = tickets.filter(t => t.status === 'DIBATALKAN').length;
        const successRate = (completed + canceled) > 0 ? Math.round((completed / (completed + canceled)) * 100) : 100;
        document.getElementById('ov-success-rate').textContent = `${successRate}%`;

        // === 3. Net Revenue ===
        let totalRevenue = 0;
        let totalPartsCost = 0;
        tickets.filter(t => t.status === 'SELESAI' || t.status === 'DIAMBIL').forEach(t => {
            const rev = t.final_cost || t.estimated_cost || 0;
            totalRevenue += rev;
            t.parts.forEach(tp => {
                const pInfo = parts.find(p => p.id === tp.id);
                if (pInfo) { totalPartsCost += (pInfo.price_buy * tp.quantity); }
            });
        });
        const netRevenue = totalRevenue - totalPartsCost;
        document.getElementById('ov-net-revenue').textContent = `Rp ${netRevenue.toLocaleString('id-ID')}`;

        // === 4. Top Technician ===
        let topTech = null;
        if (techs.length > 0) {
            topTech = techs.reduce((prev, current) => {
                if (current.rating > prev.rating) return current;
                if (current.rating === prev.rating) {
                    return (current.active_jobs || 0) < (prev.active_jobs || 0) ? current : prev;
                }
                return prev;
            }, techs[0]);
        }
        document.getElementById('ov-top-tech').textContent = topTech ? `${topTech.name} (★ ${topTech.rating.toFixed(1)})` : '-';

        // === 5. Cash Utilization ===
        let sumIn = 0, sumOut = 0;
        mutations.forEach(m => {
            if (m.type === 'MASUK') sumIn += m.amount;
            else sumOut += m.amount;
        });
        const cashUtilization = sumIn > 0 ? Math.round((sumOut / sumIn) * 100) : 0;
        document.getElementById('ov-cash-utilization').textContent = `${cashUtilization}%`;

        // === 6. Tiket Overdue ===
        const now = new Date();
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const activeStatuses = ['DITERIMA', 'DIAGNOSA', 'MENUNGGU_ACC', 'MENUNGGU_PART', 'PROSES', 'QC_TESTING'];
        const overdueTickets = tickets.filter(t => {
            if (!activeStatuses.includes(t.status)) return false;
            if (!t.estimated_date) return false;
            const estDate = new Date(t.estimated_date + 'T23:59:59');
            return nowDateOnly > estDate;
        });
        const overdueCount = overdueTickets.length;
        document.getElementById('ov-overdue-count').textContent = overdueCount;
        
        // Color the overdue card based on count
        const overdueCard = document.getElementById('ov-overdue-card');
        if (overdueCard) {
            if (overdueCount === 0) {
                overdueCard.style.borderLeft = '4px solid var(--status-selesai)';
            } else if (overdueCount <= 2) {
                overdueCard.style.borderLeft = '4px solid var(--status-menunggu-acc)';
            } else {
                overdueCard.style.borderLeft = '4px solid var(--status-dibatalkan)';
            }
        }

        // Render overdue list
        const overdueSection = document.getElementById('ov-overdue-section');
        const overdueList = document.getElementById('ov-overdue-list');
        if (overdueSection && overdueList) {
            if (overdueCount > 0) {
                overdueSection.style.display = 'block';
                overdueList.innerHTML = '';
                overdueTickets.forEach(t => {
                    const estDate = new Date(t.estimated_date);
                    const diffDays = Math.ceil((nowDateOnly - estDate) / (1000 * 60 * 60 * 24));
                    let badgeClass = 'overdue-yellow';
                    let badgeLabel = `${diffDays} hari lewat`;
                    if (diffDays >= 3) badgeClass = 'overdue-red';
                    else if (diffDays <= 1) badgeClass = 'overdue-yellow';
                    
                    const itemDiv = document.createElement('div');
                    itemDiv.className = 'overdue-item';
                    itemDiv.innerHTML = `
                        <div>
                            <div style="font-weight:700; color:var(--accent-orange); font-size:0.88rem;">${t.code}</div>
                            <div style="font-size:0.8rem; color:var(--text-body);">${t.customer_name} — ${t.model}</div>
                            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Teknisi: ${t.technician} | Prioritas: ${t.priority}</div>
                        </div>
                        <div style="text-align:right;">
                            <span class="overdue-badge ${badgeClass}">${badgeLabel}</span>
                            <div style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">Estimasi: ${t.estimated_date}</div>
                        </div>
                    `;
                    // Click to detail
                    itemDiv.style.cursor = 'pointer';
                    itemDiv.addEventListener('click', () => {
                        openDetailModal(t.id);
                        document.getElementById('modal-detail').classList.add('active');
                    });
                    overdueList.appendChild(itemDiv);
                });
            } else {
                overdueSection.style.display = 'none';
            }
        }

        // === 7. Average Service Time ===
        const completedTickets = tickets.filter(t => (t.status === 'SELESAI' || t.status === 'DIAMBIL') && t.date_completed && t.date_entered);
        let totalServiceTimeMs = 0;
        completedTickets.forEach(t => {
            const entered = new Date(t.date_entered);
            const completed = new Date(t.date_completed);
            totalServiceTimeMs += (completed - entered);
        });
        const avgTimeEl = document.getElementById('ov-avg-service-time');
        if (completedTickets.length > 0) {
            const avgHours = totalServiceTimeMs / (1000 * 60 * 60);
            if (avgHours < 24) {
                avgTimeEl.textContent = `${Math.round(avgHours)} jam`;
            } else {
                const avgDays = avgHours / 24;
                avgTimeEl.textContent = `${avgDays.toFixed(1)} hari`;
            }
        } else {
            avgTimeEl.textContent = '-';
        }

        // === 8. Payment Breakdown (Donut-like Legend UI) ===
        const breakdownContainer = document.getElementById('ov-payment-breakdown');
        if (breakdownContainer) {
            const payments = mutations.filter(m => m.type === 'MASUK');
            const totalPayAmount = payments.reduce((sum, m) => sum + m.amount, 0);
            const methods = {};
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
            
            Object.keys(methods).forEach((method, idx) => {
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

        // === 9. Repeat Customers ===
        const repeatContainer = document.getElementById('ov-repeat-customers');
        if (repeatContainer) {
            const customerCounts = {};
            const customerPhones = {};
            tickets.forEach(t => {
                if (t.customer_name && t.customer_phone) {
                    const normName = t.customer_name.trim();
                    customerCounts[normName] = (customerCounts[normName] || 0) + 1;
                    customerPhones[normName] = t.customer_phone;
                }
            });

            const repeatCustomers = Object.keys(customerCounts)
                .filter(name => customerCounts[name] > 1)
                .map(name => ({ name, count: customerCounts[name], phone: customerPhones[name] }))
                .sort((a, b) => b.count - a.count);

            repeatContainer.innerHTML = '';
            if (repeatCustomers.length === 0) {
                repeatContainer.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:10px 0;">Belum ada pelanggan repeat order</div>`;
            } else {
                repeatCustomers.slice(0, 3).forEach(c => {
                    const item = document.createElement('div');
                    item.className = 'repeat-cust-item';
                    item.innerHTML = `
                        <div>
                            <div class="repeat-cust-name">${c.name}</div>
                            <div class="repeat-cust-phone">${c.phone}</div>
                        </div>
                        <span class="repeat-cust-count">${c.count}x Servis</span>
                    `;
                    repeatContainer.appendChild(item);
                });
            }
        }

        // === 10. Technician Performance Comparison ===
        const techPerfContainer = document.getElementById('ov-tech-performance');
        if (techPerfContainer) {
            techPerfContainer.innerHTML = '';
            
            // Calculate details per technician
            const techStats = techs.map(tech => {
                const techTickets = tickets.filter(t => t.technician === tech.name);
                const active = techTickets.filter(t => t.status !== 'DIAMBIL' && t.status !== 'DIBATALKAN').length;
                const completed = techTickets.filter(t => t.status === 'SELESAI' || t.status === 'DIAMBIL').length;
                const total = techTickets.length;
                
                return {
                    ...tech,
                    active,
                    completed,
                    total
                };
            });

            // Find maximum jobs to normalize bar widths
            const maxJobs = Math.max(1, ...techStats.map(t => t.total));

            techStats.forEach(ts => {
                const activePct = (ts.active / maxJobs) * 100;
                const completedPct = (ts.completed / maxJobs) * 100;
                
                const row = document.createElement('div');
                row.className = 'tech-perf-row';
                row.innerHTML = `
                    <img src="${ts.photo}" class="tech-perf-avatar" alt="${ts.name}">
                    <div class="tech-perf-info">
                        <div class="tech-perf-name">${ts.name}</div>
                        <div class="tech-perf-specialty">${ts.specialty}</div>
                    </div>
                    <div class="tech-perf-bars">
                        <div class="tech-perf-bar-row">
                            <span class="tech-perf-bar-label">Aktif</span>
                            <div class="tech-perf-bar-track">
                                <div class="tech-perf-bar-fill" style="width:${activePct}%; background:var(--accent-orange);"></div>
                            </div>
                            <span class="tech-perf-bar-value">${ts.active}</span>
                        </div>
                        <div class="tech-perf-bar-row">
                            <span class="tech-perf-bar-label">Selesai</span>
                            <div class="tech-perf-bar-track">
                                <div class="tech-perf-bar-fill" style="width:${completedPct}%; background:var(--status-selesai);"></div>
                            </div>
                            <span class="tech-perf-bar-value">${ts.completed}</span>
                        </div>
                    </div>
                    <div class="tech-perf-stats">
                        <div class="tech-perf-stat" style="margin-right:16px;">
                            <div class="tech-perf-stat-value">★ ${ts.rating.toFixed(1)}</div>
                            <div class="tech-perf-stat-label">Rating</div>
                        </div>
                        <div class="tech-perf-stat">
                            <div class="tech-perf-stat-value">${ts.total}</div>
                            <div class="tech-perf-stat-label">Total Tiket</div>
                        </div>
                    </div>
                `;
                techPerfContainer.appendChild(row);
            });
        }

        // === 11. Draw SVG Chart ===
        renderOverviewChart(mutations);
    }

    function renderOverviewChart(mutations) {
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
            let inVal = 0;
            let outVal = 0;
            mutations.forEach(m => {
                const mDate = m.date.split('T')[0];
                if (mDate === dateStr) {
                    if (m.type === 'MASUK') inVal += m.amount;
                    else outVal += m.amount;
                }
            });
            const dObj = new Date(dateStr);
            const label = dObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            return { date: dateStr, label, inVal, outVal, net: inVal - outVal };
        });

        const minVal = Math.min(0, ...dailyData.map(d => d.net));
        const maxVal = Math.max(100000, ...dailyData.map(d => Math.max(d.inVal, d.outVal)));
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
            const isNegative = value < 0;
            const absValue = Math.abs(value);
            let formatted = '';
            if (absValue >= 1000000) {
                formatted = (absValue / 1000000).toFixed(2).replace(/\.00$/, '').replace(/\.(\d)0$/, '.$1').replace('.', ',') + ' Jt';
            } else if (absValue >= 1000) {
                formatted = (absValue / 1000).toFixed(0) + ' Rb';
            } else {
                formatted = absValue.toString();
            }
            return isNegative ? `-Rp ${formatted}` : `Rp ${formatted}`;
        };

        let gridHTML = '';
        const yTicks = 4;
        for (let i = 0; i <= yTicks; i++) {
            const val = minVal + (range / yTicks) * i;
            const y = getY(val);
            gridHTML += `<line class="chart-grid" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />`;
            gridHTML += `<text class="chart-axis-text" x="${padding.left - 10}" y="${y + 4}" text-anchor="end">${formatRupiahShort(val)}</text>`;
        }

        // Add a helper baseline dashed zero line if we have negative values
        if (minVal < 0) {
            const yZero = getY(0);
            gridHTML += `<line x1="${padding.left}" y1="${yZero}" x2="${width - padding.right}" y2="${yZero}" stroke="#94A3B8" stroke-width="1" stroke-dasharray="4 4" />`;
        }

        let linePoints = [];

        dailyData.forEach((d, idx) => {
            const cx = getX(idx);
            gridHTML += `<text class="chart-axis-text" x="${cx}" y="${height - padding.bottom + 20}" text-anchor="middle">${d.label}</text>`;
            linePoints.push(`${cx},${getY(d.inVal - d.outVal)}`);
        });

        const lineHTML = `<path class="chart-line" d="M ${linePoints.join(' L ')}" fill="none" filter="url(#chart-glow)" />`;

        let dotsHTML = '';
        dailyData.forEach((d, idx) => {
            const cx = getX(idx);
            const cy = getY(d.inVal - d.outVal);
            dotsHTML += `<circle class="chart-dot" cx="${cx}" cy="${cy}" r="5" data-title="${d.label}" data-desc="Keuntungan Bersih: Rp ${(d.inVal - d.outVal).toLocaleString('id-ID')}" />`;
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

    // Render Financial Mutations (Tab 4)
    function renderMutations() {
        const mutations = getMutations();
        const tbody = document.getElementById('mutations-table-body');
        const totalIn = document.getElementById('fin-total-in');
        const totalOut = document.getElementById('fin-total-out');
        const netBal = document.getElementById('fin-net-balance');
        
        if (!tbody) return;
        
        tbody.innerHTML = '';
        let sumIn = 0;
        let sumOut = 0;

        mutations.forEach(m => {
            if (m.type === 'MASUK') {
                sumIn += m.amount;
            } else {
                sumOut += m.amount;
            }

            const tr = document.createElement('tr');
            const dateObj = new Date(m.date);
            const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            
            tr.innerHTML = `
                <td style="color:var(--text-secondary); font-size:0.8rem;">${formattedDate}</td>
                <td style="font-weight:600; color:var(--text-title);">${m.ref_id}</td>
                <td><span class="badge" style="background-color:${m.type === 'MASUK' ? 'rgba(16,185,129,0.08)' : 'rgba(220,38,38,0.08)'}; color:${m.type === 'MASUK' ? 'var(--status-diambil)' : 'var(--status-dibatalkan)'}">${m.type}</span></td>
                <td><span style="font-weight:500;">${m.category}</span></td>
                <td style="font-weight:700; color:${m.type === 'MASUK' ? 'var(--status-diambil)' : 'var(--status-dibatalkan)'}">Rp ${m.amount.toLocaleString('id-ID')}</td>
                <td><span style="font-size:0.8rem; background:rgba(255,255,255,0.02); padding:4px 8px; border-radius:6px; border:1px solid var(--border-soft);">${m.pay_method}</span></td>
                <td style="font-size:0.85rem; color:var(--text-secondary); max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m.note}</td>
                <td style="font-size:0.8rem; color:var(--text-muted);">@${m.logged_by}</td>
            `;
            tbody.appendChild(tr);
        });

        // Update summaries
        totalIn.textContent = `Rp ${sumIn.toLocaleString('id-ID')}`;
        totalOut.textContent = `Rp ${sumOut.toLocaleString('id-ID')}`;
        const net = sumIn - sumOut;
        netBal.textContent = `Rp ${net.toLocaleString('id-ID')}`;
        netBal.style.color = net >= 0 ? 'var(--status-selesai)' : 'var(--status-dibatalkan)';
    }

    // --- WHATSAPP SIMULATION (TOASTS) ---

    function showWAToast(phone, customerName, ticketCode, status, trackingToken) {
        const trackingUrl = `${window.location.origin}/d:/website/IPHONE/DS_SERVICE/DEMO/tracking.html?token=${trackingToken}`;
        
        let message = '';
        if (status === 'DITERIMA') {
            message = `Halo Kak ${customerName},\nUnit device Anda sudah diterima di Planet Store Boyolali dengan nomor tiket *${ticketCode}*. Progres servis bisa dipantau real-time di link berikut:\n${trackingUrl}`;
        } else if (status === 'MENUNGGU_ACC') {
            message = `Halo Kak ${customerName},\nDiagnosa unit *${ticketCode}* selesai. Estimasi biaya perbaikan adalah *Rp ${arguments[5]?.toLocaleString('id-ID') || 'x'}*. Setuju? Balas *ACC* atau *TOLAK*. Pantau: ${trackingUrl}`;
        } else if (status === 'PROSES') {
            message = `Halo Kak ${customerName},\nPerbaikan unit *${ticketCode}* mulai dikerjakan oleh teknisi. Pantau progres: ${trackingUrl}`;
        } else if (status === 'SELESAI') {
            message = `Halo Kak ${customerName},\nKabar baik! Unit *${ticketCode}* Anda sudah selesai diperbaiki dan telah lolos QC testing. Unit siap diambil. Pantau: ${trackingUrl}`;
        } else {
            message = `Halo Kak ${customerName},\nUpdate status terbaru unit *${ticketCode}* Anda saat ini adalah: *${status.replace('_', ' ')}*. Link tracking: ${trackingUrl}`;
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-wa-icon">
                <svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.59 2.028 14.108.99 11.487.99c-5.43 0-9.852 4.37-9.856 9.797-.001 1.77.472 3.497 1.372 5.044L1.968 22.1l6.23-1.616c-1.614.937-2.923 1.353-1.55 2.654z"/></svg>
            </div>
            <div class="toast-content">
                <div class="toast-header">
                    <span class="toast-sender">WhatsApp Simulator (ke: ${phone})</span>
                    <span class="toast-time">Sekarang</span>
                </div>
                <div class="toast-body">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;

        // Close toast listener
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        toastContainer.appendChild(toast);

        // Auto remove toast after 10s
        setTimeout(() => {
            if (toast) toast.remove();
        }, 10000);
    }

    // --- TICKET DETAILED MODAL LOGIC ---

    function openDetailModal(ticketId) {
        selectedTicketId = ticketId;
        const tickets = getTickets();
        const t = tickets.find(ticket => ticket.id === ticketId);
        if (!t) return;

        // Reset rating container
        const ratingContainer = document.getElementById('det-rating-container');
        if (ratingContainer) ratingContainer.style.display = 'none';

        // Populate basic info
        document.getElementById('det-ticket-code').textContent = t.code;
        document.getElementById('det-cust-name').textContent = t.customer_name;
        document.getElementById('det-cust-phone').textContent = t.customer_phone;
        document.getElementById('det-model').textContent = t.model;
        document.getElementById('det-imei').textContent = t.imei || '-';
        document.getElementById('det-complaint').textContent = t.complaint;
        document.getElementById('det-condition').textContent = t.condition;
        document.getElementById('det-priority').textContent = t.priority;
        document.getElementById('det-technician').textContent = t.technician;
        document.getElementById('det-est-cost').textContent = t.estimated_cost ? `Rp ${t.estimated_cost.toLocaleString('id-ID')}` : '-';
        document.getElementById('det-final-cost').textContent = t.final_cost ? `Rp ${t.final_cost.toLocaleString('id-ID')}` : '-';
        
        // Populate Security & Photos info
        document.getElementById('det-lock-type').textContent = t.device_lock_type || 'NONE';
        document.getElementById('det-lock-code').textContent = t.device_lock_code || '-';

        const setPhotoSrc = (id, src) => {
            const img = document.getElementById(id);
            if (img) {
                if (src) {
                    img.src = src;
                    img.style.display = 'block';
                    img.parentElement.style.display = 'block';
                } else {
                    img.src = '';
                    img.style.display = 'none';
                    img.parentElement.style.display = 'none';
                }
            }
        };

        setPhotoSrc('det-photo-front', t.photo_front);
        setPhotoSrc('det-photo-back', t.photo_back);
        setPhotoSrc('det-photo-side', t.photo_side);
        setPhotoSrc('det-photo-accessories', t.photo_accessories);
        setPhotoSrc('det-photo-customer', t.photo_customer);

        // Select status drop down
        const statusSelect = document.getElementById('det-status-update');
        statusSelect.value = t.status;

        // Render Allocated Parts
        const partsListContainer = document.getElementById('det-allocated-parts');
        partsListContainer.innerHTML = '';
        if (t.parts.length === 0) {
            partsListContainer.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem;">Belum ada sparepart teralokasi</span>`;
        } else {
            t.parts.forEach(p => {
                const partDiv = document.createElement('div');
                partDiv.style = 'background:rgba(255,255,255,0.03); border: 1px solid var(--border-color); padding: 8px 12px; border-radius:6px; margin-bottom:6px; display:flex; justify-content:space-between; font-size:0.85rem;';
                partDiv.innerHTML = `
                    <span>[part] ${p.name} (x${p.quantity})</span>
                    <span style="font-weight:600; color:var(--accent-orange);">Rp ${(p.price * p.quantity).toLocaleString('id-ID')}</span>
                `;
                partsListContainer.appendChild(partDiv);
            });
        }

        // Render Timeline Logs
        const timelineContainer = document.getElementById('det-timeline');
        timelineContainer.innerHTML = '';
        t.logs.forEach((log, index) => {
            const item = document.createElement('li');
            item.className = `timeline-item completed`;
            const logTime = new Date(log.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
            item.innerHTML = `
                <div class="timeline-time">${logTime}</div>
                <div class="timeline-title">${log.next_status.replace('_', ' ')}</div>
                <div class="timeline-desc">${log.note} <span style="font-size:0.75rem; color:var(--text-muted)">— oleh ${log.technician}</span></div>
            `;
            timelineContainer.appendChild(item);
        });

        // Setup drop down for spare parts compatible with this specific device model
        const sparepartSelect = document.getElementById('det-part-allocate');
        sparepartSelect.innerHTML = `<option value="">-- Pilih Sparepart --</option>`;
        const parts = getSpareparts();
        const compatibles = parts.filter(p => p.compatible.includes(t.model) || p.compatible.some(comp => t.model.toLowerCase().includes(comp.toLowerCase())));
        compatibles.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (Stok: ${p.stock})`;
            if (p.stock <= 0) opt.disabled = true;
            sparepartSelect.appendChild(opt);
        });

        // Setup Tracking Link Navigation button
        const btnOpenTracking = document.getElementById('btn-open-tracking');
        if (btnOpenTracking) {
            btnOpenTracking.onclick = () => {
                window.open(`tracking.html?token=${t.token}`, '_blank');
            };
        }

        // Setup Copy Link
        const btnCopyTracking = document.getElementById('btn-copy-tracking');
        if (btnCopyTracking) {
            btnCopyTracking.onclick = () => {
                const url = `${window.location.origin}/d:/website/IPHONE/DS_SERVICE/DEMO/tracking.html?token=${t.token}`;
                navigator.clipboard.writeText(url).then(() => {
                    alert('Link tracking berhasil disalin ke clipboard!');
                });
            };
        }

        // Render receipt for print
        renderReceiptContent(t);

        // Open modal
        detailModal.classList.add('active');
    }

    // Render receipt inside HTML template for Print Window
    function renderReceiptContent(t) {
        const printArea = document.getElementById('thermal-receipt');
        const printDate = new Date(t.date_entered).toLocaleString('id-ID');
        
        let partsRows = '';
        t.parts.forEach(p => {
            partsRows += `
                <div class="receipt-row">
                    <span>- ${p.name} (x${p.quantity})</span>
                    <span>Rp ${(p.price * p.quantity).toLocaleString('id-ID')}</span>
                </div>
            `;
        });

        const totalCost = t.estimated_cost || 0;

        printArea.innerHTML = `
            <div class="receipt-header">
                <div class="receipt-title">PLANET STORE BOYOLALI</div>
                <div class="receipt-subtitle">Pusatnya HP Murah & Bergaransi</div>
                <div class="receipt-subtitle" style="font-size: 8pt;">Jalan Tentara Pelajar No.04, Kiringan, Boyolali</div>
                <div class="receipt-subtitle" style="font-size: 8pt;">WA: 0895-2299-4849 | IG: @planetstoreid</div>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-row">
                <span>No Tiket:</span>
                <span class="receipt-col-label">${t.code}</span>
            </div>
            <div class="receipt-row">
                <span>Tanggal:</span>
                <span>${printDate}</span>
            </div>
            <div class="receipt-row">
                <span>Customer:</span>
                <span>${t.customer_name}</span>
            </div>
            <div class="receipt-row">
                <span>No HP:</span>
                <span>${t.customer_phone}</span>
            </div>
            <div class="receipt-row">
                <span>Teknisi:</span>
                <span>${t.technician}</span>
            </div>
            <div class="receipt-row">
                <span>Prioritas:</span>
                <span class="receipt-col-label">${t.priority}</span>
            </div>

            <div class="receipt-divider"></div>
            
            <div style="font-weight: bold; margin-bottom: 4px;">Detail Perangkat & Masalah:</div>
            <div>Device: ${t.model}</div>
            <div>Keluhan: "${t.complaint}"</div>
            
            <div class="receipt-divider"></div>
            
            <div style="font-weight: bold; margin-bottom: 4px;">Rincian Servis:</div>
            ${partsRows || '<div>(Belum ada penggantian sparepart)</div>'}
            <div class="receipt-row" style="margin-top: 4px;">
                <span>Jasa Servis:</span>
                <span>Rp ${(t.estimated_cost - t.parts.reduce((a,c) => a + (c.price * c.quantity), 0) || 0).toLocaleString('id-ID')}</span>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-row" style="font-size: 12pt; font-weight: bold;">
                <span>TOTAL:</span>
                <span>Rp ${totalCost.toLocaleString('id-ID')}</span>
            </div>
            <div class="receipt-row">
                <span>Status Pembayaran:</span>
                <span>${t.status === 'DIAMBIL' ? 'LUNAS' : 'BELUM BAYAR'}</span>
            </div>
            
            <div class="receipt-divider"></div>
            
            <div class="receipt-footer">
                <div>Syarat & Ketentuan Garansi:</div>
                <div style="font-size: 8pt; margin-top: 4px;">Garansi servis LCD/Komponen selama 7 hari sejak pengambilan. Segel tidak boleh rusak. Harap membawa nota ini saat mengambil unit.</div>
                
                <div class="receipt-qr">
                   [ SCAN QR TRACK ]<br>
                   ${t.code}
                </div>
                <div>Terima kasih atas kepercayaan Anda!</div>
            </div>
        `;
    }

    // --- FORM ACTIONS ---


    // Lock Type Interactive Controls (PIN, Pattern Grid, Password)
    const createLockType = document.getElementById('create-lock-type');
    const createLockCode = document.getElementById('create-lock-code');
    const patternDrawContainer = document.getElementById('pattern-draw-container');
    const patternNodes = document.querySelectorAll('#pattern-lock-grid .pattern-node');
    const btnClearPattern = document.getElementById('btn-clear-pattern');
    let drawnPattern = [];

    if (createLockType) {
        createLockType.addEventListener('change', () => {
            const val = createLockType.value;
            if (val === 'PATTERN') {
                patternDrawContainer.style.display = 'block';
                createLockCode.readOnly = true;
                createLockCode.placeholder = 'Pola terpilih (digambar di bawah)';
            } else {
                patternDrawContainer.style.display = 'none';
                createLockCode.readOnly = false;
                createLockCode.placeholder = val === 'PIN' ? 'Masukkan PIN angka' : (val === 'PASSWORD' ? 'Masukkan kata sandi' : 'Tanpa kunci');
                createLockCode.value = '';
                resetPatternSelection();
            }
        });
    }

    if (patternNodes) {
        patternNodes.forEach(node => {
            node.addEventListener('click', () => {
                const num = node.getAttribute('data-node');
                if (!drawnPattern.includes(num)) {
                    drawnPattern.push(num);
                    node.classList.add('selected');
                    createLockCode.value = drawnPattern.join(' -> ');
                }
            });
        });
    }

    if (btnClearPattern) {
        btnClearPattern.addEventListener('click', () => {
            resetPatternSelection();
        });
    }

    function resetPatternSelection() {
        drawnPattern = [];
        if (createLockCode && createLockType && createLockType.value === 'PATTERN') {
            createLockCode.value = '';
        }
        patternNodes.forEach(n => n.classList.remove('selected'));
    }

    // Image Upload Previews for Create Ticket Form
    const setupImagePreview = (inputId, previewContainerId) => {
        const input = document.getElementById(inputId);
        const previewContainer = document.getElementById(previewContainerId);
        if (input && previewContainer) {
            input.addEventListener('change', () => {
                const file = input.files[0];
                const img = previewContainer.querySelector('img');
                if (file && img) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        img.src = e.target.result;
                        previewContainer.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else {
                    if (img) img.src = '';
                    previewContainer.style.display = 'none';
                }
            });
        }
    };

    setupImagePreview('create-photo-front', 'preview-photo-front');
    setupImagePreview('create-photo-back', 'preview-photo-back');
    setupImagePreview('create-photo-side', 'preview-photo-side');
    setupImagePreview('create-photo-accessories', 'preview-photo-accessories');
    setupImagePreview('create-photo-customer', 'preview-photo-customer');

    function resetImagePreviews() {
        const previewIds = ['preview-photo-front', 'preview-photo-back', 'preview-photo-side', 'preview-photo-accessories', 'preview-photo-customer'];
        previewIds.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                const img = container.querySelector('img');
                if (img) img.src = '';
                container.style.display = 'none';
            }
        });
    }

    // Create New Ticket Submit
    formCreateTicket.addEventListener('submit', (e) => {
        e.preventDefault();

        const ticketData = {
            customer_name: document.getElementById('cust-name').value,
            customer_phone: document.getElementById('cust-phone').value,
            model: document.getElementById('device-model').value,
            imei: document.getElementById('device-imei').value,
            complaint: document.getElementById('complaint').value,
            condition: document.getElementById('condition').value,
            technician: document.getElementById('technician').value,
            priority: document.getElementById('priority').value,
            estimated_date: document.getElementById('est-date').value,
            estimated_cost: document.getElementById('est-cost').value.replace(/\D/g, ''),
            device_lock_type: createLockType ? createLockType.value : 'NONE',
            device_lock_code: createLockCode ? createLockCode.value : ''
        };

        const fileFront = document.getElementById('create-photo-front').files[0];
        const fileBack = document.getElementById('create-photo-back').files[0];
        const fileSide = document.getElementById('create-photo-side').files[0];
        const fileAcc = document.getElementById('create-photo-accessories').files[0];
        const fileCust = document.getElementById('create-photo-customer').files[0];

        const readAsDataURL = (file) => {
            return new Promise((resolve) => {
                if (!file) return resolve('');
                const reader = new FileReader();
                reader.onload = (evt) => resolve(evt.target.result);
                reader.readAsDataURL(file);
            });
        };

        Promise.all([
            readAsDataURL(fileFront),
            readAsDataURL(fileBack),
            readAsDataURL(fileSide),
            readAsDataURL(fileAcc),
            readAsDataURL(fileCust)
        ]).then(([photoFront, photoBack, photoSide, photoAccessories, photoCustomer]) => {
            ticketData.photo_front = photoFront;
            ticketData.photo_back = photoBack;
            ticketData.photo_side = photoSide;
            ticketData.photo_accessories = photoAccessories;
            ticketData.photo_customer = photoCustomer;

            const newTicket = addTicket(ticketData);
            
            // Hide Modal
            createModal.classList.remove('active');
            formCreateTicket.reset();
            resetPatternSelection();
            resetImagePreviews();

            // Refresh Data
            renderKPIs();
            renderTicketTable();
            renderTechnicians(); // Refresh tech job count

            // WA Notification Toast
            showWAToast(newTicket.customer_phone, newTicket.customer_name, newTicket.code, 'DITERIMA', newTicket.token);
        });
    });

    formCreateTech.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('tech-name').value;
        const phone = document.getElementById('tech-phone').value;
        const specialty = document.getElementById('tech-specialty').value;
        const password = document.getElementById('tech-password').value;
        const photoFile = document.getElementById('tech-photo').files[0];

        const saveTech = (photoData) => {
            addTechnician({ name, phone, specialty, photo: photoData, password });
            createTechModal.classList.remove('active');
            formCreateTech.reset();
            populateTechnicianDropdown();
            renderTechnicians();
        };

        if (photoFile) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                saveTech(evt.target.result);
            };
            reader.readAsDataURL(photoFile);
        } else {
            saveTech(undefined);
        }
    });

    // Create New Mutation Submit (Tab 4)
    formCreateMutation.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('mut-type').value;
        const pay_method = document.getElementById('mut-pay-method').value;
        const category = document.getElementById('mut-category').value;
        const amount = document.getElementById('mut-amount').value.replace(/\D/g, '');
        const note = document.getElementById('mut-note').value;

        addMutation({
            ref_id: 'MANUAL',
            type,
            pay_method,
            category,
            amount,
            note
        });

        createMutationModal.classList.remove('active');
        formCreateMutation.reset();

        renderMutations();
    });

    // Update Status Submit
    document.getElementById('btn-save-status').addEventListener('click', () => {
        if (!selectedTicketId) return;

        const nextStatus = document.getElementById('det-status-update').value;
        const note = document.getElementById('det-status-note').value || `Merubah status ke ${nextStatus.replace('_', ' ')}`;
        
        const tickets = getTickets();
        const t = tickets.find(ticket => ticket.id === selectedTicketId);
        
        if (t && t.status !== nextStatus) {
            // Read rating if status is DIAMBIL
            let ratingVal = null;
            if (nextStatus === 'DIAMBIL') {
                ratingVal = parseInt(document.getElementById('det-service-rating').value, 10) || 5;
            }

            // Save status update
            updateTicketStatus(selectedTicketId, nextStatus, note, t.technician);
            
            // Save rating if provided
            if (ratingVal !== null) {
                const updatedTickets = getTickets();
                const ut = updatedTickets.find(ticket => ticket.id === selectedTicketId);
                if (ut) {
                    ut.rating = ratingVal;
                    saveTickets(updatedTickets);
                    
                    // Recalculate technician rating
                    recalculateTechnicianRating(ut.technician);
                }
            }

            // Refresh
            openDetailModal(selectedTicketId);
            renderKPIs();
            renderTicketTable();
            renderTechnicians(); // Refresh jobs count & ratings
            renderMutations(); // Auto ledger updates if complete

            // WhatsApp Notification
            showWAToast(t.customer_phone, t.customer_name, t.code, nextStatus, t.token, t.estimated_cost);
            
            // Reset input note
            document.getElementById('det-status-note').value = '';
        }
    });

    // Helper to recalculate technician rating dynamically
    function recalculateTechnicianRating(techName) {
        const tickets = getTickets();
        const techTickets = tickets.filter(t => t.technician === techName && t.rating);
        if (techTickets.length === 0) return;

        const sumRating = techTickets.reduce((sum, t) => sum + t.rating, 0);
        const avgRating = parseFloat((sumRating / techTickets.length).toFixed(1));

        const techs = getTechnicians();
        const techObj = techs.find(tc => tc.name === techName);
        if (techObj) {
            techObj.rating = avgRating;
            saveTechnicians(techs);
        }
    }

    // Toggle rating field in status update
    const detStatusUpdateSelect = document.getElementById('det-status-update');
    if (detStatusUpdateSelect) {
        detStatusUpdateSelect.addEventListener('change', () => {
            const ratingContainer = document.getElementById('det-rating-container');
            if (ratingContainer) {
                ratingContainer.style.display = detStatusUpdateSelect.value === 'DIAMBIL' ? 'block' : 'none';
            }
        });
    }

    // Allocate Part Submit
    document.getElementById('btn-allocate-part').addEventListener('click', () => {
        if (!selectedTicketId) return;

        const partId = document.getElementById('det-part-allocate').value;
        const qty = parseInt(document.getElementById('det-part-qty').value) || 1;

        if (!partId) {
            alert('Pilih sparepart terlebih dahulu!');
            return;
        }

        const res = addPartToTicket(selectedTicketId, partId, qty);
        if (res) {
            alert('Sparepart berhasil dialokasikan!');
            
            // Auto record expense mutation for part allocation from warehouse
            const parts = getSpareparts();
            const part = parts.find(p => p.id === partId);
            if (part) {
                const cost = part.price_buy * qty;
                addMutation({
                    ref_id: res.ticket.code,
                    type: 'KELUAR',
                    pay_method: 'TUNAI',
                    category: 'Beli Part',
                    amount: cost,
                    note: `Pengurangan stok sparepart: ${part.name} (x${qty}) untuk perbaikan`
                });
            }

            // Reset quantity to 1
            document.getElementById('det-part-qty').value = 1;
            
            // Refresh
            openDetailModal(selectedTicketId);
            renderKPIs();
            renderTicketTable();
            renderSpareparts();
            renderMutations();
        } else {
            alert('Gagal mengalokasikan sparepart. Cek kecukupan stok!');
        }
    });

    // Trigger Browser Print for Thermal Receipt
    document.getElementById('btn-print-receipt').addEventListener('click', () => {
        document.body.classList.remove('print-tech-log');
        document.body.classList.add('print-receipt');
        window.print();
    });

    // Trigger Browser Print for Technician Log
    const btnPrintTechLog = document.getElementById('btn-print-tech-log');
    if (btnPrintTechLog) {
        btnPrintTechLog.addEventListener('click', () => {
            document.body.classList.remove('print-receipt');
            document.body.classList.add('print-tech-log');
            window.print();
        });
    }

    // --- INTERACTIVE EVENTS ---

    // Search & Filter Listeners
    searchInput.addEventListener('input', renderTicketTable);
    statusFilter.addEventListener('change', renderTicketTable);
    priorityFilter.addEventListener('change', renderTicketTable);

    // Modal Control Open
    btnOpenCreate.addEventListener('click', () => {
        createModal.classList.add('active');
    });

    if (btnOpenCreateTech) {
        btnOpenCreateTech.addEventListener('click', () => {
            createTechModal.classList.add('active');
        });
    }

    if (btnOpenCreateMutation) {
        btnOpenCreateMutation.addEventListener('click', () => {
            createMutationModal.classList.add('active');
        });
    }

    // Modal Control Close
    modalCloses.forEach(close => {
        close.addEventListener('click', () => {
            createModal.classList.remove('active');
            formCreateTicket.reset();
            resetPatternSelection();
            resetImagePreviews();
            detailModal.classList.remove('active');
            if (createTechModal) createTechModal.classList.remove('active');
            if (createMutationModal) createMutationModal.classList.remove('active');
            const techDetailModal = document.getElementById('modal-tech-detail');
            if (techDetailModal) techDetailModal.classList.remove('active');
            
            const editModal = document.getElementById('modal-edit');
            if (editModal) {
                editModal.classList.remove('active');
                const formEditTicket = document.getElementById('form-edit-ticket');
                if (formEditTicket) formEditTicket.reset();
                resetEditPatternSelection();
            }
            
            selectedTicketId = null;
        });
    });

    // Sidebar navigation tabs switching
    const sidebarTabLinks = document.querySelectorAll('.sidebar .nav-item[data-tab]');
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
            if (tabName === 'overview') {
                renderOverviewDashboard();
            }
        });
    });

    // --- INITIAL RENDER ---
    populateTechnicianDropdown();
    renderKPIs();
    renderTicketTable();
    renderSpareparts();
    renderTechnicians();
    renderMutations();
    renderOverviewDashboard();

    // Default tab redirection for technicians
    if (activeUser.role === 'TEKNISI') {
        const ticketTabLink = document.querySelector('.sidebar .nav-item[data-tab="tickets"]');
        if (ticketTabLink) {
            ticketTabLink.click();
        }
    }

    // Populate Technicians Dropdown on Edit Ticket Form
    function populateEditTechnicianDropdown() {
        const editTechDropdown = document.getElementById('edit-technician');
        if (!editTechDropdown) return;
        editTechDropdown.innerHTML = '';
        const techs = getTechnicians();
        techs.forEach(t => {
            if (t.status === 'AKTIF') {
                const opt = document.createElement('option');
                opt.value = t.name;
                opt.textContent = `${t.name} (Spesialis: ${t.specialty})`;
                editTechDropdown.appendChild(opt);
            }
        });
    }

    // Lock Type Interactive Controls for Edit Modal
    const editLockType = document.getElementById('edit-lock-type');
    const editLockCode = document.getElementById('edit-lock-code');
    const editPatternDrawContainer = document.getElementById('pattern-draw-container-edit');
    const editPatternNodes = document.querySelectorAll('#pattern-lock-grid-edit .pattern-node-edit');
    const btnClearPatternEdit = document.getElementById('btn-clear-pattern-edit');
    let editDrawnPattern = [];

    if (editLockType) {
        editLockType.addEventListener('change', () => {
            const val = editLockType.value;
            if (val === 'PATTERN') {
                editPatternDrawContainer.style.display = 'block';
                editLockCode.readOnly = true;
                editLockCode.placeholder = 'Pola terpilih (digambar di bawah)';
            } else {
                editPatternDrawContainer.style.display = 'none';
                editLockCode.readOnly = false;
                editLockCode.placeholder = val === 'PIN' ? 'Masukkan PIN angka' : (val === 'PASSWORD' ? 'Masukkan kata sandi' : 'Tanpa kunci');
                editLockCode.value = '';
                resetEditPatternSelection();
            }
        });
    }

    if (editPatternNodes) {
        editPatternNodes.forEach(node => {
            node.addEventListener('click', () => {
                const num = node.getAttribute('data-node');
                if (!editDrawnPattern.includes(num)) {
                    editDrawnPattern.push(num);
                    node.classList.add('selected');
                    editLockCode.value = editDrawnPattern.join(' -> ');
                }
            });
        });
    }

    if (btnClearPatternEdit) {
        btnClearPatternEdit.addEventListener('click', () => {
            resetEditPatternSelection();
        });
    }

    function resetEditPatternSelection() {
        editDrawnPattern = [];
        if (editLockCode && editLockType && editLockType.value === 'PATTERN') {
            editLockCode.value = '';
        }
        editPatternNodes.forEach(n => n.classList.remove('selected'));
    }

    // Edit Ticket Click Handler
    const btnEditTicket = document.getElementById('btn-edit-ticket');
    if (btnEditTicket) {
        btnEditTicket.addEventListener('click', () => {
            if (!selectedTicketId) return;
            const tickets = getTickets();
            const t = tickets.find(ticket => ticket.id === selectedTicketId);
            if (!t) return;

            // Populate edit form fields
            document.getElementById('edit-ticket-code-header').textContent = t.code;
            document.getElementById('edit-cust-name').value = t.customer_name;
            document.getElementById('edit-cust-phone').value = t.customer_phone;
            document.getElementById('edit-device-model').value = t.model;
            document.getElementById('edit-device-imei').value = t.imei || '';
            document.getElementById('edit-complaint').value = t.complaint;
            document.getElementById('edit-condition').value = t.condition || '';
            
            // Populate technician dropdown first
            populateEditTechnicianDropdown();
            document.getElementById('edit-technician').value = t.technician;
            
            document.getElementById('edit-priority').value = t.priority;
            document.getElementById('edit-est-date').value = t.estimated_date || '';
            document.getElementById('edit-edit-est-cost'); // wait, input ID is edit-est-cost
            document.getElementById('edit-est-cost').value = t.estimated_cost ? t.estimated_cost.toLocaleString('id-ID') : '';
            
            document.getElementById('edit-lock-type').value = t.device_lock_type || 'NONE';
            document.getElementById('edit-lock-code').value = t.device_lock_code || '';

            // Handle lock visual state
            if (t.device_lock_type === 'PATTERN') {
                editPatternDrawContainer.style.display = 'block';
                editLockCode.readOnly = true;
                editDrawnPattern = t.device_lock_code.split(' -> ').filter(Boolean);
                editPatternNodes.forEach(n => {
                    const num = n.getAttribute('data-node');
                    if (editDrawnPattern.includes(num)) {
                        n.classList.add('selected');
                    } else {
                        n.classList.remove('selected');
                    }
                });
            } else {
                editPatternDrawContainer.style.display = 'none';
                editLockCode.readOnly = false;
                resetEditPatternSelection();
            }

            // Close detail modal, open edit modal
            detailModal.classList.remove('active');
            document.getElementById('modal-edit').classList.add('active');
        });
    }

    // Edit Ticket Form Submit Handler
    const formEditTicket = document.getElementById('form-edit-ticket');
    if (formEditTicket) {
        formEditTicket.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!selectedTicketId) return;

            const tickets = getTickets();
            const ticketIndex = tickets.findIndex(ticket => ticket.id === selectedTicketId);
            if (ticketIndex === -1) return;

            const t = tickets[ticketIndex];

            // Capture changes for activity log
            const changes = [];
            const newName = document.getElementById('edit-cust-name').value;
            const newPhone = document.getElementById('edit-cust-phone').value;
            const newModel = document.getElementById('edit-device-model').value;
            const newImei = document.getElementById('edit-device-imei').value;
            const newComplaint = document.getElementById('edit-complaint').value;
            const newCondition = document.getElementById('edit-condition').value;
            const newTech = document.getElementById('edit-technician').value;
            const newPriority = document.getElementById('edit-priority').value;
            const newEstDate = document.getElementById('edit-est-date').value;
            const newEstCost = parseFloat(document.getElementById('edit-est-cost').value.replace(/\D/g, '')) || 0;
            const newLockType = document.getElementById('edit-lock-type').value;
            const newLockCode = document.getElementById('edit-lock-code').value;

            if (t.customer_name !== newName) changes.push(`Nama Pelanggan (${t.customer_name} -> ${newName})`);
            if (t.technician !== newTech) changes.push(`Teknisi (${t.technician} -> ${newTech})`);
            if (t.estimated_cost !== newEstCost) changes.push(`Estimasi Biaya (Rp ${t.estimated_cost?.toLocaleString('id-ID') || 0} -> Rp ${newEstCost.toLocaleString('id-ID')})`);
            if (t.model !== newModel) changes.push(`Model (${t.model} -> ${newModel})`);

            // Update ticket fields
            t.customer_name = newName;
            t.customer_phone = newPhone;
            t.model = newModel;
            t.imei = newImei;
            t.complaint = newComplaint;
            t.condition = newCondition;
            
            // Update technician active job count if re-assigned
            if (t.technician !== newTech) {
                const techs = getTechnicians();
                const oldTechObj = techs.find(tc => tc.name === t.technician);
                const newTechObj = techs.find(tc => tc.name === newTech);
                
                if (oldTechObj) oldTechObj.active_jobs = Math.max(0, (oldTechObj.active_jobs || 1) - 1);
                if (newTechObj) newTechObj.active_jobs = (newTechObj.active_jobs || 0) + 1;
                
                saveTechnicians(techs);
                t.technician = newTech;
            }

            t.priority = newPriority;
            t.estimated_date = newEstDate;
            t.estimated_cost = newEstCost;
            t.device_lock_type = newLockType;
            t.device_lock_code = newLockCode;

            // Push activity log
            const noteStr = changes.length > 0 ? `Mengubah data tiket: ${changes.join(', ')}` : 'Mengubah detail data tiket';
            t.logs.push({
                id: 'log-' + Date.now(),
                prev_status: t.status,
                next_status: t.status,
                note: noteStr,
                technician: activeUser.name,
                timestamp: new Date().toISOString()
            });

            saveTickets(tickets);

            // Hide edit modal, reset, open detail modal
            document.getElementById('modal-edit').classList.remove('active');
            formEditTicket.reset();
            resetEditPatternSelection();
            
            openDetailModal(selectedTicketId);
            renderKPIs();
            renderTicketTable();
            renderTechnicians();
        });
    }

    // Auto money input formatter helper (Indonesian thousand separator)
    function setupMoneyInputFormatter(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('input', () => {
            let cleanVal = input.value.replace(/\D/g, '');
            if (!cleanVal) {
                input.value = '';
                return;
            }
            let formatted = parseInt(cleanVal, 10).toLocaleString('id-ID');
            input.value = formatted;
        });
    }

    setupMoneyInputFormatter('est-cost');
    setupMoneyInputFormatter('edit-est-cost');
    setupMoneyInputFormatter('mut-amount');

    // === EXPORT EXCEL & PRINT PDF FUNCTIONALITY ===
    function getActiveTabName() {
        const activeTabItem = document.querySelector('.sidebar .nav-item.active');
        return activeTabItem ? activeTabItem.getAttribute('data-tab') : 'overview';
    }

    function exportToExcel() {
        const activeTab = getActiveTabName();
        let filename = `PlanetStore_Service_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`;
        
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
        let moduleName = 'DS_SERVICE — Sistem Servis';
        if (activeTab === 'tickets') {
            title = 'Laporan Antrian Servis HP';
        } else if (activeTab === 'spareparts') {
            title = 'Laporan Inventaris Sparepart';
        } else if (activeTab === 'techs') {
            title = 'Laporan Kinerja & Data Teknisi';
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
});

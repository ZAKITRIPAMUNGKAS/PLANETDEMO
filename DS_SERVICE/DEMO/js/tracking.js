/* ==========================================================================
   Planet Store Boyolali — DS_SERVICE Customer Tracking Page Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const trackingSearchInput = document.getElementById('track-search-input');
    const btnTrackSearch = document.getElementById('btn-track-search');
    const resultCard = document.getElementById('track-result-card');
    const notFoundCard = document.getElementById('track-not-found');
    
    // Result Fields
    const resTicketCode = document.getElementById('res-ticket-code');
    const resDeviceModel = document.getElementById('res-device-model');
    const resStatusText = document.getElementById('res-status-text');
    const resEstSelesai = document.getElementById('res-est-selesai');
    const resComplaint = document.getElementById('res-complaint');
    const resTimeline = document.getElementById('res-timeline');
    const resBiayaLabel = document.getElementById('res-biaya-label');
    const resBiayaVal = document.getElementById('res-biaya-val');
    const btnContactWA = document.getElementById('btn-contact-wa');

    // Alur Status Global untuk Visualisasi Timeline
    const STATUS_FLOW = [
        { key: 'DITERIMA', label: 'Diterima', desc: 'Device Anda telah diterima di toko.' },
        { key: 'DIAGNOSA', label: 'Diagnosa', desc: 'Teknisi sedang menganalisa kerusakan.' },
        { key: 'MENUNGGU_ACC', label: 'Menunggu ACC', desc: 'Estimasi biaya dikirim, menunggu persetujuan Anda.' },
        { key: 'MENUNGGU_PART', label: 'Menunggu Part', desc: 'Sparepart sedang dipesan dari distributor.' },
        { key: 'PROSES', label: 'Proses Perbaikan', desc: 'Teknisi sedang melakukan perbaikan unit.' },
        { key: 'QC_TESTING', label: 'Quality Control', desc: 'Pengecekan fungsi kelayakan pasca-servis.' },
        { key: 'SELESAI', label: 'Siap Diambil', desc: 'Unit selesai diservis dan siap diambil di toko.' },
        { key: 'DIAMBIL', label: 'Sudah Diambil', desc: 'Unit telah diserahkan kembali ke pemilik.' }
    ];

    // Read parameter query token
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');

    if (tokenParam) {
        loadTicketByToken(tokenParam);
    }

    // Handle Search click
    btnTrackSearch.addEventListener('click', () => {
        const query = trackingSearchInput.value.trim().toUpperCase();
        if (!query) {
            alert('Masukkan nomor tiket terlebih dahulu!');
            return;
        }
        loadTicketByQuery(query);
    });

    // Handle Enter key on input
    trackingSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            btnTrackSearch.click();
        }
    });

    // --- SEARCH / LOAD LOGIC ---

    function loadTicketByToken(token) {
        const tickets = getTickets();
        const t = tickets.find(ticket => ticket.token === token);
        if (t) {
            renderTrackingInfo(t);
        } else {
            showNotFound();
        }
    }

    function loadTicketByQuery(query) {
        const tickets = getTickets();
        // Match by code exactly or search by phone match
        const t = tickets.find(ticket => ticket.code === query || ticket.customer_phone === query);
        if (t) {
            renderTrackingInfo(t);
        } else {
            showNotFound();
        }
    }

    function showNotFound() {
        resultCard.style.display = 'none';
        notFoundCard.style.display = 'block';
    }

    // --- RENDER VISUAL TIMELINE ---

    function renderTrackingInfo(t) {
        notFoundCard.style.display = 'none';
        resultCard.style.display = 'block';

        // Set Basic Text fields
        resTicketCode.textContent = t.code;
        resDeviceModel.textContent = t.model;
        resStatusText.textContent = t.status.replace('_', ' ');
        resEstSelesai.textContent = t.estimated_date ? new Date(t.estimated_date).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : 'Sedang Diagnosa';
        resComplaint.textContent = `"${t.complaint}"`;

        // Render Biaya Info depending on Acc Status
        if (t.status_acc === 'MENUNGGU' && t.estimated_cost) {
            resBiayaLabel.textContent = 'Estimasi Biaya Servis:';
            resBiayaVal.innerHTML = `
                <div style="font-size: 1.25rem; font-weight:700; color:var(--accent-orange);">Rp ${t.estimated_cost.toLocaleString('id-ID')}</div>
                <div style="margin-top:8px; display:flex; gap:8px;">
                    <button class="btn btn-cta" style="padding:6px 12px; font-size:0.8rem;" id="btn-user-acc">Setujui (ACC)</button>
                    <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.8rem;" id="btn-user-tolak">Tolak</button>
                </div>
            `;
            
            // ACC Button simulation
            document.getElementById('btn-user-acc').onclick = () => {
                t.status_acc = 'ACC';
                t.status = 'PROSES';
                t.logs.push({
                    id: 'log-' + Date.now(),
                    prev_status: 'MENUNGGU_ACC',
                    next_status: 'PROSES',
                    note: 'Customer memberikan persetujuan biaya (ACC) via halaman tracking publik.',
                    technician: 'Customer (Online)',
                    timestamp: new Date().toISOString()
                });
                
                const allTickets = getTickets();
                const idx = allTickets.findIndex(ticket => ticket.id === t.id);
                if (idx !== -1) {
                    allTickets[idx] = t;
                    saveTickets(allTickets);
                }
                alert('Terima kasih! Persetujuan Anda telah tersimpan. Teknisi kami akan segera memproses unit.');
                renderTrackingInfo(t);
            };

            // Tolak Button simulation
            document.getElementById('btn-user-tolak').onclick = () => {
                t.status_acc = 'TOLAK';
                t.status = 'DIBATALKAN';
                t.logs.push({
                    id: 'log-' + Date.now(),
                    prev_status: 'MENUNGGU_ACC',
                    next_status: 'DIBATALKAN',
                    note: 'Customer menolak estimasi biaya servis via halaman tracking publik.',
                    technician: 'Customer (Online)',
                    timestamp: new Date().toISOString()
                });
                
                const allTickets = getTickets();
                const idx = allTickets.findIndex(ticket => ticket.id === t.id);
                if (idx !== -1) {
                    allTickets[idx] = t;
                    saveTickets(allTickets);
                }
                alert('Pernyataan Anda telah direkam. Silakan mengambil kembali unit Anda di toko.');
                renderTrackingInfo(t);
            };

        } else if (t.status_acc === 'TOLAK' || t.status === 'DIBATALKAN') {
            resBiayaLabel.textContent = 'Biaya Servis:';
            resBiayaVal.innerHTML = `<span style="color:var(--status-dibatalkan); font-weight:700;">DIBATALKAN</span>`;
        } else {
            const cost = t.final_cost || t.estimated_cost;
            resBiayaLabel.textContent = 'Biaya Servis:';
            resBiayaVal.innerHTML = cost ? `<span style="color:var(--status-selesai); font-weight:700;">Rp ${cost.toLocaleString('id-ID')}</span>` : '<span style="color:var(--text-muted)">Menunggu Diagnosa</span>';
        }

        // Setup WhatsApp contact shortcut
        btnContactWA.onclick = () => {
            const waMsg = `Halo Planet Store Boyolali, saya ingin menanyakan progres unit servis saya dengan nomor tiket *${t.code}* (${t.model}). Terima kasih.`;
            const waUrl = `https://wa.me/6289522994849?text=${encodeURIComponent(waMsg)}`;
            window.open(waUrl, '_blank');
        };

        // Render Timeline Progress
        resTimeline.innerHTML = '';
        
        // Find index of current status in flow
        let currentStatusIndex = STATUS_FLOW.findIndex(flow => flow.key === t.status);
        if (t.status === 'DIBATALKAN') {
            currentStatusIndex = -1; // Handle custom cancelled state
        }

        STATUS_FLOW.forEach((flow, idx) => {
            const li = document.createElement('li');
            li.className = 'timeline-item';
            
            // Check if log contains timestamp for this status
            const logEntry = t.logs.find(log => log.next_status === flow.key);
            
            if (logEntry) {
                li.classList.add('completed');
                const logTime = new Date(logEntry.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
                li.innerHTML = `
                    <div class="timeline-time">${logTime}</div>
                    <div class="timeline-title">${flow.label} <span style="color:var(--status-selesai); font-size: 0.75rem;">(Selesai)</span></div>
                    <div class="timeline-desc">${logEntry.note}</div>
                `;
            } else {
                if (idx === currentStatusIndex + 1 && t.status !== 'DIAMBIL') {
                    // Next pending state
                    li.classList.add('active');
                    li.innerHTML = `
                        <div class="timeline-time" style="color:var(--accent-orange)">Berikutnya</div>
                        <div class="timeline-title" style="color:var(--accent-orange)">${flow.label}</div>
                        <div class="timeline-desc">${flow.desc}</div>
                    `;
                } else if (idx <= currentStatusIndex) {
                    // Completed status but without a specific log trace (fallback)
                    li.classList.add('completed');
                    li.innerHTML = `
                        <div class="timeline-time">—</div>
                        <div class="timeline-title">${flow.label}</div>
                        <div class="timeline-desc">${flow.desc}</div>
                    `;
                } else {
                    // Untouched future status
                    li.innerHTML = `
                        <div class="timeline-time">—</div>
                        <div class="timeline-title" style="color:var(--text-muted)">${flow.label}</div>
                        <div class="timeline-desc" style="color:var(--text-muted)">${flow.desc}</div>
                    `;
                }
            }
            resTimeline.appendChild(li);
        });

        // Add cancelled trace if cancelled
        if (t.status === 'DIBATALKAN') {
            const cancelLog = t.logs.find(log => log.next_status === 'DIBATALKAN');
            const li = document.createElement('li');
            li.className = 'timeline-item completed';
            li.style.borderColor = 'var(--status-dibatalkan)';
            const cancelTime = cancelLog ? new Date(cancelLog.timestamp).toLocaleString('id-ID') : '';
            li.innerHTML = `
                <div class="timeline-time" style="color:var(--status-dibatalkan)">${cancelTime}</div>
                <div class="timeline-title" style="color:var(--status-dibatalkan)">DIBATALKAN</div>
                <div class="timeline-desc">${cancelLog ? cancelLog.note : 'Perbaikan dibatalkan.'}</div>
            `;
            resTimeline.appendChild(li);
        }
    }
});

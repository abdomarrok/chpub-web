/* devis.js — Devis form, live preview, print, WhatsApp
   Plain script — no ES module. CONFIG is global from config.js.
*/

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ── Populate wilaya select from CONFIG ── */
    const wilayas = [
        "01 - Adrar","02 - Chlef","03 - Laghouat","04 - Oum El Bouaghi","05 - Batna",
        "06 - Béjaïa","07 - Biskra","08 - Béchar","09 - Blida","10 - Bouira",
        "11 - Tamanrasset","12 - Tébessa","13 - Tlemcen","14 - Tiaret","15 - Tizi Ouzou",
        "16 - Alger","17 - Djelfa","18 - Jijel","19 - Sétif","20 - Saïda",
        "21 - Skikda","22 - Sidi Bel Abbès","23 - Annaba","24 - Guelma","25 - Constantine",
        "26 - Médéa","27 - Mostaganem","28 - M'Sila","29 - Mascara","30 - Ouargla",
        "31 - Oran","32 - El Bayadh","33 - Illizi","34 - Bordj Bou Arréridj","35 - Boumerdès",
        "36 - El Tarf","37 - Tindouf","38 - Tissemsilt","39 - El Oued","40 - Khenchela",
        "41 - Souk Ahras","42 - Tipaza","43 - Mila","44 - Aïn Defla","45 - Naâma",
        "46 - Aïn Témouchent","47 - Ghardaïa","48 - Relizane","49 - Timimoun",
        "50 - Bordj Badji Mokhtar","51 - Ouled Djellal","52 - Béni Abbès","53 - In Salah",
        "54 - In Guezzam","55 - Touggourt","56 - Djanet","57 - El M'Ghair","58 - El Meniaa"
    ];

    const wSelect = document.getElementById('dev-wilaya');
    if (wSelect) {
        wilayas.forEach(w => {
            const op = document.createElement('option');
            op.value = w;
            op.textContent = w;
            wSelect.appendChild(op);
        });
    }

    /* ── Static devis header from CONFIG ── */
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('prev-agency-name',    CONFIG.agency.name.split('—')[0].trim());
    set('prev-agency-address', CONFIG.agency.address);
    set('prev-agency-phone',   `Tél: ${CONFIG.agency.phone1}`);

    /* ── Devis number + date ── */
    const today = new Date();
    set('prev-date', today.toLocaleDateString('fr-DZ'));
    const devisId = `${today.getFullYear()}-${
        String(today.getMonth()+1).padStart(2,'0')}${
        String(today.getDate()).padStart(2,'0')}-${
        Math.floor(Math.random()*9000+1000)}`;
    set('prev-devis-id', devisId);

    /* ── Form refs ── */
    const form       = document.getElementById('devis-form');
    const nInput     = document.getElementById('dev-name');
    const pInput     = document.getElementById('dev-phone');
    const sInput     = document.getElementById('dev-service');
    const notesInput = document.getElementById('dev-notes');

    // Hidden inputs carrying configured prices
    const hidAluD = document.getElementById('hidden-alu-details');
    const hidAluP = document.getElementById('hidden-alu-price');
    const hidWebD = document.getElementById('hidden-web-details');
    const hidWebP = document.getElementById('hidden-web-price');

    /* ── DevisManager: called by configurator.js and websites.js ── */
    window.DevisManager = {
        setAlucobond(details, price) {
            if (hidAluD) hidAluD.value = details;
            if (hidAluP) hidAluP.value = price;
            const hasWeb = parseFloat(hidWebP?.value) > 0;
            if (sInput) sInput.value = hasWeb ? 'Mixte' : 'Alucobond';
            updatePreview();
        },
        setWebsites(details, price) {
            if (hidWebD) hidWebD.value = details;
            if (hidWebP) hidWebP.value = price;
            const hasAlu = parseFloat(hidAluP?.value) > 0;
            if (sInput) sInput.value = hasAlu ? 'Mixte' : 'Site Web';
            updatePreview();
        }
    };

    /* ── Live preview update ── */
    function updatePreview() {
        set('prev-client-name',    nInput?.value.trim()  || '—');
        set('prev-client-contact', pInput?.value.trim()  || '—');
        set('prev-client-wilaya',  wSelect?.value        || '—');

        const tbody = document.getElementById('prev-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        const sVal = sInput?.value || '';
        const aluP = parseFloat(hidAluP?.value) || 0;
        const webP = parseFloat(hidWebP?.value) || 0;

        const items = [];

        if ((sVal === 'Alucobond' || sVal === 'Mixte') && aluP > 0) {
            items.push({ desc: hidAluD?.value || 'Alucobond', price: aluP });
        }
        if ((sVal === 'Site Web' || sVal === 'Mixte') && webP > 0) {
            items.push({ desc: hidWebD?.value || 'Site Web', price: webP });
        }

        if (items.length === 0) {
            tbody.innerHTML = `<tr>
                <td colspan="2" style="text-align:center;color:var(--muted);padding:1rem">
                    Aucun service configuré
                </td>
            </tr>`;
        } else {
            items.forEach(it => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${it.desc.replace(/\n/g, '<br>')}</td>
                    <td>${it.price.toLocaleString('fr-DZ')} DZD</td>
                `;
                tbody.appendChild(tr);
            });
        }

        const totalHT  = items.reduce((s, i) => s + i.price, 0);
        const tva      = Math.round(totalHT * CONFIG.tva);
        const totalTTC = totalHT + tva;

        set('prev-total-ht',  totalHT.toLocaleString('fr-DZ'));
        set('prev-tva',       tva.toLocaleString('fr-DZ'));
        set('prev-total-ttc', totalTTC.toLocaleString('fr-DZ'));
    }

    form?.addEventListener('input', updatePreview);

    /* ── Print: only the devis document ── */
    document.getElementById('btn-print')?.addEventListener('click', () => {
        window.print();
    });

    /* ── WhatsApp ── */
    document.getElementById('btn-whatsapp')?.addEventListener('click', () => {
        if (form && !form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const ttc = document.getElementById('prev-total-ttc')?.textContent || '0';

        // Build service lines from table rows (no internal markup/debug data)
        const tbody = document.getElementById('prev-table-body');
        const rows  = [...(tbody?.querySelectorAll('tr') || [])];
        const lines = rows
            .map(tr => {
                const tds = tr.querySelectorAll('td');
                return tds.length === 2
                    ? `• ${tds[0].innerText.replace(/\n/g, ' ')} — ${tds[1].innerText}`
                    : null;
            })
            .filter(Boolean)
            .join('\n');

        let msg = `Bonjour Ch.Pub,\n\nJe souhaite un devis (N° ${devisId}) pour:\n\n`;
        msg += lines || `• ${sInput?.value || 'Service non précisé'}`;
        msg += `\n\nTotal estimé: ${ttc} DZD TTC`;
        msg += `\nNom: ${nInput?.value || '—'} | Wilaya: ${wSelect?.value || '—'}`;
        if (notesInput?.value.trim()) msg += `\nNotes: ${notesInput.value.trim()}`;

        const url = `https://wa.me/${CONFIG.agency.phone1_wa}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    });

    // Initial render
    updatePreview();
});

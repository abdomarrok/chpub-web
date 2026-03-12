import { CONFIG } from './config.js';

const wilayas = [
    "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna", "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira",
    "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
    "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine", "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
    "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arreridj", "35 - Boumerdès", "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
    "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma", "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - Timimoun", "50 - Bordj Badji Mokhtar",
    "51 - Ouled Djellal", "52 - Béni Abbès", "53 - In Salah", "54 - In Guezzam", "55 - Touggourt", "56 - Djanet", "57 - El M'Ghair", "58 - El Meniaa"
];

document.addEventListener('DOMContentLoaded', () => {
    const wSelect = document.getElementById('dev-wilaya');
    wilayas.forEach(w => {
        const op = document.createElement('option');
        op.value = w;
        op.textContent = w;
        wSelect.appendChild(op);
    });

    document.getElementById('prev-agency-name').textContent = CONFIG.agency.name.split('—')[0].trim();
    document.getElementById('prev-agency-address').textContent = CONFIG.agency.address;
    document.getElementById('prev-agency-phone').textContent = `Tel: ${CONFIG.agency.phone1}`;
    
    const today = new Date();
    document.getElementById('prev-date').textContent = today.toLocaleDateString('fr-FR');
    const yy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const rand = Math.floor(Math.random() * 9000 + 1000);
    const devisId = `${yy}-${mm}${dd}-${rand}`;
    document.getElementById('prev-devis-id').textContent = devisId;

    const form = document.getElementById('devis-form');
    const nInput = document.getElementById('dev-name');
    const pInput = document.getElementById('dev-phone');
    const sInput = document.getElementById('dev-service');

    const hidAluD = document.getElementById('hidden-alu-details');
    const hidAluP = document.getElementById('hidden-alu-price');
    const hidWebD = document.getElementById('hidden-web-details');
    const hidWebP = document.getElementById('hidden-web-price');

    window.DevisManager = {
        setAlucobond: (details, price) => {
            hidAluD.value = details; hidAluP.value = price;
            sInput.value = (parseFloat(hidWebP.value) > 0) ? 'Mixte' : 'Alucobond';
            updatePreview();
        },
        setWebsites: (details, price) => {
            hidWebD.value = details; hidWebP.value = price;
            sInput.value = (parseFloat(hidAluP.value) > 0) ? 'Mixte' : 'Site Web';
            updatePreview();
        }
    };

    const updatePreview = () => {
        document.getElementById('prev-client-name').textContent = nInput.value || 'N/A';
        document.getElementById('prev-client-contact').textContent = pInput.value || 'N/A';
        document.getElementById('prev-client-wilaya').textContent = wSelect.value || 'N/A';

        const tbody = document.getElementById('prev-table-body');
        tbody.innerHTML = '';
        
        let totalHT = 0;
        const sVal = sInput.value;
        const aluP = parseFloat(hidAluP.value) || 0;
        const webP = parseFloat(hidWebP.value) || 0;

        let items = [];
        if ((sVal === 'Alucobond' || sVal === 'Mixte') && aluP > 0) {
            items.push({ desc: hidAluD.value, price: aluP });
            totalHT += aluP;
        }
        if ((sVal === 'Site Web' || sVal === 'Mixte') && webP > 0) {
            items.push({ desc: hidWebD.value, price: webP });
            totalHT += webP;
        }

        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2" style="text-align:center;color:gray;">Aucun service configuré</td></tr>`;
        } else {
            items.forEach(it => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${it.desc.replace(/\n/g, '<br>')}</td><td>${it.price.toLocaleString('fr-DZ')} DZD</td>`;
                tbody.appendChild(tr);
            });
        }

        const tva = totalHT * CONFIG.tva;
        const ttc = totalHT + tva;

        document.getElementById('prev-total-ht').textContent = totalHT.toLocaleString('fr-DZ');
        document.getElementById('prev-tva').textContent = tva.toLocaleString('fr-DZ');
        document.getElementById('prev-total-ttc').textContent = ttc.toLocaleString('fr-DZ');
    };

    form.addEventListener('input', updatePreview);
    
    document.getElementById('btn-print').addEventListener('click', () => {
        window.print();
    });

    document.getElementById('btn-whatsapp').addEventListener('click', () => {
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        let phone = CONFIG.agency.phone1.replace(/\s/g, '');
        if (phone.startsWith('0')) {
            phone = '213' + phone.substring(1);
        }
        
        let text = `Bonjour Ch.Pub,\nJe souhaite un devis (N° ${devisId}) pour:\n\n`;
        
        const tbody = document.getElementById('prev-table-body');
        if (tbody.innerText.includes('Aucun')) {
            text += `- ${sInput.value}\n`;
        } else {
            const trs = tbody.querySelectorAll('tr');
            trs.forEach(tr => {
                const tds = tr.querySelectorAll('td');
                if (tds.length === 2) {
                    text += `- ${tds[0].innerText.replace(/\n/g, ' ')}\n`;
                }
            });
        }
        
        text += `\nTotal estimé: ${document.getElementById('prev-total-ttc').textContent} DZD TTC\n`;
        text += `Nom: ${nInput.value}\nWilaya: ${wSelect.value}`;
        
        if (document.getElementById('dev-notes').value) {
            text += `\nNotes: ${document.getElementById('dev-notes').value}`;
        }

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    });
});

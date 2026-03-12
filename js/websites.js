import { CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const packagesContainer = document.getElementById('packages-container');
    const addonsContainer = document.getElementById('addons-container');
    
    let selectedPackage = null;
    let selectedAddons = new Set();
    
    // Feature Lists mapping since they are not in CONFIG
    const getFeatures = (pkgKey) => {
        const features = {
            vitrine: [
                { text: "Design personnalisé", inc: true },
                { text: "Jusqu'à 5 pages", inc: true },
                { text: "Formulaire de contact", inc: true },
                { text: "Paiement en ligne", inc: false },
                { text: "Espace client", inc: false }
            ],
            ecommerce: [
                { text: "Design E-commerce", inc: true },
                { text: "Pages illimitées", inc: true },
                { text: "Formulaire de contact", inc: true },
                { text: "Paiement en ligne", inc: true },
                { text: "Espace client", inc: true }
            ],
            surMesure: [
                { text: "Design Unique UI/UX", inc: true },
                { text: "Architecture complexe", inc: true },
                { text: "API personnalisée", inc: true },
                { text: "Fonctionnalités avancées", inc: true },
                { text: "Support dédié", inc: true }
            ]
        };
        return features[pkgKey] || [];
    };

    // Render Packages
    Object.entries(CONFIG.websites.packages).forEach(([key, data]) => {
        const card = document.createElement('div');
        card.className = 'package-card';
        card.dataset.key = key;
        
        const priceText = data.price !== null ? `${data.price.toLocaleString('fr-DZ')} DZD` : 'Sur devis';
        
        let featuresHtml = '';
        getFeatures(key).forEach(f => {
            const icon = f.inc ? '<span class="feature-check">✓</span>' : '<span class="feature-cross">✗</span>';
            featuresHtml += `<li>${icon} ${f.text}</li>`;
        });
        
        card.innerHTML = `
            <h3 class="package-title font-display">${data.label}</h3>
            <p class="package-price">${priceText}</p>
            <ul class="package-features">${featuresHtml}</ul>
            <button class="btn btn-outline package-select-btn">Sélectionner</button>
        `;
        
        card.addEventListener('click', () => {
            document.querySelectorAll('.package-card').forEach(c => c.classList.remove('selected'));
            document.querySelectorAll('.package-select-btn').forEach(b => {
                b.textContent = 'Sélectionner';
            });
            
            card.classList.add('selected');
            card.querySelector('.package-select-btn').textContent = 'Sélectionné';
            
            selectedPackage = key;
            updateTotals();
        });
        
        packagesContainer.appendChild(card);
    });

    // Render Addons
    Object.entries(CONFIG.websites.addons).forEach(([key, data]) => {
        const label = document.createElement('label');
        label.className = 'addon-checkbox';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = key;
        
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) selectedAddons.add(key);
            else selectedAddons.delete(key);
            updateTotals();
        });
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${data.label} (+${data.price.toLocaleString('fr-DZ')} DZD)`));
        
        addonsContainer.appendChild(label);
    });

    const webBasePrice = document.getElementById('web-base-price');
    const webOptionsPrice = document.getElementById('web-options-price');
    const webTotal = document.getElementById('web-total');
    const btnGenerate = document.getElementById('btn-generate-web-devis');

    const updateTotals = () => {
        if (!selectedPackage) {
            btnGenerate.disabled = true;
            return;
        }
        btnGenerate.disabled = false;
        
        const pkgData = CONFIG.websites.packages[selectedPackage];
        const basePrice = pkgData.price !== null ? pkgData.price : 0;
        
        let optionsPrice = 0;
        selectedAddons.forEach(addonKey => {
            optionsPrice += CONFIG.websites.addons[addonKey].price;
        });
        
        webBasePrice.innerHTML = pkgData.price !== null ? `${basePrice.toLocaleString('fr-DZ')} DZD` : '<span style="font-size:0.8em">Sur devis</span>';
        webOptionsPrice.textContent = optionsPrice.toLocaleString('fr-DZ');
        
        if (pkgData.price === null) {
            webTotal.innerHTML = `<span style="font-size:0.5em">Sur devis (+${optionsPrice.toLocaleString('fr-DZ')} DZD)</span>`;
        } else {
            const totalHT = basePrice + optionsPrice;
            webTotal.textContent = totalHT.toLocaleString('fr-DZ');
        }
    };
    
    // Generate Devis action
    btnGenerate.addEventListener('click', () => {
        document.getElementById('devis').scrollIntoView({ behavior: 'smooth' });
    });
});

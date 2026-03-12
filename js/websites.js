/* websites.js — Website package builder + addon logic
   Plain script — no ES module. CONFIG is global from config.js.
*/

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const packagesContainer = document.getElementById('packages-container');
    const addonsContainer   = document.getElementById('addons-container');
    const webBasePrice      = document.getElementById('web-base-price');
    const webOptionsPrice   = document.getElementById('web-options-price');
    const webTotal          = document.getElementById('web-total');
    const btnGenerate       = document.getElementById('btn-generate-web-devis');

    let selectedPackage = null;
    const selectedAddons = new Set();

    /* ── Feature lists ── */
    const FEATURES = {
        vitrine: [
            { text: "Design personnalisé",     inc: true  },
            { text: "Jusqu'à 5 pages",         inc: true  },
            { text: "Formulaire de contact",   inc: true  },
            { text: "Paiement en ligne",        inc: false },
            { text: "Espace client",            inc: false }
        ],
        ecommerce: [
            { text: "Design E-commerce",       inc: true  },
            { text: "Pages illimitées",         inc: true  },
            { text: "Formulaire de contact",   inc: true  },
            { text: "Paiement en ligne",        inc: true  },
            { text: "Espace client",            inc: true  }
        ],
        surMesure: [
            { text: "Design Unique UI/UX",     inc: true  },
            { text: "Architecture complexe",   inc: true  },
            { text: "API personnalisée",        inc: true  },
            { text: "Fonctionnalités avancées", inc: true  },
            { text: "Support dédié",            inc: true  }
        ]
    };

    /* ── Render package cards ── */
    if (packagesContainer) {
        Object.entries(CONFIG.websites.packages).forEach(([key, data]) => {
            const card = document.createElement('div');
            card.className = 'package-card';
            card.dataset.key = key;
            card.setAttribute('role', 'radio');
            card.setAttribute('aria-checked', 'false');
            card.setAttribute('tabindex', '0');

            const priceText = data.price !== null
                ? `${data.price.toLocaleString('fr-DZ')} DZD`
                : 'Sur devis';

            const featuresHtml = (FEATURES[key] || []).map(f => {
                const icon = f.inc
                    ? '<span class="feature-check" aria-hidden="true">✓</span>'
                    : '<span class="feature-cross" aria-hidden="true">✗</span>';
                return `<li style="color:${f.inc ? 'var(--light)' : 'var(--muted)'}">${icon} ${f.text}</li>`;
            }).join('');

            card.innerHTML = `
                <h3 class="package-title font-display">${data.label}</h3>
                <p class="package-price">${priceText}</p>
                <ul class="package-features">${featuresHtml}</ul>
                <button class="btn btn-outline package-select-btn" type="button">Sélectionner</button>
            `;

            const selectCard = () => {
                document.querySelectorAll('.package-card').forEach(c => {
                    c.classList.remove('selected');
                    c.setAttribute('aria-checked', 'false');
                    c.querySelector('.package-select-btn').textContent = 'Sélectionner';
                });
                card.classList.add('selected');
                card.setAttribute('aria-checked', 'true');
                card.querySelector('.package-select-btn').textContent = 'Sélectionné ✓';
                selectedPackage = key;
                updateTotals();
            };

            card.addEventListener('click', selectCard);
            card.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCard(); }
            });

            packagesContainer.appendChild(card);
        });
    }

    /* ── Render addons ── */
    if (addonsContainer) {
        Object.entries(CONFIG.websites.addons).forEach(([key, data]) => {
            const label = document.createElement('label');
            label.className = 'addon-checkbox';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = key;
            cb.id = `addon-${key}`;
            cb.setAttribute('aria-label', `${data.label} (+${data.price.toLocaleString('fr-DZ')} DZD)`);

            cb.addEventListener('change', () => {
                if (cb.checked) selectedAddons.add(key);
                else selectedAddons.delete(key);
                updateTotals();
            });

            label.appendChild(cb);
            label.insertAdjacentHTML('beforeend',
                ` ${data.label} <span style="color:var(--accent);font-weight:600">
                    (+${data.price.toLocaleString('fr-DZ')} DZD)
                  </span>`
            );
            addonsContainer.appendChild(label);
        });
    }

    /* ── Calculate and render totals ── */
    function updateTotals() {
        if (!selectedPackage) {
            if (btnGenerate) btnGenerate.disabled = true;
            return;
        }
        if (btnGenerate) btnGenerate.disabled = false;

        const pkgData   = CONFIG.websites.packages[selectedPackage];
        const basePrice = pkgData.price ?? 0;

        let optionsPrice = 0;
        const addonLabels = [];
        selectedAddons.forEach(addonKey => {
            optionsPrice += CONFIG.websites.addons[addonKey].price;
            addonLabels.push(CONFIG.websites.addons[addonKey].label);
        });

        if (webBasePrice) {
            webBasePrice.innerHTML = pkgData.price !== null
                ? `${basePrice.toLocaleString('fr-DZ')} DZD`
                : '<em>Sur devis</em>';
        }
        if (webOptionsPrice) webOptionsPrice.textContent = optionsPrice.toLocaleString('fr-DZ');

        if (webTotal) {
            webTotal.textContent = pkgData.price !== null
                ? (basePrice + optionsPrice).toLocaleString('fr-DZ')
                : 'Sur devis';
        }

        // Expose for devis.js
        const addonStr = addonLabels.length ? `\n  Options: ${addonLabels.join(', ')}` : '';
        window.currentWebConfig = {
            details: `Site Web — ${pkgData.label}${addonStr}`,
            price: pkgData.price !== null ? basePrice + optionsPrice : 0
        };
    }

    /* ── Devis button ── */
    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => {
            updateTotals();
            if (window.DevisManager && window.currentWebConfig) {
                window.DevisManager.setWebsites(
                    window.currentWebConfig.details,
                    window.currentWebConfig.price
                );
            }
            document.getElementById('devis')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

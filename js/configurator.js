import { CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const widthInput = document.getElementById('alu-width');
    const heightInput = document.getElementById('alu-height');
    const widthVal = document.getElementById('alu-width-val');
    const heightVal = document.getElementById('alu-height-val');
    const typeSelect = document.getElementById('alu-type');
    const installCheck = document.getElementById('alu-install');
    const designCheck = document.getElementById('alu-design');
    
    // CSS 3D Elements
    const aluPanel = document.getElementById('alu-panel-3d');
    const dimW = document.getElementById('dim-w-css');
    const dimH = document.getElementById('dim-h-css');

    // UI Feedback
    const calcSurface = document.getElementById('calc-surface');
    const calcUnit = document.getElementById('calc-unit-price');
    const calcOptions = document.getElementById('calc-options');
    const calcTotal = document.getElementById('calc-total');

    function updateConfigurator() {
        const w = parseFloat(widthInput.value);
        const h = parseFloat(heightInput.value);
        const typeKey = typeSelect.value;
        const typeData = CONFIG.alucobond.types[typeKey];
        if (!typeData) return;
        
        // 1. Update Labels
        widthVal.textContent = w.toFixed(1);
        heightVal.textContent = h.toFixed(1);
        if(dimW) dimW.textContent = w.toFixed(1);
        if(dimH) dimH.textContent = h.toFixed(1);

        // 2. Update CSS 3D Visual (Scale)
        if (aluPanel) {
            const scaleX = (w / 5); 
            const scaleY = (h / 2);
            aluPanel.style.transform = `rotateX(15deg) rotateY(-25deg) scale3d(${scaleX}, ${scaleY}, 1)`;
        }

        // 3. Price Calculation
        const surface = w * h;
        const unitPrice = typeData.price;
        let baseTotal = surface * unitPrice;
        
        let optionsPrice = 0;
        if (installCheck.checked) optionsPrice += baseTotal * CONFIG.alucobond.options.installation;
        if (designCheck.checked) optionsPrice += CONFIG.alucobond.options.design;

        const totalHT = baseTotal + optionsPrice;

        // 4. Update UI
        calcSurface.textContent = surface.toFixed(2);
        calcUnit.textContent = unitPrice.toLocaleString();
        calcOptions.textContent = optionsPrice.toLocaleString();
        calcTotal.textContent = Math.round(totalHT).toLocaleString();

        // 5. Shared state for Devis
        window.currentAluConfig = {
            details: `${typeData.name} (${w}m x ${h}m)${installCheck.checked ? ' + Installation' : ''}`,
            total: totalHT
        };
    }

    // Populate Types
    if (typeSelect) {
        Object.entries(CONFIG.alucobond.types).forEach(([key, val]) => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = `${val.name} (${val.price} DZD/m²)`;
            typeSelect.appendChild(opt);
        });
    }

    // Events
    [widthInput, heightInput, typeSelect, installCheck, designCheck].forEach(el => {
        if(el) el.addEventListener('input', updateConfigurator);
    });

    // Mouse interactivity for 3D rotation
    const previewArea = document.querySelector('.css-3d-scene');
    if (previewArea && aluPanel) {
        previewArea.addEventListener('mousemove', (e) => {
            const rect = previewArea.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) - 0.5;
            const y = ((e.clientY - rect.top) / rect.height) - 0.5;
            
            const rotX = 15 - (y * 30);
            const rotY = -25 + (x * 30);
            
            const w = parseFloat(widthInput.value);
            const h = parseFloat(heightInput.value);
            const scaleX = (w / 5);
            const scaleY = (h / 2);
            
            aluPanel.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${scaleX}, ${scaleY}, 1)`;
        });

        previewArea.addEventListener('mouseleave', () => {
            updateConfigurator();
        });
    }

    // Initial limit
    updateConfigurator();

    // Generate Devis action
    const btnDevis = document.getElementById('btn-generate-alu-devis');
    if (btnDevis) {
        btnDevis.addEventListener('click', () => {
            document.getElementById('devis').scrollIntoView({ behavior: 'smooth' });
        });
    }
});

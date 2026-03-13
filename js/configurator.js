/**
 * configurator.js — Alucobond 3D CSS Panel + Price Calculator
 * Plain script — no ES module. CONFIG is global from config.js.
 *
 * CSS 3D approach: drives width/height of .alu-panel-3d directly.
 * Each face is positioned via CSS transform; only container dimensions change.
 * 
 * Features:
 * - Hybrid input system (Range sliders + Manual number inputs)
 * - 3D panel geometry with 6 faces
 * - Real-time price calculation with surface area
 * - Drag-to-rotate interaction with auto-spin
 * - Input validation and clamping
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ── DOM refs ── */
    const widthInput  = document.getElementById('alu-width');
    const heightInput = document.getElementById('alu-height');
    const depthInput  = document.getElementById('alu-depth');
    const widthNum    = document.getElementById('alu-width-num');
    const heightNum   = document.getElementById('alu-height-num');
    const depthNum    = document.getElementById('alu-depth-num');
    const typeSelect  = document.getElementById('alu-type');
    const installCheck = document.getElementById('alu-install');
    const designCheck  = document.getElementById('alu-design');
    const backCheck    = document.getElementById('alu-backface');

    // Labels in 3D scene
    const dimW = document.getElementById('dim-w-css');
    const dimH = document.getElementById('dim-h-css');
    const dimD = document.getElementById('dim-d-css');

    // CSS 3D panel element and its faces
    const aluPanel  = document.getElementById('alu-panel-3d');
    const faceRight  = aluPanel?.querySelector('.panel-face.right');
    const faceLeft   = aluPanel?.querySelector('.panel-face.left');
    const faceTop    = aluPanel?.querySelector('.panel-face.top');
    const faceBottom = aluPanel?.querySelector('.panel-face.bottom');
    const faceBack   = aluPanel?.querySelector('.panel-face.back');

    // Price output
    const calcSurface = document.getElementById('calc-surface');
    const calcUnit    = document.getElementById('calc-unit-price');
    const calcOptions = document.getElementById('calc-options');
    const calcTotal   = document.getElementById('calc-total');

    // Scale: pixels per metre in the CSS panel display
    const PX_PER_M_D = 200; // depth (exaggerated for visibility)

    /* ── Populate type select from CONFIG ── */
    if (typeSelect) {
        Object.entries(CONFIG.alucobond.types).forEach(([key, val]) => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = `${val.label} — ${val.price.toLocaleString('fr-DZ')} DZD/m²`;
            typeSelect.appendChild(opt);
        });
    }

    /**
     * Update 3D panel geometry and transforms
     * @param {number} wM - Width in metres
     * @param {number} hM - Height in metres  
     * @param {number} dM - Depth in metres
     */
    function updatePanel(wM, hM, dM) {
        if (!aluPanel) return;
        
        const scene = document.querySelector('.css-3d-scene');
        if (!scene) return;

        // Dynamic Scale: Calculate how many pixels per metre to fit the scene
        const sceneRect = scene.getBoundingClientRect();
        const padding = 60; // Margin around the box
        const maxW = sceneRect.width - padding * 2;
        const maxH = sceneRect.height - padding * 2;
        
        // Use the smaller scale factor to fit within scene
        const scaleW = maxW / wM;
        const scaleH = maxH / hM;
        const dynamicPX = Math.min(scaleW, scaleH, 100); // Caps at 100px/m for very small panels
        
        const wPx = Math.round(wM * dynamicPX);
        const hPx = Math.round(hM * dynamicPX);
        const dPx = Math.round(dM * PX_PER_M_D);
        const halfD = dPx / 2;

        // Set container size
        aluPanel.style.width  = wPx + 'px';
        aluPanel.style.height = hPx + 'px';

        // Front and back faces (translateZ) depend on half-depth
        const front = aluPanel.querySelector('.panel-face.front');
        if (front) front.style.transform = `translateZ(${halfD}px)`;
        if (faceBack) {
            faceBack.style.transform  = `rotateY(180deg) translateZ(${halfD}px)`;
            faceBack.style.opacity = backCheck?.checked ? '1' : '0.3';
        }

        // Side faces: width = dPx, positioned at edges
        if (faceRight) {
            faceRight.style.width     = dPx + 'px';
            faceRight.style.height    = hPx + 'px';
            faceRight.style.right     = `-${halfD}px`;
            faceRight.style.transform = `rotateY(90deg) translateZ(${halfD}px)`;
        }
        if (faceLeft) {
            faceLeft.style.width     = dPx + 'px';
            faceLeft.style.height    = hPx + 'px';
            faceLeft.style.left      = `-${halfD}px`;
            faceLeft.style.transform = `rotateY(-90deg) translateZ(${halfD}px)`;
        }

        // Top/bottom faces: height = dPx
        if (faceTop) {
            faceTop.style.width     = wPx + 'px';
            faceTop.style.height    = dPx + 'px';
            faceTop.style.top       = `-${halfD}px`;
            faceTop.style.transform = `rotateX(90deg) translateZ(${halfD}px)`;
        }
        if (faceBottom) {
            faceBottom.style.width     = wPx + 'px';
            faceBottom.style.height    = dPx + 'px';
            faceBottom.style.bottom    = `-${halfD}px`;
            faceBottom.style.transform = `rotateX(-90deg) translateZ(${halfD}px)`;
        }

        // Dimension labels
        if (dimW) dimW.textContent = wM.toFixed(1);
        if (dimH) dimH.textContent = hM.toFixed(1);
        if (dimD) dimD.textContent = dM.toFixed(2);

        // Update shadow size relative to panel
        const shadow = document.querySelector('.panel-shadow');
        if (shadow) {
            shadow.style.width = (wPx * 1.2) + 'px';
            shadow.style.bottom = `-${Math.max(40, halfD + 20)}px`;
        }
    }

    /**
     * Calculate and update price based on dimensions and options
     * @returns {Object|null} {w, h, d} dimensions if valid, null otherwise
     */
    function updatePrice() {
        if (!widthInput || !heightInput || !depthInput || !typeSelect) return null;

        try {
            // Clamp values to valid ranges
            const w = Math.max(0.1, Math.min(50, parseFloat(widthInput.value) || 0));
            const h = Math.max(0.1, Math.min(50, parseFloat(heightInput.value) || 0));
            const d = Math.max(0.01, Math.min(10, parseFloat(depthInput.value) || 0));
            
            // Sync number inputs to range inputs
            if (widthNum) widthNum.value = w;
            if (heightNum) heightNum.value = h;
            if (depthNum) depthNum.value = d;
            
            const typeKey = typeSelect.value;
            const typeData = CONFIG.alucobond.types[typeKey];
            if (!typeData) {
                console.error('Invalid Alucobond type:', typeKey);
                return null;
            }

            // 3D Surface Calculation: Front + Sides + Top/Bottom + Back (optional)
            const frontArea = w * h;
            const sidesArea = 2 * (d * h) + 2 * (w * d);
            const backArea = backCheck?.checked ? (w * h) : 0;
            const surface = Math.max(0.1, frontArea + sidesArea + backArea);

            const unitPrice = typeData.price;
            if (!Number.isFinite(unitPrice) || unitPrice < 0) {
                console.error('Invalid unit price:', unitPrice);
                return null;
            }
            
            const baseTotal = surface * unitPrice;

            let optionsPrice = 0;
            if (installCheck?.checked) {
                const installRate = CONFIG.alucobond.options.installation.rate;
                optionsPrice += Math.round(baseTotal * Math.max(0, Math.min(1, installRate)));
            }
            if (designCheck?.checked) {
                const designFixed = CONFIG.alucobond.options.design.fixed;
                optionsPrice += Math.max(0, designFixed);
            }

            const totalHT = Math.round(baseTotal + optionsPrice);

            // Update UI
            if (calcSurface) calcSurface.textContent = surface.toFixed(2);
            if (calcUnit)    calcUnit.textContent    = unitPrice.toLocaleString('fr-DZ');
            if (calcOptions) calcOptions.textContent = Math.round(optionsPrice).toLocaleString('fr-DZ');
            if (calcTotal)   calcTotal.textContent   = totalHT.toLocaleString('fr-DZ');

            // Expose for devis.js
            window.currentAluConfig = {
                details: `Alucobond ${typeData.label} (${w.toFixed(1)}m × ${h.toFixed(1)}m × ${d.toFixed(2)}m)` +
                         (backCheck?.checked ? ' + Face arrière' : '') +
                         (installCheck?.checked ? ' + Installation' : '') +
                         (designCheck?.checked ? ' + Conception graphique' : ''),
                price: totalHT
            };

            return { w, h, d };
        } catch (err) {
            console.error('Error calculating price:', err);
            return null;
        }
    }

    /**
     * Combined update: price calculation + 3D panel rendering
     */
    function update() {
        const result = updatePrice();
        if (result) updatePanel(result.w, result.h, result.d);
    }

    /* ── Smooth 3D scene interaction (Drag to Rotate 360°) ── */
    const scene = document.querySelector('.css-3d-scene');
    let targetRotX = 15, targetRotY = -25;
    let currentRotX = 15, currentRotY = -25;
    let isDragging = false;
    let startX, startY;

    if (scene && aluPanel) {
        scene.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) {
                // Subtle shine follow when not dragging
                const rect = scene.getBoundingClientRect();
                const xIn = ((e.clientX - rect.left) / rect.width  - 0.5);
                const yIn = ((e.clientY - rect.top)  / rect.height - 0.5);
                if (xIn >= -0.5 && xIn <= 0.5 && yIn >= -0.5 && yIn <= 0.5) {
                    aluPanel.style.setProperty('--shine-x', `${(xIn + 0.5) * 100}%`);
                    aluPanel.style.setProperty('--shine-y', `${(yIn + 0.5) * 100}%`);
                }
                return;
            }

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            targetRotY += dx * 0.5;
            targetRotX -= dy * 0.5;

            // Clamp vertical rotation to avoid flipping
            targetRotX = Math.max(-60, Math.min(60, targetRotX));

            startX = e.clientX;
            startY = e.clientY;
            
            // Sync shine to rotation
            aluPanel.style.setProperty('--shine-x', `${50 + (targetRotY % 360) / 7.2}%`);
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Animation loop for smooth rotation
        function animateScene() {
            // Idle rotation when not interacting
            if (!isDragging) {
                targetRotY += 0.1;
            }

            // Lerp (smooth follow)
            currentRotX += (targetRotX - currentRotX) * 0.1;
            currentRotY += (targetRotY - currentRotY) * 0.1;

            aluPanel.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
            requestAnimationFrame(animateScene);
        }
        requestAnimationFrame(animateScene);
    }

    /* ── Events: Range + Number input sync ── */
    const rangeSlidePairs = [
        { range: widthInput, num: widthNum, min: 0.1, max: 50 },
        { range: heightInput, num: heightNum, min: 0.1, max: 50 },
        { range: depthInput, num: depthNum, min: 0.01, max: 10 }
    ];

    rangeSlidePairs.forEach(({ range, num, min, max }) => {
        if (!range || !num) return;

        // Range slider → number input
        range.addEventListener('input', () => {
            const val = parseFloat(range.value) || min;
            num.value = Math.max(min, Math.min(max, val));
            update();
        });

        // Number input → range slider
        num.addEventListener('input', () => {
            let val = parseFloat(num.value) || min;
            val = Math.max(min, Math.min(max, val));
            range.value = val;
            update();
        });

        // Validate on blur
        num.addEventListener('blur', () => {
            let val = parseFloat(num.value) || min;
            if (!Number.isFinite(val) || val < min) val = min;
            if (val > max) val = max;
            num.value = val;
            range.value = val;
            update();
        });
    });

    // Other inputs
    const otherInputs = [typeSelect, installCheck, designCheck, backCheck];
    otherInputs.forEach(el => {
        el?.addEventListener('change', update);
    });

    /* ── Devis button: scroll + expose data ── */
    document.getElementById('btn-generate-alu-devis')?.addEventListener('click', () => {
        update(); // ensure latest state
        if (window.DevisManager && window.currentAluConfig) {
            window.DevisManager.setAlucobond(
                window.currentAluConfig.details,
                window.currentAluConfig.price
            );
        }
        document.getElementById('devis')?.scrollIntoView({ behavior: 'smooth' });
    });

    /* ── Initial render ── */
    update();
});

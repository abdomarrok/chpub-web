/* configurator.js — Alucobond 3D CSS panel + price calculator
   Plain script — no ES module. CONFIG is global from config.js.

   CSS 3D approach: drives width/height of .alu-panel-css directly.
   Each face is positioned via CSS transform; only the container
   dimensions change — no scale3d distortion.
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
    // REMOVED old dimW/dimH refs as they are moved up

    // Price output
    const calcSurface = document.getElementById('calc-surface');
    const calcUnit    = document.getElementById('calc-unit-price');
    const calcOptions = document.getElementById('calc-options');
    const calcTotal   = document.getElementById('calc-total');

    // Scale: pixels per metre in the CSS panel display
    const PX_PER_M_W = 55; // horizontal
    const PX_PER_M_H = 55; // vertical
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

    /* ── Update 3D panel geometry ── */
    function updatePanel(wM, hM, dM) {
        if (!aluPanel || !scene) return;

        // Dynamic Scale: Calculate how many pixels per metre to fit the scene
        const sceneRect = scene.getBoundingClientRect();
        const padding = 60; // Margin around the box
        const maxW = sceneRect.width - padding * 2;
        const maxH = sceneRect.height - padding * 2;
        
        // We want the panel to fit comfortably. We'll use the smaller scale factor.
        const scaleW = maxW / wM;
        const scaleH = maxH / hM;
        const dynamicPX = Math.min(scaleW, scaleH, 100); // Caps at 100px/m for very small panels
        
        const wPx = Math.round(wM * dynamicPX);
        const hPx = Math.round(hM * dynamicPX);
        const dPx = Math.round(dM * PX_PER_M_D); // Keep depth somewhat exaggerated for depth feel
        const halfD = dPx / 2;

        // Set container size
        aluPanel.style.width  = wPx + 'px';
        aluPanel.style.height = hPx + 'px';
        
        // Ensure proper centering by offsetting the whole group
        // CSS transform-origin is usually center center, so we just set the size.

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

        // Dimension labels - adjust offsets based on dynamic scale
        if (dimW) dimW.textContent = wM.toFixed(1);
        if (dimH) dimH.textContent = hM.toFixed(1);
        if (dimD) dimD.textContent = dM.toFixed(2);

        // Update depth label position
        const labelD = document.querySelector('.panel-dimension-label-d');
        if (labelD) {
            labelD.style.transform = `translateY(-50%) translateZ(${halfD + 10}px) translateX(${halfD + 10}px) rotateY(90deg)`;
        }

        // Update shadow size relative to panel
        const shadow = document.querySelector('.panel-shadow');
        if (shadow) {
            shadow.style.width = (wPx * 1.2) + 'px';
            shadow.style.bottom = `-${Math.max(40, halfD + 20)}px`;
        }
    }

    /* ── Price calculation ── */
    function updatePrice() {
        if (!widthInput || !heightInput || !depthInput || !typeSelect) return;

        const w        = parseFloat(widthInput.value)  || 0;
        const h        = parseFloat(heightInput.value) || 0;
        const d        = parseFloat(depthInput.value)  || 0;
        const typeKey  = typeSelect.value;
        const typeData = CONFIG.alucobond.types[typeKey];
        if (!typeData) return;

        // NEW 3D Surface Calculation:
        // Front face + Two sides + Top/Bottom + Back Face (optional)
        const frontArea = w * h;
        const sidesArea = 2 * (d * h) + 2 * (w * d);
        const backArea  = backCheck?.checked ? (w * h) : 0;
        const surface   = frontArea + sidesArea + backArea;

        const unitPrice = typeData.price;
        const baseTotal = surface * unitPrice;

        let optionsPrice = 0;
        if (installCheck?.checked) {
            optionsPrice += baseTotal * CONFIG.alucobond.options.installation.rate;
        }
        if (designCheck?.checked) {
            optionsPrice += CONFIG.alucobond.options.design.fixed;
        }

        const totalHT = baseTotal + optionsPrice;

        // Update display (syncing number inputs)
        if (widthNum)  widthNum.value  = w.toFixed(1);
        if (heightNum) heightNum.value = h.toFixed(1);
        if (depthNum)  depthNum.value  = d.toFixed(2);
        
        if (calcSurface) calcSurface.textContent = surface.toFixed(2);
        if (calcUnit)    calcUnit.textContent    = unitPrice.toLocaleString('fr-DZ');
        if (calcOptions) calcOptions.textContent = Math.round(optionsPrice).toLocaleString('fr-DZ');
        if (calcTotal)   calcTotal.textContent   = Math.round(totalHT).toLocaleString('fr-DZ');

        // Expose for devis.js
        window.currentAluConfig = {
            details: `Alucobond ${typeData.label} (${w.toFixed(1)}m × ${h.toFixed(1)}m × ${d.toFixed(2)}m)` +
                     (backCheck?.checked    ? ' + Face arrière' : '') +
                     (installCheck?.checked ? ' + Installation' : '') +
                     (designCheck?.checked  ? ' + Conception graphique' : ''),
            price: totalHT
        };

        return { w, h, d };
    }

    /* ── Combined update ── */
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
    let autoRotateAngle = 0;

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
            };

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

        // Loop for smooth "Lerp" animation
        function animateScene() {
            // Idle rotation when not interacting
            if (!isDragging) {
                targetRotY += 0.1; // Gentle constant spin
            }

            // Lerp (smooth follow)
            currentRotX += (targetRotX - currentRotX) * 0.1;
            currentRotY += (targetRotY - currentRotY) * 0.1;

            aluPanel.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
            requestAnimationFrame(animateScene);
        }
        requestAnimationFrame(animateScene);
    }

    /* ── Events ── */
    const inputs = [widthInput, heightInput, depthInput, typeSelect, installCheck, designCheck, backCheck];
    const numInputs = [widthNum, heightNum, depthNum];

    inputs.forEach(el => {
        el?.addEventListener('input', () => {
            // Slider to Number sync is handled inside updatePrice
            update();
        });
    });

    numInputs.forEach((num, idx) => {
        if (!num) return;
        num.addEventListener('input', () => {
            const range = inputs[idx];
            if (range) {
                // Number to Slider sync
                let val = parseFloat(num.value);
                const min = parseFloat(range.min);
                const max = parseFloat(range.max);
                
                // Clamp value for valid range input
                if (val < min) val = min;
                if (val > max) val = max;
                
                range.value = val;
            }
            update();
        });
        
        // Final validation on blur
        num.addEventListener('blur', () => {
             update(); 
        });
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

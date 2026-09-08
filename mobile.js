// mobile.js - Control Táctil y UI para Móviles

const MobileControls = {
    init() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        // Evitar desplazamientos o zoom indeseados al deslizar el dedo en el juego
        document.addEventListener('touchmove', (e) => {
            if (e.target === canvas) e.preventDefault();
        }, { passive: false });

        // Escuchar toques directamente en el área de juego
        canvas.addEventListener('touchstart', (e) => this.handleTouch(e, canvas), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouch(e, canvas), { passive: false });

        this.createVirtualUI();
    },

    handleTouch(e, canvas) {
        if (!isPlaying || isPaused) return;

        const rect = canvas.getBoundingClientRect();
        const scaleY = canvas.height / rect.height;

        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const touchX = touch.clientX - rect.left;
            const touchY = (touch.clientY - rect.top) * scaleY;

            // Deslizar en la mitad izquierda mueve al Jugador 1
            if (touchX < rect.width / 2) {
                paddle1.y = Math.max(0, Math.min(touchY - paddle1.height / 2, canvas.height - paddle1.height));
            } 
            // Deslizar en la mitad derecha mueve al Jugador 2 (Modo 2P)
            else if (config.mode === '2p') {
                paddle2.y = Math.max(0, Math.min(touchY - paddle2.height / 2, canvas.height - paddle2.height));
            }
        }
    },

    createVirtualUI() {
        const uiContainer = document.createElement('div');
        uiContainer.id = 'mobile-ui';
        uiContainer.innerHTML = `
            <button id="btn-skill-p1" class="mobile-btn">SKILL P1</button>
            <button id="btn-skill-p2" class="mobile-btn" style="display:none;">SKILL P2</button>
        `;
        document.body.appendChild(uiContainer);

        const style = document.createElement('style');
        style.textContent = `
            #mobile-ui {
                position: fixed;
                bottom: 15px;
                left: 0;
                width: 100%;
                display: flex;
                justify-content: space-between;
                padding: 0 20px;
                box-sizing: border-box;
                pointer-events: none;
                z-index: 999;
            }
            .mobile-btn {
                pointer-events: auto;
                background: rgba(255, 255, 255, 0.15);
                border: 2px solid rgba(255, 255, 255, 0.6);
                color: #fff;
                padding: 14px 22px;
                font-family: 'Orbitron', sans-serif;
                font-weight: bold;
                border-radius: 10px;
                backdrop-filter: blur(6px);
                user-select: none;
            }
            .mobile-btn:active {
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0.95);
            }
            @media (min-width: 1025px) {
                #mobile-ui { display: none; }
            }
        `;
        document.head.appendChild(style);

        document.getElementById('btn-skill-p1').addEventListener('touchstart', (e) => {
            e.preventDefault();
            activateSkill(1);
        });

        document.getElementById('btn-skill-p2').addEventListener('touchstart', (e) => {
            e.preventDefault();
            activateSkill(2);
        });
    }
};

window.addEventListener('DOMContentLoaded', () => MobileControls.init());
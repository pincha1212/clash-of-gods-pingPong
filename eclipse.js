// --- GESTOR DE MODO ECLIPSE (MECÁNICAS + VISUAL) ---
window.EclipseManager = {
    active: false,
    maskCanvas: null,
    maskCtx: null,
    blackHoles: [],
    lightEchoes: [],

    init: function(width, height, isActive = false) {
        this.active = isActive;
        this.blackHoles = [];
        this.lightEchoes = [];
        
        if (this.active) {
            // Creamos dos anomalías gravitacionales invisibles en el centro
            this.blackHoles.push({ x: width / 2, y: height * 0.3, force: 0.15 });
            this.blackHoles.push({ x: width / 2, y: height * 0.7, force: 0.15 });
        }
        
        if (!this.maskCanvas) {
            this.maskCanvas = document.createElement('canvas');
            this.maskCtx = this.maskCanvas.getContext('2d');
        }
        this.maskCanvas.width = width + 60;
        this.maskCanvas.height = height + 60;
    },

update: function(balls, p1, p2) {
        if (!this.active) return;

        balls.forEach(b => {
            // Guardamos la dirección hacia la que viajaba la pelota (1 = Derecha, -1 = Izquierda)
            let dirX = Math.sign(b.vx) || 1;

            this.blackHoles.forEach(bh => {
                let dx = bh.x - b.x;
                let dy = bh.y - b.y;
                let dist = Math.hypot(dx, dy);
                
                // Aplicamos atracción sutil solo cuando cruza el área central
                if (dist < 180 && dist > 15) {
                    b.vx += (dx / dist) * 0.05; // Fuerza reducida
                    b.vy += (dy / dist) * 0.09;
                }
            });

            // CONTROL ANTI-LOOP: Garantiza que la pelota mantenga siempre velocidad hacia la paleta
            let minHorizontalSpeed = (b.baseSpeed || 5) * 0.65;
            
            // Si la gravedad intenta regresarla o frenarla demasiado, forzamos el avance
            if (Math.sign(b.vx) !== dirX || Math.abs(b.vx) < minHorizontalSpeed) {
                b.vx = dirX * minHorizontalSpeed;
            }
        });

        // Desgaste de Ecos de Luz
        for (let i = this.lightEchoes.length - 1; i >= 0; i--) {
            this.lightEchoes[i].life -= 0.02;
            if (this.lightEchoes[i].life <= 0) {
                this.lightEchoes.splice(i, 1);
            }
        }

        // Luz Táctica por movimiento
        const updateTacticalLight = (p) => {
            if (!p.lightRadius) p.lightRadius = 100;
            if (Math.abs(p.y - (p.lastY || p.y)) > 2) {
                p.lightRadius = Math.max(50, p.lightRadius - 2);
            } else {
                p.lightRadius = Math.min(110, p.lightRadius + 1);
            }
            p.lastY = p.y;
        };
        updateTacticalLight(p1);
        updateTacticalLight(p2);
    },

    addLightEcho: function(x, y) {
        if (!this.active) return;
        // Genera un destello falso en un eje X aleatorio
        this.lightEchoes.push({ 
            x: 200 + Math.random() * 400, 
            y: y, 
            life: 1.0 
        });
    },

    draw: function(ctx, canvasWidth, canvasHeight, p1, p2, balls) {
        if (!this.active) return;

        const mCtx = this.maskCtx;
        const time = typeof frameCount !== 'undefined' ? frameCount : Date.now() * 0.06;
        const pUps = typeof powerUps !== 'undefined' ? powerUps : [];

        // Oscuridad base
        const darkOpacity = 0.96 + Math.sin(time * 0.05) * 0.03;
        mCtx.globalCompositeOperation = 'source-over';
        mCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
        mCtx.fillStyle = `rgba(5, 5, 12, ${darkOpacity})`;
        mCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);

        // Perforar luces
        mCtx.globalCompositeOperation = 'destination-out';
        const revealLight = (x, y, radius, intensity = 1) => {
            let mx = x + 30; let my = y + 30;
            let mask = mCtx.createRadialGradient(mx, my, radius * 0.15, mx, my, radius);
            mask.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
            mask.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.5})`);
            mask.addColorStop(1, 'rgba(255, 255, 255, 0)');
            mCtx.fillStyle = mask; 
            mCtx.beginPath(); mCtx.arc(mx, my, radius, 0, Math.PI * 2); mCtx.fill();
        };

        // Luz de la pelota (se reduce en el centro para hacerla "fantasma")
        balls.forEach(b => {
            if (b.visible) {
                let distToCenter = Math.abs(b.x - canvasWidth / 2);
                let ghostModifier = Math.max(0.2, distToCenter / (canvasWidth / 2));
                let baseLight = 110 + Math.max(0, (b.currentSpeed - b.baseSpeed) * 5);
                revealLight(b.x, b.y, baseLight * ghostModifier);
            }
        });
        
        // Luz de los jugadores (Luz Táctica)
        const getPlayerRadius = (p) => {
            let r = p.lightRadius || 100;
            if (p.timers && p.timers.skillDur > 0) r += 50;
            return r;
        };
        revealLight(p1.x + p1.width / 2, p1.y + p1.height / 2, getPlayerRadius(p1));
        revealLight(p2.x + p2.width / 2, p2.y + p2.height / 2, getPlayerRadius(p2));

        // Luz de los Ecos (Señuelos)
        this.lightEchoes.forEach(echo => {
            revealLight(echo.x, echo.y, 80 * echo.life, echo.life * 0.8);
        });

        // Dibujar máscara
        ctx.save();
        ctx.drawImage(this.maskCanvas, -30, -30);
        ctx.restore(); 
    }
};
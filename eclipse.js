// eclipse.js
// --- GESTOR DE MODO ECLIPSE (CORREGIDO) ---
window.EclipseManager = {
    active: false,
    maskCanvas: null,
    maskCtx: null,

    initCanvas: function(width, height) {
        // Creamos un canvas invisible solo para calcular la oscuridad y las luces
        if (!this.maskCanvas) {
            this.maskCanvas = document.createElement('canvas');
            this.maskCtx = this.maskCanvas.getContext('2d');
        }
        // Tamaño sincronizado con el offset de -30 de tu juego
        this.maskCanvas.width = width + 60;
        this.maskCanvas.height = height + 60;
    },

    draw: function(ctx, canvasWidth, canvasHeight, p1, p2, balls) {
        if (!this.active) return;

        this.initCanvas(canvasWidth, canvasHeight);
        const mCtx = this.maskCtx;
        const time = typeof frameCount !== 'undefined' ? frameCount : Date.now() * 0.06;
        const pUps = typeof powerUps !== 'undefined' ? powerUps : [];

        // 1. Llenamos el canvas oculto de oscuridad
        const darkOpacity = 0.94 + Math.sin(time * 0.05) * 0.04;
        mCtx.globalCompositeOperation = 'source-over';
        mCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
        mCtx.fillStyle = `rgba(5, 5, 12, ${darkOpacity})`;
        mCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);

        // 2. Perforamos las luces SOLO en el canvas oculto
        mCtx.globalCompositeOperation = 'destination-out';
        
        const revealLight = (x, y, radius, intensity = 1) => {
            let mx = x + 30; // Ajuste por el offset de -30
            let my = y + 30;
            let mask = mCtx.createRadialGradient(mx, my, radius * 0.15, mx, my, radius);
            mask.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
            mask.addColorStop(0.5, `rgba(255, 255, 255, ${intensity * 0.5})`);
            mask.addColorStop(1, 'rgba(255, 255, 255, 0)');
            mCtx.fillStyle = mask; 
            mCtx.beginPath(); mCtx.arc(mx, my, radius, 0, Math.PI * 2); mCtx.fill();
        };

        balls.forEach(b => {
            if (b.visible) {
                let speedBonus = Math.max(0, (b.currentSpeed - b.baseSpeed) * 5);
                revealLight(b.x, b.y, 110 + speedBonus + (b.isVolatile ? Math.random() * 15 : 0));
            }
        });
        
        const getPlayerRadius = (p) => {
            let r = 100;
            if (p.timers.skillDur > 0) r += 70 + Math.sin(time * 0.2) * 15;
            if (p.timers.titan > 0) r += 40;
            if (p.timers.hielo > 0) r -= 30; 
            return r;
        };
        revealLight(p1.x + p1.width / 2, p1.y + p1.height / 2, getPlayerRadius(p1));
        revealLight(p2.x + p2.width / 2, p2.y + p2.height / 2, getPlayerRadius(p2));

        pUps.forEach(pu => revealLight(pu.x, pu.y, 50 + Math.sin(time * 0.1 + pu.x) * 12, 0.75));

        // 3. Imprimimos la máscara sobre el juego principal
        ctx.save();
        ctx.drawImage(this.maskCanvas, -30, -30);

        // 4. Capa superior: Auras de Color (Efecto Aditivo)
        ctx.globalCompositeOperation = 'lighter';
        const addAura = (x, y, radius, color, alpha) => {
            let aura = ctx.createRadialGradient(x, y, 0, x, y, radius);
            aura.addColorStop(0, color);
            aura.addColorStop(1, 'transparent');
            ctx.globalAlpha = alpha;
            ctx.fillStyle = aura;
            ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        };

        balls.forEach(b => { if (b.visible) addAura(b.x, b.y, 90, b.color, 0.3); });
        if (p1.timers.skillDur > 0) addAura(p1.x, p1.y + p1.height/2, 140, p1.color, 0.45);
        if (p2.timers.skillDur > 0) addAura(p2.x, p2.y + p2.height/2, 140, p2.color, 0.45);

        ctx.restore(); 
    }
};
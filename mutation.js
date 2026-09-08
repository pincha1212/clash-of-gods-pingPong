// --- GESTOR DE MODOS AVANZADOS (MUTACIÓN, ECLIPSE) ---
window.MutationManager = {
    // Flags de activación de modos (leídos desde la UI)
    active: false,     
    eclipse: false,    
    
    // Estados internos de Mutación
    toxicCharge: 0,
    spores: [],
    
    // Estados para habilidades de Dioses avanzados (Inari/Amaterasu)
    ballHolograms: [],
    blindTimer: 0,

    init: function() {
        this.spores = [];
        this.toxicCharge = 0;
        this.ballHolograms = [];
        this.blindTimer = 0;
    },

    trigger: function(playerNum, p1, p2, balls, canvasWidth, canvasHeight, showMessageCb) {
        if (this.toxicCharge < 100) return false; // Requiere carga máxima

        let mutationType = Math.floor(Math.random() * 3);
        let opp = playerNum === 1 ? p2 : p1;
        let caster = playerNum === 1 ? p1 : p2;

        if (mutationType === 0) {
            // 1. Necrosis: -40% velocidad rival por 180 frames (3 seg a 60fps)
            opp.timers.necrosis = 180;
            showMessageCb('¡NECROSIS!', '#0f0', 90, caster.x < canvasWidth / 2 ? 150 : canvasWidth - 150, caster.y);
            
        } else if (mutationType === 1) {
            // 2. Esporas Corrosivas: Genera 3 zonas de gas en el campo
            for (let i = 0; i < 3; i++) {
                this.spores.push({
                    x: canvasWidth / 4 + Math.random() * (canvasWidth / 2),
                    y: Math.random() * canvasHeight,
                    radius: 40 + Math.random() * 20,
                    life: 300 // 5 segundos
                });
            }
            showMessageCb('¡ESPORAS!', '#8f0', 90, caster.x < canvasWidth / 2 ? 150 : canvasWidth - 150, caster.y);

        } else if (mutationType === 2) {
            // 3. Ácido Volátil en las pelotas activas
            balls.forEach(b => {
                b.isVolatile = true;
                b.volatileTimer = 240; // 4 segundos de locura
            });
            showMessageCb('¡ÁCIDO VOLÁTIL!', '#cf0', 90, caster.x < canvasWidth / 2 ? 150 : canvasWidth - 150, caster.y);
        }
        
        this.toxicCharge = 0; // Consumimos la carga
        return true; 
    },

    spawnHolograms: function(baseBall) {
        for (let i = 0; i < 5; i++) {
            let angle = (Math.random() - 0.5) * Math.PI / 1.5;
            let speed = baseBall.currentSpeed * (0.7 + Math.random() * 0.5);
            this.ballHolograms.push({
                x: baseBall.x, y: baseBall.y,
                vx: Math.cos(angle) * speed * Math.sign(baseBall.vx),
                vy: Math.sin(angle) * speed,
                radius: baseBall.radius,
                color: '#ff69b4',
                life: 120 + Math.random() * 60
            });
        }
    },

    update: function(balls, frameCount, canvasWidth, canvasHeight) {
        // Limpieza de memoria (Garbage collection)
        this.spores = this.spores.filter(s => s.life > 0);
        this.ballHolograms = this.ballHolograms.filter(h => h.life > 0);
        
        if (this.blindTimer > 0) this.blindTimer--;

        // Física de Hologramas (Inari)
        this.ballHolograms.forEach(h => {
            h.x += h.vx; h.y += h.vy; h.life--;
            if (h.y - h.radius < 0 || h.y + h.radius > canvasHeight) h.vy *= -1; 
        });

        // Física del Ácido Volátil y Esporas
        balls.forEach(b => {
            if (b.volatileTimer > 0) {
                b.volatileTimer--;
                b.radius = 10 + Math.sin(frameCount * 0.2) * 5; 
                b.visible = (frameCount % 10) > 3; 
                
                if (b.volatileTimer <= 0) {
                    b.radius = 10;
                    b.visible = true;
                    b.isVolatile = false;
                }
            }

            // Colisión con esporas (Perturbación del ángulo)
            this.spores.forEach(s => {
                s.life--;
                let dist = Math.hypot(b.x - s.x, b.y - s.y);
                if (dist < b.radius + s.radius) {
                    b.vy += (Math.random() - 0.5) * 1.5; 
                }
            });
        });
    },

    drawSpores: function(ctx) {
        this.spores.forEach(s => {
            let alpha = Math.min(1, s.life / 60) * 0.4;
            let sporeGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
            sporeGlow.addColorStop(0, `rgba(50, 255, 50, ${alpha})`);
            sporeGlow.addColorStop(1, 'rgba(0, 20, 0, 0)');
            
            ctx.fillStyle = sporeGlow;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    },

    drawHolograms: function(ctx) {
        this.ballHolograms.forEach(h => {
            ctx.globalAlpha = Math.min(1, h.life / 60) * 0.5;
            ctx.fillStyle = h.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = h.color;
            ctx.beginPath();
            ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    },

    drawBlind: function(ctx, canvasWidth, canvasHeight) {
        if (this.blindTimer > 0) {
            let alpha = Math.min(1, this.blindTimer / 30);
            ctx.fillStyle = `rgba(255, 250, 240, ${alpha * 0.95})`; 
            ctx.fillRect(-50, -50, canvasWidth + 100, canvasHeight + 100);
        }
    },

    drawEclipse: function(ctx, canvasWidth, canvasHeight, p1, p2, balls) {
        if (!this.eclipse) return;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(-30, -30, canvasWidth + 60, canvasHeight + 60);

        // Sistema de máscaras para luces circulares optimizado
        ctx.globalCompositeOperation = 'destination-out';
        
        const revealLight = (x, y, radius) => {
            let mask = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
            mask.addColorStop(0, 'rgba(255, 255, 255, 1)');
            mask.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = mask; 
            ctx.beginPath(); 
            ctx.arc(x, y, radius, 0, Math.PI * 2); 
            ctx.fill();
        };

        balls.forEach(b => {
            if (b.visible) revealLight(b.x, b.y, 120);
        });
        revealLight(p1.x, p1.y + p1.height / 2, 100);
        revealLight(p2.x, p2.y + p2.height / 2, 100);
        
        ctx.restore(); 
    }
};
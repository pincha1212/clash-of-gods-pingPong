// effects.js
const EffectsManager = {
    particles: [],
    speedLines: [],
    ambientParticles: [],
    shakeFrames: 0,
    shakeIntensity: 0,

    // --- TEMBLOR DE PANTALLA ---
    triggerShake(intensity = 10) {
        this.shakeFrames = intensity;
        this.shakeIntensity = intensity;
    },

    applyShake(ctx) {
        if (this.shakeFrames > 0) {
            const rx = (Math.random() - 0.5) * this.shakeIntensity;
            const ry = (Math.random() - 0.5) * this.shakeIntensity;
            ctx.translate(rx, ry);
            this.shakeFrames--;
        }
    },

    // --- LÍNEAS DE VELOCIDAD ---
    addSpeedLines(x, y, color, amount = 8) {
        for (let i = 0; i < amount; i++) {
            this.speedLines.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                length: Math.random() * 18 + 10,
                life: 1,
                decay: Math.random() * 0.04 + 0.025,
                color
            });
        }
        if (this.speedLines.length > 120) {
            this.speedLines.splice(0, this.speedLines.length - 120);
        }
    },

    drawSpeedLines(ctx) {
        for (let i = this.speedLines.length - 1; i >= 0; i--) {
            let line = this.speedLines[i];
            line.x += line.vx; 
            line.y += line.vy; 
            line.life -= line.decay;

            if (line.life <= 0) {
                this.speedLines.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = line.life * 0.7;
            ctx.strokeStyle = line.color;
            ctx.lineWidth = Math.max(1, line.life * 2.4);
            ctx.shadowBlur = 8;
            ctx.shadowColor = line.color;
            ctx.beginPath();
            ctx.moveTo(line.x, line.y);
            ctx.lineTo(line.x - line.vx * line.length * 0.18, line.y - line.vy * line.length * 0.18);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    },

    // --- PARTÍCULAS AMBIENTALES ---
    initAmbientParticles(width = 800, height = 500, amount = 70) {
        this.ambientParticles = Array.from({ length: amount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            drift: (Math.random() - 0.5) * 0.25,
            rise: Math.random() * 0.25 + 0.05,
            alpha: Math.random() * 0.45 + 0.08,
            phase: Math.random() * Math.PI * 2
        }));
    },

    drawAmbientParticles(ctx, tension = 0) {
        this.ambientParticles.forEach(p => {
            p.phase += 0.015;
            p.x += p.drift + Math.sin(p.phase) * 0.12;
            p.y -= p.rise;
            if (p.y < -5) p.y = 505;
            if (p.x < -5) p.x = 805;
            if (p.x > 805) p.x = -5;

            ctx.globalAlpha = p.alpha * (0.75 + tension * 0.4);
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 + tension * 0.4), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    },

    // --- PARTÍCULAS DE IMPACTO Y EXPLOSIONES ---
    createExplosion(x, y, color, amount = 15) {
        for (let i = 0; i < amount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                size: Math.random() * 4 + 2,
                life: 1,
                decay: Math.random() * 0.03 + 0.02
            });
        }
    },

    updateAndDrawParticles(ctx) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx; 
            p.y += p.vy; 
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    },

    clearAll() {
        this.particles = [];
        this.speedLines = [];
    }
};
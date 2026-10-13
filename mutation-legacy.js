// REFERENCIA LEGADA: motor visual y mecánico de Mutación.
// NO IMPORTAR NI CARGAR en el motor actual; conservar solo para recuperar piezas en etapas posteriores.

const MutationManager = {
    active: false,
    toxicCharge: 0,
    matchTime: 0,
    tablePhase: 'NORMAL',
    playerLevel: 1,
    activeMutations: [],
    activeSynergies: [],
    triggeredThresholds: { 25: false, 50: false, 75: false },
    spores: [],
    holograms: [],
    blindTimer: 0,

    poisonThresholds: {
        25: { slowMult: 0.85, msg: '¡Rival Ralentizado!' },
        50: { distortion: true, msg: '¡Fase 1: División Celular!' },
        75: { invertControls: true, msg: '¡Controles Caóticos!' }
    },

    init(isMutationMode = false) {
        this.active = isMutationMode;
        this.toxicCharge = 0;
        this.matchTime = 0;
        this.tablePhase = 'NORMAL';
        this.playerLevel = 1;
        this.spores = [];
        this.holograms = [];
        this.blindTimer = 0;
        this.triggeredThresholds = { 25: false, 50: false, 75: false };

        // Generar enjambre de esporas en el ambiente
        if (this.active) {
            for (let i = 0; i < 35; i++) {
                this.spores.push({
                    x: Math.random() * 800,
                    y: Math.random() * 500,
                    radius: Math.random() * 2.5 + 1,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: -Math.random() * 0.7 - 0.2,
                    alpha: Math.random() * 0.5 + 0.2
                });
            }
        }
    },

    update(dt, paddle2, ball) {
        if (!this.active) return;
        this.matchTime += dt;

        // Ralentizado pasivo al 25%
        if (this.toxicCharge >= 25 && paddle2) {
            paddle2.speed = paddle2.baseSpeed * 0.85;
        }

        // Movimiento de esporas ambientales
        this.spores.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            if (s.y < 0) s.y = 500;
            if (s.x < 0) s.x = 800;
            if (s.x > 800) s.x = 0;
        });

        // Física de holograma tóxico
        for (let i = this.holograms.length - 1; i >= 0; i--) {
            let h = this.holograms[i];
            h.x += h.vx;
            h.y += h.vy;
            h.life -= dt;
            if (h.life <= 0) this.holograms.splice(i, 1);
        }

        if (this.blindTimer > 0) this.blindTimer -= dt;
    },

    addPoison(amount, paddle2, showMessage) {
        if (!this.active || this.toxicCharge >= 100) return;

        this.toxicCharge += amount;

        if (this.toxicCharge >= 100) {
            this.toxicCharge = 100;
            if (showMessage) showMessage('¡MUTACIÓN MÁXIMA: NECROSIS!', '#adff2f', 120);
            this.evolveRival(paddle2, showMessage);
            return;
        }

        [25, 50, 75].forEach(threshold => {
            if (this.toxicCharge >= threshold && !this.triggeredThresholds[threshold]) {
                this.triggeredThresholds[threshold] = true;
                if (showMessage) showMessage(this.poisonThresholds[threshold].msg, '#adff2f', 90);
            }
        });
    },

    evolveRival(paddle2, showMessage) {
        if (paddle2) {
            paddle2.baseSpeed += 2.5;
            paddle2.height *= 1.2;
        }
    },

    resetRound(paddle1, paddle2) {
        if (!this.active) return;
        this.toxicCharge = 0;
        this.holograms = [];
        this.triggeredThresholds = { 25: false, 50: false, 75: false };
        if (paddle1) paddle1.height = paddle1.baseHeight;
        if (paddle2) paddle2.height = paddle2.baseHeight;
    },

    handleCollision(ball, pCol, dir, extraBalls, showMessage, paddle1, paddle2) {
        if (!this.active) return { hitstopMod: 0, shakeMod: 0 };

        let corruption = this.toxicCharge / 100;
        let hitstopMod = 0;
        let shakeMod = 0;
        let triggerFlash = false;

        // FASE 1 (A partir del 50%): DIVISIÓN CELULAR
        if (corruption > 0.5 && corruption < 1 && Math.random() < 0.35 && extraBalls.length < 3) {
            extraBalls.push({
                x: ball.x, y: ball.y, radius: ball.radius * 0.8,
                vx: -ball.vx * 0.7, vy: (Math.random() - 0.5) * 12,
                baseSpeed: ball.baseSpeed, currentSpeed: ball.currentSpeed,
                maxSpeed: ball.maxSpeed, color: '#adff2f', glowSize: 10,
                lastHitBy: ball.lastHitBy, trail: [], isVolatile: true, visible: true, volatileTimer: 0
            });
            if (showMessage) showMessage("¡DIVISIÓN!", "#adff2f", 40, ball.x, ball.y - 30);
        }

        // FASE 2 (Al 100%): ESTALLIDO TÓXICO AUTOMÁTICO
        if (corruption >= 1) {
            // 1. Efectos físicos (Empuje y Necrosis)
            let pushForce = 35;
            if (dir === 1) {
                paddle1.x -= pushForce; setTimeout(() => paddle1.x += pushForce, 150);
            } else {
                paddle2.x += pushForce; setTimeout(() => paddle2.x -= pushForce, 150);
            }
            pCol.height = Math.max(30, pCol.height - 8);
            shakeMod = 25;
            triggerFlash = true;

            // 2. Disparo automático de Hologramas (Inyección Tóxica)
            this.spawnHolograms(ball);
            if (showMessage) showMessage('¡ESTALLIDO TÓXICO!', '#adff2f', 80);

            // 3. Reinicio del ciclo
            this.toxicCharge = 0;
            this.triggeredThresholds = { 25: false, 50: false, 75: false };
        }

        return { hitstopMod, shakeMod, triggerFlash };
    },

    trigger(playerNum, paddle1, paddle2, balls, width, height, showMessage) {
        if (!this.active || this.toxicCharge < 100) return false;

        this.toxicCharge = 0;
        this.spawnHolograms(balls[0]);
        if (showMessage) showMessage('¡INYECCIÓN TÓXICA!', '#adff2f', 90);
        return true;
    },

    spawnHolograms(ball) {
        if (!ball) return;
        for (let i = 0; i < 3; i++) {
            this.holograms.push({
                x: ball.x,
                y: ball.y,
                vx: ball.vx * (0.8 + Math.random() * 0.4),
                vy: ball.vy + (Math.random() - 0.5) * 8,
                radius: ball.radius,
                life: 2.0
            });
        }
    },

    drawSpores(ctx) {
        if (!this.active) return;
        let intensity = this.toxicCharge / 100;

        ctx.save();
        this.spores.forEach(s => {
            ctx.fillStyle = '#adff2f';
            ctx.globalAlpha = s.alpha * (0.2 + intensity * 0.8);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius * (1 + intensity * 0.8), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    },

    drawHolograms(ctx) {
        if (!this.active || this.holograms.length === 0) return;
        ctx.save();
        this.holograms.forEach(h => {
            ctx.fillStyle = '#00ffaa';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffaa';
            ctx.globalAlpha = Math.min(1, h.life * 0.5);
            ctx.beginPath();
            ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    },

    drawBlind(ctx, width, height) {
        if (!this.active) return;
        let corruption = this.toxicCharge / 100;
        if (corruption <= 0.15 && this.blindTimer <= 0) return;

        ctx.save();
        let alpha = Math.min(0.5, corruption * 0.45) + (this.blindTimer > 0 ? 0.3 : 0);
        let gradient = ctx.createRadialGradient(width / 2, height / 2, width * 0.25, width / 2, height / 2, width * 0.65);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, `rgba(15, 45, 5, ${alpha})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
};

window.MutationManager = MutationManager;
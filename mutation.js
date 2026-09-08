// mutation.js - Motor Roguelite de Mutación, Corrupción y Sinergias

const MutationManager = {
    active: false,
    toxicCharge: 0,        
    matchTime: 0,          
    tablePhase: 'NORMAL',  
    playerLevel: 1,        
    activeMutations: [],   
    activeSynergies: [],   
    triggeredThresholds: { 25: false, 50: false, 75: false },

    poisonThresholds: {
        25: { slowMult: 0.85, msg: '¡Rival Ralentizado!' },
        50: { distortion: true, msg: '¡Fase 1: División Celular!' },
        75: { invertControls: true, msg: '¡Controles Caóticos!' }
    },

    corruptionTimeline: [
        { time: 0, phase: 'NORMAL' },
        { time: 60, phase: 'CONTAMINADA' },
        { time: 120, phase: 'MUTADA' },
        { time: 180, phase: 'CORROMPIDA' }
    ],

    init(isMutationMode = false) {
        this.active = isMutationMode;
        this.toxicCharge = 0;
        this.matchTime = 0;
        this.tablePhase = 'NORMAL';
        this.playerLevel = 1;
        this.activeMutations = [];
        this.activeSynergies = [];
        this.triggeredThresholds = { 25: false, 50: false, 75: false };
    },

    update(dt, paddle2, ball) {
        if (!this.active) return;
        this.matchTime += dt;
        // La fase pasiva (ralentizar un poco al enemigo en el 25%)
        if (this.toxicCharge >= 25 && paddle2) {
            paddle2.speed = paddle2.baseSpeed * 0.85;
        }
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
        paddle2.baseSpeed += 2.5;
        paddle2.height *= 1.2;
    },

    resetRound(paddle1, paddle2) {
        if (!this.active) return;
        this.toxicCharge = 0;
        this.triggeredThresholds = { 25: false, 50: false, 75: false };
        if (paddle1) paddle1.height = paddle1.baseHeight;
        if (paddle2) paddle2.height = paddle2.baseHeight;
    },

    handleCollision(ball, pCol, dir, extraBalls, showMessage, paddle1, paddle2) {
        if (!this.active) return { hitstopMod: 0, shakeMod: 0 };

        let corruption = this.toxicCharge / 100;
        let hitstopMod = 0;
        let shakeMod = 0;

        // FASE 1 (A partir del 50%): DIVISIÓN CELULAR
        if (corruption > 0.5 && Math.random() < 0.3 && extraBalls.length < 3) {
            extraBalls.push({ 
                x: ball.x, y: ball.y, radius: ball.radius * 0.8, 
                vx: -ball.vx * 0.7, vy: (Math.random() - 0.5) * 12, 
                baseSpeed: ball.baseSpeed, currentSpeed: ball.currentSpeed, 
                maxSpeed: ball.maxSpeed, color: '#adff2f', glowSize: 10, 
                lastHitBy: ball.lastHitBy, trail: [], isVolatile: true, visible: true, volatileTimer: 0 
            });
            if (showMessage) showMessage("¡DIVISIÓN!", "#adff2f", 40, ball.x, ball.y - 30);
        }

        // FASE 2 (Al 100%): NECROSIS Y PESO MUERTO
        if (corruption >= 1) {
            let pushForce = 35;
            if (dir === 1) { 
                paddle1.x -= pushForce; setTimeout(() => paddle1.x += pushForce, 150);
            } else { 
                paddle2.x += pushForce; setTimeout(() => paddle2.x -= pushForce, 150);
            }
            pCol.height = Math.max(30, pCol.height - 8); 
            hitstopMod = 14; 
            shakeMod = 25;
        }

        return { hitstopMod, shakeMod, triggerFlash: corruption >= 1 };
    },

    // Métodos de seguridad vacíos para evitar errores de referencia
    trigger() { return false; },
    spawnHolograms() {},
    drawSpores(ctx) {},
    drawHolograms(ctx) {},
    drawBlind(ctx, width, height) {}
};

window.MutationManager = MutationManager;
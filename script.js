// script_2.js
// --- ESTADO DEL JUEGO ---
let isPlaying = false; let isPaused = false;
let hitstopTimer = 0;
let score1 = 0; let score2 = 0; let rallyCount = 0;
let dominance = 50; let frameCount = 0; let animationId;

let camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
let flashAlpha = 0; let flashColor = '#fff'; let vignetteStrength = 0.15;
let combatPulse = 0; let arenaTime = 0;
let countdownFrames = 0; let countdownValue = 0; let countdownRunning = false;
let tension = 0; let extraBalls = []; let floatTexts = [];

// --- IMMERSIVE FEEDBACK ---
function triggerFlash(color = '#fff', alpha = 0.35) { flashColor = color; flashAlpha = Math.max(flashAlpha, alpha); }

function kickCamera(power = 8, zoom = 0.02, xBias = 0, yBias = 0) {
    camera.targetX += (Math.random() - 0.5) * power + xBias;
    camera.targetY += (Math.random() - 0.5) * power + yBias;
    camera.targetZoom = Math.max(0.94, Math.min(1.08, camera.targetZoom + zoom));
}

function updateImmersiveEffects() {
    arenaTime += 0.016; combatPulse *= 0.93;
    tension = Math.min(1, rallyCount / 18 + (ball.currentSpeed - ball.baseSpeed) / 22);

    camera.targetX *= 0.86; camera.targetY *= 0.86; camera.targetZoom += (1 - camera.targetZoom) * 0.08;
    camera.x += (camera.targetX - camera.x) * 0.22; camera.y += (camera.targetY - camera.y) * 0.22;
    camera.zoom += (camera.targetZoom - camera.zoom) * 0.16;

    flashAlpha *= 0.86; if (flashAlpha < 0.01) flashAlpha = 0;
}

function resetImmersiveEffects() {
    camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
    flashAlpha = 0; combatPulse = 0; tension = 0;
}

// --- GAME ENTITIES ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
EffectsManager.initAmbientParticles(canvas.width, canvas.height);

let paddle1 = { x: 20, y: 200, width: 12, height: 100, baseHeight: 100, speed: 8, baseSpeed: 8, color: '#fff', shield: false, trail: [], timers: { titan: 0, hielo: 0, ghost: 0, invert: 0, skillCd: 0, skillDur: 0, necrosis: 0 } };
let paddle2 = { x: 768, y: 200, width: 12, height: 100, baseHeight: 100, speed: 6, baseSpeed: 6, color: '#fff', shield: false, trail: [], timers: { titan: 0, hielo: 0, ghost: 0, invert: 0, skillCd: 0, skillDur: 0, necrosis: 0 } };
let ball = { x: 400, y: 250, radius: 10, vx: 0, vy: 0, baseSpeed: 7, currentSpeed: 7, maxSpeed: 22, color: '#fff', glowSize: 15, lastHitBy: null, trail: [], isVolatile: false, visible: true, volatileTimer: 0 };
let powerUps = [];

function showMessage(text, color, duration = 60, x = canvas.width / 2, y = canvas.height / 4) {
    let isSpam = floatTexts.some(ft => ft.text === text && ft.life > duration - 15);
    if (isSpam) return;

    floatTexts.push({ text: text, color: color, x: x, y: y, life: duration, maxLife: duration });
}

function createImpact(x, y, color, intensity = 1) {
    EffectsManager.createExplosion(x, y, color, Math.min(Math.floor(20 * intensity), 30));
    EffectsManager.triggerShake(10 * intensity);
    kickCamera(6 + intensity * 5, 0.008 * intensity);
    triggerFlash(color, Math.min(0.48, 0.12 + intensity * 0.08));
    combatPulse = Math.min(1, combatPulse + intensity * 0.2);
}

// --- GAME CONFIG & START ---

// Cambiar Chip seleccionado
function selectChip(groupId, element) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');

    // Ocultar/mostrar dificultad si es 2P
    if (groupId === 'group-players') {
        const aiContainer = document.getElementById('ai-diff-container');
        if (aiContainer) {
            aiContainer.style.display = element.dataset.value === '2p' ? 'none' : 'block';
        }
    }
}

// Obtener valor activo de un grupo de Chips
function getChipValue(groupId, defaultValue = '') {
    const active = document.querySelector(`#${groupId} .chip.active`);
    return active ? active.dataset.value : defaultValue;
}

// Lógica de Presets Rápidos
function applyPreset(type) {
    if (type === 'competitive') {
        document.getElementById('cfg-god-skills').checked = false;
        document.getElementById('cfg-powerups').checked = false;
        document.getElementById('cfg-score').value = 7;
        selectChip('group-arena', document.querySelector('#group-arena [data-value="normal"]'));
        selectChip('group-ball-speed', document.querySelector('#group-ball-speed [data-value="11"]'));
    } else if (type === 'chaos') {
        document.getElementById('cfg-god-skills').checked = true;
        document.getElementById('cfg-powerups').checked = true;
        document.getElementById('cfg-score').value = 10;
        selectChip('group-skill-cd', document.querySelector('#group-skill-cd [data-value="0.5"]'));
        selectChip('group-arena', document.querySelector('#group-arena [data-value="mutation"]'));
    } else if (type === 'eclipse') {
        document.getElementById('cfg-god-skills').checked = true;
        document.getElementById('cfg-powerups').checked = true;
        selectChip('group-arena', document.querySelector('#group-arena [data-value="eclipse"]'));
    } else if (type === 'classic') {
        document.getElementById('cfg-god-skills').checked = false;
        document.getElementById('cfg-powerups').checked = false;
        document.getElementById('cfg-score').value = 5;
        selectChip('group-arena', document.querySelector('#group-arena [data-value="normal"]'));
        selectChip('group-ball-speed', document.querySelector('#group-ball-speed [data-value="8"]'));
    }
    showMessage(`¡Preset ${type.toUpperCase()} aplicado!`, '#00ffcc');
}

// --- LECTURA COMPLETA DE CONFIGURACIÓN ---
function applyConfig() {
    const c1 = GODS[config.p1];
    const c2 = GODS[config.p2];

    // Lectura de inputs y chips
    config.winScore = parseInt(document.getElementById('cfg-score').value) || 5;
    config.mode = getChipValue('group-players', '1p'); // '1p' o '2p'
    config.difficulty = getChipValue('group-diff', 'normal');
    config.arenaMode = getChipValue('group-arena', 'normal'); // 'normal', 'eclipse', 'mutation'

    config.godSkills = document.getElementById('cfg-god-skills').checked;
    config.skillCdMult = parseFloat(getChipValue('group-skill-cd', '1'));
    config.powerUps = document.getElementById('cfg-powerups').checked;

    let baseBallSpeed = parseFloat(getChipValue('group-ball-speed', '8'));
    ball.baseSpeed = baseBallSpeed;
    ball.currentSpeed = baseBallSpeed;

    // 1. Resetear y activar gestores según el modo de arena
    if (window.MutationManager) window.MutationManager.active = false;
    if (window.EclipseManager) window.EclipseManager.active = false;

    if (config.arenaMode === 'mutation' && window.MutationManager) {
        window.MutationManager.init(true);
    } else if (config.arenaMode === 'eclipse' && window.EclipseManager) {
        window.EclipseManager.init(canvas.width, canvas.height, true);
    }

    // 2. Parámetros de personajes
    paddle1.color = c1.color;
    paddle1.baseHeight = c1.height;
    paddle1.baseSpeed = c1.speed;
    paddle1.speed = c1.speed;

    paddle2.color = c2.color;
    paddle2.baseHeight = c2.height;

    let diffMult = config.difficulty === 'easy' ? 0.7 : (config.difficulty === 'hard' ? 1.3 : 1);
    paddle2.baseSpeed = c2.speed * diffMult;
    paddle2.speed = paddle2.baseSpeed;

    document.documentElement.style.setProperty('--c-p1', c1.color);
    document.documentElement.style.setProperty('--c-p2', c2.color);

    // 3. Reiniciar estado del juego
    score1 = 0; score2 = 0; dominance = 50; powerUps = [];
    EffectsManager.clearAll();
    resetImmersiveEffects();
    extraBalls = []; floatTexts = [];

    document.getElementById('score1').innerText = 0;
    document.getElementById('score2').innerText = 0;
    updateDominance();
}
function startGame() {
    applyConfig(); navTo('screen-game'); isPlaying = true; countdownRunning = true; countdownFrames = 150; countdownValue = 3;
    launchBall(Math.random() > 0.5 ? 1 : -1); ball.vx = 0; ball.vy = 0; playSound('countdown', 3);
    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function endGame() {
    isPlaying = false; countdownRunning = false; camera.targetZoom = 1.06; triggerFlash('#fff', 0.4); kickCamera(12, 0.035);
    let winner = score1 >= config.winScore ? GODS[config.p1] : (score2 >= config.winScore ? GODS[config.p2] : null);
    navTo('screen-result');

    if (winner) {
        playSound('victory', 1.2);
        document.getElementById('result-title').innerText = `${winner.icon} ${winner.name} GANA!`;
        document.getElementById('result-title').style.color = winner.color;
        document.getElementById('result-desc').innerText = `Dominio absoluto en la arena.`;

        let diff = Math.abs(score1 - score2);
        if (diff > records.maxDiff) records.maxDiff = diff;
        if (rallyCount > records.maxRally) records.maxRally = rallyCount;
        records.wins[winner.id] = (records.wins[winner.id] || 0) + 1;
        localStorage.setItem('clashGodsRec', JSON.stringify(records));
    } else {
        document.getElementById('result-title').innerText = 'RENDICIÓN';
        document.getElementById('result-title').style.color = '#fff';
        document.getElementById('result-desc').innerText = 'Has abandonado la batalla.';
    }
}

function launchBall(direction) {
    ball.x = canvas.width / 2; ball.y = canvas.height / 2; ball.currentSpeed = ball.baseSpeed; ball.color = '#fff';
    ball.glowSize = 15; ball.trail = []; ball.isVolatile = false; ball.visible = true; ball.volatileTimer = 0;

    let angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
    ball.vx = direction * ball.currentSpeed * Math.cos(angle); ball.vy = ball.currentSpeed * Math.sin(angle);
    rallyCount = 0; ball.lastHitBy = null; extraBalls = [];

    if (window.MutationManager && window.MutationManager.active) {
        window.MutationManager.resetRound(paddle1, paddle2);
    }
    let resetTimers = () => ({ titan: 0, hielo: 0, ghost: 0, invert: 0, skillCd: 0, skillDur: 0, necrosis: 0 });
    paddle1.timers = resetTimers(); paddle2.timers = resetTimers();
    paddle1.shield = false; paddle2.shield = false; paddle2.speed = paddle2.baseSpeed;

    kickCamera(4, 0.004); triggerFlash('#fff', 0.1);
}

function updateDominance() {
    let diff = score1 - score2; dominance = Math.max(10, Math.min(50 + (diff * (40 / config.winScore)), 90));
    document.documentElement.style.setProperty('--dom-p1', `${dominance}%`); document.documentElement.style.setProperty('--dom-p2', `${100 - dominance}%`);
}

function scorePoint(player) {
    const scoringColor = player === 1 ? paddle1.color : paddle2.color;
    playSound('score'); createImpact(canvas.width / 2, canvas.height / 2, scoringColor, 2.4);
    kickCamera(14, 0.025, player === 1 ? -2 : 2); triggerFlash(scoringColor, 0.3); combatPulse = 1;

    if (rallyCount > records.maxRally) { records.maxRally = rallyCount; showMessage('¡NUEVO RÉCORD RALLY!', '#ff0'); }

    let el = document.getElementById(player === 1 ? 'score1' : 'score2');
    player === 1 ? score1++ : score2++;
    el.innerText = player === 1 ? score1 : score2;
    el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');

    updateDominance();
    if (score1 >= config.winScore || score2 >= config.winScore) endGame(); else launchBall(player === 1 ? -1 : 1);
}

// --- SKILLS ---
function activateSkill(playerNum) {
    if (isPaused || !config.godSkills) return;

    let p = playerNum === 1 ? paddle1 : paddle2;
    let god = GODS[playerNum === 1 ? config.p1 : config.p2];

    if (p.timers.skillCd > 0 || p.timers.skillDur > 0) return;

    let finalCd = god.skill.cd * (config.skillCdMult || 1);

    if (window.MutationManager && window.MutationManager.active) {
        let triggered = window.MutationManager.trigger(playerNum, paddle1, paddle2, [ball, ...extraBalls], canvas.width, canvas.height, showMessage);
        if (triggered) {
            p.timers.skillCd = finalCd;
            playSound('skill', 1.5);
            triggerFlash('#0f0', 0.2);
            kickCamera(12, 0.02, p.x < canvas.width / 2 ? -2 : 2);
            return;
        }
    }

    p.timers.skillCd = finalCd;
    let duration = (god.id === 'fujin') ? 400 : god.skill.dur;
    p.timers.skillDur = duration;

    playSound('skill', 1.5);
    triggerFlash(god.color, 0.18);
    kickCamera(12, 0.02, p.x < canvas.width / 2 ? -2 : 2);
    EffectsManager.addSpeedLines(p.x < canvas.width / 2 ? 90 : canvas.width - 90, p.y + p.height / 2, god.color, 18);
    showMessage(`¡${god.skill.name}!`, god.color, 90, p.x < canvas.width / 2 ? 150 : canvas.width - 150, p.y);

    if (god.id === 'raijin') {
        let dir = playerNum === 1 ? 1 : -1;
        ball.vx = dir * ball.maxSpeed;
        ball.vy = (Math.random() - 0.5) * 8;
        EffectsManager.createExplosion(ball.x, ball.y, '#ffff00', 20);
        kickCamera(10, 0.02);
    } else if (god.id === 'fujin') {
        // Ventisca: efecto de congelación inicial
        EffectsManager.createExplosion(ball.x, ball.y, '#aaddff', 60);
        kickCamera(12, 0.03);
        // Cambiamos el color de la pelota a tono hielo
        ball.color = '#aaddff';
        // Añadimos partículas de hielo alrededor
        for (let i = 0; i < 30; i++) {
            let angle = Math.random() * Math.PI * 2;
            let radius = 40 + Math.random() * 60;
            let x = ball.x + Math.cos(angle) * radius;
            let y = ball.y + Math.sin(angle) * radius;
            EffectsManager.createExplosion(x, y, '#88ddff', 2);
        }
        // Mensaje más épico
        showMessage('¡VENTISCA!', '#aaddff', 90, p.x < canvas.width / 2 ? 150 : canvas.width - 150, p.y);

        // Estallido de presión baja (ojo del huracán)
        EffectsManager.createExplosion(ball.x, ball.y, '#ffffff', 50);
        kickCamera(12, 0.03);
        ball.vx *= 0.1;
        ball.vy *= 0.1;
        ball.color = '#00ffff';  // cian brillante
        ball.glowSize = 30;
        showMessage('¡TORNADO!', '#00ffff', 60);
    } else if (god.id === 'amaterasu') {
        let opp = playerNum === 1 ? paddle2 : paddle1;
        opp.timers.invert = god.skill.dur;
        if (window.MutationManager && window.MutationManager.active) {
            window.MutationManager.blindTimer = god.skill.dur;
        }
    } else if (god.id === 'inari') {
        if (window.MutationManager && window.MutationManager.active) {
            window.MutationManager.spawnHolograms(ball);
        } else {
            extraBalls.push({
                x: ball.x, y: ball.y, radius: ball.radius, vx: -ball.vx, vy: -ball.vy, baseSpeed: ball.baseSpeed, currentSpeed: ball.currentSpeed, maxSpeed: ball.maxSpeed, color: god.color, glowSize: 20, lastHitBy: p, trail: [], isVolatile: false, visible: true, volatileTimer: 0
            });
            showMessage('¡SEÑUELO LUNAR!', god.color);
        }
    }
}

function predictBallY(b, targetX) {
    let simX = b.x; let simY = b.y; let simVx = b.vx; let simVy = b.vy;
    if ((simVx > 0 && simX > targetX) || (simVx < 0 && simX < targetX)) return canvas.height / 2;
    let steps = 0;
    while ((simVx > 0 && simX < targetX) || (simVx < 0 && simX > targetX)) {
        let timeToX = Math.abs((targetX - simX) / simVx);
        let timeToY = simVy > 0 ? (canvas.height - simY) / simVy : -simY / simVy;
        if (timeToY < timeToX) {
            simX += simVx * timeToY; simY += simVy * timeToY; simVy = -simVy;
        } else {
            simY += simVy * timeToX; break;
        }
        if (steps++ > 20) break;
    }
    return simY;
}

// --- MAIN UPDATE ---
function update() {
    if (!isPlaying || isPaused) return;

    if (hitstopTimer > 0) {
        hitstopTimer--;
        return;
    }

    frameCount++;
    updateImmersiveEffects();

    if (countdownRunning) {
        countdownFrames--;
        const nextValue = Math.ceil(countdownFrames / 50);
        if (nextValue !== countdownValue && countdownFrames > 0) {
            countdownValue = nextValue;
            playSound('countdown', countdownValue);
            triggerFlash('#fff', 0.12);
        }
        if (countdownFrames <= 0) {
            countdownRunning = false;
            let angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
            ball.vx = (Math.random() > 0.5 ? 1 : -1) * ball.baseSpeed * Math.cos(angle);
            ball.vy = ball.baseSpeed * Math.sin(angle);
            showMessage('¡COMBATE!', '#fff', 75, canvas.width / 2, canvas.height / 2);
            kickCamera(4, 0.012);
            triggerFlash('#fff', 0.28);
        }
        return;
    }

    for (let i = floatTexts.length - 1; i >= 0; i--) {
        floatTexts[i].life--;
        floatTexts[i].y -= 0.5;
        if (floatTexts[i].life <= 0) floatTexts.splice(i, 1);
    }

    [paddle1, paddle2].forEach(p => {
        if (p.timers.titan > 0) { p.height = p.baseHeight * 1.8; p.timers.titan--; }
        else if (p.timers.hielo > 0) { p.height = p.baseHeight * 0.5; p.timers.hielo--; }
        else { p.height = p.baseHeight; }

        ['ghost', 'invert', 'skillCd', 'skillDur', 'necrosis'].forEach(t => { if (p.timers[t] > 0) p.timers[t]--; });
        p.y = Math.max(0, Math.min(p.y, canvas.height - p.height));

        p.trail.push(p.y);
        if (p.trail.length > 6) p.trail.shift();
    });

    if (config.powerUps && powerUps.length < 2 && frameCount % 350 === 0 && Math.random() > 0.3) {
        const types = ['titan', 'hielo', 'ghost', 'multi', 'invert', 'shield'];
        const weights = [0.25, 0.25, 0.1, 0.15, 0.15, 0.1];
        let rand = Math.random();
        let type = 'titan';
        let acc = 0;
        for (let i = 0; i < types.length; i++) {
            acc += weights[i];
            if (rand <= acc) { type = types[i]; break; }
        }
        powerUps.push({ x: 250 + Math.random() * 300, y: 100 + Math.random() * 300, radius: 18, type, pulse: 0 });
    }

    // Movimiento Jugadores
    let necrosisMult1 = paddle1.timers.necrosis > 0 ? 0.4 : 1;
    let p1Speed = (paddle1.timers.hielo > 0 ? paddle1.baseSpeed * 0.4 : paddle1.baseSpeed) * necrosisMult1;
    let p1Dir = 0;
    if (keys.w) p1Dir = -1;
    if (keys.s) p1Dir = 1;
    if (paddle1.timers.invert > 0) p1Dir *= -1;
    if (p1Dir === -1 && paddle1.y > 0) paddle1.y -= p1Speed;
    if (p1Dir === 1 && paddle1.y < canvas.height - paddle1.height) paddle1.y += p1Speed;

    let necrosisMult2 = paddle2.timers.necrosis > 0 ? 0.4 : 1;
    let p2Speed = (paddle2.timers.hielo > 0 ? paddle2.speed * 0.4 : paddle2.speed) * necrosisMult2;

    if (config.mode === '2p') {
        let p2Dir = 0;
        if (keys.up) p2Dir = -1;
        if (keys.down) p2Dir = 1;
        if (paddle2.timers.invert > 0) p2Dir *= -1;
        if (p2Dir === -1 && paddle2.y > 0) paddle2.y -= p2Speed;
        if (p2Dir === 1 && paddle2.y < canvas.height - paddle2.height) paddle2.y += p2Speed;
    } else {
        let targetY = canvas.height / 2 - paddle2.height / 2;
        let nearestPowerUp = powerUps.find(pu => pu.x > canvas.width * 0.5);
        let shouldHuntPowerUp = nearestPowerUp && ball.vx < 0 && config.powerUps;

        if (shouldHuntPowerUp) targetY = nearestPowerUp.y - paddle2.height / 2;
        else if (ball.vx > 0) targetY = ((config.difficulty === 'hard' || config.difficulty === 'normal') ? predictBallY(ball, paddle2.x) : ball.y) - paddle2.height / 2;

        let errorMargin = config.difficulty === 'easy' ? 40 : (config.difficulty === 'hard' ? 5 : 20);
        errorMargin = Math.max(0, errorMargin - rallyCount);
        if (paddle2.timers.invert > 0) targetY = canvas.height - targetY - paddle2.height;

        let diffY = targetY - paddle2.y;
        if (Math.abs(diffY) > errorMargin) paddle2.y += Math.sign(diffY) * Math.min(p2Speed, Math.abs(diffY) * 0.15 + p2Speed * 0.5);
        paddle2.y = Math.max(0, Math.min(paddle2.y, canvas.height - paddle2.height));

        if (ball.vx <= 0) paddle2.skillEvaluatedThisRally = false;

        if (config.godSkills && paddle2.timers.skillCd === 0 && paddle2.timers.skillDur === 0 && !paddle2.skillEvaluatedThisRally) {
            if (ball.vx > 0 && Math.abs(paddle2.x - ball.x) < 280) {
                paddle2.skillEvaluatedThisRally = true;
                if (Math.random() < ({ 'easy': 0.20, 'normal': 0.50, 'hard': 0.80 }[config.difficulty] || 0.50)) activateSkill(2);
            }
        }
    }

    let allBalls = [ball, ...extraBalls];

    // RAIJIN
    let isRaijin1 = paddle1.timers.skillDur > 0 && config.p1 === 'raijin';
    let isRaijin2 = paddle2.timers.skillDur > 0 && config.p2 === 'raijin';
    if (isRaijin1 || isRaijin2) {
        let p = isRaijin1 ? paddle1 : paddle2;
        let totalDur = 90;
        let elapsed = totalDur - p.timers.skillDur;
        let dir = isRaijin1 ? 1 : -1;

        if (elapsed < 14) {
            ball.vx *= 0.15; ball.vy *= 0.15; ball.color = '#ffff00';
            if (frameCount % 2 === 0) EffectsManager.createExplosion(ball.x, ball.y, '#ffff00', 4);
        } else {
            let progress = Math.min(1, (elapsed - 14) / (totalDur - 14));
            let currentRampSpeed = ball.baseSpeed + (ball.maxSpeed - ball.baseSpeed) * progress;
            ball.currentSpeed = currentRampSpeed;
            ball.color = '#ffff00';
            let step = Math.floor((elapsed - 14) / 4);
            ball.vx = dir * currentRampSpeed * 0.65;
            ball.vy = ((step % 2 === 0) ? 1 : -1) * currentRampSpeed * 0.95;

            if ((elapsed - 14) % 4 === 0) {
                EffectsManager.createExplosion(ball.x, ball.y, '#ffff00', 8);
                EffectsManager.addSpeedLines(ball.x, ball.y, '#ffff00', 5);
            }
        }
    }

    // FUJIN: TORNADO LITERAL EN CAMINO DE RESORTE
    let isFujin1 = paddle1.timers.skillDur > 0 && config.p1 === 'fujin';
    let isFujin2 = paddle2.timers.skillDur > 0 && config.p2 === 'fujin';

    // --- FUJIN: VENTISCA ESPIRAL CON EFECTO HIELO ---
    if (isFujin1 || isFujin2) {
        let p = isFujin1 ? paddle1 : paddle2;
        let rival = isFujin1 ? paddle2 : paddle1;
        let dir = isFujin1 ? 1 : -1;
        let totalDur = 300;               // 5 segundos
        let elapsed = totalDur - p.timers.skillDur;

        // Desactivamos colisiones para todas las pelotas mientras dure Fujin
        // (Esto se hace en las secciones de colisión, pero también podemos forzar aquí)

        allBalls.forEach(b => {
            // Color y resplandor de hielo
            b.color = '#aaddff';
            b.glowSize = 35;

            // Estela de partículas de hielo (cada frame)
            if (frameCount % 1 === 0) {
                // Partículas que siguen a la pelota
                for (let i = 0; i < 3; i++) {
                    let angle = Math.random() * Math.PI * 2;
                    let dist = 5 + Math.random() * 15;
                    let px = b.x + Math.cos(angle) * dist;
                    let py = b.y + Math.sin(angle) * dist;
                    EffectsManager.createExplosion(px, py, '#88ddff', 1 + Math.random());
                }
            }

            if (elapsed < 40) {
                // Fase de succión: la pelota se acerca al centro de Fujin
                let targetX = p.x + p.width / 2;
                let targetY = p.y + p.height / 2;
                let dx = targetX - b.x;
                let dy = targetY - b.y;
                let dist = Math.hypot(dx, dy);
                if (dist > 5) {
                    let pull = 0.08;
                    b.vx += dx * pull * 0.1;
                    b.vy += dy * pull * 0.1;
                    if (dist < 30) {
                        b.vx *= 0.9;
                        b.vy *= 0.9;
                    }
                }
                // Efectos de viento frío
                EffectsManager.createExplosion(b.x, b.y, '#aaddff', 1.5);
                EffectsManager.addSpeedLines(b.x, b.y, '#88ddff', 3);
            } else {
                // Fase espiral: 3 vueltas completas (6π)
                let spiralElapsed = elapsed - 40;
                let maxSpiral = totalDur - 40; // 260 frames
                let progress = Math.min(1, spiralElapsed / maxSpiral);

                // Radio crece de 30 a 130
                let radius = 30 + 100 * progress;
                const totalAngle = 6 * Math.PI; // 3 vueltas
                let angularSpeed = totalAngle / maxSpiral;
                let angle = spiralElapsed * angularSpeed;

                // Centro se mueve hacia el rival
                let centerX = p.x + p.width / 2 + dir * (60 + 120 * progress);
                let centerY = rival.y + rival.height / 2 + (rival.y - (p.y + p.height / 2)) * progress * 0.3;

                // Posición objetivo en la espiral
                let targetX = centerX + radius * Math.cos(angle);
                let targetY = centerY + radius * Math.sin(angle);

                // Velocidad suave
                b.vx = (targetX - b.x) * 0.12;
                b.vy = (targetY - b.y) * 0.12;

                // Efecto visual de ventisca: nube de partículas girando alrededor
                for (let j = 0; j < 15; j++) {
                    let particleAngle = angle + j * (Math.PI * 2 / 15) + frameCount * 0.02;
                    let particleRadius = radius * 0.9 + Math.sin(frameCount * 0.1 + j) * 10;
                    let px = centerX + particleRadius * Math.cos(particleAngle);
                    let py = centerY + particleRadius * Math.sin(particleAngle) * 0.6; // achatado
                    // Partículas de hielo
                    EffectsManager.createExplosion(px, py, '#aaddff', 0.8);
                    // Líneas de viento
                    EffectsManager.addSpeedLines(px, py, '#88ddff', 1.5);
                }

                // Anillos de hielo alrededor de la pelota (tornado)
                for (let j = 0; j < 12; j++) {
                    let heightOffset = j * -10;
                    let ringRadius = 15 + j * 10;
                    let vAngle = frameCount * 0.05 + j * 0.5;
                    let tx = b.x + Math.cos(vAngle) * ringRadius;
                    let ty = b.y + heightOffset + Math.sin(vAngle) * ringRadius * 0.15;
                    EffectsManager.addSpeedLines(tx, ty, '#aaddff', 1.5);
                    if (Math.random() > 0.9) {
                        EffectsManager.createExplosion(tx, ty, '#88ddff', 0.5);
                    }
                }

                // Lanzamiento final al completar la 3ª vuelta
                if (angle >= 6 * Math.PI) {
                    let launchSpeed = b.maxSpeed * 1.4;
                    let angleToRival = Math.atan2(rival.y + rival.height / 2 - b.y, rival.x - b.x);
                    b.vx = launchSpeed * Math.cos(angleToRival);
                    b.vy = launchSpeed * Math.sin(angleToRival);
                    // Explosión de hielo al lanzar
                    EffectsManager.createExplosion(b.x, b.y, '#aaddff', 40);
                    // Y se añade un efecto de estela de hielo detrás
                    for (let i = 0; i < 20; i++) {
                        let angleOff = Math.random() * Math.PI * 2;
                        let distOff = 20 + Math.random() * 40;
                        let px = b.x + Math.cos(angleOff) * distOff;
                        let py = b.y + Math.sin(angleOff) * distOff;
                        EffectsManager.createExplosion(px, py, '#88ddff', 2);
                    }
                    // Forzamos que la habilidad termine (opcional)
                    // p.timers.skillDur = 0;
                }

                // Generar estela de hielo persistente (trail)
                if (frameCount % 2 === 0) {
                    // Pequeñas partículas congeladas que se quedan atrás
                    for (let i = 0; i < 2; i++) {
                        let angle = Math.random() * Math.PI * 2;
                        let dist = 5 + Math.random() * 20;
                        let px = b.x + Math.cos(angle) * dist;
                        let py = b.y + Math.sin(angle) * dist;
                        EffectsManager.createExplosion(px, py, '#ffffff', 0.8);
                    }
                }
            }
        });
    }
    // KAGUTSUCHI
    if (paddle1.timers.skillDur > 0 && config.p1 === 'kagutsuchi') { ball.color = '#f50'; if (frameCount % 3 === 0) EffectsManager.createExplosion(ball.x, ball.y, '#f50', 2); }
    if (paddle2.timers.skillDur > 0 && config.p2 === 'kagutsuchi') { ball.color = '#f50'; if (frameCount % 3 === 0) EffectsManager.createExplosion(ball.x, ball.y, '#f50', 2); }

    let susaSlow = (paddle1.timers.skillDur > 0 && config.p1 === 'susanoo') || (paddle2.timers.skillDur > 0 && config.p2 === 'susanoo') ? 0.6 : 1;

    if (window.MutationManager && window.MutationManager.active) window.MutationManager.update(1 / 60, paddle2, ball);
    if (window.EclipseManager && window.EclipseManager.active) window.EclipseManager.update(allBalls, paddle1, paddle2);

    for (let bIndex = allBalls.length - 1; bIndex >= 0; bIndex--) {
        let b = allBalls[bIndex];
        b.x += b.vx * susaSlow;
        b.y += b.vy * susaSlow;
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 8) b.trail.shift();

        if (b.lastHitBy) {
            for (let i = powerUps.length - 1; i >= 0; i--) {
                let pu = powerUps[i];
                let dist = Math.hypot(b.x - pu.x, b.y - pu.y);
                if (dist < b.radius + pu.radius) {
                    playSound('powerup');
                    let p = b.lastHitBy;
                    let opp = p === paddle1 ? paddle2 : paddle1;
                    triggerFlash(p.color, 0.16);
                    kickCamera(5, 0.008);

                    if (pu.type === 'titan') { p.timers.titan = 420; createImpact(pu.x, pu.y, '#ff0', 1.5); showMessage('TITÁN', '#ff0'); }
                    else if (pu.type === 'hielo') { opp.timers.hielo = 300; createImpact(pu.x, pu.y, '#08f', 1.5); showMessage('HIELO', '#08f'); }
                    else if (pu.type === 'ghost') { p.timers.ghost = 240; createImpact(pu.x, pu.y, '#aaa', 1.5); showMessage('FANTASMA', '#aaa'); }
                    else if (pu.type === 'invert') { opp.timers.invert = 240; createImpact(pu.x, pu.y, '#f0f', 1.5); showMessage('CAOS', '#f0f'); }
                    else if (pu.type === 'shield') { p.shield = true; createImpact(pu.x, pu.y, '#0ff', 1.5); showMessage('ESCUDO', '#0ff'); }
                    else if (pu.type === 'multi') {
                        extraBalls.push({ x: b.x, y: b.y, radius: b.radius, vx: -b.vx, vy: -b.vy, baseSpeed: b.baseSpeed, currentSpeed: b.currentSpeed, maxSpeed: b.maxSpeed, color: b.color, glowSize: b.glowSize, lastHitBy: b.lastHitBy, trail: [], isVolatile: false, visible: true, volatileTimer: 0 });
                        createImpact(pu.x, pu.y, '#fff', 2); showMessage('MULTIBOLA', '#fff');
                    }
                    powerUps.splice(i, 1);
                }
            }
        }

        if (b.y - b.radius < 0 || b.y + b.radius > canvas.height) {
            b.vy = -b.vy;
            b.y = b.y - b.radius < 0 ? b.radius : canvas.height - b.radius;
            playSound('wall', 0.8);
            EffectsManager.createExplosion(b.x, b.y < 250 ? 0 : canvas.height, '#fff', 8);
            kickCamera(2.5, 0);
            EffectsManager.addSpeedLines(b.x, b.y, b.color, 3);
            if (window.EclipseManager && window.EclipseManager.active) window.EclipseManager.addLightEcho(b.x, b.y);
        }

        let isHittingP1 = b.x - b.radius < paddle1.x + paddle1.width && b.x + b.radius > paddle1.x && b.y + b.radius > paddle1.y && b.y - b.radius < paddle1.y + paddle1.height;
        let isHittingP2 = b.x - b.radius < paddle2.x + paddle2.width && b.x + b.radius > paddle2.x && b.y + b.radius > paddle2.y && b.y - b.radius < paddle2.y + paddle2.height;

        let pCol = null;
        if (isHittingP1 && paddle1.timers.ghost === 0 && b.vx < 0) pCol = paddle1;
        else if (isHittingP2 && paddle2.timers.ghost === 0 && b.vx > 0) pCol = paddle2;

        if (pCol) {
            let attackerPaddle = pCol === paddle1 ? paddle2 : paddle1;
            let attackerGod = pCol === paddle1 ? config.p2 : config.p1;

            if (attackerGod === 'raijin' && attackerPaddle.timers.skillDur > 0) {
                pCol.timers.necrosis = 90;
                showMessage('¡ELECTROCUTADO!', '#ffff00', 45, pCol.x, pCol.y);
                createImpact(pCol.x, pCol.y + pCol.height / 2, '#ffff00', 1.8);
            }
            if (attackerGod === 'fujin' && attackerPaddle.timers.skillDur > 0) {
                // Al atajar el tornado, restauramos el color de la pelota
                b.color = pCol.color;
            }

            b.lastHitBy = pCol;
            if (bIndex === 0) rallyCount++;

            if (window.MutationManager && window.MutationManager.active) window.MutationManager.addPoison(15, paddle2, showMessage);

            let isHeavy = GODS[pCol === paddle1 ? config.p1 : config.p2].id === 'kagutsuchi';
            let intensity = Math.min(2, 1 + rallyCount * 0.1) * (isHeavy ? 1.5 : 1);
            let intersectY = b.y - (pCol.y + pCol.height / 2);
            let normalizedIntersectY = intersectY / (pCol.height / 2);
            let isCrit = Math.abs(normalizedIntersectY) > 0.85;

            if (isCrit) hitstopTimer = 6; else if (rallyCount > 5) hitstopTimer = 3;

            if (isCrit) { intensity *= 1.5; playSound('critical', intensity); showMessage('CRÍTICO', '#f00'); }
            else playSound(pCol === paddle1 ? 'hit1' : 'hit2', intensity);

            if (!(attackerGod === 'fujin' && attackerPaddle.timers.skillDur > 0)) b.color = pCol.color;
            b.glowSize = Math.min(30, 15 + rallyCount * 1.5);
            let bounceAngle = normalizedIntersectY * (Math.PI / 3);
            if (isCrit) bounceAngle *= 1.2;
            let dir = pCol === paddle1 ? 1 : -1;

            kickCamera(isCrit ? 8 : 3.5, isCrit ? 0.012 : 0.003, dir === 1 ? 1 : -1, normalizedIntersectY * 1.5);

            b.currentSpeed = Math.min(b.maxSpeed, b.baseSpeed + (rallyCount * (isHeavy ? 0.8 : 0.5)) + (isCrit ? 2 : 0));
            paddle2.speed = Math.min(15, paddle2.baseSpeed + rallyCount * 0.3);

            b.vx = dir * b.currentSpeed * Math.cos(bounceAngle);
            b.vy = b.currentSpeed * Math.sin(bounceAngle);
            b.x = dir === 1 ? pCol.x + pCol.width + b.radius : pCol.x - b.radius;

            if (rallyCount > 0 && rallyCount % 5 === 0 && bIndex === 0) showMessage(`¡Rally x${rallyCount}!`, '#fff');

            if (window.MutationManager && window.MutationManager.active) {
                let mutEffects = window.MutationManager.handleCollision(b, pCol, dir, extraBalls, typeof showMessage === 'function' ? showMessage : null, paddle1, paddle2);
                if (mutEffects.hitstopMod > 0) hitstopTimer = mutEffects.hitstopMod;
                if (mutEffects.shakeMod > 0) kickCamera(mutEffects.shakeMod, 0.02, dir, 0);
                if (mutEffects.triggerFlash) triggerFlash('#adff2f', 0.2);
            }
        }

        if (b.x < -20) {
            if (paddle1.shield) {
                paddle1.shield = false; b.vx *= -1; b.x = 20;
                showMessage('¡BLOQUEO!', '#0ff'); playSound('hit1', 2); triggerFlash('#0ff', 0.28);
                kickCamera(7, 0.012); createImpact(b.x, b.y, '#0ff', 1.4);
            } else if (bIndex === 0) scorePoint(2); else extraBalls.splice(bIndex - 1, 1);
        } else if (b.x > canvas.width + 20) {
            if (paddle2.shield) {
                paddle2.shield = false; b.vx *= -1; b.x = canvas.width - 20;
                showMessage('¡BLOQUEO!', '#0ff'); playSound('hit2', 2); triggerFlash('#0ff', 0.28);
                kickCamera(7, 0.012); createImpact(b.x, b.y, '#0ff', 1.4);
            } else if (bIndex === 0) scorePoint(1); else extraBalls.splice(bIndex - 1, 1);
        }
    }
}

// --- DRAW ---
function drawPaddleStatus(p, isP1) {
    let x = p.x + p.width / 2; let yOffset = -15; ctx.textAlign = 'center'; ctx.font = '10px Orbitron'; let icons = '';
    if (p.timers.titan > 0) icons += '⚡'; if (p.timers.hielo > 0) icons += '❄️';
    if (p.timers.ghost > 0) icons += '👻'; if (p.timers.invert > 0) icons += '🔄';
    if (p.timers.necrosis > 0) icons += '☠️'; if (p.shield) icons += '🛡️';
    if (icons !== '') { ctx.fillStyle = '#fff'; ctx.fillText(icons, x, p.y + yOffset); yOffset -= 12; }

    let god = GODS[isP1 ? config.p1 : config.p2]; let pct = p.timers.skillCd / god.skill.cd;
    if (p.timers.skillCd > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x - 15, p.y + yOffset, 30, 4);
        ctx.fillStyle = god.color; ctx.fillRect(x - 15, p.y + yOffset, 30 * (1 - pct), 4);
    } else {
        ctx.fillStyle = god.color; ctx.fillText('SKILL', x, p.y + yOffset);
    }
    ctx.textAlign = 'left'; ctx.font = '10px sans-serif';
}

function draw() {
    ctx.save();
    EffectsManager.applyShake(ctx);

    let corruption = (window.MutationManager && window.MutationManager.active) ? window.MutationManager.toxicCharge / 100 : 0;
    let tiltAngle = Math.sin(arenaTime * 2) * (0.05 * corruption);

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.rotate(tiltAngle);
    ctx.translate(-canvas.width / 2 + camera.x, -canvas.height / 2 + camera.y);

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fillRect(-30, -30, canvas.width + 60, canvas.height + 60);

    let grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
    const leftAlpha = Math.min(0.72, 0.18 + dominance / 150 + tension * 0.14);
    const rightAlpha = Math.min(0.72, 0.18 + (100 - dominance) / 150 + tension * 0.14);

    let p1RenderColor = corruption > 0.5 ? '#adff2f' : paddle1.color;
    let p2RenderColor = corruption > 0.5 ? '#adff2f' : paddle2.color;

    grd.addColorStop(0, `${p1RenderColor}${Math.floor(leftAlpha * 255).toString(16).padStart(2, '0')}`);
    grd.addColorStop(0.5, `rgba(0,0,0,${Math.max(0.45, 0.72 - tension * 0.12)})`);
    grd.addColorStop(1, `${p2RenderColor}${Math.floor(rightAlpha * 255).toString(16).padStart(2, '0')}`);

    ctx.fillStyle = grd;
    ctx.fillRect(-30, -30, canvas.width + 60, canvas.height + 60);

    const glow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 40, canvas.width / 2, canvas.height / 2, 420);
    glow.addColorStop(0, `rgba(255,255,255,${0.04 + tension * 0.1 + combatPulse * 0.06})`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(-30, -30, canvas.width + 60, canvas.height + 60);

    EffectsManager.drawAmbientParticles(ctx, tension);
    ctx.lineWidth = 1;

    for (let y = 40; y < canvas.height; y += 40) { ctx.strokeStyle = `rgba(255,255,255,${0.025 + tension * 0.025})`; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    for (let x = 40; x < canvas.width; x += 40) { ctx.strokeStyle = `rgba(255,255,255,${0.018 + tension * 0.018})`; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }

    let redX = (canvas.width * dominance) / 100; ctx.shadowBlur = 10 + tension * 15; ctx.shadowColor = '#fff'; ctx.fillStyle = `rgba(255,255,255,${0.15 + tension * 0.08})`; ctx.fillRect(redX - 1.5, 0, 3, canvas.height); ctx.shadowBlur = 0;
    const corePulse = 1 + Math.sin(arenaTime * 3) * 0.1 + tension * 0.1; const core = ctx.createRadialGradient(redX, canvas.height / 2, 2, redX, canvas.height / 2, 34 * corePulse);
    core.addColorStop(0, `rgba(255,255,255,${0.25 + tension * 0.15})`); core.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = core; ctx.beginPath(); ctx.arc(redX, canvas.height / 2, 34 * corePulse, 0, Math.PI * 2); ctx.fill();

    EffectsManager.drawSpeedLines(ctx);
    ctx.shadowBlur = 20;

    if (window.MutationManager) { window.MutationManager.drawSpores(ctx); window.MutationManager.drawHolograms(ctx); }

    const drawPaddleGlow = (p, isP1) => {
        const god = GODS[isP1 ? config.p1 : config.p2];
        const active = p.timers.skillDur > 0;

        if (p.trail && p.timers.ghost === 0) {
            p.trail.forEach((pastY, index) => {
                let alpha = ((index + 1) / p.trail.length) * 0.18;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.timers.necrosis > 0 ? '#adff2f' : p.color;
                ctx.fillRect(p.x, pastY, p.width, p.height);
            });
            ctx.globalAlpha = 1;
        }

        ctx.shadowColor = p.timers.necrosis > 0 ? '#0f0' : p.color;
        ctx.shadowBlur = active ? 34 : 20;
        ctx.fillStyle = p.timers.necrosis > 0 ? '#adff2f' : p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);

        if (active) {
            ctx.globalAlpha = 0.28;
            ctx.fillRect(p.x - 8, p.y - 8, p.width + 16, p.height + 16);
            ctx.globalAlpha = 0.12;
            ctx.fillStyle = god.color;
            ctx.beginPath();
            ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.height * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        if (p.shield) {
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            const shieldX = isP1 ? p.x + p.width + 7 : p.x - 7;
            ctx.arc(shieldX, p.y + p.height / 2, p.height * 0.62, -Math.PI / 2, Math.PI / 2, !isP1);
            ctx.stroke();
        }
    };

    drawPaddleGlow(paddle1, true);
    drawPaddleGlow(paddle2, false);

    if (paddle1.timers.ghost > 0) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height); }
    if (paddle2.timers.ghost > 0) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height); }
    drawPaddleStatus(paddle1, true);
    drawPaddleStatus(paddle2, false);

    powerUps.forEach(pu => {
        pu.pulse += 0.1; let scale = 1 + Math.sin(pu.pulse) * 0.15; let c = '#fff'; let icon = '?';
        if (pu.type === 'titan') { c = '#ffff00'; icon = '⚡'; } else if (pu.type === 'hielo') { c = '#0088ff'; icon = '❄️'; }
        else if (pu.type === 'ghost') { c = '#aaaaaa'; icon = '👻'; } else if (pu.type === 'multi') { c = '#ffffff'; icon = '⚽'; }
        else if (pu.type === 'invert') { c = '#ff00ff'; icon = '🔄'; } else if (pu.type === 'shield') { c = '#00ffff'; icon = '🛡️'; }

        ctx.globalAlpha = 0.14; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.radius * scale * 2.15, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.shadowBlur = 18; ctx.shadowColor = c; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.radius * scale, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.radius * (1.35 + Math.sin(pu.pulse * 1.4) * 0.08), 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#000'; ctx.shadowBlur = 0; ctx.font = '16px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(icon, pu.x, pu.y + 1);
    });

    [ball, ...extraBalls].forEach(b => {
        if (!b.visible) return;

        let isToxic = corruption > 0.3;
        let currentRadius = isToxic ? b.radius + (Math.sin(arenaTime * 10) * 3 * corruption) : b.radius;
        let renderColor = isToxic ? '#adff2f' : (b.isVolatile ? '#adff2f' : b.color);

        if (b.trail.length > 0) {
            ctx.beginPath(); ctx.moveTo(b.trail[0].x, b.trail[0].y);
            for (let i = 1; i < b.trail.length; i++) ctx.lineTo(b.trail[i].x, b.trail[i].y);
            ctx.lineTo(b.x, b.y);

            ctx.strokeStyle = renderColor;
            ctx.lineWidth = currentRadius * (isToxic ? 1.5 : 0.75 + Math.min(1, Math.abs(b.currentSpeed - b.baseSpeed) / 12) * 0.8);
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.36 + Math.min(0.34, Math.abs(b.currentSpeed - b.baseSpeed) / 30);
            ctx.shadowBlur = 12 + Math.abs(b.currentSpeed - b.baseSpeed) * 1.2;
            ctx.shadowColor = renderColor;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        const speedFactor = Math.min(1, Math.abs(b.currentSpeed - b.baseSpeed) / 12);
        ctx.globalAlpha = 0.12 + speedFactor * 0.16;
        ctx.fillStyle = renderColor;
        ctx.beginPath();
        ctx.arc(b.x, b.y, currentRadius * (2.5 + speedFactor * 2), 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = b.glowSize + speedFactor * 20;
        ctx.shadowColor = renderColor;
        ctx.fillStyle = isToxic ? '#000' : '#fff';
        ctx.beginPath();
        ctx.arc(b.x, b.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
    });

    EffectsManager.updateAndDrawParticles(ctx);

    // ---> ESTA ES LA CAPA NEGRA DEL MODO ECLIPSE (Justo encima del juego, pero debajo del UI) <---
    if (window.EclipseManager && window.EclipseManager.active) {
        window.EclipseManager.draw(ctx, canvas.width, canvas.height, paddle1, paddle2, [ball, ...extraBalls]);
    }

    // --- INTERFAZ, MARCADORES Y TEXTOS FLOTANTES ---
    ctx.shadowBlur = 0;
    floatTexts.forEach(ft => {
        ctx.globalAlpha = ft.life / ft.maxLife; ctx.fillStyle = ft.color; ctx.font = 'bold 20px Orbitron'; ctx.textAlign = 'center';
        ctx.shadowBlur = 12; ctx.shadowColor = ft.color; ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.globalAlpha = 1;

    const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.25, canvas.width / 2, canvas.height / 2, canvas.height * 0.78);
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, `rgba(0,0,0,${vignetteStrength + tension * 0.12 + combatPulse * 0.08})`);
    ctx.fillStyle = vignette; ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);

    if (flashAlpha > 0) { ctx.globalAlpha = flashAlpha; ctx.fillStyle = flashColor; ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40); ctx.globalAlpha = 1; }

    if (window.MutationManager) window.MutationManager.drawBlind(ctx, canvas.width, canvas.height);

    if (countdownRunning) {
        const pulse = 1 + Math.sin(frameCount * 0.3) * 0.06;
        ctx.globalAlpha = Math.min(1, 0.35 + (countdownFrames < 50 ? 0.65 : 0.9));
        ctx.fillStyle = '#fff'; ctx.font = `900 ${82 * pulse}px Orbitron`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowBlur = 35; ctx.shadowColor = countdownValue === 3 ? '#fff' : (countdownValue === 2 ? paddle1.color : paddle2.color);
        ctx.fillText(countdownValue, canvas.width / 2, canvas.height / 2); ctx.globalAlpha = 1;
    }

    if (window.MutationManager && window.MutationManager.active && isPlaying && !countdownRunning) {
        let chargePct = window.MutationManager.toxicCharge / 100;
        let barW = 160; let barH = 8; let bx = canvas.width / 2 - barW / 2; let by = canvas.height - 25;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(bx, by, barW, barH);
        ctx.fillStyle = chargePct === 1 ? '#adff2f' : '#228b22';
        ctx.shadowBlur = chargePct === 1 ? 15 : 0; ctx.shadowColor = '#adff2f';
        ctx.fillRect(bx, by, barW * chargePct, barH); ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, barW, barH);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Orbitron'; ctx.textAlign = 'center';
        ctx.fillText(chargePct === 1 ? '¡MUTACIÓN LISTA!' : 'CARGA TÓXICA', canvas.width / 2, by - 6);
    }

    ctx.restore();
}
// --- GAME LOOP ---
function gameLoop() {
    if (isPlaying && !isPaused) { update(); draw(); } else if (!isPlaying) { draw(); }
    animationId = requestAnimationFrame(gameLoop);
}
// --- GAME DATA & STATE ---
const GODS = {
    raijin: { id: 'raijin', name: 'Raijin', icon: '⚡', color: '#00ffff', speed: 8, height: 100, desc: 'Equilibrado', skill: { name: 'Tormenta', cd: 600, dur: 120 }, aura: 'storm', hitPitch: 1.15 },
    fujin: { id: 'fujin', name: 'Fujin', icon: '🌪️', color: '#55ff55', speed: 9.5, height: 80, desc: 'Veloz / Pequeño', skill: { name: 'Ráfaga', cd: 400, dur: 10 }, aura: 'wind', hitPitch: 1.35 },
    kagutsuchi: { id: 'kagutsuchi', name: 'Kagutsuchi', icon: '🔥', color: '#ff3300', speed: 6.5, height: 110, desc: 'Golpes Fuertes', skill: { name: 'Llamarada', cd: 700, dur: 180 }, aura: 'fire', hitPitch: 0.9 },
    susanoo: { id: 'susanoo', name: 'Susanoo', icon: '🌊', color: '#3366ff', speed: 5, height: 130, desc: 'Defensa Alta', skill: { name: 'Maremoto', cd: 600, dur: 150 }, aura: 'water', hitPitch: 0.72 },
    amaterasu: { id: 'amaterasu', name: 'Amaterasu', icon: '☀️', color: '#ffd700', speed: 7, height: 110, desc: 'Diosa del Sol', skill: { name: 'Resplandor', cd: 700, dur: 120 }, aura: 'light', hitPitch: 1.2 },
    inari: { id: 'inari', name: 'Inari', icon: '🦊', color: '#ff69b4', speed: 8.5, height: 90, desc: 'Ilusión', skill: { name: 'Espejismo', cd: 600, dur: 10 }, aura: 'illusion', hitPitch: 1.1 }
};

const config = { p1: 'raijin', p2: 'fujin', winScore: 10, difficulty: 'normal', powerUps: true, mode: 'cpu' };

let isPlaying = false; let isPaused = false;
let score1 = 0; let score2 = 0; let rallyCount = 0;
let shakeFrames = 0; let dominance = 50; let frameCount = 0; let animationId;

let camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 };
let flashAlpha = 0; let flashColor = '#fff'; let vignetteStrength = 0.15;
let combatPulse = 0; let arenaTime = 0;
let countdownFrames = 0; let countdownValue = 0; let countdownRunning = false;
let lastScore1 = 0; let lastScore2 = 0;
let speedLines = []; let ambientParticles = []; let tension = 0;
let extraBalls = []; let floatTexts = [];

let records = { maxDiff: 0, maxRally: 0, wins: { raijin: 0, fujin: 0, kagutsuchi: 0, susanoo: 0, amaterasu: 0, inari: 0 } };
try {
    let saved = JSON.parse(localStorage.getItem('clashGodsRec'));
    if (saved) records = { ...records, ...saved };
} catch (e) { console.warn("No se pudo cargar el archivo de guardado."); }

// --- AUDIO ENGINE ---
let audioCtx;
function initAudio() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { console.warn("Audio no inicializado"); }
}

function playSound(type, intensity = 1) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const t = audioCtx.currentTime;
    const master = audioCtx.createGain();
    master.connect(audioCtx.destination);
    master.gain.setValueAtTime(Math.min(0.5, 0.12 + intensity * 0.08), t);
    master.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(master);
    
    let duration = 0.18;
    if (type === 'critical') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(420 * intensity, t); osc.frequency.exponentialRampToValueAtTime(1800 * Math.min(1.5, intensity), t + 0.08); duration = 0.22; } 
    else if (type === 'skill') { osc.type = 'square'; osc.frequency.setValueAtTime(90, t); osc.frequency.exponentialRampToValueAtTime(900, t + 0.26); duration = 0.32; } 
    else if (type === 'hit1' || type === 'hit2') { osc.type = 'triangle'; osc.frequency.setValueAtTime(180 + 240 * Math.min(intensity, 2), t); osc.frequency.exponentialRampToValueAtTime(900 + 300 * Math.min(intensity, 2), t + 0.09); duration = 0.14; } 
    else if (type === 'score') { osc.type = 'sine'; osc.frequency.setValueAtTime(540, t); osc.frequency.exponentialRampToValueAtTime(120, t + 0.35); duration = 0.35; } 
    else if (type === 'powerup') { osc.type = 'sine'; osc.frequency.setValueAtTime(300, t); osc.frequency.exponentialRampToValueAtTime(1100, t + 0.12); duration = 0.28; } 
    else if (type === 'wall') { osc.type = 'triangle'; osc.frequency.setValueAtTime(160, t); osc.frequency.exponentialRampToValueAtTime(80, t + 0.08); duration = 0.1; } 
    else if (type === 'countdown') { osc.type = 'sine'; osc.frequency.setValueAtTime(intensity >= 3 ? 420 : 260, t); osc.frequency.exponentialRampToValueAtTime(intensity >= 3 ? 760 : 420, t + 0.11); duration = 0.14; } 
    else if (type === 'victory') { osc.type = 'sine'; osc.frequency.setValueAtTime(260, t); osc.frequency.linearRampToValueAtTime(520, t + 0.18); osc.frequency.linearRampToValueAtTime(880, t + 0.42); duration = 0.5; }

    gain.gain.setValueAtTime(0.9, t); gain.gain.exponentialRampToValueAtTime(0.02, t + duration);
    osc.start(t); osc.stop(t + duration + 0.02);
}

// --- UI NAVIGATION ---
function navTo(screenId) {
    initAudio();
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function showRecords() {
    document.getElementById('rec-diff').innerText = records.maxDiff || 0;
    document.getElementById('rec-rally').innerText = records.maxRally || 0;
    document.getElementById('rec-win-raijin').innerText = records.wins.raijin || 0;
    document.getElementById('rec-win-fujin').innerText = records.wins.fujin || 0;
    document.getElementById('rec-win-kagu').innerText = records.wins.kagutsuchi || 0;
    document.getElementById('rec-win-susa').innerText = records.wins.susanoo || 0;
    document.getElementById('rec-win-ama').innerText = records.wins.amaterasu || 0;
    document.getElementById('rec-win-inari').innerText = records.wins.inari || 0;
    navTo('screen-records');
}

function togglePause() {
    if (!isPlaying) return;
    isPaused = !isPaused;
    document.getElementById('screen-pause').classList.toggle('hidden', !isPaused);
    document.querySelector('#screen-game .btn').disabled = isPaused;
}

function restartGame() {
    isPaused = false; document.getElementById('screen-pause').classList.add('hidden');
    document.querySelector('#screen-game .btn').disabled = false; startGame();
}

function quitToMenu() {
    isPaused = false; isPlaying = false; document.getElementById('screen-pause').classList.add('hidden');
    document.querySelector('#screen-game .btn').disabled = false; navTo('screen-menu');
}

// --- IMMERSIVE FEEDBACK ---
function triggerFlash(color = '#fff', alpha = 0.35) { flashColor = color; flashAlpha = Math.max(flashAlpha, alpha); }

function kickCamera(power = 8, zoom = 0.02, xBias = 0, yBias = 0) {
    camera.targetX += (Math.random() - 0.5) * power + xBias; camera.targetY += (Math.random() - 0.5) * power + yBias;
    camera.targetZoom = Math.max(0.94, Math.min(1.08, camera.targetZoom + zoom));
}

function addSpeedLines(x, y, color, amount = 8) {
    for (let i = 0; i < amount; i++) speedLines.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, length: Math.random() * 18 + 10, life: 1, decay: Math.random() * 0.04 + 0.025, color });
    if (speedLines.length > 120) speedLines.splice(0, speedLines.length - 120);
}

function initAmbientParticles() {
    ambientParticles = [];
    for (let i = 0; i < 70; i++) ambientParticles.push({ x: Math.random() * 800, y: Math.random() * 500, size: Math.random() * 2 + 0.5, drift: (Math.random() - 0.5) * 0.25, rise: Math.random() * 0.25 + 0.05, alpha: Math.random() * 0.45 + 0.08, phase: Math.random() * Math.PI * 2 });
}

function updateImmersiveEffects() {
    arenaTime += 0.016; combatPulse *= 0.93; tension = Math.min(1, rallyCount / 18 + (ball.currentSpeed - ball.baseSpeed) / 22);
    camera.targetX *= 0.86; camera.targetY *= 0.86; camera.targetZoom += (1 - camera.targetZoom) * 0.08;
    camera.x += (camera.targetX - camera.x) * 0.22; camera.y += (camera.targetY - camera.y) * 0.22; camera.zoom += (camera.targetZoom - camera.zoom) * 0.16;
    flashAlpha *= 0.86; if (flashAlpha < 0.01) flashAlpha = 0;

    for (let i = speedLines.length - 1; i >= 0; i--) {
        const line = speedLines[i]; line.x += line.vx; line.y += line.vy; line.life -= line.decay;
        if (line.life <= 0) speedLines.splice(i, 1);
    }
    ambientParticles.forEach(p => {
        p.phase += 0.015; p.x += p.drift + Math.sin(p.phase) * 0.12; p.y -= p.rise;
        if (p.y < -5) p.y = 505; if (p.x < -5) p.x = 805; if (p.x > 805) p.x = -5;
    });
}
function resetImmersiveEffects() { camera = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, targetZoom: 1 }; flashAlpha = 0; combatPulse = 0; speedLines = []; tension = 0; }

// --- CHARACTER SELECTION ---
function buildCharSelect() {
    const grid1 = document.getElementById('grid-p1'); const grid2 = document.getElementById('grid-p2');
    if(!grid1 || !grid2) return;
    grid1.innerHTML = ''; grid2.innerHTML = '';

    Object.values(GODS).forEach(god => {
        let c1 = document.createElement('div'); c1.className = `char-card ${config.p1 === god.id ? 'selected-p1' : ''}`;
        c1.innerHTML = `<div class="char-icon">${god.icon}</div><div class="char-name">${god.name}</div><div class="char-stat">${god.desc}<br><span class="skill-desc">${god.skill.name}</span></div>`;
        c1.onclick = () => { config.p1 = god.id; buildCharSelect(); }; grid1.appendChild(c1);

        let c2 = document.createElement('div'); c2.className = `char-card ${config.p2 === god.id ? 'selected-p2' : ''}`;
        c2.innerHTML = `<div class="char-icon">${god.icon}</div><div class="char-name">${god.name}</div><div class="char-stat">${god.desc}<br><span class="skill-desc">${god.skill.name}</span></div>`;
        c2.onclick = () => { config.p2 = god.id; buildCharSelect(); }; grid2.appendChild(c2);
    });
}
buildCharSelect();

// --- GAME ENTITIES ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
initAmbientParticles();

let paddle1 = { x: 20, y: 200, width: 12, height: 100, baseHeight: 100, speed: 8, baseSpeed: 8, color: '#fff', shield: false, timers: { titan: 0, hielo: 0, ghost: 0, invert: 0, skillCd: 0, skillDur: 0, necrosis: 0 } };
let paddle2 = { x: 768, y: 200, width: 12, height: 100, baseHeight: 100, speed: 6, baseSpeed: 6, color: '#fff', shield: false, timers: { titan: 0, hielo: 0, ghost: 0, invert: 0, skillCd: 0, skillDur: 0, necrosis: 0 } };
let ball = { x: 400, y: 250, radius: 10, vx: 0, vy: 0, baseSpeed: 7, currentSpeed: 7, maxSpeed: 22, color: '#fff', glowSize: 15, lastHitBy: null, trail: [], isVolatile: false, volatileTimer: 0, visible: true };
let powerUps = [];

function showMessage(text, color, duration = 60, x = canvas.width / 2, y = canvas.height / 4) { floatTexts.push({ text, color, x, y, life: duration, maxLife: duration }); }

// --- PARTICLE SYSTEM ---
class ParticlePool {
    constructor(maxSize) { this.pool = []; for (let i = 0; i < maxSize; i++) this.pool.push({ active: false, x: 0, y: 0, vx: 0, vy: 0, color: '', type: '', size: 0, radius: 0, maxRadius: 0, thickness: 0, life: 0, decay: 0 }); }
    spawn(x, y, color, type, multiplier = 1) {
        let p = this.pool.find(p => !p.active); if (!p) return;
        p.active = true; p.x = x; p.y = y; p.color = color; p.type = type; p.life = 1;
        if (type === 'burst') { let angle = Math.random() * Math.PI * 2; let speed = (Math.random() * 8 + 2) * multiplier; p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed; p.size = Math.random() * 5 + 2; p.decay = Math.random() * 0.03 + 0.02; } 
        else if (type === 'trail') { p.vx = (Math.random() - 0.5); p.vy = (Math.random() - 0.5); p.size = Math.random() * 3 + 1; p.decay = 0.05; } 
        else if (type === 'shockwave') { p.radius = 5; p.maxRadius = 50 * multiplier; p.thickness = 3; p.decay = 0.05; }
    }
    updateAndDraw(ctx) {
        for (let i = 0; i < this.pool.length; i++) {
            let p = this.pool[i]; if (!p.active) continue;
            if (p.type !== 'shockwave') { p.x += p.vx; p.y += p.vy; } else { p.radius += (p.maxRadius - p.radius) * 0.2; }
            p.life -= p.decay; if (p.life <= 0) { p.active = false; continue; }
            ctx.globalAlpha = p.life;
            if (p.type === 'shockwave') { ctx.strokeStyle = p.color; ctx.lineWidth = p.thickness * p.life; ctx.shadowBlur = 10; ctx.shadowColor = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke(); } 
            else { ctx.fillStyle = p.color; ctx.shadowBlur = p.type === 'burst' ? 15 : 5; ctx.shadowColor = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.globalAlpha = 1;
    }
    clear() { this.pool.forEach(p => p.active = false); }
}
const pManager = new ParticlePool(250);

function createImpact(x, y, color, intensity = 1) {
    let limit = Math.min(Math.floor(20 * intensity), 30);
    for (let i = 0; i < limit; i++) pManager.spawn(x, y, color, 'burst', intensity);
    pManager.spawn(x, y, color, 'shockwave', intensity);
    shakeFrames = Math.floor(10 * intensity); kickCamera(6 + intensity * 5, 0.008 * intensity);
    triggerFlash(color, Math.min(0.48, 0.12 + intensity * 0.08)); combatPulse = Math.min(1, combatPulse + intensity * 0.2);
}

// --- GAME CONFIG & START ---
function applyConfig() {
    const c1 = GODS[config.p1]; const c2 = GODS[config.p2];
    config.winScore = parseInt(document.getElementById('cfg-score').value);
    config.difficulty = document.getElementById('cfg-diff').value;
    config.powerUps = document.getElementById('cfg-power').value === 'on';
    config.mode = document.getElementById('cfg-mode').value;

    let mutUi = document.getElementById('cfg-mutation');
    let eclUi = document.getElementById('cfg-eclipse');
    if (window.MutationManager) {
        window.MutationManager.active = mutUi ? mutUi.value === 'on' : false;
        window.MutationManager.eclipse = eclUi ? eclUi.value === 'on' : false;
    }

    paddle1.color = c1.color; paddle1.baseHeight = c1.height; paddle1.baseSpeed = c1.speed; paddle1.speed = c1.speed;
    paddle2.color = c2.color; paddle2.baseHeight = c2.height;
    let diffMult = config.difficulty === 'easy' ? 0.7 : (config.difficulty === 'hard' ? 1.3 : 1);
    paddle2.baseSpeed = c2.speed * diffMult; paddle2.speed = paddle2.baseSpeed;

    document.documentElement.style.setProperty('--c-p1', c1.color); document.documentElement.style.setProperty('--c-p2', c2.color);
    score1 = 0; score2 = 0; dominance = 50; powerUps = []; pManager.clear(); resetImmersiveEffects();
    lastScore1 = 0; lastScore2 = 0; extraBalls = []; floatTexts = [];
    document.getElementById('score1').innerText = 0; document.getElementById('score2').innerText = 0; updateDominance();
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
        document.getElementById('result-title').innerText = `${winner.icon} ${winner.name} GANA!`; document.getElementById('result-title').style.color = winner.color;
        document.getElementById('result-desc').innerText = `Dominio absoluto en la arena.`;
        let diff = Math.abs(score1 - score2);
        if (diff > records.maxDiff) records.maxDiff = diff;
        if (rallyCount > records.maxRally) records.maxRally = rallyCount;
        records.wins[winner.id] = (records.wins[winner.id] || 0) + 1;
        localStorage.setItem('clashGodsRec', JSON.stringify(records));
    } else { document.getElementById('result-title').innerText = 'RENDICIÓN'; document.getElementById('result-title').style.color = '#fff'; document.getElementById('result-desc').innerText = 'Has abandonado la batalla.'; }
}

function launchBall(direction) {
    ball.x = canvas.width / 2; ball.y = canvas.height / 2; ball.currentSpeed = ball.baseSpeed; ball.color = '#fff'; ball.glowSize = 15; ball.trail = []; ball.isVolatile = false; ball.visible = true; ball.volatileTimer = 0;
    let angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
    ball.vx = direction * ball.currentSpeed * Math.cos(angle); ball.vy = ball.currentSpeed * Math.sin(angle);
    rallyCount = 0; ball.lastHitBy = null; extraBalls = [];
    if (window.MutationManager) window.MutationManager.init();
    paddle1.timers = { titan: 0, hielo: 0, ghost: 0, invert: 0, skillCd: 0, skillDur: 0, necrosis: 0 };
    paddle2.timers = { titan: 0, hielo: 0, ghost: 0, invert: 0, skillCd: 0, skillDur: 0, necrosis: 0 };
    paddle1.shield = false; paddle2.shield = false; paddle2.speed = paddle2.baseSpeed;
    kickCamera(4, 0.004); triggerFlash('#fff', 0.1);
}

function updateDominance() {
    let diff = score1 - score2; dominance = Math.max(10, Math.min(50 + (diff * (40 / config.winScore)), 90));
    document.documentElement.style.setProperty('--dom-p1', `${dominance}%`); document.documentElement.style.setProperty('--dom-p2', `${100 - dominance}%`);
}

function scorePoint(player) {
    const scoringColor = player === 1 ? paddle1.color : paddle2.color; playSound('score'); createImpact(canvas.width / 2, canvas.height / 2, scoringColor, 2.4);
    kickCamera(14, 0.025, player === 1 ? -2 : 2); triggerFlash(scoringColor, 0.3); combatPulse = 1;
    if (rallyCount > records.maxRally) { records.maxRally = rallyCount; showMessage('¡NUEVO RÉCORD RALLY!', '#ff0'); }
    let el = player === 1 ? document.getElementById('score1') : document.getElementById('score2');
    if (player === 1) score1++; else score2++;
    el.innerText = player === 1 ? score1 : score2;
    el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
    updateDominance();
    if (score1 >= config.winScore || score2 >= config.winScore) endGame(); else launchBall(player === 1 ? -1 : 1);
}

// --- INPUTS & SKILLS ---
const keys = { w: false, s: false, up: false, down: false, space: false, enter: false };
window.addEventListener('keydown', e => {
    if (e.key === 'w' || e.key === 'W') keys.w = true;
    if (e.key === 's' || e.key === 'S') keys.s = true;
    if (e.key === 'ArrowUp') keys.up = true;
    if (e.key === 'ArrowDown') keys.down = true;
    if (e.key === ' ') { keys.space = true; activateSkill(1); }
    if (e.key === 'Enter' || e.key === 'Shift') { keys.enter = true; activateSkill(2); }
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
});
window.addEventListener('keyup', e => {
    if (e.key === 'w' || e.key === 'W') keys.w = false;
    if (e.key === 's' || e.key === 'S') keys.s = false;
    if (e.key === 'ArrowUp') keys.up = false;
    if (e.key === 'ArrowDown') keys.down = false;
    if (e.key === ' ') keys.space = false;
    if (e.key === 'Enter' || e.key === 'Shift') keys.enter = false;
});

function activateSkill(playerNum) {
    if (isPaused) return;
    let p = playerNum === 1 ? paddle1 : paddle2;
    let god = GODS[playerNum === 1 ? config.p1 : config.p2];
    
    if (p.timers.skillCd > 0 || p.timers.skillDur > 0) return;

    if (window.MutationManager && window.MutationManager.active) {
        let triggered = window.MutationManager.trigger(playerNum, paddle1, paddle2, [ball, ...extraBalls], canvas.width, canvas.height, showMessage);
        if (triggered) { p.timers.skillCd = 300; playSound('skill', 1.5); triggerFlash('#0f0', 0.2); kickCamera(12, 0.02, p.x < canvas.width / 2 ? -2 : 2); return; }
    }

    p.timers.skillCd = god.skill.cd; p.timers.skillDur = god.skill.dur; playSound('skill', 1.5); triggerFlash(god.color, 0.18);
    kickCamera(12, 0.02, p.x < canvas.width / 2 ? -2 : 2); addSpeedLines(p.x < canvas.width / 2 ? 90 : canvas.width - 90, p.y + p.height / 2, god.color, 18);
    showMessage(`¡${god.skill.name}!`, god.color, 90, p.x < canvas.width / 2 ? 150 : canvas.width - 150, p.y);

    if (god.id === 'fujin') {
        [ball, ...extraBalls].forEach(b => { if ((playerNum === 1 && b.vx < 0) || (playerNum === 2 && b.vx > 0)) b.vx *= -1; b.vx += playerNum === 1 ? 4 : -4; });
    } else if (god.id === 'amaterasu') { if (window.MutationManager) window.MutationManager.blindTimer = god.skill.dur;
    } else if (god.id === 'inari') { if (window.MutationManager) window.MutationManager.spawnHolograms(ball); }
}

function predictBallY(b, targetX) {
    let simX = b.x; let simY = b.y; let simVx = b.vx; let simVy = b.vy;
    if ((simVx > 0 && simX > targetX) || (simVx < 0 && simX < targetX)) return canvas.height / 2;
    let steps = 0;
    while ((simVx > 0 && simX < targetX) || (simVx < 0 && simX > targetX)) {
        let timeToX = Math.abs((targetX - simX) / simVx); let timeToY = simVy > 0 ? (canvas.height - simY) / simVy : -simY / simVy;
        if (timeToY < timeToX) { simX += simVx * timeToY; simY += simVy * timeToY; simVy = -simVy; } else { simY += simVy * timeToX; break; }
        if (steps++ > 20) break;
    }
    return simY;
}

// --- MAIN UPDATE ---
function update() {
    if (!isPlaying || isPaused) return;
    frameCount++; updateImmersiveEffects();

    if (countdownRunning) {
        countdownFrames--; const nextValue = Math.ceil(countdownFrames / 50);
        if (nextValue !== countdownValue && countdownFrames > 0) { countdownValue = nextValue; playSound('countdown', countdownValue); triggerFlash('#fff', 0.12); }
        if (countdownFrames <= 0) {
            countdownRunning = false;
            ball.vx = (Math.random() > 0.5 ? 1 : -1) * ball.baseSpeed * Math.cos((Math.random() * Math.PI / 4) - Math.PI / 8); ball.vy = ball.baseSpeed * Math.sin((Math.random() * Math.PI / 4) - Math.PI / 8);
            showMessage('¡COMBATE!', '#fff', 75, canvas.width / 2, canvas.height / 2); kickCamera(4, 0.012); triggerFlash('#fff', 0.28);
        }
        return;
    }

    for (let i = floatTexts.length - 1; i >= 0; i--) { floatTexts[i].life--; floatTexts[i].y -= 0.5; if (floatTexts[i].life <= 0) floatTexts.splice(i, 1); }

    [paddle1, paddle2].forEach(p => {
        if (p.timers.titan > 0) { p.height = p.baseHeight * 1.8; p.timers.titan--; } else if (p.timers.hielo > 0) { p.height = p.baseHeight * 0.5; p.timers.hielo--; } else { p.height = p.baseHeight; }
        if (p.timers.ghost > 0) p.timers.ghost--; if (p.timers.invert > 0) p.timers.invert--; if (p.timers.skillCd > 0) p.timers.skillCd--; if (p.timers.skillDur > 0) p.timers.skillDur--; if (p.timers.necrosis > 0) p.timers.necrosis--;
        p.y = Math.max(0, Math.min(p.y, canvas.height - p.height));
    });

    if (config.powerUps && powerUps.length < 2 && frameCount % 350 === 0 && Math.random() > 0.3) {
        const types = ['titan', 'hielo', 'ghost', 'multi', 'invert', 'shield']; const weights = [0.25, 0.25, 0.1, 0.15, 0.15, 0.1];
        let rand = Math.random(); let type = 'titan'; let acc = 0;
        for (let i = 0; i < types.length; i++) { acc += weights[i]; if (rand <= acc) { type = types[i]; break; } }
        powerUps.push({ x: 250 + Math.random() * 300, y: 100 + Math.random() * 300, radius: 18, type, pulse: 0 });
    }

    let necrosisMult1 = paddle1.timers.necrosis > 0 ? 0.6 : 1;
    let p1Speed = (paddle1.timers.hielo > 0 ? paddle1.baseSpeed * 0.4 : paddle1.baseSpeed) * necrosisMult1;
    let p1Dir = 0; if (keys.w) p1Dir = -1; if (keys.s) p1Dir = 1; if (paddle1.timers.invert > 0) p1Dir *= -1;
    if (p1Dir === -1 && paddle1.y > 0) paddle1.y -= p1Speed; if (p1Dir === 1 && paddle1.y < canvas.height - paddle1.height) paddle1.y += p1Speed;

    let necrosisMult2 = paddle2.timers.necrosis > 0 ? 0.6 : 1;
    let p2Speed = (paddle2.timers.hielo > 0 ? paddle2.speed * 0.4 : paddle2.speed) * necrosisMult2;
    if (config.mode === '2p') {
        let p2Dir = 0; if (keys.up) p2Dir = -1; if (keys.down) p2Dir = 1; if (paddle2.timers.invert > 0) p2Dir *= -1;
        if (p2Dir === -1 && paddle2.y > 0) paddle2.y -= p2Speed; if (p2Dir === 1 && paddle2.y < canvas.height - paddle2.height) paddle2.y += p2Speed;
    } else {
        let targetY = canvas.height / 2;
        if (ball.vx > 0) { let predictedY = (config.difficulty === 'hard' || config.difficulty === 'normal') ? predictBallY(ball, paddle2.x) : ball.y; targetY = predictedY - paddle2.height / 2; }
        let errorMargin = config.difficulty === 'easy' ? 40 : (config.difficulty === 'hard' ? 5 : 20); errorMargin = Math.max(0, errorMargin - rallyCount);
        if (paddle2.timers.invert > 0) { if (paddle2.y < targetY) paddle2.y -= p2Speed; else paddle2.y += p2Speed; } else { if (paddle2.y < targetY - errorMargin) paddle2.y += p2Speed; else if (paddle2.y > targetY + errorMargin) paddle2.y -= p2Speed; }
        paddle2.y = Math.max(0, Math.min(paddle2.y, canvas.height - paddle2.height));
    }

    if (paddle1.timers.skillDur > 0 && config.p1 === 'raijin') { ball.currentSpeed = ball.maxSpeed; ball.color = '#ff0'; }
    if (paddle2.timers.skillDur > 0 && config.p2 === 'raijin') { ball.currentSpeed = ball.maxSpeed; ball.color = '#ff0'; }
    if (paddle1.timers.skillDur > 0 && config.p1 === 'kagutsuchi') { ball.color = '#f50'; if (frameCount % 3 === 0) pManager.spawn(ball.x, ball.y, '#f50', 'burst', 0.5); }
    if (paddle2.timers.skillDur > 0 && config.p2 === 'kagutsuchi') { ball.color = '#f50'; if (frameCount % 3 === 0) pManager.spawn(ball.x, ball.y, '#f50', 'burst', 0.5); }

    let susaSlow = (paddle1.timers.skillDur > 0 && config.p1 === 'susanoo') || (paddle2.timers.skillDur > 0 && config.p2 === 'susanoo') ? 0.6 : 1;
    let allBalls = [ball, ...extraBalls];
    
    if (window.MutationManager) window.MutationManager.update(allBalls, frameCount, canvas.width, canvas.height);

    for (let bIndex = allBalls.length - 1; bIndex >= 0; bIndex--) {
        let b = allBalls[bIndex];
        b.x += b.vx * susaSlow; b.y += b.vy * susaSlow; b.trail.push({ x: b.x, y: b.y }); if (b.trail.length > 8) b.trail.shift();

        if (b.lastHitBy) {
            for (let i = powerUps.length - 1; i >= 0; i--) {
                let pu = powerUps[i]; let dist = Math.hypot(b.x - pu.x, b.y - pu.y);
                if (dist < b.radius + pu.radius) {
                    playSound('powerup'); let p = b.lastHitBy; let opp = p === paddle1 ? paddle2 : paddle1;
                    triggerFlash(p.color, 0.16); kickCamera(5, 0.008);
                    if (pu.type === 'titan') { p.timers.titan = 420; createImpact(pu.x, pu.y, '#ff0', 1.5); showMessage('TITÁN', '#ff0'); }
                    else if (pu.type === 'hielo') { opp.timers.hielo = 300; createImpact(pu.x, pu.y, '#08f', 1.5); showMessage('HIELO', '#08f'); }
                    else if (pu.type === 'ghost') { p.timers.ghost = 240; createImpact(pu.x, pu.y, '#aaa', 1.5); showMessage('FANTASMA', '#aaa'); }
                    else if (pu.type === 'invert') { opp.timers.invert = 240; createImpact(pu.x, pu.y, '#f0f', 1.5); showMessage('CAOS', '#f0f'); }
                    else if (pu.type === 'shield') { p.shield = true; createImpact(pu.x, pu.y, '#0ff', 1.5); showMessage('ESCUDO', '#0ff'); }
                    else if (pu.type === 'multi') { extraBalls.push({ x: b.x, y: b.y, radius: b.radius, vx: -b.vx, vy: -b.vy, baseSpeed: b.baseSpeed, currentSpeed: b.currentSpeed, maxSpeed: b.maxSpeed, color: b.color, glowSize: b.glowSize, lastHitBy: b.lastHitBy, trail: [], isVolatile: false, visible: true, volatileTimer: 0 }); createImpact(pu.x, pu.y, '#fff', 2); showMessage('MULTIBOLA', '#fff'); }
                    powerUps.splice(i, 1);
                }
            }
        }

        if (b.y - b.radius < 0 || b.y + b.radius > canvas.height) {
            b.vy = -b.vy; b.y = b.y - b.radius < 0 ? b.radius : canvas.height - b.radius;
            playSound('wall', 0.8); pManager.spawn(b.x, b.y < 250 ? 0 : canvas.height, '#fff', 'burst', 0.3); kickCamera(2.5, 0); addSpeedLines(b.x, b.y, b.color, 3);
        }

        let pCol = b.x < canvas.width / 2 ? paddle1 : paddle2;
        if (pCol.timers.ghost === 0 && b.x - b.radius < pCol.x + pCol.width && b.x + b.radius > pCol.x && b.y + b.radius > pCol.y && b.y - b.radius < pCol.y + pCol.height) {
            if ((b.vx < 0 && b.x > pCol.x + pCol.width / 2) || (b.vx > 0 && b.x < pCol.x + pCol.width / 2)) {
                b.lastHitBy = pCol;
                if (bIndex === 0) rallyCount++;
                if (window.MutationManager && window.MutationManager.active) window.MutationManager.toxicCharge = Math.min(100, window.MutationManager.toxicCharge + 15);
                
                let isHeavy = GODS[pCol === paddle1 ? config.p1 : config.p2].id === 'kagutsuchi';
                let intensity = Math.min(2, 1 + rallyCount * 0.1) * (isHeavy ? 1.5 : 1);
                let intersectY = b.y - (pCol.y + pCol.height / 2); let normalizedIntersectY = intersectY / (pCol.height / 2);
                let isCrit = Math.abs(normalizedIntersectY) > 0.85;

                if (isCrit) { intensity *= 1.5; playSound('critical', intensity); showMessage('CRÍTICO', '#f00'); } else { playSound(pCol === paddle1 ? 'hit1' : 'hit2', intensity); }
                createImpact(b.x, b.y, pCol.color, intensity); addSpeedLines(b.x, b.y, pCol.color, isCrit ? 14 : 7);
                b.color = pCol.color; b.glowSize = Math.min(30, 15 + rallyCount * 1.5);
                let bounceAngle = normalizedIntersectY * (Math.PI / 3); if (isCrit) bounceAngle *= 1.2;
                let dir = b.x < canvas.width / 2 ? 1 : -1; kickCamera(isCrit ? 8 : 3.5, isCrit ? 0.012 : 0.003, dir === 1 ? 1 : -1, normalizedIntersectY * 1.5);
                
                b.currentSpeed = Math.min(b.maxSpeed, b.baseSpeed + (rallyCount * (isHeavy ? 0.8 : 0.5)) + (isCrit ? 2 : 0));
                paddle2.speed = Math.min(15, paddle2.baseSpeed + rallyCount * 0.3);
                b.vx = dir * b.currentSpeed * Math.cos(bounceAngle); b.vy = b.currentSpeed * Math.sin(bounceAngle);
                b.x = dir === 1 ? pCol.x + pCol.width + b.radius : pCol.x - b.radius;
                if (rallyCount > 0 && rallyCount % 5 === 0 && bIndex === 0) showMessage(`¡Rally x${rallyCount}!`, '#fff');
            }
        }

        if (b.x < -20) {
            if (paddle1.shield) { paddle1.shield = false; b.vx *= -1; b.x = 20; showMessage('¡BLOQUEO!', '#0ff'); playSound('hit1', 2); triggerFlash('#0ff', 0.28); kickCamera(7, 0.012); createImpact(b.x, b.y, '#0ff', 1.4); } 
            else if (bIndex === 0) scorePoint(2); else extraBalls.splice(bIndex - 1, 1);
        } else if (b.x > canvas.width + 20) {
            if (paddle2.shield) { paddle2.shield = false; b.vx *= -1; b.x = canvas.width - 20; showMessage('¡BLOQUEO!', '#0ff'); playSound('hit2', 2); triggerFlash('#0ff', 0.28); kickCamera(7, 0.012); createImpact(b.x, b.y, '#0ff', 1.4); } 
            else if (bIndex === 0) scorePoint(1); else extraBalls.splice(bIndex - 1, 1);
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
    if (p.timers.skillCd > 0) { ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x - 15, p.y + yOffset, 30, 4); ctx.fillStyle = god.color; ctx.fillRect(x - 15, p.y + yOffset, 30 * (1 - pct), 4); } 
    else { ctx.fillStyle = god.color; ctx.fillText('SKILL', x, p.y + yOffset); }
    ctx.textAlign = 'left'; ctx.font = '10px sans-serif';
}

function draw() {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2); ctx.scale(camera.zoom, camera.zoom); ctx.translate(-canvas.width / 2 + camera.x, -canvas.height / 2 + camera.y);
    ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0, 0, 0, 0.32)'; ctx.fillRect(-30, -30, canvas.width + 60, canvas.height + 60);

    let grd = ctx.createLinearGradient(0, 0, canvas.width, 0);
    const leftAlpha = Math.min(0.72, 0.18 + dominance / 150 + tension * 0.14); const rightAlpha = Math.min(0.72, 0.18 + (100 - dominance) / 150 + tension * 0.14);
    grd.addColorStop(0, `${paddle1.color}${Math.floor(leftAlpha * 255).toString(16).padStart(2, '0')}`); grd.addColorStop(0.5, `rgba(0,0,0,${Math.max(0.45, 0.72 - tension * 0.12)})`); grd.addColorStop(1, `${paddle2.color}${Math.floor(rightAlpha * 255).toString(16).padStart(2, '0')}`);
    ctx.fillStyle = grd; ctx.fillRect(-30, -30, canvas.width + 60, canvas.height + 60);

    const glow = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 40, canvas.width / 2, canvas.height / 2, 420);
    glow.addColorStop(0, `rgba(255,255,255,${0.04 + tension * 0.1 + combatPulse * 0.06})`); glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow; ctx.fillRect(-30, -30, canvas.width + 60, canvas.height + 60);

    ambientParticles.forEach(p => { ctx.globalAlpha = p.alpha * (0.75 + tension * 0.4); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 + tension * 0.4), 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1; ctx.lineWidth = 1;
    for (let y = 40; y < canvas.height; y += 40) { ctx.strokeStyle = `rgba(255,255,255,${0.025 + tension * 0.025})`; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    for (let x = 40; x < canvas.width; x += 40) { ctx.strokeStyle = `rgba(255,255,255,${0.018 + tension * 0.018})`; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }

    let redX = (canvas.width * dominance) / 100; ctx.shadowBlur = 10 + tension * 15; ctx.shadowColor = '#fff'; ctx.fillStyle = `rgba(255,255,255,${0.15 + tension * 0.08})`; ctx.fillRect(redX - 1.5, 0, 3, canvas.height); ctx.shadowBlur = 0;
    const corePulse = 1 + Math.sin(arenaTime * 3) * 0.1 + tension * 0.1; const core = ctx.createRadialGradient(redX, canvas.height / 2, 2, redX, canvas.height / 2, 34 * corePulse);
    core.addColorStop(0, `rgba(255,255,255,${0.25 + tension * 0.15})`); core.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = core; ctx.beginPath(); ctx.arc(redX, canvas.height / 2, 34 * corePulse, 0, Math.PI * 2); ctx.fill();

    speedLines.forEach(line => { ctx.globalAlpha = line.life * 0.7; ctx.strokeStyle = line.color; ctx.lineWidth = Math.max(1, line.life * 2.4); ctx.shadowBlur = 8; ctx.shadowColor = line.color; ctx.beginPath(); ctx.moveTo(line.x, line.y); ctx.lineTo(line.x - line.vx * line.length * 0.18, line.y - line.vy * line.length * 0.18); ctx.stroke(); });
    ctx.globalAlpha = 1; ctx.shadowBlur = 20;

    if (window.MutationManager) { window.MutationManager.drawSpores(ctx); window.MutationManager.drawHolograms(ctx); }

    const drawPaddleGlow = (p, isP1) => {
        const god = GODS[isP1 ? config.p1 : config.p2]; const active = p.timers.skillDur > 0;
        ctx.shadowColor = p.timers.necrosis > 0 ? '#0f0' : p.color; ctx.shadowBlur = active ? 34 : 20;
        ctx.fillStyle = p.timers.necrosis > 0 ? '#adff2f' : p.color; ctx.fillRect(p.x, p.y, p.width, p.height);
        if (active) { ctx.globalAlpha = 0.28; ctx.fillRect(p.x - 8, p.y - 8, p.width + 16, p.height + 16); ctx.globalAlpha = 1; ctx.globalAlpha = 0.12; ctx.fillStyle = god.color; ctx.beginPath(); ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.height * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
        if (p.shield) { ctx.strokeStyle = '#0ff'; ctx.lineWidth = 3; ctx.shadowBlur = 20; ctx.beginPath(); const shieldX = isP1 ? p.x + p.width + 7 : p.x - 7; ctx.arc(shieldX, p.y + p.height / 2, p.height * 0.62, -Math.PI / 2, Math.PI / 2, !isP1); ctx.stroke(); }
    };

    drawPaddleGlow(paddle1, true); drawPaddleGlow(paddle2, false);
    if (paddle1.timers.ghost > 0) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height); }
    if (paddle2.timers.ghost > 0) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height); }
    drawPaddleStatus(paddle1, true); drawPaddleStatus(paddle2, false);

    powerUps.forEach(pu => {
        pu.pulse += 0.1; let scale = 1 + Math.sin(pu.pulse) * 0.15; let c = '#fff'; let icon = '?';
        if (pu.type === 'titan') { c = '#ffff00'; icon = '⚡'; } if (pu.type === 'hielo') { c = '#0088ff'; icon = '❄️'; }
        if (pu.type === 'ghost') { c = '#aaaaaa'; icon = '👻'; } if (pu.type === 'multi') { c = '#ffffff'; icon = '⚽'; }
        if (pu.type === 'invert') { c = '#ff00ff'; icon = '🔄'; } if (pu.type === 'shield') { c = '#00ffff'; icon = '🛡️'; }
        ctx.globalAlpha = 0.14; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.radius * scale * 2.15, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.shadowBlur = 18; ctx.shadowColor = c; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.radius * scale, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pu.x, pu.y, pu.radius * (1.35 + Math.sin(pu.pulse * 1.4) * 0.08), 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#000'; ctx.shadowBlur = 0; ctx.font = '16px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(icon, pu.x, pu.y + 1);
    });

    [ball, ...extraBalls].forEach(b => {
        if (!b.visible) return; 
        let renderColor = b.isVolatile ? '#adff2f' : b.color;
        if (b.trail.length > 0) {
            ctx.beginPath(); ctx.moveTo(b.trail[0].x, b.trail[0].y); for (let i = 1; i < b.trail.length; i++) ctx.lineTo(b.trail[i].x, b.trail[i].y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = renderColor; ctx.lineWidth = b.radius * (0.75 + Math.min(1, Math.abs(b.currentSpeed - b.baseSpeed) / 12) * 0.8);
            ctx.lineCap = 'round'; ctx.globalAlpha = 0.36 + Math.min(0.34, Math.abs(b.currentSpeed - b.baseSpeed) / 30);
            ctx.shadowBlur = 12 + Math.abs(b.currentSpeed - b.baseSpeed) * 1.2; ctx.shadowColor = renderColor; ctx.stroke(); ctx.globalAlpha = 1;
        }
        const speedFactor = Math.min(1, Math.abs(b.currentSpeed - b.baseSpeed) / 12);
        ctx.globalAlpha = 0.12 + speedFactor * 0.16; ctx.fillStyle = renderColor; ctx.beginPath(); ctx.arc(b.x, b.y, b.radius * (2.5 + speedFactor * 2), 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.shadowBlur = b.glowSize + speedFactor * 20; ctx.shadowColor = renderColor; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
    });

    pManager.updateAndDraw(ctx);

    ctx.shadowBlur = 0; floatTexts.forEach(ft => { ctx.globalAlpha = ft.life / ft.maxLife; ctx.fillStyle = ft.color; ctx.font = 'bold 20px Orbitron'; ctx.textAlign = 'center'; ctx.shadowBlur = 12; ctx.shadowColor = ft.color; ctx.fillText(ft.text, ft.x, ft.y); }); ctx.globalAlpha = 1;
    const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.25, canvas.width / 2, canvas.height / 2, canvas.height * 0.78);
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, `rgba(0,0,0,${vignetteStrength + tension * 0.12 + combatPulse * 0.08})`);
    ctx.fillStyle = vignette; ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);
    if (flashAlpha > 0) { ctx.globalAlpha = flashAlpha; ctx.fillStyle = flashColor; ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40); ctx.globalAlpha = 1; }

    if (window.MutationManager) {
        window.MutationManager.drawEclipse(ctx, canvas.width, canvas.height, paddle1, paddle2, [ball, ...extraBalls]);
        window.MutationManager.drawBlind(ctx, canvas.width, canvas.height);
    }

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
        ctx.fillStyle = chargePct === 1 ? '#adff2f' : '#228b22'; ctx.shadowBlur = chargePct === 1 ? 15 : 0; ctx.shadowColor = '#adff2f'; ctx.fillRect(bx, by, barW * chargePct, barH); ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, barW, barH);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px Orbitron'; ctx.textAlign = 'center'; ctx.fillText(chargePct === 1 ? '¡MUTACIÓN LISTA!' : 'CARGA TÓXICA', canvas.width / 2, by - 6);
    }

    ctx.restore();
}

// --- GAME LOOP ---
function gameLoop() {
    if (isPlaying && !isPaused) { update(); draw(); } else if (!isPlaying) { draw(); }
    animationId = requestAnimationFrame(gameLoop);
}
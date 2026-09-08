// --- UI NAVIGATION & DOM ---
function navTo(screenId) {
    initAudio();
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function showRecords() {
    ['diff', 'rally'].forEach(k => document.getElementById(`rec-${k}`).innerText = records[`max${k.charAt(0).toUpperCase() + k.slice(1)}`] || 0);
    ['raijin', 'fujin', 'kagu', 'susa', 'ama', 'inari'].forEach(k => {
        let godKey = k === 'kagu' ? 'kagutsuchi' : (k === 'susa' ? 'susanoo' : (k === 'ama' ? 'amaterasu' : k));
        document.getElementById(`rec-win-${k}`).innerText = records.wins[godKey] || 0;
    });
    navTo('screen-records');
}

function togglePause() {
    if (!isPlaying) return;
    isPaused = !isPaused;
    document.getElementById('screen-pause').classList.toggle('hidden', !isPaused);
    document.querySelector('#screen-game .btn').disabled = isPaused;
}

function restartGame() {
    isPaused = false; 
    document.getElementById('screen-pause').classList.add('hidden');
    document.querySelector('#screen-game .btn').disabled = false; 
    startGame();
}

function quitToMenu() {
    isPaused = false; 
    isPlaying = false; 
    document.getElementById('screen-pause').classList.add('hidden');
    document.querySelector('#screen-game .btn').disabled = false; 
    navTo('screen-menu');
}

// --- CHARACTER SELECTION ---
function buildCharSelect() {
    const grid1 = document.getElementById('grid-p1'); 
    const grid2 = document.getElementById('grid-p2');
    if(!grid1 || !grid2) return;
    grid1.innerHTML = ''; grid2.innerHTML = '';

    Object.values(GODS).forEach(god => {
        const createCard = (isP1) => {
            let card = document.createElement('div');
            card.className = `char-card ${isP1 ? (config.p1 === god.id ? 'selected-p1' : '') : (config.p2 === god.id ? 'selected-p2' : '')}`;
            card.innerHTML = `<div class="char-icon">${god.icon}</div><div class="char-name">${god.name}</div><div class="char-stat">${god.desc}<br><span class="skill-desc">${god.skill.name}</span></div>`;
            card.onclick = () => { isP1 ? config.p1 = god.id : config.p2 = god.id; buildCharSelect(); };
            return card;
        };
        grid1.appendChild(createCard(true));
        grid2.appendChild(createCard(false));
    });
}

// --- CONFIGURACIÓN & PRESETS ---

function showConfig() {
    syncConfigUI();
    navTo('screen-config');
}

function syncConfigUI() {
    // Sincronizar inputs con el objeto config actual
    const maxScoreInput = document.getElementById('cfg-max-score');
    if (maxScoreInput) maxScoreInput.value = config.maxScore || 5;

    // Actualizar estado de Chips / Botones visuales
    document.querySelectorAll('.chip').forEach(chip => {
        const key = chip.dataset.key;
        const val = chip.dataset.value;
        if (key && config[key] !== undefined) {
            chip.classList.toggle('active', String(config[key]) === String(val));
        }
    });
}

function setChipValue(key, value, element) {
    config[key] = value;
    // Remueve clase active de los hermanos y se la asigna al seleccionado
    element.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
}

function applyPreset(presetType) {
    if (presetType === 'fast') {
        config.ballSpeed = 1.4;
        config.maxScore = 3;
    } else if (presetType === 'classic') {
        config.ballSpeed = 1.0;
        config.maxScore = 5;
    } else if (presetType === 'chaos') {
        config.ballSpeed = 1.8;
        config.maxScore = 10;
    }
    syncConfigUI();
}

function selectChip(groupId, element) {
    const value = element.dataset.value;
    const container = document.getElementById(groupId);
    
    if (container) {
        container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        element.classList.add('active');
    }
    
    // Mapeo directo a la configuración
    if (groupId === 'group-players') config.is2P = (value === '2p');
    if (groupId === 'group-diff') config.aiDifficulty = value;
    if (groupId === 'group-arena') config.arenaMode = value;
    if (groupId === 'group-ball-speed') config.ballSpeed = parseFloat(value);
    if (groupId === 'group-skill-cd') config.skillCooldownMultiplier = parseFloat(value);
}

function applyPreset(presetType) {
    if (presetType === 'competitive') {
        config.ballSpeed = 8;
        config.arenaMode = 'normal';
    } else if (presetType === 'chaos') {
        config.ballSpeed = 11;
        config.arenaMode = 'mutation';
    } else if (presetType === 'eclipse') {
        config.ballSpeed = 8;
        config.arenaMode = 'eclipse';
    } else if (presetType === 'classic') {
        config.ballSpeed = 6;
        config.arenaMode = 'normal';
    }
    
    const scoreInput = document.getElementById('cfg-score');
    if (scoreInput) scoreInput.value = config.maxScore || 5;
}

buildCharSelect();
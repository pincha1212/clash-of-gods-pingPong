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
buildCharSelect();
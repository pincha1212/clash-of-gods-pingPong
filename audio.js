// audio.js
// --- AUDIO ENGINE ---
let audioCtx;

function initAudio() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { 
        console.warn("Audio no inicializado"); 
    }
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
// config.js
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

let records = { maxDiff: 0, maxRally: 0, wins: { raijin: 0, fujin: 0, kagutsuchi: 0, susanoo: 0, amaterasu: 0, inari: 0 } };

try {
    let saved = JSON.parse(localStorage.getItem('clashGodsRec'));
    if (saved) records = { ...records, ...saved };
} catch (e) { 
    console.warn("No se pudo cargar el archivo de guardado."); 
}
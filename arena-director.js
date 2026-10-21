import { state } from './state.js';
import { ARENAS, LEGACY_ARENA_MIGRATION, SETTINGS } from './config.js';

// Director de evolución: un único reloj de simulación, eventos declarativos y
// una autoridad de estado. Prototipo jugable para Japón, Grecia y Nórdica.
const PROFILES = {
  arena_japanese: {
    name: 'SANTUARIO DE LOS KAMI', color: '#8af0df', baseInterval: [5.5, 8.2],
    events: ['wind_shear', 'spirit_gate', 'seal_pulse'],
    exclusive: ['spirit_gate', 'seal_pulse']
  },
  arena_greek: {
    name: 'CUMBRE DEL OLIMPO', color: '#ffe17a', baseInterval: [5.0, 7.8],
    events: ['wind_shear', 'thunder_charge', 'olympian_bolt'],
    exclusive: ['thunder_charge', 'olympian_bolt']
  },
  arena_norse: {
    name: 'RAÍCES DE YGGDRASIL', color: '#b8d5f2', baseInterval: [5.8, 8.5],
    events: ['wind_shear', 'gravity_pulse', 'frost_front'],
    exclusive: ['gravity_pulse', 'frost_front']
  }
};

const EVENTS = {
  wind_shear: { label: 'CIZALLA DE VIENTO', color: '#b8fff1', shared: true, duration: 3.5, warning: 1.15, weight: 1.25, cooldown: 7, force: .38 },
  gravity_pulse: { label: 'PULSO DE GRAVEDAD', color: '#d7c7ff', shared: true, duration: 3.2, warning: 1.25, weight: .8, cooldown: 8, force: .34 },
  spirit_gate: { label: 'PORTALES DE LOS KAMI', color: '#8af0df', duration: 3.6, warning: 1.3, weight: 1.0, cooldown: 9, force: .36 },
  seal_pulse: { label: 'SELLOS REACTIVOS', color: '#b4fff0', duration: 3.0, warning: 1.0, weight: .9, cooldown: 8, force: .28 },
  thunder_charge: { label: 'CARGA DEL OLIMPO', color: '#ffe17a', duration: 3.4, warning: 1.25, weight: 1.0, cooldown: 9, force: .34 },
  olympian_bolt: { label: 'DESCARGA DE ZEUS', color: '#fff1a8', duration: 2.8, warning: 1.4, weight: .8, cooldown: 10, force: .48 },
  frost_front: { label: 'FRENTE DE NIFLHEIM', color: '#b8d5f2', duration: 3.7, warning: 1.25, weight: 1.0, cooldown: 9, force: .36 }
};

const SYNERGIES = {
  arena_japanese: { pair: ['wind_shear', 'spirit_gate'], id: 'kami_veil', label: 'VELO DE LOS KAMI', color: '#a8fff1', description: 'Viento y portales se entrelazan.' },
  arena_greek: { pair: ['wind_shear', 'thunder_charge'], id: 'olympus_circuit', label: 'CIRCUITO DEL OLIMPO', color: '#fff0a0', description: 'La tormenta convierte el viento en una descarga.' },
  arena_norse: { pair: ['gravity_pulse', 'frost_front'], id: 'niflheim_echo', label: 'ECO DE NIFLHEIM', color: '#d8edff', description: 'El frío amplifica los pulsos de gravedad.' }
};
const PROTOTYPE_ARENAS = new Set(Object.keys(PROFILES));
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => min + Math.random() * (max - min);

function normalizedArenaId() {
  const id = ARENAS.some(a => a.id === state.arenaId) ? state.arenaId : (LEGACY_ARENA_MIGRATION[state.arenaId] || 'arena_japanese');
  return id;
}
function enabled() {
  return state.running && !state.paused && !state.finished && state.mutationMode !== 'mutation' && (state.mythicMode || 'classic') === 'classic' && Boolean(PROFILES[normalizedArenaId()]);
}
function notify(text, color) {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('god-message', { detail: { text, color } }));
}
function contextSnapshot() {
  const ball = (state.balls || []).find(Boolean) || state.ball || {};
  const scores = state.scores || { p1: 0, p2: 0 };
  const speed = Math.hypot(ball.vx || 0, ball.vy || 0);
  const side = ball.x < SETTINGS.width * .38 ? 'left' : ball.x > SETTINGS.width * .62 ? 'right' : 'center';
  const lastHit = ball.lastHit === 'p1' || ball.lastHit === 'p2' ? ball.lastHit : 'none';
  const difference = (scores.p1 || 0) - (scores.p2 || 0);
  const lastPaddle = lastHit !== 'none' ? state.paddles?.[lastHit] : null;
  const opponentPaddle = lastHit === 'p1' ? state.paddles?.p2 : lastHit === 'p2' ? state.paddles?.p1 : null;
  const lastCompetitor = lastHit !== 'none' ? state.selected?.[lastHit] || '' : '';
  return { ball, speed, side, lastHit, difference, rally: state.rally || 0, lastPaddle, opponentPaddle, lastCompetitor };
}
function initialState(arenaId = normalizedArenaId()) {
  const profile = PROFILES[arenaId];
  return {
    enabled: Boolean(profile), arenaId, elapsed: 0, nextIn: profile ? rand(...profile.baseInterval) : 0,
    warning: null, active: [], recent: [], sequence: 0, synergyCooldown: 0,
    lastContext: null, lastMessage: '', phase: 'calma', totalEvolutions: 0
  };
}
export function resetArenaDirector() {
  state.arenaDirector = initialState();
}
export function clearArenaDirector() {
  state.arenaDirector = initialState('');
  state.arenaDirector.enabled = false;
}

function pickEvent(profile, director, context) {
  const candidates = profile.events.filter(id => {
    const spec = EVENTS[id];
    if (!spec) return false;
    if (director.active.some(item => item.id === id)) return false;
    if (director.recent.slice(-2).includes(id)) return false;
    if (director.active.length >= 2) return false;
    return true;
  });
  if (!candidates.length) return null;
  const weights = candidates.map(id => {
    const spec = EVENTS[id]; let weight = spec.weight;
    // Context changes the odds, never directly targets a competitor with a penalty.
    if (context.speed > 8 && (id === 'gravity_pulse' || id === 'olympian_bolt')) weight *= .72;
    if (context.speed < 5.2 && (id === 'wind_shear' || id === 'spirit_gate' || id === 'frost_front')) weight *= 1.22;
    if (Math.abs(context.difference) >= 2 && spec.shared) weight *= 1.12; // comeback-friendly variety
    if (context.rally >= 7 && (id === 'seal_pulse' || id === 'thunder_charge' || id === 'gravity_pulse')) weight *= 1.16;
    if (context.side === 'left' && context.lastHit === 'p1' && id === 'olympian_bolt') weight *= .9;
    if (context.side === 'right' && context.lastHit === 'p2' && id === 'olympian_bolt') weight *= .9;
    // El estado del competidor afecta la selección sin elegir un blanco para el efecto.
    if ((context.lastPaddle?.shield || 0) > 0 && spec.force > .4) weight *= .78;
    if ((context.opponentPaddle?.freeze || 0) > 0 || (context.opponentPaddle?.slow || 0) > 0) {
      if (spec.shared) weight *= 1.18; else if (spec.force > .4) weight *= .82;
    }
    if (context.lastCompetitor && context.lastPaddle?.speed > 8 && id === 'wind_shear') weight *= .92;
    return Math.max(.05, weight);
  });
  const total = weights.reduce((a, b) => a + b, 0); let roll = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) { roll -= weights[i]; if (roll <= 0) return candidates[i]; }
  return candidates[candidates.length - 1];
}
function beginWarning(director, profile, context) {
  const id = pickEvent(profile, director, context);
  if (!id) { director.nextIn = rand(2.5, 4.2); return; }
  const spec = EVENTS[id];
  const direction = context.side === 'left' ? 1 : context.side === 'right' ? -1 : (Math.random() < .5 ? -1 : 1);
  director.warning = { id, time: spec.warning, direction, context: { side: context.side, lastHit: context.lastHit, speed: context.speed } };
  director.phase = 'despertar';
  notify(`${spec.label} EN ${spec.warning.toFixed(1)} s`, spec.color);
}
function activateWarning(director, profile) {
  const warning = director.warning; if (!warning) return;
  const spec = EVENTS[warning.id];
  const active = { id: warning.id, time: spec.duration, duration: spec.duration, direction: warning.direction, age: 0, intensity: 1 };
  director.active.push(active); director.recent.push(warning.id); director.recent = director.recent.slice(-5);
  director.warning = null; director.totalEvolutions++; director.sequence++;
  const combo = SYNERGIES[director.arenaId];
  if (combo && director.active.length === 2 && combo.pair.every(id => director.active.some(item => item.id === id))) {
    director.active.forEach(item => { item.synergy = combo.id; });
    director.phase = 'climax'; director.synergyCooldown = 5.5;
    notify(`${combo.label} · ${combo.description}`, combo.color);
  } else {
    director.phase = 'despertar'; notify(`${spec.label} · ¡ACTIVO!`, spec.color);
  }
  // Si hay un fenómeno activo, una segunda ventana breve permite descubrir sinergias.
  director.nextIn = director.active.length === 1 ? rand(1.0, 2.0) : rand(...profile.baseInterval);
}

export function updateArenaDirector(dt) {
  if (!enabled()) {
    if (state.arenaDirector?.enabled) clearArenaDirector();
    return;
  }
  const arenaId = normalizedArenaId();
  if (!state.arenaDirector?.enabled || state.arenaDirector.arenaId !== arenaId) resetArenaDirector();
  const director = state.arenaDirector, profile = PROFILES[arenaId];
  const delta = clamp(Number.isFinite(dt) ? dt : 0, 0, .033);
  director.elapsed += delta; director.nextIn = Math.max(0, director.nextIn - delta); director.synergyCooldown = Math.max(0, director.synergyCooldown - delta);
  const context = contextSnapshot(); director.lastContext = { speed: context.speed, side: context.side, lastHit: context.lastHit, difference: context.difference };
  for (let i = director.active.length - 1; i >= 0; i--) {
    const item = director.active[i]; item.time = Math.max(0, item.time - delta); item.age += delta;
    if (item.time <= 0) director.active.splice(i, 1);
  }
  if (director.warning) {
    director.warning.time = Math.max(0, director.warning.time - delta);
    if (director.warning.time <= 0) activateWarning(director, profile);
    return;
  }
  if (director.active.length) director.phase = director.active.some(item => item.synergy) ? 'convergencia' : 'despertar';
  else director.phase = 'calma';
  if (director.nextIn <= 0) beginWarning(director, profile, context);
}

export function getArenaDirectorForces(ball = null) {
  const director = state.arenaDirector;
  if (!enabled() || !director?.enabled || director.arenaId !== normalizedArenaId()) return { x: 0, y: 0 };
  const profile = PROFILES[director.arenaId], b = ball || contextSnapshot().ball;
  const t = director.elapsed, ctx = director.lastContext || {};
  let x = 0, y = 0;
  for (const event of director.active) {
    const spec = EVENTS[event.id], d = event.direction || 1, wave = Math.sin(t * 2.1 + event.age * .8);
    switch (event.id) {
      case 'wind_shear': x += d * spec.force * (.45 + .55 * Math.abs(Math.sin(t * 1.65))); y += wave * .08; break;
      case 'gravity_pulse': y += d * spec.force * (.25 + .75 * Math.max(0, Math.sin(t * 3.2))); break;
      case 'spirit_gate': x += Math.sin(t * 2.7) * spec.force; y += Math.cos(t * 2.1) * .16; break;
      case 'seal_pulse': y += d * spec.force * Math.sin(t * 4.2) * .65; break;
      case 'thunder_charge': y += d * spec.force * (.25 + .4 * Math.max(0, Math.sin(t * 2.4))); break;
      case 'olympian_bolt': if (Math.sin(t * 7.5) > .72) { x += d * spec.force * .55; y += -Math.sign((b?.y || 300) - SETTINGS.height / 2 || 1) * spec.force * .3; } break;
      case 'frost_front': x += d * spec.force * (.38 + .35 * Math.max(0, Math.sin(t * 1.7))); y += Math.sin(t * 1.25) * .13; break;
    }
    if (event.synergy) {
      if (event.synergy === 'kami_veil') { x *= 1.12; y += Math.sin(t * 4.5) * .10; }
      if (event.synergy === 'olympus_circuit' && Math.sin(t * 7) > .68) { x += d * .13; y += Math.cos(t * 5) * .12; }
      if (event.synergy === 'niflheim_echo') { y += Math.sin(t * 3.4) * .14; x *= .92; }
    }
  }
  // La desventaja del marcador solo ajusta diversidad/probabilidad; nunca apunta fuerzas al jugador.
  const mag = Math.hypot(x, y), max = .82;
  if (mag > max) { x = x / mag * max; y = y / mag * max; }
  return { x, y };
}

export function drawArenaDirector(ctx) {
  const director = state.arenaDirector;
  if (!director?.enabled || !PROFILES[director.arenaId] || !enabled()) return;
  const profile = PROFILES[director.arenaId], reduced = Boolean(state.settings?.reducedMotion), t = reduced ? 0 : director.elapsed;
  const quality = state.settings?.quality || 'balanced';
  const active = director.active, warning = director.warning;
  if (!active.length && !warning) return;
  ctx.save(); ctx.beginPath(); ctx.rect(24, 24, SETTINGS.width - 48, SETTINGS.height - 48); ctx.clip();
  // Capas visuales ligeras; no crean colisiones ni obstáculos invisibles.
  for (const event of active) {
    const spec = EVENTS[event.id], pulse = reduced ? .5 : .5 + .5 * Math.sin(t * 5.5);
    ctx.globalAlpha = .08 + pulse * .06; ctx.fillStyle = spec.color; ctx.fillRect(24, 24, SETTINGS.width - 48, SETTINGS.height - 48);
    ctx.globalAlpha = .42 + pulse * .18; ctx.strokeStyle = event.synergy ? (SYNERGIES[director.arenaId]?.color || spec.color) : spec.color; ctx.lineWidth = 2;
    if (event.id === 'spirit_gate') {
      for (const x of [160, 840]) { ctx.beginPath(); ctx.ellipse(x, 300 + Math.sin(t * 2 + x) * 16, 26 + pulse * 7, 112, 0, 0, Math.PI * 2); ctx.stroke(); }
    } else if (event.id === 'seal_pulse' || event.id === 'thunder_charge' || event.id === 'gravity_pulse') {
      for (let r = 45; r < 160; r += 35) { ctx.beginPath(); ctx.arc(500, 300, r + pulse * 5, 0, Math.PI * 2); ctx.stroke(); }
    } else if (event.id === 'olympian_bolt') {
      if (quality !== 'low') { ctx.beginPath(); ctx.moveTo(500, 30); ctx.lineTo(478, 98); ctx.lineTo(515, 150); ctx.lineTo(489, 214); ctx.lineTo(507, 270); ctx.stroke(); }
    } else {
      for (let row = 0; row < (quality === 'low' ? 2 : 4); row++) { const y = 110 + row * 120; ctx.beginPath(); ctx.moveTo(30, y + Math.sin(t * 3 + row) * 9); ctx.lineTo(970, y + Math.sin(t * 3 + row + 1) * 12); ctx.stroke(); }
    }
  }
  if (warning) {
    const spec = EVENTS[warning.id]; ctx.globalAlpha = reduced ? .35 : .26 + Math.sin(t * 12) * .08; ctx.strokeStyle = spec.color; ctx.lineWidth = 2.5; ctx.setLineDash([8, 7]);
    ctx.strokeRect(32, 32, SETTINGS.width - 64, SETTINGS.height - 64); ctx.setLineDash([]);
  }
  ctx.restore();
  const label = warning ? `SE ACERCA: ${EVENTS[warning.id].label}` : active.some(e => e.synergy) ? (SYNERGIES[director.arenaId]?.label || EVENTS[active[0].id].label) : active.map(e => EVENTS[e.id].label).join(' + ');
  const color = warning ? EVENTS[warning.id].color : active.some(e => e.synergy) ? (SYNERGIES[director.arenaId]?.color || profile.color) : EVENTS[active[0].id].color;
  ctx.save(); ctx.globalAlpha = .86; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.font = 'bold 11px sans-serif'; ctx.fillText(label, SETTINGS.width / 2, 47); ctx.restore();
}

export function getArenaDirectorStatus() {
  const d = state.arenaDirector;
  if (!d?.enabled) return null;
  return { arenaId: d.arenaId, phase: d.phase, active: d.active.map(e => EVENTS[e.id]?.label).filter(Boolean), warning: d.warning ? EVENTS[d.warning.id]?.label : null, totalEvolutions: d.totalEvolutions };
}

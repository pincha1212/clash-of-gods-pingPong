import { state } from './state.js';
import { ARENAS, LEGACY_ARENA_MIGRATION, SETTINGS } from './config.js';

// Director de evolución: un único reloj de simulación, eventos declarativos y
// una autoridad de estado. Prototipo jugable para Japón, Grecia y Nórdica.
const PROFILES = {
  arena_japanese: { name: 'SANTUARIO DE LOS KAMI', color: '#8af0df', baseInterval: [5.5, 8.2], events: ['wind_shear', 'spirit_gate', 'seal_pulse'], exclusive: ['spirit_gate', 'seal_pulse'] },
  arena_greek: { name: 'CUMBRE DEL OLIMPO', color: '#ffe17a', baseInterval: [5.0, 7.8], events: ['wind_shear', 'thunder_charge', 'olympian_bolt'], exclusive: ['thunder_charge', 'olympian_bolt'] },
  arena_norse: { name: 'RAÍCES DE YGGDRASIL', color: '#b8d5f2', baseInterval: [5.8, 8.5], events: ['wind_shear', 'gravity_pulse', 'frost_front'], exclusive: ['gravity_pulse', 'frost_front'] },
  arena_egyptian: { name: 'TEMPLO DE LA BARCA SOLAR', color: '#f5c56b', baseInterval: [5.4, 8.0], events: ['wind_shear', 'solar_flare', 'eclipse_drift'], exclusive: ['solar_flare', 'eclipse_drift'] },
  arena_indian: { name: 'MANDALA CÓSMICO', color: '#e8a0d0', baseInterval: [5.2, 7.9], events: ['gravity_pulse', 'mandala_spin', 'mantra_resonance'], exclusive: ['mandala_spin', 'mantra_resonance'] },
  arena_mexica: { name: 'JARDÍN DE LA SERPIENTE EMPLUMADA', color: '#78d6a3', baseInterval: [5.1, 7.8], events: ['wind_shear', 'feather_storm', 'sunstone_pulse'], exclusive: ['feather_storm', 'sunstone_pulse'] },
  arena_primordial: { name: 'CAMPO PRIMORDIAL', color: '#d5b078', baseInterval: [5.0, 7.5], events: ['gravity_pulse', 'titan_rift', 'chaos_surge'], exclusive: ['titan_rift', 'chaos_surge'] },
  arena_chinese: { name: 'MONTAÑAS DE LOS INMORTALES', color: '#f0c36c', baseInterval: [5.4, 8.0], events: ['wind_shear', 'cloud_dragon', 'jade_mist'], exclusive: ['cloud_dragon', 'jade_mist'] },
  arena_mesopotamian: { name: 'ZIGURAT ENTRE LOS DOS RÍOS', color: '#d9ae68', baseInterval: [5.3, 8.0], events: ['gravity_pulse', 'river_surge', 'ishtar_gate'], exclusive: ['river_surge', 'ishtar_gate'] },
  arena_celtic: { name: 'CLARO DE LOS TÚMULOS ANTIGUOS', color: '#9ad18a', baseInterval: [5.5, 8.1], events: ['wind_shear', 'root_snare', 'druid_whisper'], exclusive: ['root_snare', 'druid_whisper'] },
  arena_arthurian: { name: 'CAMELOT · SALÓN DEL GRIAL', color: '#c6d5e8', baseInterval: [5.3, 8.0], events: ['gravity_pulse', 'grail_resonance', 'spectral_sword'], exclusive: ['grail_resonance', 'spectral_sword'] },
  arena_persian: { name: 'JARDINES DE SHAHNAMEH', color: '#e7a16f', baseInterval: [5.2, 7.9], events: ['wind_shear', 'simurgh_updraft', 'ember_rain'], exclusive: ['simurgh_updraft', 'ember_rain'] },
  arena_roman: { name: 'FORO DE LOS DIOSES', color: '#e3c18b', baseInterval: [5.3, 8.0], events: ['wind_shear', 'legion_march', 'laurel_surge'], exclusive: ['legion_march', 'laurel_surge'] },
  arena_anglo_saxon: { name: 'SALÓN DE LOS JURAMENTOS', color: '#c5b98a', baseInterval: [5.5, 8.1], events: ['gravity_pulse', 'rune_hum', 'mead_hall_echo'], exclusive: ['rune_hum', 'mead_hall_echo'] },
  arena_germanic: { name: 'BOSQUE DE LAS SAGAS', color: '#c6a77c', baseInterval: [5.2, 7.9], events: ['wind_shear', 'wild_hunt', 'moonlit_charge'], exclusive: ['wild_hunt', 'moonlit_charge'] },
  arena_medieval_europe: { name: 'RUINAS DE LAS LEYENDAS', color: '#b8b4d9', baseInterval: [5.4, 8.0], events: ['gravity_pulse', 'leyline_shift', 'crystal_bloom'], exclusive: ['leyline_shift', 'crystal_bloom'] },
  arena_levantine: { name: 'MAR DE LOS RELATOS ANTIGUOS', color: '#91d4d2', baseInterval: [5.3, 8.0], events: ['wind_shear', 'crescent_tide', 'star_compass'], exclusive: ['crescent_tide', 'star_compass'] }
};

const makeEvent = (label, color, behavior, force = .3, weight = .9, duration = 3.2) => ({ label, color, behavior, duration, warning: 1.15, weight, cooldown: 8, force });
const EVENTS = {
  wind_shear: { label: 'CIZALLA DE VIENTO', color: '#b8fff1', behavior: 'wind', shared: true, duration: 3.5, warning: 1.15, weight: 1.25, cooldown: 7, force: .38 },
  gravity_pulse: { label: 'PULSO DE GRAVEDAD', color: '#d7c7ff', behavior: 'gravity', shared: true, duration: 3.2, warning: 1.25, weight: .8, cooldown: 8, force: .34 },
  spirit_gate: makeEvent('PORTALES DE LOS KAMI', '#8af0df', 'gate', .36, 1.0, 3.6),
  seal_pulse: makeEvent('SELLOS REACTIVOS', '#b4fff0', 'pulse', .28, .9, 3.0),
  thunder_charge: makeEvent('CARGA DEL OLIMPO', '#ffe17a', 'charge', .34, 1.0, 3.4),
  olympian_bolt: makeEvent('DESCARGA DE ZEUS', '#fff1a8', 'bolt', .48, .8, 2.8),
  frost_front: makeEvent('FRENTE DE NIFLHEIM', '#b8d5f2', 'frost', .36, 1.0, 3.7),
  solar_flare: makeEvent('LLAMARADA DE RA', '#ffcf66', 'flare', .35, 1.0, 3.1),
  eclipse_drift: makeEvent('DERIVA DEL ECLIPSE', '#d6a76c', 'eclipse', .31, .9, 3.5),
  mandala_spin: makeEvent('ÓRBITA DEL MANDALA', '#f2a5dc', 'orbit', .34, 1.0, 3.4),
  mantra_resonance: makeEvent('RESONANCIA DEL MANTRA', '#e8b8ff', 'pulse', .3, .9, 3.0),
  feather_storm: makeEvent('TORMENTA DE PLUMAS', '#78d6a3', 'feathers', .36, 1.0, 3.4),
  sunstone_pulse: makeEvent('LATIDO DE LA PIEDRA SOLAR', '#b4f08c', 'pulse', .32, .9, 3.0),
  titan_rift: makeEvent('FISURA DE LOS TITANES', '#d5b078', 'rift', .4, 1.0, 3.5),
  chaos_surge: makeEvent('OLEADA DEL CAOS PRIMORDIAL', '#f2a1b5', 'chaos', .42, .85, 3.0),
  cloud_dragon: makeEvent('DRAGÓN ENTRE LAS NUBES', '#f0c36c', 'dragon', .34, 1.0, 3.6),
  jade_mist: makeEvent('NIEBLA DE JADE', '#9ce4bd', 'mist', .28, .9, 3.7),
  river_surge: makeEvent('CRECIDA DE LOS DOS RÍOS', '#d9ae68', 'river', .36, 1.0, 3.4),
  ishtar_gate: makeEvent('PUERTA DE ISHTAR', '#e8a9ff', 'gate', .34, .9, 3.3),
  root_snare: makeEvent('RAÍCES DESPIERTAS', '#9ad18a', 'roots', .3, 1.0, 3.5),
  druid_whisper: makeEvent('SUSURRO DEL DRUIDA', '#c3f1a0', 'whisper', .29, .9, 3.1),
  grail_resonance: makeEvent('RESONANCIA DEL GRIAL', '#c6d5e8', 'pulse', .32, 1.0, 3.3),
  spectral_sword: makeEvent('ESPADA ESPECTRAL', '#e5edff', 'sword', .39, .9, 2.9),
  simurgh_updraft: makeEvent('ASCENSO DEL SIMURG', '#e7a16f', 'updraft', .35, 1.0, 3.5),
  ember_rain: makeEvent('LLUVIA DE BRASAS', '#ff9b68', 'embers', .31, .9, 3.2),
  legion_march: makeEvent('MARCHA DE LAS LEGIONES', '#e3c18b', 'march', .32, 1.0, 3.3),
  laurel_surge: makeEvent('CORONA DE LAUREL', '#c7e69b', 'pulse', .28, .9, 3.1),
  rune_hum: makeEvent('ZUMBIDO DE LAS RUNAS', '#c5b98a', 'runes', .31, 1.0, 3.4),
  mead_hall_echo: makeEvent('ECO DEL SALÓN', '#f1d69a', 'echo', .3, .9, 3.0),
  wild_hunt: makeEvent('CACERÍA SALVAJE', '#c6a77c', 'hunt', .38, 1.0, 3.2),
  moonlit_charge: makeEvent('CARGA BAJO LA LUNA', '#c7d7f5', 'charge', .34, .9, 3.1),
  leyline_shift: makeEvent('DESPLAZAMIENTO DE LEYLINES', '#b8b4d9', 'leyline', .34, 1.0, 3.5),
  crystal_bloom: makeEvent('FLORACIÓN DE CRISTALES', '#c6c4ff', 'crystal', .3, .9, 3.3),
  crescent_tide: makeEvent('MAREA DE LA LUNA CRECIENTE', '#91d4d2', 'tide', .34, 1.0, 3.5),
  star_compass: makeEvent('BRÚJULA DE ESTRELLAS', '#b7e8ff', 'compass', .3, .9, 3.2)
};

const SYNERGIES = {
  arena_japanese: { pair: ['wind_shear', 'spirit_gate'], id: 'kami_veil', label: 'VELO DE LOS KAMI', color: '#a8fff1', description: 'Viento y portales se entrelazan.' },
  arena_greek: { pair: ['wind_shear', 'thunder_charge'], id: 'olympus_circuit', label: 'CIRCUITO DEL OLIMPO', color: '#fff0a0', description: 'La tormenta convierte el viento en una descarga.' },
  arena_norse: { pair: ['gravity_pulse', 'frost_front'], id: 'niflheim_echo', label: 'ECO DE NIFLHEIM', color: '#d8edff', description: 'El frío amplifica los pulsos de gravedad.' },
  arena_egyptian: { pair: ['wind_shear', 'solar_flare'], id: 'solar_chariot', label: 'CARRERA DE LA BARCA SOLAR', color: '#ffe29a', description: 'El viento aviva la llamarada solar.' },
  arena_indian: { pair: ['gravity_pulse', 'mandala_spin'], id: 'cosmic_dance', label: 'DANZA CÓSMICA', color: '#f6b7ed', description: 'La órbita y la gravedad se sincronizan.' },
  arena_mexica: { pair: ['wind_shear', 'feather_storm'], id: 'quetzal_tempest', label: 'TEMPESTAD DE QUETZAL', color: '#a8f3bf', description: 'Las corrientes levantan plumas espectrales.' },
  arena_primordial: { pair: ['gravity_pulse', 'titan_rift'], id: 'titan_collapse', label: 'COLAPSO TITÁNICO', color: '#f0c38d', description: 'La fisura pulsa con la gravedad primordial.' },
  arena_chinese: { pair: ['wind_shear', 'cloud_dragon'], id: 'dragon_wake', label: 'DESPERTAR DEL DRAGÓN', color: '#ffe0a0', description: 'El dragón canaliza las corrientes celestes.' },
  arena_mesopotamian: { pair: ['gravity_pulse', 'river_surge'], id: 'river_gate', label: 'COMPUERTAS DEL DESTINO', color: '#e8c78d', description: 'La crecida responde a los pulsos del campo.' },
  arena_celtic: { pair: ['wind_shear', 'root_snare'], id: 'green_covenant', label: 'PACTO DEL BOSQUE', color: '#b8ef9f', description: 'Las raíces vibran al ritmo del viento.' },
  arena_arthurian: { pair: ['gravity_pulse', 'grail_resonance'], id: 'grail_ascendant', label: 'GRIAL ASCENDENTE', color: '#e1eaff', description: 'La reliquia amplifica la gravedad arcana.' },
  arena_persian: { pair: ['wind_shear', 'simurgh_updraft'], id: 'simurgh_flight', label: 'VUELO DEL SIMURG', color: '#ffc08e', description: 'Las corrientes elevan el ave legendaria.' },
  arena_roman: { pair: ['wind_shear', 'legion_march'], id: 'legion_eagle', label: 'ÁGUILA DE LAS LEGIONES', color: '#f4dfad', description: 'El impulso rítmico se convierte en una carga.' },
  arena_anglo_saxon: { pair: ['gravity_pulse', 'rune_hum'], id: 'oath_echo', label: 'JURAMENTO RESONANTE', color: '#e7d7a2', description: 'Las runas retumban en el salón.' },
  arena_germanic: { pair: ['wind_shear', 'wild_hunt'], id: 'wild_tempest', label: 'TEMPESTAD DE LA CACERÍA', color: '#d9c39c', description: 'La cacería atraviesa el bosque con ráfagas.' },
  arena_medieval_europe: { pair: ['gravity_pulse', 'leyline_shift'], id: 'cathedral_network', label: 'RED DE LEYLINES', color: '#d6d3ff', description: 'Las líneas arcanas convergen en el campo.' },
  arena_levantine: { pair: ['wind_shear', 'crescent_tide'], id: 'lunar_navigation', label: 'NAVEGACIÓN CELESTE', color: '#baf4f0', description: 'El viento guía la marea lunar.' }
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
    if (context.speed > 8 && (spec.behavior === 'gravity' || spec.behavior === 'bolt' || spec.behavior === 'rift' || spec.behavior === 'chaos')) weight *= .72;
    if (context.speed < 5.2 && ['wind','gate','frost','orbit','feathers','dragon','updraft','tide'].includes(spec.behavior)) weight *= 1.22;
    if (Math.abs(context.difference) >= 2 && spec.shared) weight *= 1.12; // comeback-friendly variety
    if (context.rally >= 7 && ['pulse','charge','gravity','runes','echo'].includes(spec.behavior)) weight *= 1.16;
    if (context.side === 'left' && context.lastHit === 'p1' && spec.behavior === 'bolt') weight *= .9;
    if (context.side === 'right' && context.lastHit === 'p2' && spec.behavior === 'bolt') weight *= .9;
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
      switch (spec.behavior) {
      case 'wind': x += d * spec.force * (.45 + .55 * Math.abs(Math.sin(t * 1.65))); y += wave * .08; break;
      case 'gravity': y += d * spec.force * (.25 + .75 * Math.max(0, Math.sin(t * 3.2))); break;
      case 'gate': x += Math.sin(t * 2.7) * spec.force; y += Math.cos(t * 2.1) * .16; break;
      case 'pulse': y += d * spec.force * Math.sin(t * 4.2) * .65; break;
      case 'charge': y += d * spec.force * (.25 + .4 * Math.max(0, Math.sin(t * 2.4))); x += Math.sin(t * 2.0) * spec.force * .22; break;
      case 'bolt': if (Math.sin(t * 7.5) > .72) { x += d * spec.force * .55; y += -Math.sign((b?.y || 300) - SETTINGS.height / 2 || 1) * spec.force * .3; } break;
      case 'frost': x += d * spec.force * (.38 + .35 * Math.max(0, Math.sin(t * 1.7))); y += Math.sin(t * 1.25) * .13; break;
      case 'flare': y += Math.sin(t * 3.8) * spec.force * .65; if (Math.sin(t * 5.4) > .55) x += d * spec.force * .32; break;
      case 'eclipse': x += Math.sin(t * 1.5) * spec.force * .62; y += Math.cos(t * 2.6) * spec.force * .45; break;
      case 'orbit': { const a = t * 2.2; x += Math.cos(a) * spec.force * .55; y += Math.sin(a) * spec.force * .7; break; }
      case 'feathers': x += Math.sin(t * 3.1) * spec.force * .8; y += Math.cos(t * 2.2) * spec.force * .45; break;
      case 'rift': y += d * spec.force * Math.sin(t * 2.8); x += Math.sin(t * 4.1) * spec.force * .45; break;
      case 'chaos': x += Math.sin(t * 5.3) * spec.force * .7; y += Math.cos(t * 4.7) * spec.force * .7; break;
      case 'dragon': x += d * spec.force * (.25 + .75 * Math.abs(Math.sin(t * 1.4))); y += Math.sin(t * 2.1) * .16; break;
      case 'mist': x += Math.sin(t * 1.1) * spec.force * .48; y += Math.sin(t * 1.7) * .11; break;
      case 'river': y += d * spec.force * (.2 + .8 * Math.abs(Math.sin(t * 1.9))); x += Math.cos(t * 1.4) * .12; break;
      case 'roots': x += Math.sin(t * 2.0) * spec.force * .42; y += d * spec.force * Math.max(0, Math.sin(t * 3.4)) * .55; break;
      case 'whisper': y += Math.sin(t * 2.8) * spec.force * .6; x += Math.sin(t * 1.4) * .1; break;
      case 'sword': if (Math.sin(t * 6.2) > .62) { x += d * spec.force * .55; y += Math.cos(t * 4.5) * .12; } break;
      case 'updraft': y -= spec.force * (.25 + .65 * Math.max(0, Math.sin(t * 2.3))); x += Math.sin(t * 1.6) * .12; break;
      case 'embers': y += Math.sin(t * 5.2) * spec.force * .45; x += d * spec.force * .35; break;
      case 'march': x += d * spec.force * (.2 + .8 * Math.abs(Math.sin(t * 3.2))); y += Math.sin(t * 3.2) * .08; break;
      case 'runes': y += Math.sin(t * 3.7) * spec.force * .55; x += Math.cos(t * 2.5) * .13; break;
      case 'echo': x += Math.sin(t * 4.4) * spec.force * .5; y += Math.cos(t * 4.4) * spec.force * .5; break;
      case 'hunt': x += d * spec.force * (.3 + .7 * Math.max(0, Math.sin(t * 2.8))); y += Math.sin(t * 3.7) * .14; break;
      case 'leyline': x += Math.sin(t * 1.8) * spec.force * .6; y += Math.cos(t * 2.1) * spec.force * .55; break;
      case 'crystal': x += Math.sin(t * 3.6) * spec.force * .45; y += Math.sin(t * 5.1) * spec.force * .45; break;
      case 'tide': x += d * spec.force * (.25 + .65 * Math.sin(t * 1.7) ** 2); y += Math.cos(t * 1.6) * .13; break;
      case 'compass': { const dx = SETTINGS.width / 2 - (b?.x || SETTINGS.width / 2); const dy = SETTINGS.height / 2 - (b?.y || SETTINGS.height / 2); x += Math.sign(dx) * spec.force * .28; y += Math.sign(dy) * spec.force * .28; break; }
    }
    if (event.synergy) {
      if (event.synergy === 'kami_veil') { x *= 1.12; y += Math.sin(t * 4.5) * .10; }
      if (event.synergy === 'olympus_circuit' && Math.sin(t * 7) > .68) { x += d * .13; y += Math.cos(t * 5) * .12; }
      if (event.synergy === 'niflheim_echo') { y += Math.sin(t * 3.4) * .14; x *= .92; }
      if (!['kami_veil','olympus_circuit','niflheim_echo'].includes(event.synergy)) { const pulse = Math.sin(t * 3.1); x += d * pulse * .045; y += Math.cos(t * 2.7) * .045; }
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
    const behavior = spec.behavior;
    if (behavior === 'gate' || behavior === 'dragon' || behavior === 'sword') {
      for (const x of behavior === 'gate' ? [160, 840] : [220, 500, 780]) { ctx.beginPath(); ctx.ellipse(x, 300 + Math.sin(t * 2 + x) * 16, 22 + pulse * 8, behavior === 'sword' ? 90 : 112, t * .15, 0, Math.PI * 2); ctx.stroke(); }
    } else if (['pulse','charge','gravity','orbit','flare','eclipse','runes','crystal','compass'].includes(behavior)) {
      for (let r = 38; r < 160; r += 30) { ctx.beginPath(); ctx.arc(500, 300, r + pulse * 7, behavior === 'orbit' ? t * .4 : 0, Math.PI * 2 + (behavior === 'orbit' ? t * .4 : 0)); ctx.stroke(); }
    } else if (behavior === 'bolt' || behavior === 'rift' || behavior === 'leyline') {
      if (quality !== 'low') { ctx.beginPath(); ctx.moveTo(500, 30); ctx.lineTo(478 + Math.sin(t * 3) * 15, 98); ctx.lineTo(515, 150); ctx.lineTo(489, 214); ctx.lineTo(507, 270); ctx.stroke(); if (behavior === 'leyline') { ctx.beginPath(); ctx.moveTo(60, 90); ctx.lineTo(940, 510); ctx.moveTo(60, 510); ctx.lineTo(940, 90); ctx.stroke(); } }
    } else {
      for (let row = 0; row < (quality === 'low' ? 2 : 4); row++) { const y = 110 + row * 120; ctx.beginPath(); ctx.moveTo(30, y + Math.sin(t * 3 + row) * 9); ctx.lineTo(970, y + Math.sin(t * 3 + row + 1) * 12); ctx.stroke(); }
      if (behavior === 'feathers' || behavior === 'embers' || behavior === 'mist' || behavior === 'frost' || behavior === 'tide') {
        for (let i = 0; i < (quality === 'low' ? 8 : 18); i++) { const x = (i * 71 + t * (behavior === 'embers' ? 24 : -18) + 1000) % 940 + 30; const y = (i * 43 + t * (behavior === 'frost' ? 28 : 13)) % 560 + 20; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (behavior === 'feathers' ? 9 : 2), y + 13); ctx.stroke(); }
      }
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

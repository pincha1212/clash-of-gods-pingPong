import { state } from './state.js';
import { ARENAS, LEGACY_ARENA_MIGRATION, SETTINGS } from './config.js';

// Director de evolución: reloj único, eventos declarativos, compatibilidad y
// sinergias propias para las 17 identidades de arena.
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
  return state.running && !state.paused && !state.finished && state.settings?.arenaEvents !== false && state.mutationMode !== 'mutation' && (state.mythicMode || 'classic') === 'classic' && Boolean(PROFILES[normalizedArenaId()]);
}
function notify(title, color) {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') window.dispatchEvent(new CustomEvent('god-message', { detail: { title, text:title, color, category:'arena' } }));
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
  notify(spec.label, spec.color);
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
    notify(combo.label, combo.color);
  } else {
    director.phase = 'despertar'; notify(spec.label, spec.color);
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
    // La bonificación de sinergia se aplica una sola vez por pareja, y cambia
    // según la lógica mitológica (no es un pulso genérico compartido).
    const combo = SYNERGIES[director.arenaId];
    if (event.synergy && combo && event.id === combo.pair[0]) {
      const nx = ((b?.x || SETTINGS.width / 2) - SETTINGS.width / 2) / (SETTINGS.width / 2);
      const ny = ((b?.y || SETTINGS.height / 2) - SETTINGS.height / 2) / (SETTINGS.height / 2);
      const beat = Math.sin(t * 4.2), fastBeat = Math.sin(t * 7.4);
      switch (event.synergy) {
        case 'kami_veil': x += d * .10; y += Math.sin(t * 4.5) * .15; break;
        case 'olympus_circuit': if (fastBeat > .48) { x += d * .19; y -= Math.sign(ny || 1) * .08; } break;
        case 'niflheim_echo': x *= .86; y += Math.sin(t * 3.4) * .18; break;
        case 'solar_chariot': x += d * (.08 + Math.abs(beat) * .08); y -= Math.max(0, Math.sin(t * 2.1)) * .12; break;
        case 'cosmic_dance': x += -ny * .16; y += nx * .20; break;
        case 'quetzal_tempest': x += Math.sin(t * 5.5 + ny * 3) * .16; y += Math.cos(t * 3.8 + nx * 2) * .13; break;
        case 'titan_collapse': x -= Math.sign(nx || 1) * .13; y -= Math.sign(ny || 1) * .12; break;
        case 'dragon_wake': x += d * (.07 + Math.abs(Math.sin(t * 1.7 + ny)) * .13); y += Math.sin(t * 2.4 + nx * 2) * .17; break;
        case 'river_gate': x += Math.sin(t * 1.6 + ny * 4) * .14; y += d * (.07 + Math.abs(Math.sin(t * 2.2)) * .12); break;
        case 'green_covenant': x += Math.sin(t * 2.8) * .10 - Math.sign(nx || 1) * .06; y += d * Math.max(0, Math.sin(t * 3.4)) * .12; break;
        case 'grail_ascendant': y -= .10 + Math.max(0, Math.sin(t * 2.7)) * .12; x += Math.sin(t * 2.1) * .07; break;
        case 'simurgh_flight': y -= .14 + Math.max(0, Math.sin(t * 2.3)) * .10; x += d * .10; break;
        case 'legion_eagle': if (Math.sin(t * 3.2) > .18) x += d * .21; y += Math.sin(t * 3.2) * .06; break;
        case 'oath_echo': x += Math.sin(t * 4.4) * .13; y += Math.cos(t * 4.4) * .13; break;
        case 'wild_tempest': x += d * Math.sin(t * 2.8) * .17; y += Math.sin(t * 3.7) * .15; break;
        case 'cathedral_network': x += Math.sign(-ny || 1) * .10 + Math.sin(t * 1.8) * .08; y += Math.sign(-nx || 1) * .10 + Math.cos(t * 2.1) * .08; break;
        case 'lunar_navigation': x += Math.sign(-nx || 1) * .10; y += Math.sin(t * 1.6) * .15 - Math.sign(ny || 1) * .05; break;
      }
    }
  }
  // La desventaja del marcador solo ajusta diversidad/probabilidad; nunca apunta fuerzas al jugador.
  const mag = Math.hypot(x, y), max = .82;
  if (mag > max) { x = x / mag * max; y = y / mag * max; }
  return { x, y };
}

function drawArenaPhenomenon(ctx, event, t, pulse, quality) {
  const spec = EVENTS[event.id], behavior = spec.behavior, color = event.synergy ? (SYNERGIES[state.arenaDirector.arenaId]?.color || spec.color) : spec.color;
  const d = event.direction || 1;
  ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.6 + pulse * .8; ctx.globalAlpha = .35 + pulse * .3;
  const edgeL = 46, edgeR = SETTINGS.width - 46, top = 72, bottom = SETTINGS.height - 72;
  const wave = (x, y, width, amp, phase, step = 14) => { ctx.beginPath(); for (let px = x; px <= x + width; px += step) { const py = y + Math.sin(px * .018 + phase) * amp; if (px === x) ctx.moveTo(px, py); else ctx.lineTo(px, py); } ctx.stroke(); };
  switch (behavior) {
    case 'wind':
      for (let i=0;i<(quality==='low'?3:5);i++) { const y=105+i*88+Math.sin(t*2+i)*5; ctx.beginPath();ctx.moveTo(edgeL,y);ctx.lineTo(edgeL+d*36,y-13);ctx.lineTo(edgeL+d*72,y+2);ctx.lineTo(edgeL+d*105,y-7);ctx.stroke();ctx.beginPath();ctx.moveTo(edgeR,y+25);ctx.lineTo(edgeR-d*34,y+12);ctx.lineTo(edgeR-d*72,y+28);ctx.stroke(); }
      break;
    case 'gravity':
      for(let r=35;r<185;r+=28){ctx.beginPath();ctx.ellipse(500,300,r+ pulse*5,r*.58+pulse*3,0,0,TAU);ctx.stroke();} for(let x of [180,820]){ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,top+36);ctx.moveTo(x-6,top+28);ctx.lineTo(x,top+36);ctx.lineTo(x+6,top+28);ctx.stroke();} break;
    case 'gate':
      for(const x of [150,850]){ctx.beginPath();ctx.ellipse(x,300,23+pulse*5,103+pulse*9,t*.12*d,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(x,300,12+pulse*2,83,t*.12*d,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(x-29,404);ctx.lineTo(x+29,404);ctx.stroke();} break;
    case 'bolt': case 'sword':
      for(const x of behavior==='bolt'?[250,500,750]:[130,870]){ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x-18,top+48);ctx.lineTo(x+7,top+67);ctx.lineTo(x-15,top+106);ctx.lineTo(x+5,top+142);ctx.stroke();if(behavior==='sword'){ctx.beginPath();ctx.moveTo(x+15,top+12);ctx.lineTo(x+15,top+112);ctx.moveTo(x-2,top+94);ctx.lineTo(x+32,top+94);ctx.stroke();}} break;
    case 'charge': case 'march':
      for(let x=95;x<960;x+=behavior==='march'?95:170){ctx.beginPath();ctx.moveTo(x,top+Math.sin(t*3+x)*7);ctx.lineTo(x+d*(behavior==='march'?28:45),bottom);ctx.stroke();if(behavior==='march'){ctx.strokeRect(x-7,top+20,14,17);}} break;
    case 'frost':
      for(let i=0;i<(quality==='low'?7:15);i++){const x=(i*71+t*13+1000)%920+40,y=(i*43+t*5)%500+55;ctx.beginPath();for(let a=0;a<6;a++){const ang=a*TAU/6;ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(ang)*(5+pulse*2),y+Math.sin(ang)*(5+pulse*2));}ctx.stroke();}wave(50,200,900,9,t*1.2);wave(50,410,900,8,-t);break;
    case 'flare':
      ctx.beginPath();ctx.arc(500,90,22+pulse*6,0,TAU);ctx.stroke();for(let i=0;i<20;i++){const a=i*TAU/20;ctx.beginPath();ctx.moveTo(500+Math.cos(a)*30,90+Math.sin(a)*30);ctx.lineTo(500+Math.cos(a)*(43+pulse*4),90+Math.sin(a)*(43+pulse*4));ctx.stroke();}for(let x of [390,610]){ctx.beginPath();ctx.moveTo(x,170);ctx.quadraticCurveTo(x-26,140,x,116);ctx.quadraticCurveTo(x+27,148,x,170);ctx.stroke();}break;
    case 'eclipse':
      ctx.beginPath();ctx.arc(500,110,37,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(517,100,35,0,TAU);ctx.stroke();ctx.beginPath();ctx.ellipse(500,110,62,49,0,0,TAU);ctx.stroke();break;
    case 'orbit':
      ctx.save();ctx.translate(500,300);ctx.rotate(t*.28);for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(0,0,48+i*25,18+i*13,i*.11,0,TAU);ctx.stroke();}for(let i=0;i<8;i++){const a=t*.6+i*TAU/8;ctx.beginPath();ctx.arc(Math.cos(a)*145,Math.sin(a)*90,4+pulse*2,0,TAU);ctx.stroke();}ctx.restore();break;
    case 'pulse':
      for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(500,300,28+i*25+pulse*5,0,TAU);ctx.stroke();}ctx.beginPath();ctx.moveTo(470,300);ctx.lineTo(530,300);ctx.moveTo(500,270);ctx.lineTo(500,330);ctx.stroke();break;
    case 'feathers':
      for(let i=0;i<(quality==='low'?8:17);i++){const x=(i*59-t*16+1000)%920+40,y=(i*71+t*14)%500+50;ctx.beginPath();ctx.ellipse(x,y,4,14,Math.sin(t+i)*.8,0,TAU);ctx.moveTo(x-3,y+11);ctx.lineTo(x+4,y-11);ctx.stroke();}break;
    case 'rift': case 'leyline':
      if(behavior==='leyline'){for(let off=-2;off<=2;off++){ctx.beginPath();ctx.moveTo(30,160+off*42);ctx.lineTo(970,440+off*42);ctx.stroke();}ctx.beginPath();ctx.moveTo(40,490);ctx.lineTo(460,110);ctx.lineTo(540,490);ctx.lineTo(960,110);ctx.stroke();}
      else for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(470+j*28,top);for(let i=0;i<7;i++)ctx.lineTo(450+j*31+Math.sin(t*3+i+j)*11,top+i*68);ctx.stroke();}break;
    case 'chaos':
      ctx.save();ctx.translate(500,300);ctx.rotate(t*.7);ctx.beginPath();for(let i=0;i<17;i++){const a=i*TAU/17,r=45+(i%3)*30+Math.sin(t*5+i)*8;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();for(let i=0;i<8;i++)starGlyph(ctx,Math.cos(i*TAU/8)*155,Math.sin(i*TAU/8)*95,7);ctx.restore();break;
    case 'dragon':
      ctx.beginPath();for(let x=40;x<=960;x+=12){const y=150+Math.sin(x*.014+t*1.5)*35+Math.sin(x*.027-t)*12;if(x===40)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();ctx.beginPath();ctx.moveTo(936,132);ctx.lineTo(960,150);ctx.lineTo(936,168);ctx.closePath();ctx.stroke();break;
    case 'mist':
      for(let row=0;row<6;row++){ctx.globalAlpha*=.86;wave(35,100+row*76,930,5+row%2*4,t*1.15+row);}break;
    case 'river': case 'tide':
      for(let row=0;row<6;row++)wave(30,80+row*85,940,8+row%2*5,t*(behavior==='tide'?.8:1.3)+row*1.4);
      if(behavior==='tide'){ctx.beginPath();ctx.arc(500,120,25,Math.PI*.2,Math.PI*1.8);ctx.stroke();}break;
    case 'roots':
      for(const x0 of [35,965])for(let i=0;i<7;i++){const x=x0+(x0<500?i*15:-i*15);ctx.beginPath();ctx.moveTo(x,600);ctx.bezierCurveTo(x+(x0<500?15:-15),520,x+(x0<500?-22:22),470,x+(x0<500?6:-6),390-i*9);ctx.stroke();}break;
    case 'whisper':
      for(let i=0;i<9;i++){const x=110+i*98,y=130+Math.sin(t*2+i)*30;ctx.beginPath();ctx.arc(x,y,3+(i%3)*2,0,TAU);ctx.stroke();ctx.beginPath();ctx.arc(x,y,9+(i%3)*4,0,TAU);ctx.stroke();}break;
    case 'updraft':
      for(let i=0;i<10;i++){const x=90+i*91;ctx.beginPath();ctx.moveTo(x,bottom);ctx.bezierCurveTo(x-25,430+Math.sin(t+i)*12,x+25,250,x+d*8,top);ctx.stroke();}break;
    case 'embers':
      for(let i=0;i<(quality==='low'?8:18);i++){const x=(i*67+t*28+900)%920+40,y=bottom-((i*39+t*48)%470);ctx.beginPath();ctx.arc(x,y,1.5+(i%3),0,TAU);ctx.fill();ctx.beginPath();ctx.moveTo(x,y+10);ctx.lineTo(x-2,y+16);ctx.stroke();}break;
    case 'runes':
      for(let i=0;i<7;i++){const x=90+i*137,y=150+(i%2)*300;ctx.strokeRect(x-12,y-17,24,34);ctx.beginPath();ctx.moveTo(x,y-12);ctx.lineTo(x,y+11);ctx.moveTo(x-8,y-3);ctx.lineTo(x+8,y+4);ctx.stroke();}break;
    case 'echo':
      for(const x of [130,870])for(let r=15;r<110;r+=22){ctx.beginPath();ctx.ellipse(x,300,r+pulse*5,r*.7,0,0,TAU);ctx.stroke();}break;
    case 'hunt':
      for(const x of [120,880]){ctx.beginPath();ctx.moveTo(x-26,155);ctx.lineTo(x-13,121);ctx.lineTo(x,140);ctx.lineTo(x+17,121);ctx.lineTo(x+30,155);ctx.lineTo(x+20,182);ctx.lineTo(x-16,182);ctx.closePath();ctx.stroke();ctx.beginPath();ctx.arc(x-9,154,2,0,TAU);ctx.arc(x+11,154,2,0,TAU);ctx.stroke();}break;
    case 'crystal':
      for(const x of [100,180,820,900,500]){const y=x===500?450:420+(x%3)*25;for(let i=0;i<3;i++){const h=22+i*13,w=8+i*3;ctx.beginPath();ctx.moveTo(x-w,y);ctx.lineTo(x,y-h);ctx.lineTo(x+w,y);ctx.lineTo(x,y+8);ctx.closePath();ctx.stroke();}}break;
    case 'compass':
      ctx.save();ctx.translate(500,300);ctx.rotate(t*.25);for(let i=0;i<8;i++){const a=i*TAU/8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*125,Math.sin(a)*125);ctx.stroke();}ctx.beginPath();ctx.arc(0,0,42,0,TAU);ctx.stroke();ctx.restore();break;
    default:
      wave(35,160,930,8,t);wave(35,440,930,8,-t);
  }
  ctx.restore();
}
function starGlyph(ctx, x, y, r) { ctx.beginPath(); for (let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.4:r;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.stroke(); }

function drawArenaSynergy(ctx, arenaId, t, color, pulse, quality) {
  ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2+pulse;ctx.globalAlpha=.6;
  switch(SYNERGIES[arenaId]?.id){
    case 'kami_veil': for(const x of [150,850]){ctx.beginPath();ctx.ellipse(x,300,35+pulse*4,115,Math.sin(t)*.08,0,TAU);ctx.stroke();}break;
    case 'olympus_circuit': ctx.beginPath();ctx.moveTo(70,130);ctx.lineTo(400,240);ctx.lineTo(485,290);ctx.lineTo(515,310);ctx.lineTo(620,365);ctx.lineTo(930,470);ctx.stroke();ctx.beginPath();ctx.moveTo(70,470);ctx.lineTo(410,350);ctx.lineTo(500,300);ctx.lineTo(930,130);ctx.stroke();break;
    case 'niflheim_echo': for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(500,300,65+i*24,100+i*18,0,0,TAU);ctx.stroke();}break;
    case 'solar_chariot': ctx.beginPath();ctx.arc(500,105,40+pulse*5,0,TAU);ctx.stroke();for(let i=0;i<16;i++){const a=i*TAU/16;ctx.beginPath();ctx.moveTo(500+Math.cos(a)*48,105+Math.sin(a)*48);ctx.lineTo(500+Math.cos(a)*70,105+Math.sin(a)*70);ctx.stroke();}break;
    case 'cosmic_dance': ctx.save();ctx.translate(500,300);ctx.rotate(t*.5);for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(0,0,65+i*35,26+i*18,i*.2,0,TAU);ctx.stroke();}ctx.restore();break;
    case 'quetzal_tempest': for(let y of [100,500]){ctx.beginPath();ctx.moveTo(30,y);ctx.bezierCurveTo(270,y-45,330,y+50,500,y);ctx.bezierCurveTo(670,y-50,760,y+40,970,y-10);ctx.stroke();}break;
    case 'titan_collapse': ctx.beginPath();for(let i=0;i<12;i++){const a=i*TAU/12,r=i%2?130:190;const x=500+Math.cos(a)*r,y=300+Math.sin(a)*r;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();break;
    case 'dragon_wake': ctx.beginPath();ctx.moveTo(25,180);ctx.bezierCurveTo(200,85,320,245,500,160);ctx.bezierCurveTo(680,75,800,235,975,140);ctx.stroke();break;
    case 'river_gate': for(let row=0;row<5;row++){ctx.beginPath();for(let x=30;x<=970;x+=12){const y=210+row*42+Math.sin(x*.02+t+row)*9;if(x===30)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}break;
    case 'green_covenant': for(const x0 of [30,970]){ctx.beginPath();ctx.moveTo(x0,575);ctx.bezierCurveTo(x0+(x0<500?150:-150),470,500,420,500,300);ctx.bezierCurveTo(500,230,500+(x0<500?-120:120),170,500,90);ctx.stroke();}break;
    case 'grail_ascendant': for(let r=45;r<=170;r+=25){ctx.beginPath();ctx.ellipse(500,300-r*.18,r,r*.48,0,0,TAU);ctx.stroke();}ctx.beginPath();ctx.moveTo(500,80);ctx.lineTo(500,220);ctx.stroke();break;
    case 'simurgh_flight': ctx.beginPath();ctx.moveTo(500,240);ctx.bezierCurveTo(390,125,260,130,180,75);ctx.bezierCurveTo(290,215,380,205,500,240);ctx.bezierCurveTo(610,125,740,130,820,75);ctx.bezierCurveTo(710,215,620,205,500,240);ctx.stroke();break;
    case 'legion_eagle': for(let i=0;i<7;i++){const x=90+i*137;ctx.beginPath();ctx.moveTo(x,95);ctx.lineTo(x+25,120);ctx.lineTo(x,145);ctx.lineTo(x-25,120);ctx.closePath();ctx.stroke();}ctx.beginPath();ctx.moveTo(35,300);ctx.lineTo(965,300);ctx.stroke();break;
    case 'oath_echo': for(let r=20;r<150;r+=25){ctx.strokeRect(500-r,300-r,2*r,2*r);}break;
    case 'wild_tempest': for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(30,110+i*90);ctx.bezierCurveTo(220,65+i*90,280,155+i*90,500,100+i*90);ctx.bezierCurveTo(720,50+i*90,780,155+i*90,970,95+i*90);ctx.stroke();}break;
    case 'cathedral_network': ctx.beginPath();ctx.moveTo(40,80);ctx.lineTo(500,300);ctx.lineTo(960,80);ctx.moveTo(40,520);ctx.lineTo(500,300);ctx.lineTo(960,520);ctx.stroke();ctx.beginPath();ctx.arc(500,300,65+pulse*4,0,TAU);ctx.stroke();break;
    case 'lunar_navigation': ctx.beginPath();ctx.arc(500,120,35,Math.PI*.2,Math.PI*1.8);ctx.stroke();for(const [x,y] of [[120,180],[300,105],[700,95],[870,190]]){ctx.beginPath();ctx.moveTo(500,120);ctx.lineTo(x,y);ctx.stroke();starGlyph(ctx,x,y,7);}break;
  }
  ctx.restore();
}

export function drawArenaDirector(ctx) {
  const director = state.arenaDirector;
  if (!director?.enabled || !PROFILES[director.arenaId] || !enabled()) return;
  const profile = PROFILES[director.arenaId], reduced = Boolean(state.settings?.reducedMotion), t = reduced ? 0 : director.elapsed;
  const quality = state.settings?.quality || 'balanced';
  const active = director.active, warning = director.warning;
  if (!active.length && !warning) return;
  ctx.save(); ctx.beginPath(); ctx.rect(24, 24, SETTINGS.width - 48, SETTINGS.height - 48); ctx.clip();
  for (const event of active) {
    const spec = EVENTS[event.id];
    // Estado antiguo o corrupto del director: ignorar el evento desconocido, no romper el frame completo.
    if (!spec) continue;
    const pulse = reduced ? .5 : .5 + .5 * Math.sin(t * 5.5 + event.age);
    ctx.globalAlpha = .045 + pulse * .035; ctx.fillStyle = spec.color; ctx.fillRect(24, 24, SETTINGS.width - 48, SETTINGS.height - 48);
    drawArenaPhenomenon(ctx, event, t, pulse, quality);
  }
  if (active.some(e => e.synergy)) drawArenaSynergy(ctx, director.arenaId, t, SYNERGIES[director.arenaId]?.color || profile.color, reduced ? .3 : .5 + .5 * Math.sin(t * 6), quality);
  if (warning) {
    const spec = EVENTS[warning.id];
    if (spec) {
    const phase = reduced ? .3 : .24 + Math.sin(t * 12) * .1;
    ctx.globalAlpha = phase; ctx.strokeStyle = spec.color; ctx.lineWidth = 2.5; ctx.setLineDash([8, 7]);
    ctx.strokeRect(32, 32, SETTINGS.width - 64, SETTINGS.height - 64); ctx.setLineDash([]);
    // Emblema anticipatorio distinto: el jugador puede reconocer qué fenómeno llega.
    ctx.globalAlpha = .62; ctx.strokeStyle = spec.color; ctx.lineWidth = 2;
    drawArenaPhenomenon(ctx, warning, t, .45, quality);
    }
  }
  ctx.restore();
  const comboActive = active.some(e => e.synergy);
  const warningLabel = warning && EVENTS[warning.id] ? `SE ACERCA: ${EVENTS[warning.id].label}` : '';
  const activeLabels = active.map(e => EVENTS[e.id]?.label).filter(Boolean);
  const label = warningLabel || (comboActive ? (SYNERGIES[director.arenaId]?.label || activeLabels[0] || profile.name) : (activeLabels.join(' + ') || profile.name));
  const color = warning && EVENTS[warning.id] ? EVENTS[warning.id].color : comboActive ? (SYNERGIES[director.arenaId]?.color || profile.color) : (EVENTS[active[0]?.id]?.color || profile.color);
  ctx.save(); ctx.globalAlpha = .9; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.font = 'bold 11px sans-serif'; ctx.fillText(label, SETTINGS.width / 2, 47); ctx.restore();
}

export function getArenaDirectorStatus() {
  const d = state.arenaDirector;
  if (!d?.enabled) return null;
  return { arenaId: d.arenaId, phase: d.phase, active: d.active.map(e => EVENTS[e.id]?.label).filter(Boolean), warning: d.warning ? EVENTS[d.warning.id]?.label : null, totalEvolutions: d.totalEvolutions };
}

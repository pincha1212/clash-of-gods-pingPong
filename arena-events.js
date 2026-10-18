import { state } from './state.js';
import { ARENAS } from './config.js';

// Sistema único de modificadores para Clásico y crónicas compatibles.
const REPEAT_COOLDOWN = 9.5;
const WARNING_DURATION = 1.4;
const GUST_DURATION = 1.25;

// Catálogo editable: cada perfil declara el efecto, los límites y la señal visual.
// Las arenas sin override usan el perfil de su familia visual; las importantes
// y las crónicas tienen perfiles propios para que no dependan solo del estilo.
export const ARENA_MODIFIER_PROFILES = {
  families: {
    storm:   { label: 'RÁFAGA DIVINA', kind: 'wind', axis: 'y', color: '#9defff', force: .82, ambient: .12, warning: 1.4, activeDuration: 1.15, cooldown: 9.5 },
    inferno: { label: 'PULSO SOLAR', kind: 'heat', axis: 'x', color: '#ffd08a', force: .62, ambient: .08, warning: 1.5, activeDuration: 1.05, cooldown: 10 },
    ocean:   { label: 'CORRIENTE ABISAL', kind: 'tide', axis: 'x', color: '#83d8ff', force: .68, ambient: .10, warning: 1.5, activeDuration: 1.2, cooldown: 9.8 },
    moon:    { label: 'PULSO LUNAR', kind: 'lunar', axis: 'y', color: '#c6caff', force: .56, ambient: .09, warning: 1.6, activeDuration: .95, cooldown: 10.5 },
    wild:    { label: 'RÁFAGA ANCESTRAL', kind: 'wild', axis: 'y', color: '#b6f4a4', force: .64, ambient: .10, warning: 1.4, activeDuration: 1.05, cooldown: 10 },
    temple:  { label: 'IMPULSO CELESTIAL', kind: 'celestial', axis: 'x', color: '#f5d99a', force: .60, ambient: .09, warning: 1.5, activeDuration: 1.0, cooldown: 10 }
  },
  arenas: {
    raijin: { label: 'RÁFAGA DE RAIJIN', kind: 'wind', axis: 'y', color: '#9defff', force: 1.05, ambient: .18, warning: 1.4, activeDuration: 1.25, cooldown: 9.5 },
    zeus: { label: 'DESCARGA DEL OLIMPO', kind: 'celestial', axis: 'y', color: '#ffe17a', force: .72, ambient: .08, warning: 1.6, activeDuration: .9, cooldown: 10.5 },
    poseidon: { label: 'MAREA DE POSEIDÓN', kind: 'tide', axis: 'x', color: '#83d8ff', force: .74, ambient: .13, warning: 1.5, activeDuration: 1.2, cooldown: 10 },
    thor: { label: 'TRUENO DE THOR', kind: 'storm', axis: 'y', color: '#b8eaff', force: .76, ambient: .10, warning: 1.5, activeDuration: .95, cooldown: 10.2 },
    jormungandr: { label: 'CORRIENTE DE MIDGARD', kind: 'tide', axis: 'x', color: '#a9e4bd', force: .58, ambient: .09, warning: 1.7, activeDuration: 1.0, cooldown: 11 },
    horus: { label: 'PULSO DEL SOL', kind: 'solar', axis: 'y', color: '#f1cf76', force: .60, ambient: .08, warning: 1.6, activeDuration: .9, cooldown: 10.5 },
    seth: { label: 'VIENTO DEL DESIERTO', kind: 'sand', axis: 'x', color: '#e9a46f', force: .62, ambient: .08, warning: 1.5, activeDuration: 1.0, cooldown: 10.5 },
    indra: { label: 'VAJRA DE INDRA', kind: 'celestial', axis: 'y', color: '#b3e8f2', force: .62, ambient: .09, warning: 1.6, activeDuration: .95, cooldown: 10.5 },
    vritra: { label: 'RETENCIÓN DE LAS AGUAS', kind: 'tide', axis: 'x', color: '#80c6d6', force: .60, ambient: .08, warning: 1.6, activeDuration: 1.0, cooldown: 10.5 },
    typhon: { label: 'VENDAVAL DE TIFÓN', kind: 'wind', axis: 'y', color: '#e8c2c9', force: .88, ambient: .13, warning: 1.25, activeDuration: 2.0, cooldown: 8.6 }
  },
  modes: {
    olympus: { label: 'RÁFAGA DEL OLIMPO', kind: 'celestial', axis: 'y', color: '#ffe17a', force: .70, ambient: .08, warning: 1.5, activeDuration: 1.0, cooldown: 8.25, stageEvery: 0, stageMessages: [] },
    ragnarok: { label: 'RÁFAGA DEL RAGNARÖK', kind: 'frost', axis: 'y', color: '#a9d6df', force: .70, ambient: .10, warning: 1.5, activeDuration: 1.05, cooldown: 8.5, stageEvery: 15, stageMessages: ['EL VIENTO DEL NORTE DESPIERTA','LAS RAÍCES DE MIDGARD SE QUIEBRAN','EL CIELO DEL RAGNARÖK SE ABRE','EL FIN DE LOS DIOSES SE ACERCA'] },
    throne: { label: 'ECLIPSE DEL JUICIO', kind: 'solar', axis: 'y', color: '#cf8064', force: .58, ambient: .08, warning: 1.6, activeDuration: .9, cooldown: 9, stageEvery: 12, stageMessages: ['EL CONSEJO DIVINO SE REÚNE','EL DESIERTO RECLAMA SU PRECIO','EL SOL ENTRA EN ECLIPSE','EL TRONO EXIGE UN HEREDERO'] },
    waters: { label: 'OLEADA DE INDRA', kind: 'tide', axis: 'x', color: '#83d8e8', force: .64, ambient: .10, warning: 1.5, activeDuration: 1.0, cooldown: 9, stageEvery: 14, stageMessages: ['LA TIERRA SE RESQUEBRAJA','VRITRA RETIENE LAS AGUAS','EL VAJRA ROMPE LA OSCURIDAD','LAS AGUAS VUELVEN AL MUNDO'] }
  }
};
const INITIAL_COOLDOWN = 7.5;
const MAX_TOTAL_FORCE = 1.25;
const CLASSIC_CHRONICLES = new Set(['olympus', 'ragnarok', 'throne', 'waters', 'boss-typhon']);

function inactiveState() {
  return { enabled: false, elapsed: 0, cooldown: 0, warning: 0, active: 0, direction: 1, cycle: 0, profileId: '' };
}

function selectedArena() {
  return ARENAS.find(arena => arena.id === state.arenaId) || ARENAS[0];
}

function currentProfile() {
  const mode = state.mythicMode || 'classic';
  const modeProfile = ARENA_MODIFIER_PROFILES.modes[mode];
  if (modeProfile) return { ...modeProfile, id: `mode:${mode}`, name: mode };
  if (mode === 'boss-typhon') return { ...ARENA_MODIFIER_PROFILES.arenas.typhon, id: 'mode:boss-typhon', name: 'Tifón' };
  const arena = selectedArena();
  if (!arena) return null;
  const explicit = ARENA_MODIFIER_PROFILES.arenas[arena.id];
  const family = ARENA_MODIFIER_PROFILES.families[arena.style] || ARENA_MODIFIER_PROFILES.families.temple;
  return { ...family, ...(explicit || {}), id: arena.id, name: arena.name };
}

export function isArenaModifierEnabled() {
  if (state.mutationMode === 'mutation') return false;
  const mode = state.mythicMode || 'classic';
  // Jörmungandr mantiene su mecánica especial de cierre de arena/colisiones.
  // Su geometría no debe mezclarse con el modificador ambiental genérico.
  if (mode === 'boss-jormungandr') return false;
  if (mode === 'classic') return Boolean(selectedArena());
  return CLASSIC_CHRONICLES.has(mode) && Boolean(ARENA_MODIFIER_PROFILES.modes[mode] || mode === 'boss-typhon');
}

function notify(text, color) {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return;
  window.dispatchEvent(new CustomEvent('god-message', { detail: { text, color } }));
}

export function clearArenaEventState() {
  state.arenaEvent = inactiveState();
}

export function resetArenaEventState() {
  if (!isArenaModifierEnabled()) {
    clearArenaEventState();
    return;
  }
  const profile = currentProfile();
  state.arenaEvent = {
    enabled: true,
    elapsed: 0,
    cooldown: INITIAL_COOLDOWN,
    warning: 0,
    active: 0,
    direction: 1,
    cycle: 0,
    profileId: profile?.id || '',
    stageElapsed: 0,
    stage: 0
  };
}

export function updateArenaEvents(dt) {
  if (!isArenaModifierEnabled()) {
    if (state.arenaEvent?.enabled || state.arenaEvent?.warning > 0 || state.arenaEvent?.active > 0) clearArenaEventState();
    return;
  }
  const profile = currentProfile();
  if (!state.arenaEvent?.enabled || state.arenaEvent.profileId !== profile?.id) resetArenaEventState();
  const event = state.arenaEvent;
  const delta = Math.max(0, Math.min(0.033, Number.isFinite(dt) ? dt : 0));
  event.elapsed += delta;
  if (profile.stageEvery > 0 && profile.stageMessages?.length) {
    event.stageElapsed += delta;
    const stage = Math.min(profile.stageMessages.length - 1, Math.floor(event.stageElapsed / profile.stageEvery));
    if (stage > event.stage) { event.stage = stage; notify(profile.stageMessages[stage], profile.color); }
  }

  if (event.warning > 0) {
    event.warning = Math.max(0, event.warning - delta);
    if (event.warning === 0) {
      event.active = profile.activeDuration ?? GUST_DURATION;
      notify(`${profile.label} · ¡AHORA!`, profile.color);
    }
    return;
  }
  if (event.active > 0) {
    event.active = Math.max(0, event.active - delta);
    if (event.active === 0) event.cooldown = profile.cooldown ?? REPEAT_COOLDOWN;
    return;
  }
  event.cooldown = Math.max(0, event.cooldown - delta);
  if (event.cooldown === 0) {
    // El sentido alterna en cada evento para no favorecer permanentemente a un lado.
    event.direction *= -1;
    event.warning = profile.warning ?? WARNING_DURATION;
    event.cycle += 1;
    notify(`${profile.label} EN ${(profile.warning ?? WARNING_DURATION).toFixed(1)} s`, profile.color);
  }
}

export function getArenaForces() {
  if (!isArenaModifierEnabled() || !state.arenaEvent?.enabled) return { x: 0, y: 0 };
  const profile = currentProfile();
  if (!profile) return { x: 0, y: 0 };
  const event = state.arenaEvent;
  const ambient = Math.sin(event.elapsed * 1.4) * profile.ambient;
  const gust = event.active > 0 ? event.direction * profile.force : 0;
  const force = Math.max(-MAX_TOTAL_FORCE, Math.min(MAX_TOTAL_FORCE, ambient + gust));
  return profile.axis === 'x' ? { x: force, y: 0 } : { x: 0, y: force };
}

// Compatibilidad con cualquier llamada antigua al modificador vertical.
export function getArenaWindForce() {
  return getArenaForces().y;
}

function drawArrow(ctx, x, y, direction, axis = 'y') {
  ctx.beginPath();
  if (axis === 'x') {
    const endX = x + direction * 23;
    ctx.moveTo(x, y); ctx.lineTo(endX, y);
    ctx.moveTo(endX, y); ctx.lineTo(endX - direction * 6, y - 5);
    ctx.moveTo(endX, y); ctx.lineTo(endX - direction * 6, y + 5);
  } else {
    const endY = y + direction * 23;
    ctx.moveTo(x, y); ctx.lineTo(x, endY);
    ctx.moveTo(x, endY); ctx.lineTo(x - 5, endY - direction * 6);
    ctx.moveTo(x, endY); ctx.lineTo(x + 5, endY - direction * 6);
  }
  ctx.stroke();
}

export function drawArenaEvent(ctx) {
  if (!isArenaModifierEnabled()) return;
  const event = state.arenaEvent;
  if (!event?.enabled || (event.warning <= 0 && event.active <= 0)) return;
  const profile = currentProfile();
  if (!profile) return;
  const warning = event.warning > 0;
  const reducedMotion = Boolean(state.settings?.reducedMotion);
  const quality = state.settings?.quality || 'balanced';
  const phase = reducedMotion ? 0 : event.elapsed * 3.2;
  const direction = event.direction < 0 ? -1 : 1;
  const axis = profile.axis || 'y';
  const color = profile.color;
  const arrowCount = quality === 'low' ? 2 : quality === 'high' ? 5 : 3;

  ctx.save();
  ctx.beginPath(); ctx.rect(24, 24, 952, 552); ctx.clip();
  ctx.strokeStyle = color; ctx.lineWidth = warning ? 1.8 : 2.2;
  ctx.globalAlpha = warning ? 0.62 : 0.76;
  ctx.setLineDash(warning ? [6, 6] : []);
  for (let side = 0; side < 2; side++) {
    const anchorX = axis === 'x' ? (side === 0 ? 120 : 880) : (side === 0 ? 64 : 936);
    for (let i = 0; i < arrowCount; i++) {
      const anchorY = axis === 'x'
        ? 112 + i * (376 / Math.max(1, arrowCount - 1))
        : 94 + i * (410 / Math.max(1, arrowCount - 1));
      const drift = reducedMotion ? 0 : Math.sin(phase + i + side * 0.8) * 5;
      drawArrow(ctx, axis === 'x' ? anchorX : anchorX + drift, axis === 'x' ? anchorY + drift : anchorY, direction, axis);
    }
  }
  ctx.setLineDash([]);
  const directionName = axis === 'x' ? (direction < 0 ? 'HACIA LA IZQUIERDA' : 'HACIA LA DERECHA') : (direction < 0 ? 'ASCENDENTE' : 'DESCENDENTE');
  const label = warning
    ? `${profile.label} ${directionName} EN ${event.warning.toFixed(1)} s`
    : `${profile.label} ${directionName}`;
  ctx.globalAlpha = 0.92; ctx.fillStyle = 'rgba(4, 11, 22, 0.9)';
  ctx.fillRect(324, 28, 352, 25); ctx.fillStyle = color;
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, 500, 40.5, 342);
  ctx.restore();
}

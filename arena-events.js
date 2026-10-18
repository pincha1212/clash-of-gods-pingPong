import { state } from './state.js';

// Primer piloto: la arena de Raijin combina una corriente suave con ráfagas avisadas.
// El estado vive en state para compartir el ciclo de vida del motor, no en un bucle aparte.
const RAJIN_ARENA_ID = 'raijin';
const INITIAL_COOLDOWN = 7.5;
const REPEAT_COOLDOWN = 9.5;
const WARNING_DURATION = 1.4;
const GUST_DURATION = 1.25;
const BACKGROUND_WIND = 0.24;
const GUST_FORCE = 1.15;

function inactiveState() {
  return { enabled: false, elapsed: 0, cooldown: 0, warning: 0, active: 0, direction: 1, cycle: 0 };
}

export function isArenaModifierEnabled() {
  return state.arenaId === RAJIN_ARENA_ID
    && state.mythicMode === 'classic'
    && state.mutationMode !== 'mutation';
}

function notify(text) {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return;
  window.dispatchEvent(new CustomEvent('god-message', {
    detail: { text, color: '#9defff' }
  }));
}

export function clearArenaEventState() {
  state.arenaEvent = inactiveState();
}

export function resetArenaEventState() {
  if (!isArenaModifierEnabled()) {
    clearArenaEventState();
    return;
  }
  state.arenaEvent = {
    enabled: true,
    elapsed: 0,
    cooldown: INITIAL_COOLDOWN,
    warning: 0,
    active: 0,
    direction: 1,
    cycle: 0
  };
}

export function updateArenaEvents(dt) {
  if (!isArenaModifierEnabled()) {
    if (state.arenaEvent?.enabled || state.arenaEvent?.warning > 0 || state.arenaEvent?.active > 0) {
      clearArenaEventState();
    }
    return;
  }

  if (!state.arenaEvent?.enabled) resetArenaEventState();
  const event = state.arenaEvent;
  const delta = Math.max(0, Math.min(0.033, Number.isFinite(dt) ? dt : 0));
  event.elapsed += delta;

  if (event.warning > 0) {
    event.warning = Math.max(0, event.warning - delta);
    if (event.warning === 0) {
      event.active = GUST_DURATION;
      const directionName = event.direction < 0 ? 'ASCENDENTE' : 'DESCENDENTE';
      notify(`RÁFAGA ${directionName} · ¡AHORA!`);
    }
    return;
  }

  if (event.active > 0) {
    event.active = Math.max(0, event.active - delta);
    if (event.active === 0) event.cooldown = REPEAT_COOLDOWN;
    return;
  }

  event.cooldown = Math.max(0, event.cooldown - delta);
  if (event.cooldown === 0) {
    // Alternar el sentido evita una ventaja permanente para cualquiera de los lados.
    event.direction *= -1;
    event.warning = WARNING_DURATION;
    event.cycle += 1;
    const directionName = event.direction < 0 ? 'ASCENDENTE' : 'DESCENDENTE';
    notify(`RAIJIN PREPARA RÁFAGA ${directionName} · ${WARNING_DURATION.toFixed(1)} s`);
  }
}

export function getArenaWindForce() {
  if (!isArenaModifierEnabled() || !state.arenaEvent?.enabled) return 0;
  const event = state.arenaEvent;
  const ambientWind = Math.sin(event.elapsed * 1.4) * BACKGROUND_WIND;
  return ambientWind + (event.active > 0 ? event.direction * GUST_FORCE : 0);
}

function drawArrow(ctx, x, y, direction) {
  const endY = y + direction * 23;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, endY);
  ctx.moveTo(x, endY);
  ctx.lineTo(x - 5, endY - direction * 6);
  ctx.moveTo(x, endY);
  ctx.lineTo(x + 5, endY - direction * 6);
  ctx.stroke();
}

export function drawArenaEvent(ctx) {
  const event = state.arenaEvent;
  if (!isArenaModifierEnabled() || !event?.enabled || (event.warning <= 0 && event.active <= 0)) return;

  const warning = event.warning > 0;
  const reducedMotion = Boolean(state.settings?.reducedMotion);
  const quality = state.settings?.quality || 'balanced';
  const phase = reducedMotion ? 0 : event.elapsed * 3.2;
  const direction = event.direction < 0 ? -1 : 1;
  const color = warning ? '#b8f4ff' : '#67d9f3';
  const arrowCount = quality === 'low' ? 2 : quality === 'high' ? 5 : 3;

  ctx.save();
  ctx.beginPath();
  ctx.rect(24, 24, 952, 552);
  ctx.clip();

  // El viento se representa en los márgenes para no tapar pelota, paletas ni marcador.
  ctx.strokeStyle = color;
  ctx.lineWidth = warning ? 1.8 : 2.2;
  ctx.globalAlpha = warning ? 0.62 : 0.76;
  ctx.setLineDash(warning ? [6, 6] : []);
  for (let side = 0; side < 2; side++) {
    const x = side === 0 ? 64 : 936;
    for (let i = 0; i < arrowCount; i++) {
      const y = 94 + i * (410 / Math.max(1, arrowCount - 1));
      const drift = reducedMotion ? 0 : Math.sin(phase + i + side * 0.8) * 5;
      drawArrow(ctx, x + drift, y, direction);
    }
  }
  ctx.setLineDash([]);

  const label = warning
    ? `RAIJIN · RÁFAGA ${direction < 0 ? 'ASCENDENTE' : 'DESCENDENTE'} EN ${event.warning.toFixed(1)} s`
    : `RAIJIN · RÁFAGA ${direction < 0 ? 'ASCENDENTE' : 'DESCENDENTE'}`;
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = 'rgba(4, 11, 22, 0.9)';
  ctx.fillRect(324, 28, 352, 25);
  ctx.fillStyle = color;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 500, 40.5, 342);
  ctx.restore();
}

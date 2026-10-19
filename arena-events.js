import { state } from './state.js';
import { ARENAS, LEGACY_ARENA_MIGRATION } from './config.js';

// Un perfil de evento por arena compartida. Solo actúa en Clásico;
// Crónicas, jefes y Mutación mantienen sus gestores dedicados.
const makeProfile = (label, kind, behavior, visual, axis, color, force, ambient, warning, activeDuration, cooldown, rate = 1) => ({
  label, kind, behavior, visual, axis, color, force, ambient, warning, activeDuration, cooldown, rate
});

export const ARENA_MODIFIER_PROFILES = {
  arenas: {
    arena_japanese: makeProfile('CORRIENTE DE LOS KAMI','viento','crosswind','gust','x','#a9f1df',.62,.07,1.5,1.0,10.0,1.7),
    arena_greek: makeProfile('DESCARGA DEL OLIMPO','eléctrico','pulse','lightning','y','#ffe17a',.66,.06,1.6,.88,10.5,2.4),
    arena_norse: makeProfile('FRENTE DE NIFLHEIM','gélido','cold-front','frost','x','#b8d5f2',.58,.06,1.6,1.0,10.5,1.4),
    arena_egyptian: makeProfile('PULSO DE LA BARCA SOLAR','solar','solar-pulse','halo','y','#f5c56b',.58,.06,1.65,.85,10.7,2.2),
    arena_indian: makeProfile('GIRO DEL MANDALA','cósmico','spiral','spiral','x','#e8a0d0',.58,.05,1.6,.95,10.5,1.6),
    arena_mexica: makeProfile('VIENTO DE QUETZALCÓATL','aéreo','sand-shear','sand','x','#78d6a3',.57,.06,1.55,.95,10.3,1.8),
    arena_primordial: makeProfile('RUPTURA PRIMORDIAL','primordial','alternating-shear','quake','y','#d5b078',.62,.05,1.55,.95,10.5,2.0),
    arena_chinese: makeProfile('BRISA DE LOS INMORTALES','viento celeste','crosswind','gust','x','#f0c36c',.55,.05,1.55,.95,10.5,1.6),
    arena_mesopotamian: makeProfile('CORRIENTE DE LOS DOS RÍOS','fluvial','pulse','ripple','y','#d9ae68',.54,.05,1.6,.9,10.8,1.5),
    arena_celtic: makeProfile('ALIENTO DEL BOSQUE ANTIGUO','bosque','crosswind','gust','x','#9ad18a',.52,.05,1.55,.9,10.8,1.5),
    arena_arthurian: makeProfile('ECO DEL GRIAL','arcano','pulse','halo','y','#c6d5e8',.54,.05,1.6,.9,10.8,1.5),
    arena_persian: makeProfile('VIENTO DE LAS SAGAS','abrasador','crosswind','sand','x','#e7a16f',.55,.05,1.55,.9,10.6,1.6),
    arena_roman: makeProfile('IMPULSO DEL FORO','solar','pulse','lightning','y','#e3c18b',.55,.05,1.6,.9,10.8,1.6),
    arena_anglo_saxon: makeProfile('RÁFAGA DEL SALÓN','viento','crosswind','gust','x','#c5b98a',.53,.05,1.55,.9,10.8,1.5),
    arena_germanic: makeProfile('CORRIENTE DE LAS SAGAS','gélido','cold-front','frost','x','#c6a77c',.53,.05,1.55,.9,10.8,1.5),
    arena_medieval_europe: makeProfile('PULSO DE LAS LEYENDAS','arcano','alternating-shear','halo','y','#b8b4d9',.53,.05,1.55,.9,10.8,1.5),
    arena_levantine: makeProfile('MAREA DEL ANTIGUO ORIENTE','fluvial','pulse','ripple','y','#91d4d2',.53,.05,1.55,.9,10.8,1.5)
  }
};
const INITIAL_COOLDOWN = 7.5;
const MAX_TOTAL_FORCE = 1.25;

function inactiveState() {
  return { enabled: false, elapsed: 0, cooldown: 0, warning: 0, active: 0, direction: 1, cycle: 0, profileId: '' };
}

function selectedArena() {
  const id = ARENAS.some(arena => arena.id === state.arenaId) ? state.arenaId : (LEGACY_ARENA_MIGRATION[state.arenaId] || 'arena_japanese');
  if (state.arenaId !== id) state.arenaId = id;
  return ARENAS.find(arena => arena.id === id) || ARENAS[0];
}

function currentProfile() {
  const arena = selectedArena();
  if (!arena) return null;
  const profile = ARENA_MODIFIER_PROFILES.arenas[arena.id];
  // Sin perfil explícito, no se aplica un fenómeno de sustitución silencioso.
  return profile ? { ...profile, id: arena.id, name: arena.name } : null;
}

export function isArenaModifierEnabled() {
  if (state.mutationMode === 'mutation') return false;
  const mode = state.mythicMode || 'classic';
  // Todas las crónicas (incluidos ambos jefes) conservan sus eventos originales.
  // El gestor genérico solo funciona en Clásico para evitar duplicar fuerzas y avisos.
  if (mode !== 'classic') return false;
  return Boolean(selectedArena());
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
  const t = event.elapsed * (profile.rate || 1);
  const dir = event.direction < 0 ? -1 : 1;
  const ambient = Math.sin(t * 1.4) * profile.ambient;
  const active = event.active > 0;
  let x = 0, y = 0;
  if (active) {
    switch (profile.behavior) {
      case 'crosswind': x = dir * profile.force; y = Math.sin(t * 2.4) * profile.force * .22; break;
      case 'thermal-wave': y = dir * profile.force * (.72 + .28 * Math.abs(Math.sin(t * 2.6))); x = Math.sin(t * 1.7) * profile.force * .16; break;
      case 'surge': x = dir * profile.force * (.68 + .32 * Math.abs(Math.sin(t * 2.1))); y = Math.sin(t * 1.3) * profile.force * .12; break;
      case 'solar-pulse': y = dir * profile.force * (.38 + .62 * Math.max(0, Math.sin(t * 2.2))); break;
      case 'pulse': y = dir * profile.force * (.35 + .65 * Math.abs(Math.sin(t * 3.1))); x = Math.sin(t * 1.8) * profile.force * .12; break;
      case 'guard-pulse': x = dir * profile.force * (.45 + .55 * Math.max(0, Math.sin(t * 2.7))); break;
      case 'undertow': x = dir * profile.force * .86; y = -dir * profile.force * .20; break;
      case 'spiral': x = Math.cos(t * 2.2) * profile.force * .72; y = Math.sin(t * 2.2) * profile.force * .72; break;
      case 'drift': x = dir * profile.force * .72; y = Math.sin(t * 1.6) * profile.force * .34; break;
      case 'rune-shear': x = Math.sin(t * 2.0) * profile.force * .35; y = dir * profile.force * .82; break;
      case 'judgement-wave': x = dir * profile.force * (.45 + .55 * Math.abs(Math.sin(t * 2.4))); y = -dir * profile.force * .15; break;
      case 'feint': x = Math.sin(t * 4.0) * profile.force * .45; y = dir * profile.force * .58; break;
      case 'stone-pulse': x = dir * profile.force * Math.max(0, Math.sin(t * 2.5)); break;
      case 'earth-pulse': y = dir * profile.force * (.35 + .65 * Math.max(0, Math.sin(t * 1.9))); x = Math.sin(t * 1.2) * profile.force * .18; break;
      case 'glyph-shift': x = dir * profile.force * .55; y = Math.sin(t * 2.8) * profile.force * .35; break;
      case 'alternating-shear': x = Math.sin(t * 2.3) * profile.force * .55; y = dir * profile.force * .65; break;
      case 'veil-drift': x = Math.sin(t * 1.6) * profile.force * .35; y = dir * profile.force * .65; break;
      case 'charge': x = dir * profile.force; break;
      case 'arrow-burst': y = dir * profile.force; x = Math.sin(t * 2.0) * profile.force * .10; break;
      case 'slipstream': x = dir * profile.force * (.75 + .25 * Math.sin(t * 3.0)); break;
      case 'cold-front': x = dir * profile.force * .78; y = Math.sin(t * 1.4) * profile.force * .18; break;
      case 'lunar-tide': y = dir * profile.force * (.55 + .45 * Math.sin(t * 1.7) ** 2); break;
      case 'seasonal-surge': x = dir * profile.force * (.5 + .5 * Math.sin(t * 2.0) ** 2); y = Math.sin(t * 1.5) * profile.force * .12; break;
      case 'sand-shear': x = dir * profile.force * .70; y = Math.sin(t * 3.4) * profile.force * .38; break;
      case 'thunder-step': y = dir * profile.force * (Math.sin(t * 3.2) > -.15 ? 1 : .25); break;
      case 'multi-surge': x = dir * profile.force * (.45 + .55 * Math.abs(Math.sin(t * 3.5))); y = Math.sin(t * 2.6) * profile.force * .2; break;
      case 'maze-shear': y = dir * profile.force * .58; x = Math.sin(t * 2.7) * profile.force * .42; break;
      default: if (profile.axis === 'x') x = dir * profile.force; else y = dir * profile.force;
    }
  }
  if (profile.axis === 'x') x += ambient;
  else y += ambient;
  // Limitar la resultante completa, no cada componente por separado.
  const magnitude = Math.hypot(x, y);
  if (magnitude > MAX_TOTAL_FORCE) { x = x / magnitude * MAX_TOTAL_FORCE; y = y / magnitude * MAX_TOTAL_FORCE; }
  return { x, y };
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
  const directional = ['crosswind','surge','undertow','drift','charge','arrow-burst','slipstream','cold-front','thunder-step'].includes(profile.behavior);
  if (directional) {
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
  }
  ctx.setLineDash([]);
  // Firma visual propia del fenómeno: se dibuja solo durante aviso/activación,
  // sin añadir obstáculos, colisiones ni una segunda capa ambiental permanente.
  const cx = 500, cy = 300, pulse = reducedMotion ? 0 : Math.sin(phase * 1.7) * 4;
  ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = warning ? .38 : .52;
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = warning ? 1.5 : 2;
  switch (profile.visual) {
    case 'lightning':
      for (let side = -1; side <= 1; side += 2) { ctx.beginPath(); ctx.moveTo(side * 22, -54); ctx.lineTo(side * 7, -18); ctx.lineTo(side * 23, -18); ctx.lineTo(side * 2, 26); ctx.stroke(); }
      break;
    case 'wave': case 'tentacles': case 'heads':
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); for (let x = -88; x <= 88; x += 8) { const y = i * 17 + Math.sin(x / 19 + phase + i) * (profile.visual === 'heads' ? 9 : 6); if (x === -88) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); }
      break;
    case 'spiral':
      ctx.beginPath(); for (let a = .3; a < Math.PI * 4; a += .08) { const r = 4 + a * 5; const x = Math.cos(a + phase * .3) * r, y = Math.sin(a + phase * .3) * r * .58; if (a < .31) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
      break;
    case 'halo': case 'moon': case 'gaze':
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, 0, 30 + i * 18 + pulse, 18 + i * 11 + pulse * .5, 0, 0, Math.PI * 2); ctx.stroke(); }
      if (profile.visual === 'gaze') { ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); }
      break;
    case 'shield': case 'scales':
      ctx.beginPath(); ctx.moveTo(0, -48); ctx.lineTo(38, -30); ctx.lineTo(31, 18); ctx.lineTo(0, 48); ctx.lineTo(-31, 18); ctx.lineTo(-38, -30); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-25, 0); ctx.lineTo(25, 0); ctx.moveTo(0, -25); ctx.lineTo(0, 25); ctx.stroke();
      break;
    case 'runes': case 'maze':
      for (let i = 0; i < 3; i++) { const r = 22 + i * 20; ctx.strokeRect(-r, -r, r * 2, r * 2); }
      ctx.beginPath(); ctx.moveTo(-32, 24); ctx.lineTo(-8, 24); ctx.lineTo(-8, -8); ctx.lineTo(20, -8); ctx.lineTo(20, -30); ctx.stroke();
      break;
    case 'flame': case 'frost': case 'sand': case 'leaves': case 'petals': case 'veil':
      for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7 + phase * .12, r = 25 + (i % 2) * 12; ctx.beginPath(); ctx.ellipse(Math.cos(a) * r, Math.sin(a) * r, 7, 19 + pulse, a, 0, Math.PI * 2); ctx.stroke(); }
      break;
    case 'quake': case 'rift': case 'spear': case 'arrow': case 'wings':
      ctx.beginPath(); ctx.moveTo(-65, -36); ctx.lineTo(-22, -8); ctx.lineTo(-43, 8); ctx.lineTo(0, 48); ctx.lineTo(19, 8); ctx.lineTo(48, -12); ctx.lineTo(30, -28); ctx.lineTo(65, -44); ctx.stroke();
      break;
    case 'gust': case 'speed': case 'cross':
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-72, i * 24 - 8); ctx.lineTo(-18, i * 24 + 4); ctx.lineTo(20, i * 24 - 2); ctx.lineTo(72, i * 24 + 10); ctx.stroke(); }
      break;
    case 'mirage':
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(Math.sin(phase + i) * 12, 0, 24 + i * 20, 18 + i * 12, Math.sin(phase * .2) * .08, 0, Math.PI * 2); ctx.stroke(); }
      break;
    default:
      ctx.beginPath(); ctx.arc(0, 0, 32 + pulse, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-45, 0); ctx.lineTo(45, 0); ctx.moveTo(0, -45); ctx.lineTo(0, 45); ctx.stroke();
  }
  ctx.restore(); ctx.restore();
  const directionName = directional
    ? (axis === 'x' ? (direction < 0 ? 'HACIA LA IZQUIERDA' : 'HACIA LA DERECHA') : (direction < 0 ? 'ASCENDENTE' : 'DESCENDENTE'))
    : (warning ? 'PREPARANDO FENÓMENO' : 'FENÓMENO ACTIVO');
  const label = warning
    ? `${profile.label} · ${directionName} EN ${event.warning.toFixed(1)} s`
    : `${profile.label} · ${directionName}`;
  ctx.globalAlpha = 0.92; ctx.fillStyle = 'rgba(4, 11, 22, 0.9)';
  ctx.fillRect(324, 28, 352, 25); ctx.fillStyle = color;
  ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, 500, 40.5, 342);
  ctx.restore();
}

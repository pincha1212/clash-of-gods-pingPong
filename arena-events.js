import { state } from './state.js';
import { ARENAS, LEGACY_ARENA_MIGRATION } from './config.js';

// Un perfil de evento por arena compartida. Solo actúa en Clásico;
// Crónicas, jefes y Mutación mantienen sus gestores dedicados.
const makeProfile = (label, kind, behavior, visual, axis, color, force, ambient, warning, activeDuration, cooldown, rate = 1) => ({
  label, kind, behavior, visual, axis, color, force, ambient, warning, activeDuration, cooldown, rate
});

export const ARENA_MODIFIER_PROFILES = {
  arenas: {
    arena_japanese: makeProfile('ALIENTO DE LOS KAMI','viento espiritual','kami-crosswind','torii','x','#a9f1df',.55,.045,1.7,1.05,10.5,1.55),
    arena_greek: makeProfile('RAYO DEL OLIMPO','tormenta divina','olympian-bolt','thundercrest','y','#ffe17a',.60,.04,1.75,.9,10.8,2.1),
    arena_norse: makeProfile('FRENTE DE NIFLHEIM','frente gélido','niflheim-front','yggdrasil-pulse','x','#b8d5f2',.53,.04,1.7,1.05,10.8,1.35),
    arena_egyptian: makeProfile('ECLIPSE DE LA BARCA SOLAR','eclipse solar','solar-eclipse','solar-disk','y','#f5c56b',.54,.04,1.8,.9,11.0,1.9),
    arena_indian: makeProfile('GIRO DEL MANDALA','órbita cósmica','mandala-orbit','yantra','x','#e8a0d0',.52,.035,1.7,1.0,10.8,1.5),
    arena_mexica: makeProfile('SERPIENTE DE VIENTO','viento emplumado','feathered-serpent','feathered-serpent','x','#78d6a3',.53,.04,1.65,1.0,10.6,1.65),
    arena_primordial: makeProfile('FISURA DE LA TITANOMAQUIA','fractura primordial','titan-rift','titan-rift','y','#d5b078',.58,.035,1.7,1.0,10.8,1.8),
    arena_chinese: makeProfile('NUBES DE LOS INMORTALES','nube celeste','immortal-cloud','dragon-cloud','x','#f0c36c',.50,.035,1.65,1.0,10.8,1.5),
    arena_mesopotamian: makeProfile('CRECIDA DE LOS DOS RÍOS','crecida fluvial','twin-river','cuneiform-wave','y','#d9ae68',.50,.035,1.7,.95,11.0,1.45),
    arena_celtic: makeProfile('ALIENTO DEL BOSQUE ANTIGUO','pulso del bosque','ancient-grove','knotwork','x','#9ad18a',.49,.035,1.65,.95,11.0,1.45),
    arena_arthurian: makeProfile('RESONANCIA DEL GRIAL','resonancia arcana','grail-resonance','grail','y','#c6d5e8',.50,.035,1.7,.95,11.0,1.45),
    arena_persian: makeProfile('ASCENSO DEL SIMURG','corriente térmica','simurgh-thermal','simurgh','y','#e7a16f',.51,.035,1.65,.95,10.8,1.5),
    arena_roman: makeProfile('MARCHA DE LAS LEGIONES','impulso rítmico','legion-march','laurel','x','#e3c18b',.51,.035,1.65,.95,11.0,1.5),
    arena_anglo_saxon: makeProfile('RUNAS DEL SALÓN','pulso rúnico','mead-hall-rune','mead-hall','y','#c5b98a',.49,.035,1.65,.95,11.0,1.45),
    arena_germanic: makeProfile('CACERÍA SALVAJE','ráfaga de cacería','wild-hunt','wild-hunt','x','#c6a77c',.51,.035,1.65,.95,10.8,1.5),
    arena_medieval_europe: makeProfile('CRUCE DE LEYLINES','corriente arcana','leyline-shift','leyline','y','#b8b4d9',.49,.035,1.65,.95,11.0,1.45),
    arena_levantine: makeProfile('MAREA DE LA LUNA CRECIENTE','marea lunar','crescent-tide','crescent-tide','y','#91d4d2',.50,.035,1.7,.95,11.0,1.45)
  }
};

// Hoja de ruta de evolución visual/sistémica de las arenas. Es metadato de diseño:
// no activa capas ni modifica el comportamiento actual de las arenas por sí solo.
export const ARENA_EVOLUTION_BLUEPRINTS = {
  arena_japanese: {family:'kami', evolution:'Torii vivos', layers:['siluetas parallax','sellos reactivos','puertas de fase'], synergy:'viento + portales'},
  arena_greek: {family:'olympus', evolution:'Olimpo fractal', layers:['columnas quebrables visuales','nubes de tormenta','runas de destino'], synergy:'rayos + zonas de carga'},
  arena_norse: {family:'niflheim', evolution:'Yggdrasil dinámico', layers:['raíces en profundidad','nieve direccional','grietas de hielo'], synergy:'frío + rebotes'},
  arena_egyptian: {family:'solar', evolution:'Barca solar', layers:['disco eclipsable','arena de polvo','jeroglíficos encendidos'], synergy:'luz + sombra'},
  arena_indian: {family:'mandala', evolution:'Mandala orbital', layers:['anillos concéntricos','geometría rotatoria','pétalos energéticos'], synergy:'órbitas + ritmo'},
  arena_mexica: {family:'feathered-serpent', evolution:'Templo emplumado', layers:['escalinatas profundas','plumas espectrales','calendario solar'], synergy:'viento + pulsos'},
  arena_primordial: {family:'titan', evolution:'Falla de los titanes', layers:['estratos geológicos','fragmentos suspendidos','núcleo inestable'], synergy:'fracturas + gravedad'},
  arena_chinese: {family:'immortal-cloud', evolution:'Palacio entre nubes', layers:['dragón de fondo','linternas reactivas','capas de niebla'], synergy:'nubes + corrientes'},
  arena_mesopotamian: {family:'twin-river', evolution:'Zigurat de las mareas', layers:['canales antiguos','tablillas cuneiformes','crecida escalonada'], synergy:'ríos + compuertas'},
  arena_celtic: {family:'ancient-grove', evolution:'Bosque consciente', layers:['raíces luminosas','niebla de brezo','nudos rúnicos'], synergy:'raíces + viento'},
  arena_arthurian: {family:'grail', evolution:'Cámara del Grial', layers:['vidrieras arcanas','niebla caballeresca','espada espectral'], synergy:'juramentos + energía'},
  arena_persian: {family:'simurgh', evolution:'Cielo del Simurg', layers:['plumas incandescentes','corrientes térmicas','mosaico estelar'], synergy:'calor + corrientes'},
  arena_roman: {family:'legion', evolution:'Foro de los dioses', layers:['estandartes animados','mármol agrietado','laureles de victoria'], synergy:'formaciones + impulso'},
  arena_anglo_saxon: {family:'mead-hall', evolution:'Salón de las runas', layers:['vigas talladas','brasas flotantes','inscripciones reactivas'], synergy:'runas + resonancia'},
  arena_germanic: {family:'wild-hunt', evolution:'Cacería espectral', layers:['bosque en silueta','cazadores lejanos','bruma lunar'], synergy:'ráfagas + apariciones'},
  arena_medieval_europe: {family:'leyline', evolution:'Catedral de leylines', layers:['arcos góticos','trazados arcanos','cristales de energía'], synergy:'líneas + portales'},
  arena_levantine: {family:'crescent-tide', evolution:'Jardín de la luna creciente', layers:['mosaicos geométricos','arcos de luz','marea celeste'], synergy:'marea + fases lunares'}
};

export function getArenaEvolutionBlueprint(arenaId = state.arenaId) {
  const id = ARENAS.some(arena => arena.id === arenaId) ? arenaId : (LEGACY_ARENA_MIGRATION[arenaId] || 'arena_japanese');
  return ARENA_EVOLUTION_BLUEPRINTS[id] || ARENA_EVOLUTION_BLUEPRINTS.arena_japanese;
}

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
  // Todas las arenas mitológicas compartidas usan el director global; evitar fuerzas y avisos duplicados.
  if (selectedArena()) return false;
  return Boolean(selectedArena());
}

function notify(title, color) {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return;
  window.dispatchEvent(new CustomEvent('god-message', { detail: { title, text:title, color, category:'arena' } }));
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
    if (stage > event.stage) { event.stage = stage; notify(profile.label, profile.color); }
  }

  if (event.warning > 0) {
    event.warning = Math.max(0, event.warning - delta);
    if (event.warning === 0) {
      event.active = profile.activeDuration ?? GUST_DURATION;
      notify(profile.label, profile.color);
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
    notify(profile.label, profile.color);
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
      case 'kami-crosswind': x = dir * profile.force * (.42 + .58 * Math.abs(Math.sin(t * 1.8))); y = Math.sin(t * 3.1) * profile.force * .22; break;
      case 'olympian-bolt': y = dir * profile.force * (.32 + .48 * Math.max(0, Math.sin(t * 2.1))); x = (Math.sin(t * 5.2) > .72 ? dir : 0) * profile.force * .42; break;
      case 'niflheim-front': x = dir * profile.force * (.58 + .25 * Math.sin(t * 1.1) + .17 * Math.max(0, Math.sin(t * 3.0))); y = Math.sin(t * 1.6) * profile.force * .14; break;
      case 'solar-eclipse': y = dir * profile.force * (.25 + .65 * (0.5 + 0.5 * Math.sin(t * 1.35))); x = Math.sin(t * .8) * profile.force * .18; break;
      case 'mandala-orbit': x = Math.cos(t * 1.9) * profile.force * .62; y = Math.sin(t * 1.9) * profile.force * .62; break;
      case 'feathered-serpent': x = dir * profile.force * (.48 + .22 * Math.sin(t * 2.2)); y = Math.sin(t * 3.2) * profile.force * .46; break;
      case 'titan-rift': y = dir * profile.force * (.45 + .35 * Math.abs(Math.sin(t * 1.7))); x = (Math.sin(t * .9) > .35 ? 1 : -1) * profile.force * .22; break;
      case 'immortal-cloud': x = dir * profile.force * (.38 + .34 * Math.abs(Math.sin(t * 1.5))); y = Math.sin(t * 2.0 + Math.PI / 3) * profile.force * .34; break;
      case 'twin-river': y = dir * profile.force * (.3 + .55 * Math.abs(Math.sin(t * 2.0))); x = Math.sin(t * 1.2) * profile.force * .28; break;
      case 'ancient-grove': x = Math.sin(t * 1.55) * profile.force * .72; y = dir * profile.force * (.18 + .24 * Math.max(0, Math.sin(t * 2.4))); break;
      case 'grail-resonance': y = dir * profile.force * (.25 + .55 * Math.abs(Math.sin(t * 2.3))); x = Math.sin(t * 3.4) * profile.force * .2; break;
      case 'simurgh-thermal': y = dir * profile.force * (.4 + .35 * Math.max(0, Math.sin(t * 1.6))); x = Math.sin(t * 2.1) * profile.force * .38; break;
      case 'legion-march': x = dir * profile.force * (Math.sin(t * 2.5) > -.2 ? .78 : .28); y = Math.sin(t * 1.25) * profile.force * .16; break;
      case 'mead-hall-rune': y = dir * profile.force * (Math.sin(t * 2.8) > -.25 ? .72 : .24); x = Math.sin(t * 1.7) * profile.force * .16; break;
      case 'wild-hunt': x = dir * profile.force * (.28 + .62 * Math.max(0, Math.sin(t * 2.7))); y = Math.sin(t * 4.1) * profile.force * .2; break;
      case 'leyline-shift': x = Math.sin(t * 1.35) * profile.force * .38; y = dir * profile.force * (.38 + .3 * Math.abs(Math.sin(t * 2.0))); break;
      case 'crescent-tide': y = dir * profile.force * (.28 + .58 * (Math.sin(t * .9) ** 2)); x = Math.sin(t * .9 + 1.2) * profile.force * .18; break;
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
  const directional = profile.behavior !== 'mandala-orbit';
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
    case 'torii':
      for (let i = 0; i < 3; i++) { const y = -34 + i * 28; ctx.beginPath(); ctx.moveTo(-52, y); ctx.lineTo(52, y); ctx.moveTo(-40, y); ctx.lineTo(-40, y + 16); ctx.moveTo(40, y); ctx.lineTo(40, y + 16); ctx.stroke(); }
      break;
    case 'thundercrest':
      ctx.beginPath(); ctx.moveTo(-8,-52); ctx.lineTo(20,-18); ctx.lineTo(2,-18); ctx.lineTo(24,10); ctx.lineTo(-4,2); ctx.lineTo(-18,38); ctx.lineTo(-14,5); ctx.lineTo(-34,12); ctx.closePath(); ctx.stroke();
      for (let r=22;r<=48;r+=13) { ctx.beginPath(); ctx.arc(0,0,r,Math.PI*1.1,Math.PI*1.9); ctx.stroke(); }
      break;
    case 'yggdrasil-pulse':
      ctx.beginPath(); ctx.moveTo(0,48); ctx.lineTo(0,-48); ctx.moveTo(0,-12); ctx.lineTo(-34,-38); ctx.moveTo(0,-22); ctx.lineTo(33,-44); ctx.moveTo(0,15); ctx.lineTo(-40,38); ctx.moveTo(0,22); ctx.lineTo(42,40); ctx.stroke();
      for (let r=12;r<=34;r+=11) { ctx.beginPath(); ctx.arc(0,-18,r,0,Math.PI*2); ctx.stroke(); }
      break;
    case 'solar-disk':
      for (let r=14;r<=42;r+=14) { ctx.beginPath(); ctx.arc(0,0,r+pulse*.3,0,Math.PI*2); ctx.stroke(); }
      for (let i=0;i<12;i++) { const a=i*Math.PI/6; ctx.beginPath(); ctx.moveTo(Math.cos(a)*47,Math.sin(a)*47); ctx.lineTo(Math.cos(a)*58,Math.sin(a)*58); ctx.stroke(); }
      break;
    case 'yantra':
      for (let i=0;i<4;i++) { const r=18+i*10; ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(r*.72,r*.65); ctx.lineTo(-r*.72,r*.65); ctx.closePath(); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2); ctx.stroke();
      break;
    case 'feathered-serpent':
      for (let i=-2;i<=2;i++) { ctx.beginPath(); ctx.moveTo(-54,i*12); ctx.quadraticCurveTo(-15,i*12-18,0,i*12); ctx.quadraticCurveTo(18,i*12+18,54,i*12); ctx.stroke(); }
      for (let i=0;i<7;i++) { const x=-36+i*12; ctx.beginPath(); ctx.moveTo(x,-28); ctx.lineTo(x+7,-38-(i%2)*5); ctx.lineTo(x+13,-27); ctx.stroke(); }
      break;
    case 'titan-rift':
      ctx.beginPath(); ctx.moveTo(-18,-54); ctx.lineTo(5,-27); ctx.lineTo(-10,-8); ctx.lineTo(17,12); ctx.lineTo(-3,30); ctx.lineTo(12,52); ctx.stroke();
      for (let i=0;i<3;i++) { ctx.beginPath(); ctx.ellipse(0,0,28+i*13,12+i*8,phase*.08,0,Math.PI*2); ctx.stroke(); }
      break;
    case 'dragon-cloud':
      for (let i=0;i<3;i++) { const y=-24+i*24; ctx.beginPath(); ctx.moveTo(-55,y); ctx.bezierCurveTo(-35,y-22, -15,y+22, 5,y); ctx.bezierCurveTo(25,y-22,45,y+22,55,y); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2); ctx.stroke();
      break;
    case 'cuneiform-wave':
      for (let i=-2;i<=2;i++) { const y=i*16; ctx.beginPath(); ctx.moveTo(-54,y); ctx.lineTo(-34,y-8); ctx.lineTo(-14,y+8); ctx.lineTo(6,y-8); ctx.lineTo(26,y+8); ctx.lineTo(48,y); ctx.stroke(); }
      for (let i=0;i<5;i++) { ctx.beginPath(); ctx.moveTo(-36+i*18,-42); ctx.lineTo(-30+i*18,-31); ctx.stroke(); }
      break;
    case 'knotwork':
      for (let i=0;i<4;i++) { ctx.beginPath(); ctx.ellipse(0,0,18+i*10,30+i*5,(i%2?1:-1)*.6,0,Math.PI*2); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.stroke();
      break;
    case 'grail':
      ctx.beginPath(); ctx.moveTo(-30,-35); ctx.lineTo(30,-35); ctx.lineTo(20,-5); ctx.quadraticCurveTo(0,15,-20,-5); ctx.closePath(); ctx.moveTo(0,14); ctx.lineTo(0,38); ctx.moveTo(-19,39); ctx.lineTo(19,39); ctx.stroke();
      for (let r=22;r<=44;r+=11) { ctx.beginPath(); ctx.arc(0,-5,r,Math.PI*1.05,Math.PI*1.95); ctx.stroke(); }
      break;
    case 'simurgh':
      ctx.beginPath(); ctx.moveTo(0,35); ctx.bezierCurveTo(-10,5,-48,5,-48,-28); ctx.bezierCurveTo(-25,-18,-14,-36,0,-48); ctx.bezierCurveTo(14,-36,25,-18,48,-28); ctx.bezierCurveTo(48,5,10,5,0,35); ctx.stroke();
      for (let i=0;i<5;i++) { ctx.beginPath(); ctx.moveTo(-38+i*19,14); ctx.lineTo(-28+i*14,28+(i%2)*7); ctx.stroke(); }
      break;
    case 'laurel':
      for (let side of [-1,1]) for (let i=0;i<5;i++) { const y=-35+i*17; ctx.beginPath(); ctx.ellipse(side*(20+i*4),y,7,13,side*.65,0,Math.PI*2); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(0,-48); ctx.lineTo(0,45); ctx.stroke();
      break;
    case 'mead-hall':
      ctx.beginPath(); ctx.moveTo(-45,34); ctx.lineTo(-45,-24); ctx.lineTo(0,-48); ctx.lineTo(45,-24); ctx.lineTo(45,34); ctx.stroke();
      for (let i=-1;i<=1;i++) { ctx.beginPath(); ctx.moveTo(i*22,-12); ctx.lineTo(i*22+8,0); ctx.lineTo(i*22-6,14); ctx.stroke(); }
      break;
    case 'wild-hunt':
      for (let i=-1;i<=1;i++) { ctx.beginPath(); ctx.moveTo(-48,i*20+5); ctx.lineTo(-25,i*20-7); ctx.lineTo(-4,i*20+5); ctx.lineTo(18,i*20-7); ctx.lineTo(46,i*20+5); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-10,-38); ctx.lineTo(-23,-52); ctx.moveTo(10,-38); ctx.lineTo(23,-52); ctx.arc(0,-25,18,Math.PI,Math.PI*2); ctx.stroke();
      break;
    case 'leyline':
      ctx.beginPath(); ctx.moveTo(-52,-35); ctx.lineTo(-18,-35); ctx.lineTo(-18,0); ctx.lineTo(18,0); ctx.lineTo(18,35); ctx.lineTo(52,35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-52,35); ctx.lineTo(-32,15); ctx.lineTo(-4,15); ctx.lineTo(-4,-18); ctx.lineTo(28,-18); ctx.lineTo(52,-42); ctx.stroke();
      break;
    case 'crescent-tide':
      for (let i=0;i<3;i++) { ctx.beginPath(); ctx.arc(-8+i*8,0,24+i*9,-Math.PI*.72,Math.PI*.72); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(22,-25,8,0,Math.PI*2); ctx.stroke();
      break;
    default:
      ctx.beginPath(); ctx.arc(0, 0, 32 + pulse, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-45, 0); ctx.lineTo(45, 0); ctx.moveTo(0, -45); ctx.lineTo(0, 45); ctx.stroke();
  }
  ctx.restore();
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

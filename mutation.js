// mutation.js — Corrupción individual, poderes compartidos y eventos de la Cancha Mutante.
// La física de la pelota sigue perteneciendo a physics.js: este módulo solo propone
// modificaciones acotadas sobre la pelota existente y administra sus temporizadores.
import { state } from './state.js';
import { SETTINGS } from './config.js';

export const MUTATION_MAX_CHARGE = 100;
export const MUTATION_THRESHOLDS = [25, 50, 75, 90];
export const MUTATION_VACCINE_REDUCTION = 12;
const SIDES = ['p1', 'p2'];
const POWER_DEFAULTS = Object.freeze({
  pulseCooldown: 0, pulsePenalty: 0,
  shieldTime: 0, shieldPenalty: 0, shieldUsedRally: false,
  ruptureCooldown: 0, ruptureBoost: 0, rupturePenalty: 0,
  avatarActive: 0, avatarPenalty: 0, avatarPending: false
});

function makePlayerMutation() {
  return {
    charge: 0,
    unlocked: { 25: false, 50: false, 75: false, 90: false },
    lastGain: 0,
    lastSource: null,
    concededStreak: 0,
    avatarUsed: false,
    powers: { ...POWER_DEFAULTS }
  };
}
function makeArenaEvent() { return { warning: 0, active: 0, cooldown: 4.2, direction: 1 }; }

function ensureMutationState() {
  if (!state.mutation || typeof state.mutation !== 'object') state.mutation = {};
  const mutation = state.mutation;
  mutation.active = state.mutationMode === 'mutation';
  mutation.maxCharge = MUTATION_MAX_CHARGE;
  mutation.rot = Math.max(0, Math.min(100, Number(mutation.rot) || 0));
  mutation.rotElapsed = Math.max(0, Number(mutation.rotElapsed) || 0);
  if (!mutation.players || typeof mutation.players !== 'object') mutation.players = {};
  for (const side of SIDES) {
    const player = mutation.players[side];
    if (!player || typeof player !== 'object') mutation.players[side] = makePlayerMutation();
    else {
      player.charge = Math.max(0, Math.min(MUTATION_MAX_CHARGE, Number(player.charge) || 0));
      if (!player.unlocked || typeof player.unlocked !== 'object') player.unlocked = {};
      for (const threshold of MUTATION_THRESHOLDS) player.unlocked[threshold] = player.charge >= threshold || Boolean(player.unlocked[threshold]);
      player.lastGain = Number(player.lastGain) || 0;
      player.concededStreak = Math.max(0, Math.floor(Number(player.concededStreak) || 0));
      player.avatarUsed = Boolean(player.avatarUsed);
      if (!player.powers || typeof player.powers !== 'object') player.powers = { ...POWER_DEFAULTS };
      else player.powers = { ...POWER_DEFAULTS, ...player.powers };
      for (const key of Object.keys(POWER_DEFAULTS)) {
        if (key !== 'shieldUsedRally' && key !== 'avatarPending') player.powers[key] = Math.max(0, Number(player.powers[key]) || 0);
        else player.powers[key] = Boolean(player.powers[key]);
      }
      if (!('lastSource' in player)) player.lastSource = null;
    }
  }
  mutation.arenaEvent = { ...makeArenaEvent(), ...(mutation.arenaEvent || {}) };
  for (const key of ['warning', 'active', 'cooldown']) mutation.arenaEvent[key] = Math.max(0, Number(mutation.arenaEvent[key]) || 0);
  mutation.arenaEvent.direction = mutation.arenaEvent.direction < 0 ? -1 : 1;
  return mutation;
}

function notify(name, detail) {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
}
function playerStatus(player) {
  const charge = Math.max(0, Math.min(MUTATION_MAX_CHARGE, player.charge));
  const stage = charge >= 90 ? 90 : charge >= 75 ? 75 : charge >= 50 ? 50 : charge >= 25 ? 25 : 0;
  return {
    charge, stage, ready: charge >= 100, unlocked: { ...player.unlocked },
    lastGain: player.lastGain, concededStreak: player.concededStreak,
    avatarUsed: player.avatarUsed, powers: { ...player.powers },
    lastSource: player.lastSource ? { ...player.lastSource } : null
  };
}
function publicStatus(mutation = ensureMutationState()) {
  const players = { p1: playerStatus(mutation.players.p1), p2: playerStatus(mutation.players.p2) };
  return {
    active: Boolean(mutation.active), maxCharge: MUTATION_MAX_CHARGE, players,
    charge: players.p1.charge, ready: players.p1.ready || players.p2.ready,
    stage: Math.max(players.p1.stage, players.p2.stage),
    rot: mutation.rot, rotElapsed: mutation.rotElapsed,
    arenaStage: getMutationArenaStage(), arenaEvent: { ...mutation.arenaEvent }
  };
}

export function getMutationStatus() { return publicStatus(); }
export function setMutationMode(mode) {
  state.mutationMode = mode === 'mutation' ? 'mutation' : 'off';
  return resetMutationState(state.mutationMode === 'mutation');
}
export function resetMutationState(active = state.mutationMode === 'mutation') {
  state.mutationMode = active ? 'mutation' : 'off';
  state.mutation = {
    active: Boolean(active), maxCharge: MUTATION_MAX_CHARGE, rot: 0, rotElapsed: 0,
    players: { p1: makePlayerMutation(), p2: makePlayerMutation() }, arenaEvent: makeArenaEvent()
  };
  const status = publicStatus(state.mutation);
  notify('mutation-state-changed', status);
  notify('mutation-charge-changed', { ...status, reset: true });
  return status;
}

// Goles recibidos: +3, +6, +9 y +12 por racha. La corrupción alta añade inestabilidad:
// +1 desde 50%, +2 desde 75%. Solo se altera la carga del jugador que recibió el gol.
export function registerMutationGoal(side, source = {}) {
  const mutation = ensureMutationState();
  if (!mutation.active || !SIDES.includes(side)) return { accepted: false, side: null, status: publicStatus(mutation) };
  const player = mutation.players[side];
  const otherSide = side === 'p1' ? 'p2' : 'p1';
  const before = player.charge;
  const previousArenaStage = getMutationArenaStage();
  player.concededStreak += 1;
  mutation.players[otherSide].concededStreak = 0;
  const baseGain = Math.min(12, player.concededStreak * 3);
  const instability = before >= 75 ? 2 : before >= 50 ? 1 : 0;
  const requested = Math.min(14, baseGain + instability);
  let targetCharge = before + requested;
  // Si todavía no usó el Avatar, nunca saltar directamente de menos de 90% al límite fatal.
  // Llegará a 99%, desbloqueará el Avatar y tendrá una última oportunidad antes del 100%.
  if (before < 90 && targetCharge >= MUTATION_MAX_CHARGE && !player.avatarUsed) targetCharge = 99;
  player.charge = Math.min(MUTATION_MAX_CHARGE, targetCharge);
  // La pudrición del escenario es una memoria acumulativa del partido: las vacunas no la revierten.
  mutation.rot = Math.min(100, Math.max(mutation.rot, player.charge * 0.62) + Math.max(4, (player.charge - before) * 0.7));
  player.lastGain = player.charge - before;
  player.lastSource = { type: 'goal-conceded', side, streak: player.concededStreak, ballId: typeof source.ballId === 'string' ? source.ballId : null };

  const unlockedNow = [];
  for (const threshold of MUTATION_THRESHOLDS) {
    if (before < threshold && player.charge >= threshold && !player.unlocked[threshold]) {
      player.unlocked[threshold] = true;
      unlockedNow.push(threshold);
    } else if (player.charge >= threshold) player.unlocked[threshold] = true;
  }
  // El Avatar se prepara solo si el jugador cruza 90% y todavía no alcanzó el límite de derrota.
  if (before < 90 && player.charge >= 90 && player.charge < MUTATION_MAX_CHARGE && !player.avatarUsed) {
    player.avatarUsed = true;
    player.powers.avatarPending = true;
    if (!unlockedNow.includes(90)) unlockedNow.push(90);
  }

  const status = publicStatus(mutation);
  const detail = { side, gain: player.lastGain, charge: player.charge, before, streak: player.concededStreak, baseGain, instability, unlockedNow, defeated: player.charge >= MUTATION_MAX_CHARGE, status };
  notify('mutation-charge-changed', status);
  if (getMutationArenaStage() > previousArenaStage) notify('mutation-rot-stage-changed', { stage: getMutationArenaStage(), rot: mutation.rot, reason: 'goal' });
  notify('mutation-goal', detail);
  for (const threshold of unlockedNow) notify('mutation-threshold-reached', { side, threshold, charge: player.charge, streak: player.concededStreak });
  if (player.powers.avatarPending) notify('mutation-avatar-pending', { side, charge: player.charge });
  return { accepted: player.lastGain > 0, ...detail };
}

// Alias de compatibilidad para versiones previas; la puntuación ya no influye en Mutación.
export function accumulateMutationCharge(side, _scores = state.scores, source = {}) {
  return registerMutationGoal(side, source);
}

export function reduceMutationCharge(side, amount = MUTATION_VACCINE_REDUCTION) {
  const mutation = ensureMutationState();
  if (!mutation.active || !SIDES.includes(side)) return { accepted: false, side: null, status: publicStatus(mutation) };
  const player = mutation.players[side];
  const before = player.charge;
  player.charge = Math.max(0, before - Math.max(1, Number(amount) || MUTATION_VACCINE_REDUCTION));
  player.lastGain = player.charge - before;
  player.lastSource = { type: 'vaccine', side, reduced: before - player.charge };
  // Los poderes desbloqueados se conservan durante el partido aunque la vacuna baje la carga.
  const detail = { side, before, charge: player.charge, reduction: before - player.charge, status: publicStatus(mutation) };
  notify('mutation-charge-changed', detail.status);
  notify('mutation-vaccine-used', detail);
  return { accepted: detail.reduction > 0, ...detail };
}

export function getMutationArenaStage() {
  const mutation = ensureMutationState();
  if (!mutation.active) return 0;
  const rot = mutation.rot || 0;
  return rot >= 75 ? 4 : rot >= 50 ? 3 : rot >= 25 ? 2 : 1;
}
export function getMutationArenaEvent() { return { ...ensureMutationState().arenaEvent }; }
export function applyMutationArenaForce(ball, dt) {
  if (!ball || state.mutationMode !== 'mutation') return;
  const event = ensureMutationState().arenaEvent;
  if (event.active > 0) {
    const stage = getMutationArenaStage();
    ball.vy += event.direction * (stage >= 4 ? 3.6 : stage >= 3 ? 2.8 : 1.8) * dt;
  }
}

export function updateMutationEffects(dt, ball = state.ball) {
  const mutation = ensureMutationState();
  if (!mutation.active) return;
  dt = Math.max(0, Math.min(.05, Number(dt) || 0));
  const previousArenaStage = getMutationArenaStage();
  mutation.rotElapsed += dt;
  // La cancha se pudre lentamente aunque nadie reciba goles. Cada gol acelera esa evolución.
  mutation.rot = Math.min(100, mutation.rot + dt * 0.12);
  if (getMutationArenaStage() > previousArenaStage) {
    notify('mutation-rot-stage-changed', { stage: getMutationArenaStage(), rot: mutation.rot, reason: 'time' });
    notify('god-message', { text: `LA CANCHA SE PUDRE · FASE ${getMutationArenaStage()}`, color: '#aaff69' });
  }
  for (const side of SIDES) {
    const player = mutation.players[side], power = player.powers;
    const hadShield = power.shieldTime > 0, hadRupture = power.ruptureBoost > 0;
    for (const key of ['pulseCooldown', 'pulsePenalty', 'shieldTime', 'shieldPenalty', 'ruptureCooldown', 'ruptureBoost', 'rupturePenalty', 'avatarActive', 'avatarPenalty']) power[key] = Math.max(0, power[key] - dt);
    if (hadShield && power.shieldTime === 0) power.shieldPenalty = .42;
    if (hadRupture && power.ruptureBoost === 0) power.rupturePenalty = .48;
  }

  // Escudo del abismo: en vez de anular un gol, amplía temporalmente la paleta al acercarse el peligro.
  if (ball && ball.vx !== 0) for (const side of SIDES) {
    const player = mutation.players[side], power = player.powers, paddle = state.paddles?.[side];
    if (!player.unlocked[50] || power.shieldUsedRally || !paddle || paddle.shield > 0) continue;
    const threatened = side === 'p1'
      ? ball.vx < 0 && ball.x <= 205 && ball.x >= 46
      : ball.vx > 0 && ball.x >= SETTINGS.width - 205 && ball.x <= SETTINGS.width - 46;
    if (threatened) {
      power.shieldTime = .86;
      power.shieldUsedRally = true;
      // Usa la autoridad de escudo que ya consulta la resolución de goles en physics.js.
      paddle.shield = .86;
      paddle.shieldMode = 'mutation';
      notify('god-message', { text: 'ESCUDO DEL ABISMO · PROTECCIÓN ACTIVADA', color: '#9eff70' });
    }
  }

  const event = mutation.arenaEvent;
  const arenaStage = getMutationArenaStage();
  if (arenaStage < 2) {
    event.warning = 0; event.active = 0; event.cooldown = 4.2;
    return;
  }
  if (event.active > 0) {
    event.active = Math.max(0, event.active - dt);
    if (event.active === 0) event.cooldown = arenaStage >= 4 ? 5 + Math.random() * 2 : arenaStage >= 3 ? 8 + Math.random() * 3 : 15 + Math.random() * 5;
  } else if (event.warning > 0) {
    event.warning = Math.max(0, event.warning - dt);
    if (event.warning === 0) {
      event.active = arenaStage >= 4 ? 1.65 : arenaStage >= 3 ? 1.35 : 0.95;
      notify('god-message', { text: 'PULSO DE LA CANCHA MUTANTE', color: '#b9ff76' });
    }
  } else {
    event.cooldown = Math.max(0, event.cooldown - dt);
    if (event.cooldown === 0) {
      event.warning = arenaStage >= 4 ? 1.1 : arenaStage >= 3 ? 1.2 : 1.4;
      event.direction = Math.random() < .5 ? -1 : 1;
      notify('god-message', { text: 'LA CANCHA SE CONTRAE · PREPARATE', color: '#c5ff88' });
    }
  }
}

export function getMutationMovementMultiplier(side) {
  const player = ensureMutationState().players[side];
  if (!player) return 1;
  const power = player.powers;
  let multiplier = power.ruptureBoost > 0 ? 1.48 : 1;
  const penalties = [power.pulsePenalty, power.shieldPenalty, power.rupturePenalty, power.avatarPenalty].filter(value => value > 0);
  if (penalties.length) multiplier *= Math.max(.48, 1 - Math.max(...penalties));
  return Math.max(.48, Math.min(1.48, multiplier));
}

export function consumeMutationShield(side) {
  const mutation = ensureMutationState();
  if (!mutation.active || !SIDES.includes(side)) return;
  const player = mutation.players[side];
  player.powers.shieldTime = 0;
  player.powers.shieldPenalty = .56;
  notify('god-message', { text: 'ESCUDO DEL ABISMO · GOL EVITADO, CONTROL REDUCIDO', color: '#9eff70' });
}

export function getMutationShieldScale(side) {
  const player = ensureMutationState().players[side];
  return player?.unlocked?.[50] && player.powers.shieldTime > 0 ? 1.28 : 1;
}

export function applyMutationPaddleHit(side, ball) {
  if (state.mutationMode !== 'mutation' || !ball || !SIDES.includes(side)) return [];
  const player = ensureMutationState().players[side], power = player.powers;
  const labels = [];
  let speed = Math.hypot(ball.vx, ball.vy) || ball.speed || SETTINGS.ballSpeed;
  let angle = Math.atan2(ball.vy, ball.vx);
  if (player.unlocked[25] && power.pulseCooldown <= 0) {
    power.pulseCooldown = 1.8;
    power.pulsePenalty = .32;
    speed *= 1.07;
    angle += (Math.random() - .5) * .34;
    labels.push('PULSO CAÓTICO');
  }
  if (player.unlocked[75] && power.ruptureCooldown <= 0) {
    power.ruptureCooldown = 2.7;
    power.ruptureBoost = .62;
    speed *= 1.09;
    angle += (Math.random() - .5) * .16;
    labels.push('IMPULSO DE RUPTURA');
  }
  if (power.avatarActive > 0) {
    power.avatarPenalty = .36;
    speed *= 1.11;
    angle += (Math.random() - .5) * .22;
    labels.push('AVATAR · PELOTA ALTERADA');
  }
  if (labels.length) {
    speed = Math.max(3.2, Math.min(SETTINGS.maxBallSpeed, speed));
    ball.vx = Math.cos(angle) * speed;
    ball.vy = Math.sin(angle) * speed;
    ball.speed = speed;
    notify('mutation-power-activated', { side, powers: labels, charge: player.charge });
    notify('god-message', { text: labels.join(' + '), color: '#b9ff76' });
  }
  return labels;
}

// Cada saque elimina los efectos temporales y reinicia sus recargas. La carga, las rachas
// de goles recibidos, los desbloqueos y el uso único del Avatar persisten.
export function resetMutationRally() {
  const mutation = ensureMutationState();
  if (!mutation.active) return publicStatus(mutation);
  for (const side of SIDES) {
    const player = mutation.players[side], power = player.powers;
    power.pulseCooldown = 0; power.pulsePenalty = 0;
    power.shieldTime = 0; power.shieldPenalty = 0; power.shieldUsedRally = false;
    power.ruptureCooldown = 0; power.ruptureBoost = 0; power.rupturePenalty = 0;
    power.avatarActive = 0; power.avatarPenalty = 0;
    const paddle = state.paddles?.[side];
    if (paddle?.shieldMode === 'mutation') { paddle.shield = 0; paddle.shieldMode = ''; }
    if (power.avatarPending) {
      power.avatarPending = false;
      power.avatarActive = 5.0;
      mutation.arenaEvent.warning = 0;
      mutation.arenaEvent.active = 1.8;
      mutation.arenaEvent.cooldown = 8;
      mutation.arenaEvent.direction = Math.random() < .5 ? -1 : 1;
      notify('mutation-avatar-activated', { side, duration: 5.0 });
      notify('god-message', { text: 'AVATAR DE CORRUPCIÓN · TRANSFORMACIÓN', color: '#c5ff88' });
    }
  }
  if (!SIDES.some(side => mutation.players[side].powers.avatarActive > 0)) {
    mutation.arenaEvent.warning = 0;
    mutation.arenaEvent.active = 0;
    const arenaStage = getMutationArenaStage();
    mutation.arenaEvent.cooldown = arenaStage >= 4 ? 5 + Math.random() * 2 : arenaStage >= 3 ? 8 + Math.random() * 3 : arenaStage >= 2 ? 14 + Math.random() * 4 : 0;
  }
  return publicStatus(mutation);
}

// mutation.js — Base de corrupción individual para el modo Mutación.
// Sin poderes ni efectos de arena: esta capa solo registra carga y desbloqueos.
import { state } from './state.js';

export const MUTATION_MAX_CHARGE = 100;
export const MUTATION_CHARGE_PER_GOAL = 15;
export const MUTATION_MAX_GOAL_CHARGE = 25;
export const MUTATION_THRESHOLDS = [25, 50, 75, 100];

const SIDES = ['p1', 'p2'];

function makePlayerMutation() {
  return { charge: 0, unlocked: { 25: false, 50: false, 75: false, 100: false }, lastGain: 0, lastSource: null };
}

function ensureMutationState() {
  if (!state.mutation || typeof state.mutation !== 'object') state.mutation = {};
  const mutation = state.mutation;
  mutation.active = state.mutationMode === 'mutation';
  mutation.maxCharge = MUTATION_MAX_CHARGE;
  if (!mutation.players || typeof mutation.players !== 'object') mutation.players = { p1: makePlayerMutation(), p2: makePlayerMutation() };
  for (const side of SIDES) {
    const player = mutation.players[side];
    if (!player || typeof player !== 'object') mutation.players[side] = makePlayerMutation();
    else {
      player.charge = Math.max(0, Math.min(MUTATION_MAX_CHARGE, Number(player.charge) || 0));
      if (!player.unlocked || typeof player.unlocked !== 'object') player.unlocked = {};
      for (const threshold of MUTATION_THRESHOLDS) player.unlocked[threshold] = player.charge >= threshold || Boolean(player.unlocked[threshold]);
      player.lastGain = Number(player.lastGain) || 0;
      if (!('lastSource' in player)) player.lastSource = null;
    }
  }
  return mutation;
}

function notify(name, detail) {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

function playerStatus(player) {
  const charge = Math.max(0, Math.min(MUTATION_MAX_CHARGE, player.charge));
  return { charge, stage: charge >= 100 ? 100 : charge >= 75 ? 75 : charge >= 50 ? 50 : charge >= 25 ? 25 : 0, ready: charge >= 100, unlocked: { ...player.unlocked }, lastGain: player.lastGain, lastSource: player.lastSource ? { ...player.lastSource } : null };
}

function publicStatus(mutation = ensureMutationState()) {
  const players = { p1: playerStatus(mutation.players.p1), p2: playerStatus(mutation.players.p2) };
  return { active: Boolean(mutation.active), maxCharge: MUTATION_MAX_CHARGE, players, charge: players.p1.charge, ready: players.p1.ready || players.p2.ready, stage: Math.max(players.p1.stage, players.p2.stage) };
}

export function getMutationStatus() { return publicStatus(); }

export function setMutationMode(mode) {
  state.mutationMode = mode === 'mutation' ? 'mutation' : 'off';
  return resetMutationState(state.mutationMode === 'mutation');
}

export function resetMutationState(active = state.mutationMode === 'mutation') {
  state.mutationMode = active ? 'mutation' : 'off';
  state.mutation = { active: Boolean(active), maxCharge: MUTATION_MAX_CHARGE, players: { p1: makePlayerMutation(), p2: makePlayerMutation() } };
  const status = publicStatus(state.mutation);
  notify('mutation-state-changed', status);
  notify('mutation-charge-changed', { ...status, reset: true });
  return status;
}

// Se invoca exclusivamente cuando el marcador confirma un gol.
// La bonificación usa la diferencia de marcador posterior al gol y tiene un tope total de +25.
export function accumulateMutationCharge(side, scores = state.scores, source = {}) {
  const mutation = ensureMutationState();
  if (!mutation.active || !SIDES.includes(side) || mutation.players[side].charge >= MUTATION_MAX_CHARGE) {
    return { accepted: false, side: SIDES.includes(side) ? side : null, status: publicStatus(mutation) };
  }
  const player = mutation.players[side];
  const ownScore = Number(scores?.[side]) || 0;
  const otherSide = side === 'p1' ? 'p2' : 'p1';
  const otherScore = Number(scores?.[otherSide]) || 0;
  const deficit = Math.max(0, otherScore - ownScore);
  const bonus = deficit >= 3 ? 10 : deficit >= 2 ? 5 : 0;
  const requested = Math.min(MUTATION_MAX_GOAL_CHARGE, MUTATION_CHARGE_PER_GOAL + bonus);
  const before = player.charge;
  player.charge = Math.min(MUTATION_MAX_CHARGE, before + requested);
  player.lastGain = player.charge - before;
  player.lastSource = { type: 'goal-conceded', side, scoreAfter: { p1: Number(scores?.p1) || 0, p2: Number(scores?.p2) || 0 }, deficit, ballId: typeof source.ballId === 'string' ? source.ballId : null };

  const unlockedNow = [];
  for (const threshold of MUTATION_THRESHOLDS) {
    if (before < threshold && player.charge >= threshold && !player.unlocked[threshold]) {
      player.unlocked[threshold] = true;
      unlockedNow.push(threshold);
    } else if (player.charge >= threshold) {
      player.unlocked[threshold] = true;
    }
  }

  const detail = { side, gain: player.lastGain, charge: player.charge, before, deficit, scoreAfter: { p1: Number(scores?.p1) || 0, p2: Number(scores?.p2) || 0 }, unlockedNow, status: publicStatus(mutation) };
  notify('mutation-charge-changed', detail.status);
  for (const threshold of unlockedNow) {
    const unlockedDetail = { side, threshold, charge: player.charge, scoreAfter: detail.scoreAfter };
    notify(threshold === 100 ? 'mutation-charge-ready' : 'mutation-threshold-reached', unlockedDetail);
  }
  return { accepted: player.lastGain > 0, ...detail };
}

// Conservado como no-op de compatibilidad: un saque ya no reinicia la corrupción.
export function resetMutationRally() { return publicStatus(); }

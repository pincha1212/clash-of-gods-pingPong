// mutation.js — Núcleo de carga y resolución de la mutación genética.
// Este módulo pertenece al motor actual (game.js + physics.js). No conecta el motor legado script.js.
import { state, spawnBall } from './state.js';

export const MUTATION_MAX_CHARGE = 100;
export const MUTATION_CHARGE_PER_HIT = 15;
export const MUTATION_DIVISION_CHANCE = 0.35;

function ensureMutationState() {
  if (!state.mutation || typeof state.mutation !== 'object') {
    state.mutation = {
      active: state.mutationMode === 'mutation',
      charge: 0,
      maxCharge: MUTATION_MAX_CHARGE,
      ready: false,
      pendingEffects: [],
      sequence: 0,
      thresholds: { 25: false, 50: false, 75: false },
      modifiers: { slowBoth: false, invertBoth: false, divisionPhase: false },
      lastSource: null
    };
  }
  state.mutation.maxCharge = MUTATION_MAX_CHARGE;
  if (!Array.isArray(state.mutation.pendingEffects)) state.mutation.pendingEffects = [];
  if (!state.mutation.thresholds || typeof state.mutation.thresholds !== 'object') state.mutation.thresholds = { 25: false, 50: false, 75: false };
  if (!state.mutation.modifiers || typeof state.mutation.modifiers !== 'object') state.mutation.modifiers = { slowBoth: false, invertBoth: false, divisionPhase: false };
  // Normaliza estados de v0.2.22/v0.2.23 sin conservar modificadores asimétricos.
  if ('slowP2' in state.mutation.modifiers || 'invertP2' in state.mutation.modifiers) {
    state.mutation.modifiers = { slowBoth: Boolean(state.mutation.modifiers.slowP2), invertBoth: Boolean(state.mutation.modifiers.invertP2), divisionPhase: Boolean(state.mutation.modifiers.divisionPhase) };
  }
  if (!('slowBoth' in state.mutation.modifiers)) state.mutation.modifiers.slowBoth = false;
  if (!('invertBoth' in state.mutation.modifiers)) state.mutation.modifiers.invertBoth = false;
  return state.mutation;
}

function notify(name, detail) {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

function publicStatus(mutation = ensureMutationState()) {
  return {
    active: Boolean(mutation.active),
    charge: mutation.charge,
    maxCharge: mutation.maxCharge,
    ready: Boolean(mutation.ready),
    sequence: mutation.sequence,
    thresholds: { ...mutation.thresholds },
    modifiers: { ...mutation.modifiers },
    stage: mutation.ready ? 100 : mutation.charge >= 75 ? 75 : mutation.charge >= 50 ? 50 : mutation.charge >= 25 ? 25 : 0,
    lastSource: mutation.lastSource ? { ...mutation.lastSource } : null
  };
}

export function getMutationStatus() {
  return publicStatus();
}

export function setMutationMode(mode) {
  state.mutationMode = mode === 'mutation' ? 'mutation' : 'off';
  return resetMutationState(state.mutationMode === 'mutation');
}

export function resetMutationState(active = state.mutationMode === 'mutation') {
  state.mutation = {
    active: Boolean(active),
    charge: 0,
    maxCharge: MUTATION_MAX_CHARGE,
    ready: false,
    pendingEffects: [],
    sequence: 0,
    thresholds: { 25: false, 50: false, 75: false },
    modifiers: { slowBoth: false, invertBoth: false, divisionPhase: false },
    lastSource: null
  };
  const status = publicStatus(state.mutation);
  notify('mutation-state-changed', status);
  notify('mutation-charge-changed', { ...status, reset: true });
  return status;
}

// La carga se acumula aquí; no se ejecutan modificadores ni efectos de arena desde esta función.
export function accumulateMutationCharge(amount = MUTATION_CHARGE_PER_HIT, source = {}) {
  const mutation = ensureMutationState();
  if (!mutation.active || mutation.ready) return { accepted: false, status: publicStatus(mutation) };
  const increment = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  if (increment <= 0) return { accepted: false, status: publicStatus(mutation) };

  const before = mutation.charge;
  mutation.charge = Math.min(mutation.maxCharge, before + increment);
  mutation.sequence += 1;
  mutation.lastSource = {
    ballId: typeof source.ballId === 'string' ? source.ballId : null,
    side: source.side === 'p1' || source.side === 'p2' ? source.side : null
  };

  // Los umbrales solo se encolan al cruzarse. Su resolución ocurre después del choque,
  // separada de la acumulación para no alterar la colisión que acaba de producirse.
  for (const threshold of [25, 50, 75]) {
    if (before < threshold && mutation.charge >= threshold && !mutation.thresholds[threshold]) {
      mutation.thresholds[threshold] = true; // reserva inmediata: impide encolar duplicados
      mutation.pendingEffects.push({
        type: 'threshold-crossed', threshold,
        sequence: mutation.sequence,
        source: { ...mutation.lastSource }
      });
    }
  }
  if (before < mutation.maxCharge && mutation.charge >= mutation.maxCharge) {
    mutation.pendingEffects.push({ type: 'charge-ready', sequence: mutation.sequence, source: { ...mutation.lastSource } });
  }

  const status = publicStatus(mutation);
  notify('mutation-charge-changed', status);
  return { accepted: mutation.charge > before, status };
}

// La resolución se ejecuta después de procesar el choque, no durante la acumulación de carga.
// Esto evita que una futura reacción pueda reiniciar/modificar la carga a mitad de la colisión.
export function resolveMutationEffects(context = {}) {
  const mutation = ensureMutationState();
  if (!mutation.active || mutation.pendingEffects.length === 0) return [];

  const resolved = [];
  while (mutation.pendingEffects.length > 0) {
    const request = mutation.pendingEffects.shift();
    const eventContext = {
      ballId: typeof context.ballId === 'string' ? context.ballId : null,
      side: context.side === 'p1' || context.side === 'p2' ? context.side : null
    };
    if (request.type === 'threshold-crossed') {
      const threshold = request.threshold;
      if (threshold === 25) mutation.modifiers.slowBoth = true;
      if (threshold === 50) mutation.modifiers.divisionPhase = true;
      if (threshold === 75) mutation.modifiers.invertBoth = true;
      const result = { type: 'threshold-crossed', threshold, sequence: request.sequence, charge: mutation.charge, source: request.source, context: eventContext, modifiers: { ...mutation.modifiers } };
      resolved.push(result);
      notify('mutation-threshold-reached', result);
      notify('mutation-state-changed', publicStatus(mutation));
    } else if (request.type === 'charge-ready' && !mutation.ready) {
      mutation.ready = true;
      const result = { type: 'charge-ready', sequence: request.sequence, charge: mutation.charge, source: request.source, context: eventContext, modifiers: { ...mutation.modifiers } };
      resolved.push(result);
      notify('mutation-charge-ready', result);
    }
  }
  return resolved;
}

// La división es simétrica: cualquier pelota puede dividirse tras cualquier golpe,
// sin importar qué paleta la tocó. Se usa el administrador común de pelotas/física.
export function tryMutationDivision(parent, source = {}) {
  const mutation = ensureMutationState();
  if (!mutation.active || !mutation.modifiers.divisionPhase || !parent) return null;
  const balls = Array.isArray(state.balls) ? state.balls : [];
  const limit = Math.max(1, Math.floor(state.ballLimit || 64));
  if (balls.length >= limit || Math.random() >= MUTATION_DIVISION_CHANCE) return null;

  const sign = Math.random() < 0.5 ? -1 : 1;
  const child = spawnBall(parent, { angle: sign * (0.28 + Math.random() * 0.24), mutation: (parent.lineage?.mutation || 0) + 1 });
  if (!child) return null;
  const detail = { parentId: parent.id, childId: child.id, generation: child.generation, count: state.balls.length, limit, source: { ballId: parent.id, side: source.side === 'p1' || source.side === 'p2' ? source.side : null } };
  notify('mutation-cell-divided', detail);
  notify('god-message', { text: 'DIVISIÓN CELULAR', color: '#adff2f' });
  return child;
}

// La carga pertenece a la jugada: se reinicia al sacar después de un punto, pero el modo sigue activo.
export function resetMutationRally() {
  const mutation = ensureMutationState();
  if (!mutation.active) return publicStatus(mutation);
  mutation.charge = 0;
  mutation.ready = false;
  mutation.pendingEffects.length = 0;
  mutation.thresholds = { 25: false, 50: false, 75: false };
  mutation.modifiers = { slowBoth: false, invertBoth: false, divisionPhase: false };
  mutation.lastSource = null;
  const status = publicStatus(mutation);
  notify('mutation-state-changed', status);
  notify('mutation-charge-changed', { ...status, reset: true });
  return status;
}

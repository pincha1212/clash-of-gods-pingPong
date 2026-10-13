// mutation.js — Núcleo de carga y resolución de la mutación genética.
// Este módulo pertenece al motor actual (game.js + physics.js). No conecta el motor legado script.js.
import { state } from './state.js';

export const MUTATION_MAX_CHARGE = 100;
export const MUTATION_CHARGE_PER_HIT = 15;

function ensureMutationState() {
  if (!state.mutation || typeof state.mutation !== 'object') {
    state.mutation = {
      active: state.mutationMode === 'mutation',
      charge: 0,
      maxCharge: MUTATION_MAX_CHARGE,
      ready: false,
      pendingEffects: [],
      sequence: 0,
      lastSource: null
    };
  }
  state.mutation.maxCharge = MUTATION_MAX_CHARGE;
  if (!Array.isArray(state.mutation.pendingEffects)) state.mutation.pendingEffects = [];
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

  // Se solicita una resolución una única vez al completar la carga. Los efectos de juego
  // se enchufarán en etapas posteriores; por ahora el resolvedor solo marca la carga como lista.
  if (before < mutation.maxCharge && mutation.charge >= mutation.maxCharge) {
    mutation.pendingEffects.push({
      type: 'charge-ready',
      sequence: mutation.sequence,
      source: { ...mutation.lastSource }
    });
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
    if (request.type === 'charge-ready' && !mutation.ready) {
      mutation.ready = true;
      const result = {
        type: 'charge-ready',
        sequence: request.sequence,
        charge: mutation.charge,
        source: request.source,
        context: {
          ballId: typeof context.ballId === 'string' ? context.ballId : null,
          side: context.side === 'p1' || context.side === 'p2' ? context.side : null
        }
      };
      resolved.push(result);
      notify('mutation-charge-ready', result);
    }
  }
  return resolved;
}

// La carga pertenece a la jugada: se reinicia al sacar después de un punto, pero el modo sigue activo.
export function resetMutationRally() {
  const mutation = ensureMutationState();
  if (!mutation.active) return publicStatus(mutation);
  mutation.charge = 0;
  mutation.ready = false;
  mutation.pendingEffects.length = 0;
  mutation.lastSource = null;
  const status = publicStatus(mutation);
  notify('mutation-state-changed', status);
  notify('mutation-charge-changed', { ...status, reset: true });
  return status;
}

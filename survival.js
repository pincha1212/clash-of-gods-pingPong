import { GODS } from './config.js';
import { state } from './state.js';

export const SURVIVAL_ENCOUNTERS = 15;
export const SURVIVAL_STARTING_LIVES = 3;
export const SURVIVAL_RECORD_KEY = 'clashOfGods.survival.records.v2';
export const SURVIVAL_ACTIVE_KEY = 'clashOfGods.survival.active.v1';
const RECENT_LIMIT = 3;
const DEFAULT_WIN_SCORE = 7;
const BOSS_WIN_SCORE = 9;

export const survivalCampaign = {
  active: false,
  lives: SURVIVAL_STARTING_LIVES,
  encounter: 1,
  boss: false,
  bossId: null,
  protagonistId: null,
  recentEnemies: [],
  outcome: null,
  wins: 0,
  losses: 0,
  clearedEncounters: 0,
  bossAttempts: 0,
  startedAt: 0,
  lastOpponentId: null
};

function randomIndex(length, random = Math.random) {
  return Math.min(length - 1, Math.floor(random() * length));
}

function chooseEnemy({ excludeRecent = true, random = Math.random } = {}) {
  const ids = Object.keys(GODS).filter(id => id !== survivalCampaign.protagonistId);
  const fresh = excludeRecent ? ids.filter(id => !survivalCampaign.recentEnemies.includes(id)) : ids;
  const pool = fresh.length ? fresh : ids;
  if (!pool.length) throw new Error('No hay rivales disponibles para Supervivencia.');
  return pool[randomIndex(pool.length, random)];
}

function rememberEnemy(id) {
  survivalCampaign.recentEnemies.push(id);
  survivalCampaign.recentEnemies = survivalCampaign.recentEnemies.slice(-RECENT_LIMIT);
}

function configureSurvivalRules() {
  state.preparationMode = 'survival';
  state.mutationMode = 'off';
  state.mythicMode = 'classic';
  state.mode = 'cpu';
  state.difficulty = 'easy';
  state.winScore = DEFAULT_WIN_SCORE;
  state.skillsEnabled = true;
  state.itemsEnabled = true;
}

export function beginSurvival(playerId, { random = Math.random, now = Date.now } = {}) {
  if (!GODS[playerId]) throw new Error(`Personaje de supervivencia desconocido: ${playerId}`);
  Object.assign(survivalCampaign, {
    active: true,
    lives: SURVIVAL_STARTING_LIVES,
    encounter: 1,
    boss: false,
    bossId: null,
    protagonistId: playerId,
    recentEnemies: [],
    outcome: null,
    wins: 0,
    losses: 0,
    clearedEncounters: 0,
    bossAttempts: 0,
    startedAt: now(),
    lastOpponentId: null
  });
  configureSurvivalRules();
  state.selected.p1 = playerId;
  prepareSurvivalOpponent({ random });
  persistActiveCampaign();
  return survivalCampaign;
}

export function prepareSurvivalOpponent({ random = Math.random } = {}) {
  if (!survivalCampaign.active) return null;
  configureSurvivalRules();
  state.selected.p1 = survivalCampaign.protagonistId;

  if (survivalCampaign.boss) {
    if (!survivalCampaign.bossId) {
      survivalCampaign.bossId = chooseEnemy({ excludeRecent: true, random });
    }
    state.selected.p2 = survivalCampaign.bossId;
    state.difficulty = 'hard';
    state.winScore = BOSS_WIN_SCORE;
  } else {
    // A retry must preserve the same opponent. Only a newly unlocked encounter rolls a rival.
    const enemy = survivalCampaign.lastOpponentId || chooseEnemy({ excludeRecent: true, random });
    state.selected.p2 = enemy;
    survivalCampaign.lastOpponentId = enemy;
    if (!survivalCampaign.recentEnemies.includes(enemy)) rememberEnemy(enemy);
    state.difficulty = survivalCampaign.encounter >= 12 ? 'hard' : survivalCampaign.encounter >= 8 ? 'normal' : 'easy';
    state.winScore = DEFAULT_WIN_SCORE;
  }
  state.skillsEnabled = true;
  state.itemsEnabled = true;
  return state.selected.p2;
}

export function persistActiveCampaign() {
  try {
    if (!globalThis.localStorage || !survivalCampaign.active) return;
    const snapshot = {
      version: 1,
      campaign: { ...survivalCampaign, recentEnemies: [...survivalCampaign.recentEnemies] },
      currentOpponentId: state.selected.p2,
      arenaId: state.arenaId || null,
      savedAt: new Date().toISOString()
    };
    globalThis.localStorage.setItem(SURVIVAL_ACTIVE_KEY, JSON.stringify(snapshot));
  } catch (_) { /* Guardar progreso es opcional; no debe bloquear el juego. */ }
}

export function getSavedSurvivalCampaign() {
  try {
    const raw = globalThis.localStorage?.getItem(SURVIVAL_ACTIVE_KEY);
    if (!raw) return null;
    const snapshot = JSON.parse(raw);
    const campaign = snapshot?.campaign;
    if (snapshot?.version !== 1 || campaign?.active !== true ||
        !GODS[campaign.protagonistId] || !GODS[snapshot.currentOpponentId] ||
        snapshot.currentOpponentId === campaign.protagonistId ||
        !Number.isInteger(campaign.lives) || campaign.lives < 1 || campaign.lives > SURVIVAL_STARTING_LIVES ||
        !Number.isInteger(campaign.encounter) || campaign.encounter < 1 || campaign.encounter > SURVIVAL_ENCOUNTERS ||
        typeof campaign.boss !== 'boolean') return null;
    if (campaign.boss && (!campaign.bossId || !GODS[campaign.bossId] || campaign.bossId !== snapshot.currentOpponentId)) return null;
    return snapshot;
  } catch (_) { return null; }
}

export function resumeSavedSurvivalCampaign() {
  const snapshot = getSavedSurvivalCampaign();
  if (!snapshot) return null;
  const saved = snapshot.campaign;
  Object.assign(survivalCampaign, saved, { recentEnemies: [...(saved.recentEnemies || [])] });
  configureSurvivalRules();
  state.selected.p1 = survivalCampaign.protagonistId;
  state.selected.p2 = snapshot.currentOpponentId;
  if (snapshot.arenaId) state.arenaId = snapshot.arenaId;
  state.difficulty = survivalCampaign.boss ? 'hard' : survivalCampaign.encounter >= 12 ? 'hard' : survivalCampaign.encounter >= 8 ? 'normal' : 'easy';
  state.winScore = survivalCampaign.boss ? BOSS_WIN_SCORE : DEFAULT_WIN_SCORE;
  persistActiveCampaign();
  return survivalCampaign;
}

export function clearSavedSurvivalCampaign() {
  try { globalThis.localStorage?.removeItem(SURVIVAL_ACTIVE_KEY); } catch (_) { /* almacenamiento opcional */ }
}

function readRecords() {
  try {
    const current = JSON.parse(globalThis.localStorage?.getItem(SURVIVAL_RECORD_KEY) || '{}');
    const legacy = JSON.parse(globalThis.localStorage?.getItem('clashOfGods.survival.records.v1') || '{}');
    if (!current || typeof current !== 'object' || Array.isArray(current)) return {};
    if (!legacy || typeof legacy !== 'object' || Array.isArray(legacy)) return current;
    return { ...legacy, ...current };
  } catch (_) {
    return {};
  }
}

function saveRecord() {
  try {
    if (!globalThis.localStorage) return;
    const records = readRecords();
    const player = survivalCampaign.protagonistId;
    const old = records[player] || {};
    const isVictory = survivalCampaign.outcome === 'victory';
    const summary = {
      date: new Date().toISOString(),
      outcome: survivalCampaign.outcome,
      clearedEncounters: survivalCampaign.clearedEncounters,
      wins: survivalCampaign.wins,
      losses: survivalCampaign.losses,
      bossReached: survivalCampaign.boss,
      bossAttempts: survivalCampaign.bossAttempts
    };
    const history = [summary, ...(Array.isArray(old.history) ? old.history : [])].slice(0, 10);
    records[player] = {
      campaigns: (old.campaigns || 0) + 1,
      victories: (old.victories || 0) + (isVictory ? 1 : 0),
      bestEncounter: Math.max(old.bestEncounter || 0, survivalCampaign.clearedEncounters),
      totalWins: (old.totalWins || 0) + survivalCampaign.wins,
      totalLosses: (old.totalLosses || 0) + survivalCampaign.losses,
      bossVictories: (old.bossVictories || 0) + (isVictory ? 1 : 0),
      lastOutcome: survivalCampaign.outcome,
      lastPlayed: summary.date,
      history
    };
    globalThis.localStorage.setItem(SURVIVAL_RECORD_KEY, JSON.stringify(records));
  } catch (_) {
    // Storage is optional; never block the campaign if unavailable or full.
  }
}

function finishCampaign(outcome) {
  survivalCampaign.outcome = outcome;
  survivalCampaign.active = false;
  saveRecord();
  clearSavedSurvivalCampaign();
}

export function completeSurvivalMatch(winner, { random = Math.random } = {}) {
  if (!survivalCampaign.active) return null;
  if (winner !== 'p1' && winner !== 'p2') throw new Error(`Ganador inválido en Supervivencia: ${winner}`);

  const playerWon = winner === 'p1';
  if (survivalCampaign.boss) survivalCampaign.bossAttempts++;

  if (playerWon) {
    survivalCampaign.wins++;
  } else {
    survivalCampaign.losses++;
    survivalCampaign.lives = Math.max(0, survivalCampaign.lives - 1);
  }

  if (survivalCampaign.lives === 0) {
    finishCampaign('defeat');
    return {
      type: 'defeat', playerWon, lives: 0,
      encounter: survivalCampaign.encounter, boss: survivalCampaign.boss,
      opponentId: state.selected.p2, clearedEncounters: survivalCampaign.clearedEncounters
    };
  }

  if (survivalCampaign.boss) {
    if (playerWon) {
      finishCampaign('victory');
      return {
        type: 'victory', playerWon, lives: survivalCampaign.lives,
        encounter: survivalCampaign.encounter, boss: true,
        opponentId: state.selected.p2, clearedEncounters: survivalCampaign.clearedEncounters
      };
    }
    // A lost boss fight costs a life, but the same final boss remains for the next attempt.
    prepareSurvivalOpponent({ random });
    persistActiveCampaign();
    return {
      type: 'retry-boss', playerWon, lives: survivalCampaign.lives,
      encounter: survivalCampaign.encounter, boss: true,
      opponentId: state.selected.p2, clearedEncounters: survivalCampaign.clearedEncounters
    };
  }

  if (!playerWon) {
    // Defeat costs one life and retries the same encounter; progression requires a victory.
    prepareSurvivalOpponent({ random });
    persistActiveCampaign();
    return {
      type: 'retry-encounter', playerWon, lives: survivalCampaign.lives,
      encounter: survivalCampaign.encounter, boss: false,
      opponentId: state.selected.p2, clearedEncounters: survivalCampaign.clearedEncounters
    };
  }

  survivalCampaign.clearedEncounters++;
  if (survivalCampaign.encounter >= SURVIVAL_ENCOUNTERS) {
    survivalCampaign.boss = true;
    survivalCampaign.bossId = null;
    survivalCampaign.lastOpponentId = null;
    prepareSurvivalOpponent({ random });
    persistActiveCampaign();
    return {
      type: 'boss-unlocked', playerWon, lives: survivalCampaign.lives,
      encounter: survivalCampaign.encounter, boss: true,
      opponentId: state.selected.p2, clearedEncounters: survivalCampaign.clearedEncounters
    };
  }

  survivalCampaign.encounter++;
  survivalCampaign.lastOpponentId = null;
  prepareSurvivalOpponent({ random });
  persistActiveCampaign();
  return {
    type: 'next', playerWon, lives: survivalCampaign.lives,
    encounter: survivalCampaign.encounter, boss: false,
    opponentId: state.selected.p2, clearedEncounters: survivalCampaign.clearedEncounters
  };
}

export function resetSurvival() {
  survivalCampaign.active = false;
  survivalCampaign.outcome = null;
  survivalCampaign.recentEnemies = [];
  survivalCampaign.bossId = null;
  survivalCampaign.lastOpponentId = null;
}

export function getSurvivalRecord(playerId) {
  return readRecords()[playerId] || null;
}

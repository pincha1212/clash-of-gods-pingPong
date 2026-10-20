import { GODS } from './config.js';
import { state } from './state.js';

export const SURVIVAL_ENCOUNTERS = 15;
export const SURVIVAL_STARTING_LIVES = 3;
const RECENT_LIMIT = 3;
export const survivalCampaign = {
  active: false, lives: SURVIVAL_STARTING_LIVES, encounter: 1, boss: false,
  bossId: null, protagonistId: null, recentEnemies: [], outcome: null,
  wins: 0, losses: 0, startedAt: 0
};

function chooseEnemy(excludeRecent = true) {
  const ids = Object.keys(GODS).filter(id => id !== survivalCampaign.protagonistId &&
    (!excludeRecent || !survivalCampaign.recentEnemies.includes(id)));
  const pool = ids.length ? ids : Object.keys(GODS).filter(id => id !== survivalCampaign.protagonistId);
  return pool[Math.floor(Math.random() * pool.length)];
}
function rememberEnemy(id) {
  survivalCampaign.recentEnemies.push(id);
  survivalCampaign.recentEnemies = survivalCampaign.recentEnemies.slice(-RECENT_LIMIT);
}
export function beginSurvival(playerId) {
  if (!GODS[playerId]) throw new Error(`Personaje de supervivencia desconocido: ${playerId}`);
  Object.assign(survivalCampaign, {
    active: true, lives: SURVIVAL_STARTING_LIVES, encounter: 1, boss: false,
    bossId: null, protagonistId: playerId, recentEnemies: [], outcome: null,
    wins: 0, losses: 0, startedAt: Date.now()
  });
  state.preparationMode = 'survival';
  state.mutationMode = 'off';
  state.mythicMode = 'classic';
  state.mode = 'cpu';
  state.difficulty = 'normal';
  state.winScore = 7;
  state.skillsEnabled = true;
  state.itemsEnabled = true;
  state.selected.p1 = playerId;
  prepareSurvivalOpponent();
  return survivalCampaign;
}
export function prepareSurvivalOpponent() {
  if (!survivalCampaign.active) return null;
  state.mode = 'cpu';
  state.mythicMode = 'classic';
  state.mutationMode = 'off';
  state.selected.p1 = survivalCampaign.protagonistId;
  if (survivalCampaign.boss) {
    if (!survivalCampaign.bossId) survivalCampaign.bossId = chooseEnemy(false);
    state.selected.p2 = survivalCampaign.bossId;
    state.difficulty = 'hard';
    state.winScore = 9;
  } else {
    const enemy = chooseEnemy(true);
    state.selected.p2 = enemy;
    rememberEnemy(enemy);
    state.difficulty = survivalCampaign.encounter >= 12 ? 'hard' : survivalCampaign.encounter >= 8 ? 'normal' : 'easy';
    state.winScore = 7;
  }
  state.skillsEnabled = true;
  state.itemsEnabled = true;
  return state.selected.p2;
}
function saveRecord() {
  try {
    const key = 'clashOfGods.survival.records.v1';
    const records = JSON.parse(localStorage.getItem(key) || '{}');
    const player = survivalCampaign.protagonistId;
    const old = records[player] || { bestEncounter: 0, campaigns: 0, victories: 0 };
    records[player] = {
      bestEncounter: Math.max(old.bestEncounter || 0, survivalCampaign.boss ? SURVIVAL_ENCOUNTERS : survivalCampaign.encounter - 1),
      campaigns: (old.campaigns || 0) + 1,
      victories: (old.victories || 0) + (survivalCampaign.outcome === 'victory' ? 1 : 0),
      lastOutcome: survivalCampaign.outcome,
      lastPlayed: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(records));
  } catch (_) { /* La campaña sigue funcionando aunque el almacenamiento local esté bloqueado. */ }
}
export function completeSurvivalMatch(winner) {
  if (!survivalCampaign.active) return null;
  const playerWon = winner === 'p1';
  if (playerWon) survivalCampaign.wins++; else { survivalCampaign.losses++; survivalCampaign.lives--; }
  if (survivalCampaign.lives <= 0) {
    survivalCampaign.lives = 0;
    survivalCampaign.outcome = 'defeat';
    survivalCampaign.active = false;
    saveRecord();
    return { type: 'defeat', playerWon, lives: 0, encounter: survivalCampaign.encounter, boss: survivalCampaign.boss };
  }
  if (survivalCampaign.boss) {
    if (playerWon) {
      survivalCampaign.outcome = 'victory';
      survivalCampaign.active = false;
      saveRecord();
      return { type: 'victory', playerWon, lives: survivalCampaign.lives, encounter: survivalCampaign.encounter, boss: true };
    }
    // El jefe se mantiene: gastar una vida permite volver a intentarlo.
    prepareSurvivalOpponent();
    return { type: 'retry-boss', playerWon, lives: survivalCampaign.lives, encounter: survivalCampaign.encounter, boss: true };
  }
  if (survivalCampaign.encounter >= SURVIVAL_ENCOUNTERS) {
    survivalCampaign.boss = true;
    survivalCampaign.bossId = null;
    prepareSurvivalOpponent();
    return { type: 'boss-unlocked', playerWon, lives: survivalCampaign.lives, encounter: survivalCampaign.encounter, boss: true };
  }
  survivalCampaign.encounter++;
  prepareSurvivalOpponent();
  return { type: 'next', playerWon, lives: survivalCampaign.lives, encounter: survivalCampaign.encounter, boss: false };
}
export function resetSurvival() {
  survivalCampaign.active = false;
  survivalCampaign.outcome = null;
  survivalCampaign.recentEnemies = [];
  survivalCampaign.bossId = null;
}
export function getSurvivalRecord(playerId) {
  try { return JSON.parse(localStorage.getItem('clashOfGods.survival.records.v1') || '{}')[playerId] || null; }
  catch (_) { return null; }
}

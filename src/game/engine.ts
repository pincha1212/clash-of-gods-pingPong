// @ts-nocheck
import {
  GODS,
  SETTINGS,
  ARENAS,
  ARENA_MYTHOLOGIES,
  LEGACY_ARENA_MIGRATION,
  CHARACTER_CULTURAL_CLASSIFICATION
} from './config.js';
import { state, createBall, createPaddle } from './state.js';
import { updatePhysics, updatePaddles, serve } from './physics.js';
import { updateEffects, drawEffects, burst } from './effects.js';
import { setSound, playTone } from './audio.js';
import { activateAbility, shouldCPUUseAbility } from './abilities.js';
import {
  resetPowerups,
  drawPowerupEffects,
  drawBallPower,
  getPowerupDefinition
} from './powerups.js';
import {
  setMutationMode,
  resetMutationState,
  getMutationStatus,
  getMutationArenaStage,
  getMutationArenaEvent
} from './mutation.js';
import { drawArenaEvent, clearArenaEventState } from './arena-events.js';
import { drawArenaDirector, resetArenaDirector, clearArenaDirector } from './arena-director.js';
import { drawArenaIdentity } from './arena-art.js';
import {
  beginSurvival,
  completeSurvivalMatch,
  resetSurvival,
  survivalCampaign,
  persistActiveCampaign
} from './survival.js';

export interface GameEngineCallbacks {
  onScoreUpdate?: (scores: { p1: number; p2: number }, targetScore: number) => void;
  onHudUpdate?: (hud: {
    p1Skill: { name: string; state: string; pct: number };
    p2Skill: { name: string; state: string; pct: number };
    countdown: number;
    paused: boolean;
    hint: string;
    arenaName: string;
    mutationStatus?: any;
    introLine?: string;
    introTitle?: string;
  }) => void;
  onMatchFinished?: (result: any) => void;
  onGodMessage?: (msg: { text: string; color: string }) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private arenaCache: HTMLCanvasElement | null = null;
  private arenaCtx: CanvasRenderingContext2D | null = null;
  private effectCanvas: HTMLCanvasElement | null = null;
  private effectCtx: CanvasRenderingContext2D | null = null;

  private messageTimer = 0;
  private messageText = '';
  private messageColor = '#fff';
  private messageQueue: any[] = [];
  private messageSequence = 0;

  private countdown = 0;
  private lastHud = 0;
  private lastMutationRotBucket = -1;
  private failedRenderLayers = new Set();
  private callbacks: GameEngineCallbacks = {};

  private keydownHandler: any = null;
  private keyupHandler: any = null;
  private windowListeners: Array<{ type: string; handler: any }> = [];

  constructor() {
    this.arenaCache = document.createElement('canvas');
    this.arenaCache.width = SETTINGS.width;
    this.arenaCache.height = SETTINGS.height;
    this.arenaCtx = this.arenaCache.getContext('2d', { alpha: false });

    this.effectCanvas = document.createElement('canvas');
    this.effectCanvas.width = SETTINGS.width;
    this.effectCanvas.height = SETTINGS.height;
    this.effectCtx = this.effectCanvas.getContext('2d', { alpha: true });
  }

  setCallbacks(cbs: GameEngineCallbacks) {
    this.callbacks = cbs;
  }

  attachCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.setupListeners();
  }

  detachCanvas() {
    this.cleanupListeners();
    this.canvas = null;
    this.ctx = null;
  }

  private setupListeners() {
    this.cleanupListeners();

    this.keydownHandler = (e: KeyboardEvent) => {
      state.keys = state.keys || {};
      state.keys[e.code] = true;
      if (e.code === 'KeyW' || e.code === 'KeyS') state.keys[e.code] = true;
      if (e.code === 'ArrowUp' || e.code === 'ArrowDown') state.keys[e.code] = true;

      if (e.code === 'Space') {
        e.preventDefault();
        if (state.running && !state.paused) activateAbility('p1');
      }
      if (e.code === 'Enter') {
        e.preventDefault();
        if (state.running && !state.paused && state.mode !== 'cpu') activateAbility('p2');
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        this.togglePause();
      }
    };

    this.keyupHandler = (e: KeyboardEvent) => {
      if (state.keys) state.keys[e.code] = false;
    };

    window.addEventListener('keydown', this.keydownHandler);
    window.addEventListener('keyup', this.keyupHandler);

    const onPointScored = (e: any) => {
      const winner = e.detail?.winner;
      const color = winner === 'p1' ? GODS[state.selected.p1]?.color : GODS[state.selected.p2]?.color;
      burst(500, 300, color || '#fff', 10, 2.2);
      this.callbacks.onScoreUpdate?.({ ...state.scores }, state.winScore);
    };

    const onMutationGoal = (e: any) => {
      const winner = e.detail?.winner;
      const color = winner === 'p1' ? GODS[state.selected.p1]?.color : GODS[state.selected.p2]?.color;
      burst(500, 300, color || '#fff', 14, 2.6);
      this.callbacks.onScoreUpdate?.({ ...state.scores }, state.winScore);
    };

    const onGodMsg = (e: any) => {
      this.enqueueGodMessage(e.detail || {});
    };

    const onFinish = (e: any) => {
      this.finishMatch(e.detail);
    };

    window.addEventListener('point-scored', onPointScored);
    window.addEventListener('mutation-goal-confirmed', onMutationGoal);
    window.addEventListener('god-message', onGodMsg);
    window.addEventListener('match-finished', onFinish);

    this.windowListeners = [
      { type: 'point-scored', handler: onPointScored },
      { type: 'mutation-goal-confirmed', handler: onMutationGoal },
      { type: 'god-message', handler: onGodMsg },
      { type: 'match-finished', handler: onFinish }
    ];
  }

  private cleanupListeners() {
    if (this.keydownHandler) window.removeEventListener('keydown', this.keydownHandler);
    if (this.keyupHandler) window.removeEventListener('keyup', this.keyupHandler);
    for (const l of this.windowListeners) {
      window.removeEventListener(l.type, l.handler);
    }
    this.windowListeners = [];
  }

  private mutationSideColor(side: string) {
    return state.mutationColors?.[side] || state.paddles?.[side]?.color || (side === 'p1' ? '#45ff75' : '#42baff');
  }

  private randomMutationCPUColor(except = '') {
    const MUTATION_CPU_COLORS = ['#42baff', '#ff4d9d', '#ffc247', '#b66bff', '#54f0d2', '#ff7043', '#a6ff3f', '#f4f4f4'];
    const options = MUTATION_CPU_COLORS.filter(color => color.toLowerCase() !== String(except).toLowerCase());
    return options[Math.floor(Math.random() * options.length)] || '#42baff';
  }

  public gestureStart(side: 'p1' | 'p2', canvasY: number) {
    if (!state.running || state.paused) return;
    state.touchDrag = state.touchDrag || { p1: null, p2: null };
    state.touchDragDelta = state.touchDragDelta || { p1: 0, p2: 0 };
    state.touchDrag[side] = true;
    const p = state.paddles?.[side];
    if (p) {
      const targetY = canvasY - p.h / 2;
      state.touchDragDelta[side] = (targetY - p.y);
    }
  }

  public gestureMove(side: 'p1' | 'p2', deltaY: number) {
    if (!state.running || state.paused) return;
    state.touchDrag = state.touchDrag || { p1: null, p2: null };
    state.touchDragDelta = state.touchDragDelta || { p1: 0, p2: 0 };
    state.touchDrag[side] = true;
    state.touchDragDelta[side] = (state.touchDragDelta[side] || 0) + deltaY;
  }

  public gestureEnd(side: 'p1' | 'p2') {
    if (state.touchDrag) state.touchDrag[side] = null;
    if (state.touchDragDelta) state.touchDragDelta[side] = 0;
  }

  public gestureTriggerAbility(side: 'p1' | 'p2') {
    if (!state.running || state.paused) return;
    activateAbility(side);
  }

  public setTouchInput(side: 'p1' | 'p2', action: 'up' | 'down' | 'skill', active: boolean) {
    state.touch = state.touch || {};
    if (action === 'up') state.touch[`up${side === 'p1' ? '1' : '2'}`] = active;
    if (action === 'down') state.touch[`down${side === 'p1' ? '1' : '2'}`] = active;
    if (action === 'skill' && active && state.running && !state.paused) {
      activateAbility(side);
    }
  }

  public setTouchDrag(side: 'p1' | 'p2', y: number | null) {
    state.touchDrag = state.touchDrag || { p1: null, p2: null };
    state.touchDrag[side] = y;
  }

  public buildArenaCache() {
    if (!this.arenaCtx) return;
    const W = SETTINGS.width, H = SETTINGS.height;
    const baseArena = state.mythicMode === 'olympus'
      ? (ARENAS.find(x => x.id === 'arena_greek') || ARENAS[0])
      : state.mythicMode === 'ragnarok'
      ? (ARENAS.find(x => x.id === 'arena_norse') || ARENAS[0])
      : (ARENAS.find(x => x.id === state.arenaId) || ARENAS.find(x => x.id === LEGACY_ARENA_MIGRATION[state.arenaId]) || ARENAS[0]);

    const a = state.mutationMode === 'mutation'
      ? { name: 'Cancha Mutante', style: 'wild', bg: '#050b06', field: '#0b170d', accent: '#88ff4f', line: '#31552d' }
      : state.mythicMode === 'boss-jormungandr'
      ? { name: 'Jörmungandr · El cerco de Midgard', style: 'ocean', bg: '#07130f', field: '#10251e', accent: '#83c9a5', line: '#416e5a' }
      : state.mythicMode === 'boss-typhon'
      ? { name: 'Tifón · La tormenta primordial', style: 'storm', bg: '#100f19', field: '#202333', accent: '#d5a0a4', line: '#6b6b88' }
      : state.mythicMode === 'throne'
      ? { name: 'La disputa por el trono · Horus vs Seth', style: 'temple', bg: '#17100c', field: '#2b2017', accent: '#e8c66f', line: '#84664a' }
      : state.mythicMode === 'waters'
      ? { name: 'La liberación de las aguas · Indra vs Vritra', style: 'ocean', bg: '#06141b', field: '#0b2b32', accent: '#79c8ee', line: '#397f82' }
      : baseArena;

    const ctx = this.arenaCtx;
    ctx.fillStyle = a.bg;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = a.field;
    ctx.fillRect(24, 24, W - 48, H - 48);

    const quality = state.settings?.quality || 'balanced';
    const mutationRot = state.mutationMode === 'mutation' ? (state.mutation?.rot || 0) : 0;
    this.lastMutationRotBucket = state.mutationMode === 'mutation' ? Math.floor(mutationRot / 5) : -1;

    if (state.mutationMode === 'mutation') {
      this.drawMutationArenaSurface(ctx, W, H, quality, mutationRot);
      this.drawMutationColorSplit(ctx, W, H);
    }

    if (quality !== 'low') {
      ctx.save();
      ctx.globalAlpha = 0.13;
      ctx.strokeStyle = a.accent;
      ctx.lineWidth = 2;
      // Style specific procedural art
      if (a.style === 'storm') {
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(80 + i * 190, 40);
          ctx.lineTo(120 + i * 170, 170);
          ctx.lineTo(90 + i * 185, 255);
          ctx.stroke();
        }
      } else if (a.style === 'inferno') {
        for (let i = -5; i < 12; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 120, 575);
          ctx.lineTo(i * 120 + 280, 25);
          ctx.stroke();
        }
      } else if (a.style === 'ocean') {
        for (let y = 90; y < 560; y += 90) {
          ctx.beginPath();
          for (let x = 30; x <= 970; x += 20) {
            const yy = y + Math.sin(x / 48 + y) * 9;
            if (x === 30) ctx.moveTo(x, yy);
            else ctx.lineTo(x, yy);
          }
          ctx.stroke();
        }
      } else if (a.style === 'moon') {
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.arc((i * 137 + 90) % 920 + 40, (i * 83 + 70) % 450 + 70, 12 + (i % 4) * 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (a.style === 'solar') {
        for (let r = 26; r <= 110; r += 28) {
          ctx.beginPath();
          ctx.arc(500, 300, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        for (let i = 0; i < 16; i++) {
          const ang = i * Math.PI / 8;
          ctx.beginPath();
          ctx.moveTo(500 + Math.cos(ang) * 118, 300 + Math.sin(ang) * 118);
          ctx.lineTo(500 + Math.cos(ang) * 145, 300 + Math.sin(ang) * 145);
          ctx.stroke();
        }
      } else if (a.style === 'mandala') {
        for (let r = 35; r <= 130; r += 24) {
          ctx.beginPath();
          ctx.arc(500, 300, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        for (let x = 80; x < 960; x += 110) {
          ctx.strokeRect(x, 45, 18, 510);
          ctx.beginPath();
          ctx.moveTo(x - 8, 45);
          ctx.lineTo(x + 9, 30);
          ctx.lineTo(x + 26, 45);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    if (a.id) drawArenaIdentity(ctx, a, quality);

    if (quality !== 'low') {
      for (let i = 0; i < (quality === 'high' ? 38 : 18); i++) {
        const x = (i * 173 + 47) % W, y = (i * 97 + 23) % H;
        ctx.fillStyle = i % 7 === 0 ? a.accent : a.line;
        ctx.globalAlpha = i % 7 === 0 ? 0.7 : 0.45;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }

    ctx.strokeStyle = a.accent;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = a.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(35, 35, 430, 530);
    ctx.strokeRect(535, 35, 430, 530);

    ctx.setLineDash([7, 10]);
    ctx.strokeStyle = a.accent;
    ctx.beginPath();
    ctx.moveTo(500, 25);
    ctx.lineTo(500, 575);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(500, 300, 66, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.arc(500, 300, 55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    document.documentElement.style.setProperty('--arena-accent', a.accent);
    document.documentElement.style.setProperty('--arena-bg', a.bg);
  }

  private drawMutationColorSplit(c: CanvasRenderingContext2D, W: number, H: number) {
    if (state.mutationMode !== 'mutation') return;
    const left = this.mutationSideColor('p1'), right = this.mutationSideColor('p2');
    c.save();
    c.beginPath();
    c.rect(24, 24, W - 48, H - 48);
    c.clip();
    c.globalAlpha = 0.13;
    c.fillStyle = left;
    c.fillRect(24, 24, W / 2 - 24, H - 48);
    c.fillStyle = right;
    c.fillRect(W / 2, 24, W / 2 - 24, H - 48);
    c.globalAlpha = 0.5;
    c.lineWidth = 2;
    c.strokeStyle = '#ffffff';
    c.beginPath();
    c.moveTo(W / 2, 24);
    c.lineTo(W / 2 - 5, 92);
    c.lineTo(W / 2 + 4, 155);
    c.lineTo(W / 2 - 6, 225);
    c.lineTo(W / 2 + 5, 292);
    c.lineTo(W / 2 - 4, 365);
    c.lineTo(W / 2 + 5, 438);
    c.lineTo(W / 2 - 3, 510);
    c.lineTo(W / 2, H - 24);
    c.stroke();
    c.restore();
  }

  private drawMutationArenaSurface(c: CanvasRenderingContext2D, W: number, H: number, quality: string, rot: number) {
    const low = quality === 'low', stage = rot >= 75 ? 4 : rot >= 50 ? 3 : rot >= 25 ? 2 : 1;
    const count = (low ? 3 : quality === 'high' ? 7 : 5) * stage + Math.floor(rot / 12);
    c.save();
    c.beginPath();
    c.rect(25, 25, W - 50, H - 50);
    c.clip();
    c.globalAlpha = 0.028 + stage * 0.019 + Math.min(0.025, rot * 0.00025);
    c.fillStyle = '#031109';
    c.fillRect(25, 25, W - 50, H - 50);

    for (let i = 0; i < count; i++) {
      const x = 58 + ((i * 137 + 43) % (W - 116)), y = 48 + ((i * 89 + 31) % (H - 96));
      const rx = (low ? 23 : 29) + (i % 4) * 8 + stage * 2, ry = (low ? 12 : 16) + (i % 3) * 6 + stage;
      c.globalAlpha = 0.095 + stage * 0.035 + Math.min(0.045, rot * 0.00045) + (i % 3) * 0.016;
      c.fillStyle = i % 3 === 0 ? '#06170c' : i % 3 === 1 ? '#12391d' : '#244a20';
      c.beginPath();
      for (let k = 0; k <= 14; k++) {
        const a = k / 14 * Math.PI * 2, mod = 1 + 0.17 * Math.sin(k * 2.13 + i * 1.7) + 0.08 * Math.cos(k * 3.1 + i);
        const px = x + Math.cos(a) * rx * mod, py = y + Math.sin(a) * ry * mod;
        if (k === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.closePath();
      c.fill();
      c.globalAlpha = 0.09 + stage * 0.026;
      c.strokeStyle = '#78f04b';
      c.lineWidth = 1;
      c.stroke();
    }
    c.restore();
  }

  private drawBallBody(ctx: CanvasRenderingContext2D, b: any, fill: string) {
    const mutation = state.mutationMode === 'mutation';
    const rot = mutation ? Math.max(0, Math.min(100, state.mutation?.rot || 0)) : 0;
    let sides = Math.round(b?.matchEffects?.polygonSides || 0), shape = 'polygon';
    const customShape = b?.matchEffects?.mutationShape || '';

    if (mutation) {
      const seed = (Number(String(b.id || '').replace(/\D/g, '')) || b.generation || 1) % 5;
      if (customShape) {
        shape = customShape;
        sides = Math.max(sides, customShape === 'diamond' ? 4 : customShape === 'shard' ? 5 : customShape === 'polygon' ? 5 : 0);
      } else if (rot >= 68) {
        shape = seed % 2 ? 'shard' : 'crystal';
        sides = seed % 2 ? 5 : 4;
      } else if (rot >= 38) {
        shape = 'polygon';
        sides = 3 + (seed % 3);
      } else if (rot >= 18) {
        shape = 'polygon';
        sides = seed % 2 ? 4 : 5;
      }
    }

    if (!mutation && sides < 3) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.82, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if (mutation && rot < 18 && sides < 3) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.82, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    const count = Math.max(3, Math.min(8, sides || 5));
    const motion = state.settings?.reducedMotion ? 0 : Math.sin(performance.now() / 220 + (b.generation || 0)) * 0.035;
    const angle = Math.atan2(b.vy || 0, b.vx || 1) + motion - Math.PI / 2 + (shape === 'diamond' ? Math.PI / 4 : 0);
    const radius = b.r * (mutation ? Math.min(1.04, 0.88 + rot * 0.0016) : 0.9);

    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const a = angle + i * Math.PI * 2 / count;
      const x = b.x + Math.cos(a) * radius;
      const y = b.y + Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.globalAlpha *= 0.42;
    ctx.strokeStyle = mutation ? '#d7ffb7' : '#ffffff';
    ctx.lineWidth = Math.max(0.7, b.r * 0.09);
    ctx.stroke();
    ctx.restore();
  }

  private drawMythicArenaEffects(c: CanvasRenderingContext2D) {
    if (state.settings?.arenaEvents === false) return;
    const mode = state.mythicMode;
    if (mode !== 'olympus' && mode !== 'ragnarok' && mode !== 'throne' && mode !== 'waters' && mode !== 'boss-jormungandr' && mode !== 'boss-typhon') return;
    const t = performance.now() / 1000;
    c.save();
    if (mode === 'olympus') {
      const active = (state.mythicSurgeTime || 0) > 0;
      c.globalAlpha = 0.10 + Math.sin(t * 1.4) * 0.025;
      c.fillStyle = '#f7d77a';
      c.fillRect(24, 24, 952, 552);
      c.globalAlpha = 0.32;
      c.strokeStyle = '#ffe28b';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(500, 300, active ? 90 + Math.sin(t * 15) * 8 : 76, 0, Math.PI * 2);
      c.stroke();
    } else if (mode === 'ragnarok') {
      const stage = state.mythicRagnarokStage || 0;
      c.globalAlpha = 0.10 + stage * 0.025;
      c.fillStyle = '#193747';
      c.fillRect(24, 24, 952, 552);
    }
    c.restore();
  }

  private drawMutationAtmosphere(c: CanvasRenderingContext2D) {
    if (state.mutationMode !== 'mutation') return;
    const W = SETTINGS.width, H = SETTINGS.height;
    const left = this.mutationSideColor('p1'), right = this.mutationSideColor('p2');
    c.save();
    c.beginPath();
    c.rect(24, 24, W - 48, H - 48);
    c.clip();
    c.globalAlpha = 0.055;
    c.fillStyle = left;
    c.fillRect(24, 24, W / 2 - 24, H - 48);
    c.fillStyle = right;
    c.fillRect(W / 2, 24, W / 2 - 24, H - 48);
    c.restore();
  }

  private drawOptionalLayer(name: string, drawLayer: () => void) {
    try {
      drawLayer();
    } catch (error) {
      if (!this.failedRenderLayers.has(name)) {
        this.failedRenderLayers.add(name);
        console.error(`Layer '${name}' failed to render:`, error);
      }
    }
  }

  private enqueueGodMessage(detail: any = {}) {
    const raw = String(detail.title || detail.text || '').trim();
    if (!raw) return;
    const category = detail.category || 'general';
    const concise = detail.title ? raw : (category === 'general' ? raw.split(/\s+[·—]\s+/)[0] : raw);
    const title = concise.toUpperCase().replace(/\s+EN\s+\d+(?:[.,]\d+)?\s*S(?:EG)?\.?$/i, '').trim();
    if (!title) return;
    const priority = category === 'powerup' ? 100 : category === 'ability' ? 70 : category === 'arena' ? 30 : 20;
    this.messageQueue.push({ title, color: detail.color || '#fff', category, priority, sequence: this.messageSequence++ });
    if (this.messageQueue.length > 32) this.messageQueue.shift();
  }

  private advanceGodMessage() {
    if (this.messageTimer > 0) return;
    this.messageQueue.sort((a, b) => b.priority - a.priority || a.sequence - b.sequence);
    const next = this.messageQueue.shift();
    if (next) {
      this.messageText = next.title;
      this.messageColor = next.color;
      this.messageTimer = 90;
      this.callbacks.onGodMessage?.({ text: next.title, color: next.color });
    }
  }

  private clearGodMessages() {
    this.messageQueue = [];
    this.messageTimer = 0;
    this.messageText = '';
  }

  public draw() {
    if (!this.ctx || !this.arenaCache || !this.effectCanvas || !this.effectCtx) return;
    const W = SETTINGS.width, H = SETTINGS.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(this.arenaCache, 0, 0);

    this.effectCtx.clearRect(0, 0, W, H);
    this.drawOptionalLayer('efectos míticos', () => this.drawMythicArenaEffects(this.effectCtx!));
    this.drawOptionalLayer('atmósfera de mutación', () => this.drawMutationAtmosphere(this.effectCtx!));
    this.drawOptionalLayer('evento de arena', () => drawArenaEvent(this.effectCtx!));
    this.drawOptionalLayer('director de arena', () => drawArenaDirector(this.effectCtx!));
    this.drawOptionalLayer('efectos de power-ups', () => drawPowerupEffects(this.effectCtx!));
    ctx.drawImage(this.effectCanvas, 0, 0);

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
    ctx.filter = 'none';

    // Temporary walls
    for (const wall of state.temporaryWalls || []) {
      const life = Math.max(0, Math.min(1, (wall.life ?? 1) / (wall.maxLife || 1)));
      ctx.save();
      ctx.globalAlpha = Math.min(1, life * 1.35);
      ctx.fillStyle = '#101629';
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.strokeStyle = wall.color || '#9be8ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x + 0.5, wall.y + 0.5, wall.w - 1, wall.h - 1);
      ctx.restore();
    }

    // Net
    const p1 = state.paddles.p1, p2 = state.paddles.p2;
    ctx.strokeStyle = (p1?.color || '#70e4e9') + '88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(500, 25);
    ctx.lineTo(500, 575);
    ctx.stroke();

    ctx.strokeStyle = (p2?.color || '#d49aff') + '55';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(503, 25);
    ctx.lineTo(503, 575);
    ctx.stroke();

    // Balls
    const balls = Array.isArray(state.balls) && state.balls.length ? state.balls : [state.ball];
    for (const b of balls) {
      if (!b) continue;
      const trail = b.trail || [];
      const trailLimit = state.settings?.quality === 'low' ? 0 : trail.length;
      for (let i = 0; i < trailLimit; i++) {
        const t = trail[i], f = (i + 1) / Math.max(1, trail.length);
        ctx.globalAlpha = f * 0.18;
        ctx.fillStyle = b.color || '#e9f0fa';
        ctx.beginPath();
        ctx.arc(t.x, t.y, b.r * (0.25 + f * 0.35), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      drawBallPower(ctx, b);
      ctx.fillStyle = b.color || '#fffdf5';
      this.drawBallBody(ctx, b, ctx.fillStyle);
    }

    // Paddles
    for (const side of ['p1', 'p2']) {
      const p = state.paddles[side];
      if (!p) continue;
      ctx.save();
      if (p.abilityTime > 0) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.45 + Math.min(0.45, p.abilityTime * 0.4);
        ctx.strokeRect(p.x - 4, p.y - 4, p.w + 8, p.h + 8);
      }
      ctx.fillStyle = state.mutationMode === 'mutation'
        ? (state.mutationColors?.[side] || p.color)
        : (p.powerColor || p.color);
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = '#ffffffaa';
      ctx.fillRect(p.x + (side === 'p1' ? 2 : p.w - 4), p.y + 6, 2, Math.max(1, p.h - 12));
      if (p.shield > 0) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.arc(
          side === 'p1' ? p.x + p.w + 5 : p.x - 5,
          p.y + p.h / 2,
          p.h * 0.55,
          side === 'p1' ? -Math.PI / 2 : Math.PI / 2,
          side === 'p1' ? Math.PI / 2 : Math.PI * 1.5
        );
        ctx.stroke();
      }
      ctx.restore();
    }

    // Items
    for (const item of state.items || []) {
      const vaccine = state.mutationMode === 'mutation' && item.type === 'mutation-vaccine';
      const def = vaccine ? { color: '#a7ff7c', symbol: '✚' } : getPowerupDefinition(item.type);
      ctx.save();
      ctx.globalAlpha = Math.min(1, item.life < 2 ? 0.45 + Math.sin(performance.now() / 70) * 0.35 : 1);
      ctx.fillStyle = def.color + '22';
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.r + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = def.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(def.symbol, item.x, item.y + 0.5);
      ctx.restore();
    }

    if (!state.settings?.reducedMotion && state.settings?.quality !== 'low') {
      drawEffects(ctx);
    }

    this.advanceGodMessage();
    if (this.messageTimer > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.messageTimer / 12);
      ctx.textAlign = 'center';
      ctx.font = '800 24px Barlow Condensed, sans-serif';
      ctx.fillStyle = this.messageColor;
      ctx.fillText(this.messageText, 500, 76);
      ctx.restore();
      this.messageTimer--;
    }
  }

  public loop = (now: number) => {
    if (state.finished || (!state.running && !state.paused)) {
      this.draw();
      return;
    }
    const dt = Math.min(0.033, (now - (state.lastFrame || now)) / 1000 || 0);
    state.lastFrame = now;

    if (state.running && !state.paused) {
      if (this.countdown > 0) {
        this.countdown -= dt;
      } else {
        updatePaddles(dt);
        if (shouldCPUUseAbility()) activateAbility('p2');
        updatePhysics(dt);
        updateEffects(dt);
      }
    }

    this.draw();

    if (now - this.lastHud > 100) {
      const p1 = state.paddles.p1, p2 = state.paddles.p2;
      const g1 = GODS[state.selected.p1], g2 = GODS[state.selected.p2];
      const maxCd1 = g1?.skill?.cooldown || 10;
      const maxCd2 = g2?.skill?.cooldown || 10;

      const p1Pct = p1 ? Math.max(0, Math.min(100, (1 - (p1.cooldown || 0) / maxCd1) * 100)) : 100;
      const p2Pct = p2 ? Math.max(0, Math.min(100, (1 - (p2.cooldown || 0) / maxCd2) * 100)) : 100;

      const baseName = state.mythicMode === 'boss-jormungandr'
        ? 'Jefe · Jörmungandr — El cerco de Midgard'
        : state.mythicMode === 'boss-typhon'
        ? 'Jefe · Tifón — La tormenta primordial'
        : state.mythicMode === 'olympus'
        ? 'La guerra del Olimpo · Zeus vs Poseidón'
        : state.mythicMode === 'ragnarok'
        ? 'El presagio del Ragnarök · Thor vs Jörmungandr'
        : state.mythicMode === 'throne'
        ? 'La disputa por el trono · Horus vs Seth'
        : state.mythicMode === 'waters'
        ? 'La liberación de las aguas · Indra vs Vritra'
        : (ARENAS.find(a => a.id === state.arenaId)?.name || 'Arena divina');

      const arenaDisplayName = state.mutationMode === 'mutation'
        ? `CANCHA MUTANTE · PUDRICIÓN ${Math.round(state.mutation?.rot || 0)}% · ${['', 'CONTAMINACIÓN', 'INFECCIÓN', 'DESCOMPOSICIÓN', 'CORRUPCIÓN TOTAL'][getMutationArenaStage()] || 'CONTAMINACIÓN'}`
        : baseName;

      this.callbacks.onHudUpdate?.({
        p1Skill: {
          name: g1?.skill?.name || 'PODER',
          state: (p1?.cooldown || 0) <= 0 ? 'LISTA' : `${(p1.cooldown).toFixed(1)}s`,
          pct: p1Pct
        },
        p2Skill: {
          name: g2?.skill?.name || 'PODER',
          state: (p2?.cooldown || 0) <= 0 ? 'LISTA' : `${(p2.cooldown).toFixed(1)}s`,
          pct: p2Pct
        },
        countdown: Math.max(0, Math.ceil(this.countdown)),
        paused: state.paused,
        hint: 'MANTÉN EL CONTROL. BUSCA EL ÁNGULO.',
        arenaName: arenaDisplayName,
        mutationStatus: state.mutationMode === 'mutation' ? getMutationStatus() : null
      });

      this.callbacks.onScoreUpdate?.({ ...state.scores }, state.winScore);

      if (state.mutationMode === 'mutation') {
        const rotBucket = Math.floor((state.mutation?.rot || 0) / 5);
        if (rotBucket !== this.lastMutationRotBucket) this.buildArenaCache();
      }
      this.lastHud = now;
    }

    state.raf = requestAnimationFrame(this.loop);
  };

  public startMatch(options: any = {}) {
    if (state.preparationMode === 'survival' && survivalCampaign.active) {
      state.mode = 'cpu';
      state.mythicMode = 'classic';
      state.mutationMode = 'off';
      persistActiveCampaign();
    }

    if (state.preparationMode === 'mutation') {
      state.mythicMode = 'classic';
      state.mutationOptions = state.mutationOptions || {};
      state.mutationOptions.vaccinesEnabled = Boolean(state.itemsEnabled);
      setMutationMode('mutation');
    } else if (state.preparationMode === 'chronicles') {
      setMutationMode('off');
    }

    if (['olympus', 'ragnarok', 'throne', 'waters', 'boss-jormungandr', 'boss-typhon'].includes(state.mythicMode)) {
      const duel = {
        olympus: ['zeus', 'poseidon'],
        ragnarok: ['thor', 'jormungandr'],
        throne: ['horus', 'seth'],
        waters: ['indra', 'vritra'],
        'boss-jormungandr': ['thor', 'jormungandr'],
        'boss-typhon': ['zeus', 'typhon']
      }[state.mythicMode];
      state.selected.p1 = duel[0];
      state.selected.p2 = duel[1];
      state.rosterMode = 'mythic-duel';
    }

    if (state.mythicMode === 'boss-jormungandr') {
      state.mode = 'cpu';
      if (state.mutationMode !== 'mutation') {
        state.itemsEnabled = false;
        state.items = [];
      }
    }

    state.scores = { p1: 0, p2: 0 };
    this.clearGodMessages();
    clearArenaEventState();
    resetArenaDirector();
    state.lastWinner = null;
    state.finished = false;
    state.paused = false;
    state.running = true;

    state.mythicSurgeTime = 0;
    state.mythicSurgeCooldown = state.mythicMode === 'olympus' ? 5.5 : 0;
    state.mythicRagnarokElapsed = 0;
    state.mythicRagnarokStage = 0;
    state.mythicRagnarokPulse = 0;
    state.mythicRagnarokCooldown = 4.5;
    state.mythicThroneElapsed = 0;
    state.mythicThroneStage = 0;
    state.mythicThronePulse = 0;
    state.mythicThroneCooldown = 4.5;
    state.mythicWatersElapsed = 0;
    state.mythicWatersStage = 0;
    state.mythicWatersPulse = 0;
    state.mythicWatersCooldown = 4.5;
    state.jormungandr = { elapsed: 0, stage: 0, warning: 0, active: 0, recovery: 0, cooldown: 4.5, inset: 0, targetInset: 42 };
    state.typhon = { elapsed: 0, stage: 0, warning: 0, active: 0, cooldown: 3.8, direction: 1, gust: 0 };

    state.keys = {};
    state.touch = { up1: false, down1: false, up2: false, down2: false };
    state.touchDrag = { p1: null, p2: null };
    state.touchDragDelta = { p1: 0, p2: 0 };

    if (state.mutationMode === 'mutation') {
      state.mutationColors = state.mutationColors || { p1: '#45ff75', p2: '#42baff' };
      if (state.mode === 'cpu') state.mutationColors.p2 = this.randomMutationCPUColor(state.mutationColors.p1);
      state.paddles = {
        p1: createPaddle('p1', GODS[state.selected.p1]),
        p2: createPaddle('p2', GODS[state.selected.p2])
      };
      state.paddles.p1.color = state.mutationColors.p1;
      state.paddles.p2.color = state.mutationColors.p2;
    } else {
      state.paddles = {
        p1: createPaddle('p1', GODS[state.selected.p1]),
        p2: createPaddle('p2', GODS[state.selected.p2])
      };
    }

    resetMutationState(state.mutationMode === 'mutation');
    state.ball = createBall();
    state.balls = [state.ball];
    state.nextBallId = 2;
    state.particles = [];
    state.items = [];
    state.temporaryWalls = [];
    state.powerupSpawnTimer = 0.8;
    resetPowerups();

    state.lastFrame = 0;
    this.buildArenaCache();
    serve(Math.random() > 0.5 ? 1 : -1);
    state.serveTimer = 0;

    this.countdown = 3;

    const introLine = state.preparationMode === 'survival'
      ? (survivalCampaign.boss ? `JEFE FINAL · ${GODS[state.selected.p2].name.toUpperCase()}` : `RIVAL ${survivalCampaign.encounter}/15 · ${GODS[state.selected.p2].name.toUpperCase()}`)
      : state.mutationMode === 'mutation'
      ? 'CANCHA MUTANTE · EL 100% SIGNIFICA DERROTA'
      : state.mythicMode === 'olympus'
      ? 'ZEUS VS POSEIDÓN · LA TORMENTA DECIDIRÁ'
      : state.mythicMode === 'ragnarok'
      ? 'THOR VS JÖRMUNGANDR · EL MUNDO SE QUIEBRA'
      : state.mythicMode === 'throne'
      ? 'HORUS VS SETH · EL TRONO ESTÁ EN JUEGO'
      : state.mythicMode === 'waters'
      ? 'INDRA VS VRITRA · LAS AGUAS DEBEN SER LIBERADAS'
      : state.mythicMode === 'boss-jormungandr'
      ? 'THOR VS JÖRMUNGANDR · SIN POWER-UPS'
      : state.mythicMode === 'boss-typhon'
      ? 'ZEUS VS TIFÓN · LA TORMENTA TE PONDRÁ A PRUEBA'
      : 'EL PRIMER GOLPE ES TUYO';

    const introTitle = state.preparationMode === 'survival'
      ? 'DESAFÍO DE SUPERVIVENCIA'
      : state.mythicMode === 'olympus'
      ? 'LA GUERRA DEL OLIMPO'
      : state.mythicMode === 'ragnarok'
      ? 'EL PRESAGIO DEL RAGNARÖK'
      : state.mythicMode === 'throne'
      ? 'LA DISPUTA POR EL TRONO'
      : state.mythicMode === 'waters'
      ? 'LA LIBERACIÓN DE LAS AGUAS'
      : state.mythicMode === 'boss-jormungandr'
      ? 'DESAFÍO DE JEFE · MIDGARD'
      : state.mythicMode === 'boss-typhon'
      ? 'DESAFÍO DE JEFE · TORMENTA PRIMORDIAL'
      : 'PREPARADOS';

    this.callbacks.onHudUpdate?.({
      p1Skill: { name: GODS[state.selected.p1]?.skill?.name || 'PODER', state: 'LISTA', pct: 100 },
      p2Skill: { name: GODS[state.selected.p2]?.skill?.name || 'PODER', state: 'LISTA', pct: 100 },
      countdown: 3,
      paused: false,
      hint: 'MANTÉN EL CONTROL. BUSCA EL ÁNGULO.',
      arenaName: ARENAS.find(a => a.id === state.arenaId)?.name || 'Arena divina',
      introLine,
      introTitle
    });

    cancelAnimationFrame(state.raf);
    state.raf = requestAnimationFrame(this.loop);
    playTone(440, 0.08);
  }

  public togglePause() {
    if (!state.running && !state.paused) return;
    state.paused = !state.paused;
    if (!state.paused) state.lastFrame = 0;
  }

  public finishMatch(detail: any) {
    clearArenaEventState();
    clearArenaDirector();
    const winner = detail.winner;
    const opponentIdAtFinish = state.selected.p2;
    const protagonistIdAtFinish = state.selected.p1;
    const side = winner === 'p1' ? 'p1' : 'p2';
    const god = GODS[state.selected[side]];
    const mutationLoss = state.mutationMode === 'mutation' && detail.reason === 'corruption';
    const loserSide = detail.loser || (winner === 'p1' ? 'p2' : 'p1');
    const loser = GODS[state.selected[loserSide]];

    let survivalResult = null;
    let title = '';
    let description = '';
    let color = '';
    let emblem = '';
    let rematchText = 'REVANCHA ↻';

    if (state.preparationMode === 'survival' && (survivalCampaign.active || survivalCampaign.outcome)) {
      const playerWon = winner === 'p1';
      const defeatedOpponent = GODS[opponentIdAtFinish];
      const protagonist = GODS[protagonistIdAtFinish];
      survivalResult = completeSurvivalMatch(winner);

      color = survivalResult?.type === 'victory' ? '#f4d17a' : survivalResult?.type === 'defeat' ? '#ff7187' : playerWon ? (protagonist?.color || god.color) : (defeatedOpponent?.color || god.color);
      emblem = survivalResult?.type === 'victory' ? '♛' : survivalResult?.type === 'defeat' ? '☠' : survivalResult?.type === 'boss-unlocked' ? '♜' : playerWon ? (protagonist?.symbol || god.symbol) : (defeatedOpponent?.symbol || god.symbol);

      if (survivalResult?.type === 'victory') {
        title = 'SUPERVIVENCIA COMPLETADA';
        description = `${protagonist.name} derrotó al jefe final ${defeatedOpponent.name} y completó el desafío. Rivales superados: 15/15. Victorias: ${survivalCampaign.wins}; combates perdidos: ${survivalCampaign.losses}. Vidas restantes: ${survivalResult.lives}.`;
        rematchText = 'NUEVA PARTIDA ↻';
      } else if (survivalResult?.type === 'defeat') {
        title = 'FIN DE LA SUPERVIVENCIA';
        description = `${protagonist.name} se quedó sin vidas. ${survivalResult.boss ? `El jefe final ${defeatedOpponent.name} resistió.` : `Tu último rival fue ${defeatedOpponent.name}; llegaste al rival ${survivalResult.encounter} de 15 y superaste ${survivalResult.clearedEncounters}/15.`} Victorias: ${survivalCampaign.wins}; combates perdidos: ${survivalCampaign.losses}.`;
        rematchText = 'NUEVA PARTIDA ↻';
      } else if (survivalResult?.type === 'boss-unlocked') {
        title = 'EL JEFE FINAL TE ESPERA';
        description = `Superaste los 15 rivales y derrotaste a ${defeatedOpponent.name}. ${GODS[state.selected.p2].name} aparece como jefe final reforzado. Vidas restantes: ${survivalResult.lives}.`;
        rematchText = 'ENFRENTAR JEFE FINAL ↗';
      } else if (survivalResult?.type === 'retry-boss') {
        title = 'EL JEFE SIGUE EN PIE';
        description = `${defeatedOpponent.name} te derrotó y perdiste una vida. El jefe no cambia: tendrás que vencerlo para completar el desafío. Vidas restantes: ${survivalResult.lives}.`;
        rematchText = 'REINTENTAR JEFE ↻';
      } else if (survivalResult?.type === 'retry-encounter') {
        title = 'EL RIVAL TE DETUVO';
        description = `${defeatedOpponent.name} ganó este combate. Perdiste una vida, pero el rival ${survivalResult.encounter}/15 sigue pendiente. Vencelo para avanzar. Vidas restantes: ${survivalResult.lives}.`;
        rematchText = 'REINTENTAR RIVAL ↻';
      } else {
        title = 'RIVAL SUPERADO';
        description = `${protagonist.name} venció a ${defeatedOpponent.name}. Rival ${survivalResult?.clearedEncounters || survivalCampaign.clearedEncounters}/15 superado. Próximo rival: ${GODS[state.selected.p2].name}. Vidas restantes: ${survivalResult?.lives}.`;
        rematchText = 'SIGUIENTE RIVAL ↗';
      }
    } else {
      title = mutationLoss ? `${god.name.toUpperCase()} SOBREVIVE` : `${god.name.toUpperCase()} TRIUNFA`;
      color = mutationLoss ? '#a7ff7c' : god.color;
      emblem = mutationLoss ? '✚' : god.symbol;
      description = mutationLoss
        ? `${loser.name} alcanzó el 100% de corrupción y sucumbió a la Cancha Mutante. ${god.name} sobrevivió a la mutación.`
        : `${god.skill.name} inclinó el destino de la arena. ${god.name} (${god.kind || 'DIOS'}) se queda con la victoria.`;
    }

    state.finished = true;
    state.running = false;
    cancelAnimationFrame(state.raf);

    this.callbacks.onMatchFinished?.({
      winner,
      scores: { ...state.scores },
      title,
      description,
      color,
      emblem,
      rematchText,
      survivalResult
    });
  }

  public returnToMenu() {
    state.running = false;
    state.paused = false;
    state.finished = false;
    state.keys = {};
    state.touch = { up1: false, down1: false, up2: false, down2: false };
    state.touchDrag = { p1: null, p2: null };
    state.touchDragDelta = { p1: 0, p2: 0 };
    cancelAnimationFrame(state.raf);
    this.clearGodMessages();
    clearArenaEventState();
    clearArenaDirector();
  }
}

export const engine = new GameEngine();

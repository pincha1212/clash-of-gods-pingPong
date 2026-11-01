import React, { useEffect, useRef, useState } from 'react';
import { GODS } from '../game/config.js';
import { engine } from '../game/engine.js';
import { survivalCampaign } from '../game/survival.js';
import { state } from '../game/state.js';

interface ScreenGameProps {
  preparationMode: 'classic' | 'chronicles' | 'mutation' | 'survival';
  selectedP1: string;
  selectedP2: string;
  winScore: number;
  gameMode: 'cpu' | 'local';
  onExit: () => void;
  onMatchFinished: (result: any) => void;
}

interface TouchPoint {
  side: 'p1' | 'p2';
  startX: number;
  startY: number;
  lastY: number;
  startTime: number;
}

export const ScreenGame: React.FC<ScreenGameProps> = ({
  preparationMode,
  selectedP1,
  selectedP2,
  winScore,
  gameMode,
  onExit,
  onMatchFinished
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [scores, setScores] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [hud, setHud] = useState<any>({
    p1Skill: { name: 'PODER', state: 'LISTA', pct: 100 },
    p2Skill: { name: 'PODER', state: 'LISTA', pct: 100 },
    countdown: 3,
    paused: false,
    hint: 'DESLIZA PARA MOVER · DOBLE TOQUE O SWIPE PARA PODER',
    arenaName: 'Arena divina',
    introLine: 'EL PRIMER GOLPE ES TUYO',
    introTitle: 'PREPARADOS'
  });

  const [landscapeHintDismissed, setLandscapeHintDismissed] = useState<boolean>(false);

  const p1God = GODS[selectedP1] || GODS.raijin;
  const p2God = GODS[selectedP2] || GODS.fujin;
  const isSurvival = preparationMode === 'survival';
  const isMutation = preparationMode === 'mutation';

  // Tracking touches for gestures
  const touchesRef = useRef<Map<number, TouchPoint>>(new Map());
  const lastTapTimeRef = useRef<{ p1: number; p2: number }>({ p1: 0, p2: 0 });

  // Body classes for device and screen adaptation
  useEffect(() => {
    document.body.classList.add('game-playing');
    document.body.dataset.gameMode = gameMode;
    document.body.dataset.mythicMode = state.mythicMode || 'classic';
    document.body.dataset.mutationMode = state.mutationMode === 'mutation' ? 'mutation' : 'off';
    if (isSurvival) document.body.classList.add('survival-mode');

    // Attempt orientation lock to landscape if available
    try {
      if (window.matchMedia('(pointer: coarse)').matches && screen.orientation && (screen.orientation as any).lock) {
        (screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch (_) {}

    return () => {
      document.body.classList.remove('game-playing');
      document.body.classList.remove('survival-mode');
    };
  }, [gameMode, isSurvival]);

  useEffect(() => {
    if (!canvasRef.current) return;

    engine.setCallbacks({
      onScoreUpdate: (newScores) => {
        setScores({ ...newScores });
      },
      onHudUpdate: (newHud) => {
        setHud((prev: any) => ({ ...prev, ...newHud }));
      },
      onMatchFinished: (res) => {
        onMatchFinished(res);
      }
    });

    engine.attachCanvas(canvasRef.current);
    engine.startMatch();

    return () => {
      engine.detachCanvas();
    };
  }, []);

  // Gesture system: Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = 600 / rect.height;
    const now = performance.now();

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const clientX = touch.clientX - rect.left;
      const clientY = touch.clientY - rect.top;
      const canvasY = clientY * scaleY;

      // In 1P CPU mode, entire court controls Player 1. In 2P local mode, left half is P1, right half is P2.
      const side: 'p1' | 'p2' = gameMode === 'cpu' ? 'p1' : (clientX < rect.width / 2 ? 'p1' : 'p2');

      // Check for two-finger tap on same side
      let existingTouchesOnSide = 0;
      touchesRef.current.forEach(t => {
        if (t.side === side) existingTouchesOnSide++;
      });
      if (existingTouchesOnSide >= 1) {
        // Two-finger tap detected -> activate ability!
        engine.gestureTriggerAbility(side);
      }

      // Check for double-tap
      const lastTap = lastTapTimeRef.current[side];
      if (now - lastTap < 320) {
        // Double-tap detected -> activate ability!
        engine.gestureTriggerAbility(side);
        lastTapTimeRef.current[side] = 0;
      } else {
        lastTapTimeRef.current[side] = now;
      }

      touchesRef.current.set(touch.identifier, {
        side,
        startX: touch.clientX,
        startY: touch.clientY,
        lastY: touch.clientY,
        startTime: now
      });

      engine.gestureStart(side, canvasY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = 600 / rect.height;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const pt = touchesRef.current.get(touch.identifier);
      if (!pt) continue;

      const deltaY = (touch.clientY - pt.lastY) * scaleY;
      pt.lastY = touch.clientY;

      engine.gestureMove(pt.side, deltaY);

      // Check for quick horizontal swipe / flick gesture to trigger power
      const deltaX = touch.clientX - pt.startX;
      const elapsed = performance.now() - pt.startTime;
      if (elapsed < 300 && Math.abs(deltaX) > 45) {
        if ((pt.side === 'p1' && deltaX > 40) || (pt.side === 'p2' && deltaX < -40) || gameMode === 'cpu') {
          engine.gestureTriggerAbility(pt.side);
          pt.startTime = 0; // Prevent repeated triggers
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const pt = touchesRef.current.get(touch.identifier);
      if (pt) {
        engine.gestureEnd(pt.side);
        touchesRef.current.delete(touch.identifier);
      }
    }
  };

  // Pointer / Mouse drag support for desktop/tablet mouse
  const isPointerDownRef = useRef<boolean>(false);
  const lastPointerYRef = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return; // Handled by touch events
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = 600 / rect.height;
    const canvasY = (e.clientY - rect.top) * scaleY;
    const side: 'p1' | 'p2' = gameMode === 'cpu' ? 'p1' : ((e.clientX - rect.left) < rect.width / 2 ? 'p1' : 'p2');

    isPointerDownRef.current = true;
    lastPointerYRef.current = e.clientY;
    engine.gestureStart(side, canvasY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || e.pointerType === 'touch') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = 600 / rect.height;
    const deltaY = (e.clientY - lastPointerYRef.current) * scaleY;
    lastPointerYRef.current = e.clientY;

    const side: 'p1' | 'p2' = gameMode === 'cpu' ? 'p1' : ((e.clientX - rect.left) < rect.width / 2 ? 'p1' : 'p2');
    engine.gestureMove(side, deltaY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    isPointerDownRef.current = false;
    engine.gestureEnd('p1');
    engine.gestureEnd('p2');
  };

  const togglePause = () => {
    engine.togglePause();
  };

  const completedEncounters = survivalCampaign.clearedEncounters || 0;
  const survivalProgress = survivalCampaign.outcome === 'victory' ? 16 : completedEncounters;

  return (
    <section id="screen-game" className="screen active game-screen" aria-hidden="false">
      {/* Portrait Landscape Hint */}
      <div
        className={`landscape-hint ${landscapeHintDismissed ? 'dismissed' : ''}`}
        id="landscape-hint"
        role="status"
      >
        <span>Para jugar mejor, gira el dispositivo a horizontal.</span>
        <button
          type="button"
          id="dismiss-landscape-hint"
          aria-label="Cerrar aviso"
          onClick={() => setLandscapeHintDismissed(true)}
        >
          ×
        </button>
      </div>

      {isSurvival && (
        <div id="survival-hud" className="survival-hud" role="status" aria-live="polite">
          <div className="survival-hud-main">
            <strong>
              {survivalCampaign.boss
                ? 'JEFE FINAL · BATALLA DEFINITIVA'
                : `SUPERVIVENCIA · RIVAL ${survivalCampaign.encounter || 1}/15`}
            </strong>
            <span aria-label={`${survivalCampaign.lives} de 3 vidas`}>
              {'♥ '.repeat(survivalCampaign.lives) + '♡ '.repeat(3 - survivalCampaign.lives)}
            </span>
            <div className="survival-progress" role="progressbar">
              <i style={{ width: `${Math.min(100, (survivalProgress / 16) * 100)}%` }}></i>
            </div>
            <small>
              {survivalCampaign.boss ? '15/15 RIVALES · JEFE FINAL' : `${completedEncounters}/15 RIVALES SUPERADOS`}
            </small>
          </div>
          <div className="survival-hud-enemy">
            <small>ENFRENTAMIENTO ACTUAL</small>
            <strong>{p2God.name.toUpperCase()}</strong>
            <small>{winScore} PUNTOS PARA GANAR</small>
          </div>
        </div>
      )}

      <div className="game-heading">
        <div>
          <p className="eyebrow">DIVINE ARENA / MATCH LIVE</p>
          <h2>EL DUELO <em>COMIENZA</em></h2>
          <small className="arena-name-live">{hud.arenaName}</small>
        </div>
        <div className="game-actions">
          <button className="button button-quiet" onClick={togglePause}>
            {hud.paused ? '▶ REANUDAR' : 'Ⅱ PAUSA'}
          </button>
          <button className="button button-quiet" onClick={onExit}>
            SALIR
          </button>
        </div>
      </div>

      <div className="scorebar">
        <div className="score-player left-score">
          <span className="score-name">{p1God.name.toUpperCase()}</span>
          <b>{scores.p1}</b>
          <small>JUGADOR 01</small>
        </div>
        <div className="match-center">
          <span>FIRST TO</span>
          <b>{winScore}</b>
          <div className="score-track">
            <i style={{ width: `${Math.min(100, (scores.p1 / winScore) * 100)}%` }}></i>
            <i style={{ width: `${Math.min(100, (scores.p2 / winScore) * 100)}%` }}></i>
          </div>
        </div>
        <div className="score-player right-score">
          <span className="score-name">{p2God.name.toUpperCase()}</span>
          <b>{scores.p2}</b>
          <small>{gameMode === 'cpu' ? 'CPU' : 'JUGADOR 02'}</small>
        </div>
      </div>

      {isMutation && hud.mutationStatus && (
        <div id="mutation-status" className="mutation-status" aria-live="polite">
          <div className="mutation-status-head">
            <span>CANCHA MUTANTE · SUPERVIVENCIA POR CORRUPCIÓN</span>
          </div>
          <div className="mutation-player-charge">
            <div className="mutation-status-head">
              <span>JUGADOR 01</span>
              <b>{Math.round(hud.mutationStatus.players?.p1?.charge || 0)}%</b>
            </div>
            <div className="mutation-charge-track">
              <i style={{ width: `${Math.min(100, hud.mutationStatus.players?.p1?.charge || 0)}%` }}></i>
            </div>
          </div>
          <div className="mutation-player-charge">
            <div className="mutation-status-head">
              <span>{gameMode === 'cpu' ? 'CPU' : 'JUGADOR 02'}</span>
              <b>{Math.round(hud.mutationStatus.players?.p2?.charge || 0)}%</b>
            </div>
            <div className="mutation-charge-track">
              <i style={{ width: `${Math.min(100, hud.mutationStatus.players?.p2?.charge || 0)}%` }}></i>
            </div>
          </div>
        </div>
      )}

      {/* Arena container with Gesture Touch & Drag controls */}
      <div
        ref={containerRef}
        className="arena-wrap"
        style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="arena-corner arena-corner-tl"></div>
        <div className="arena-corner arena-corner-tr"></div>
        <div className="arena-corner arena-corner-bl"></div>
        <div className="arena-corner arena-corner-br"></div>

        <canvas
          ref={canvasRef}
          id="game-canvas"
          width={1000}
          height={600}
          aria-label="Arena de combate"
        />

        {/* Lateral Skill Widget - Jugador 1 (Costado medio izquierdo) */}
        <div
          className={`lateral-skill lateral-skill-p1 ${hud.p1Skill.state === 'LISTA' ? 'is-ready' : 'is-cooldown'}`}
          onClick={(e) => {
            e.stopPropagation();
            engine.gestureTriggerAbility('p1');
          }}
          role="button"
          tabIndex={0}
          aria-label={`Habilidad ${hud.p1Skill.name}: ${hud.p1Skill.state}`}
          title={`${hud.p1Skill.name} · Toca o Doble Toque para activar`}
        >
          <div className="lateral-skill-gauge">
            <svg className="lateral-gauge-svg" viewBox="0 0 46 46">
              <circle className="lateral-gauge-bg" cx="23" cy="23" r="19" />
              <circle
                className="lateral-gauge-fill"
                cx="23"
                cy="23"
                r="19"
                style={{
                  strokeDasharray: 119.4,
                  strokeDashoffset: 119.4 * (1 - Math.min(100, Math.max(0, hud.p1Skill.pct)) / 100)
                }}
              />
            </svg>
            <span className="lateral-skill-symbol">{p1God.symbol}</span>
          </div>
          <div className="lateral-skill-info">
            <span className="lateral-skill-name">{hud.p1Skill.name}</span>
            <b className="lateral-skill-state">{hud.p1Skill.state}</b>
          </div>
        </div>

        {/* Lateral Skill Widget - Jugador 2 / CPU (Costado medio derecho) */}
        <div
          className={`lateral-skill lateral-skill-p2 ${hud.p2Skill.state === 'LISTA' ? 'is-ready' : 'is-cooldown'}`}
          onClick={(e) => {
            if (gameMode !== 'cpu') {
              e.stopPropagation();
              engine.gestureTriggerAbility('p2');
            }
          }}
          role={gameMode !== 'cpu' ? 'button' : undefined}
          tabIndex={gameMode !== 'cpu' ? 0 : undefined}
          aria-label={`Habilidad ${hud.p2Skill.name}: ${hud.p2Skill.state}`}
          title={`${hud.p2Skill.name}${gameMode !== 'cpu' ? ' · Toca para activar' : ''}`}
        >
          <div className="lateral-skill-gauge">
            <svg className="lateral-gauge-svg" viewBox="0 0 46 46">
              <circle className="lateral-gauge-bg" cx="23" cy="23" r="19" />
              <circle
                className="lateral-gauge-fill"
                cx="23"
                cy="23"
                r="19"
                style={{
                  strokeDasharray: 119.4,
                  strokeDashoffset: 119.4 * (1 - Math.min(100, Math.max(0, hud.p2Skill.pct)) / 100)
                }}
              />
            </svg>
            <span className="lateral-skill-symbol">{p2God.symbol}</span>
          </div>
          <div className="lateral-skill-info">
            <span className="lateral-skill-name">{hud.p2Skill.name}</span>
            <b className="lateral-skill-state">{hud.p2Skill.state}</b>
          </div>
        </div>

        {hud.countdown > 0 && (
          <div id="arena-overlay" className="arena-overlay">
            <span className="eyebrow">{hud.introTitle || 'PREPARADOS'}</span>
            <strong>{hud.countdown}</strong>
            <small>{hud.introLine || 'EL PRIMER GOLPE ES TUYO'}</small>
          </div>
        )}

        {hud.paused && (
          <div id="pause-overlay" className="pause-overlay">
            <strong>COMBATE EN PAUSA</strong>
            <button className="button button-primary" onClick={togglePause}>
              REANUDAR
            </button>
          </div>
        )}
      </div>

      <div className="combat-footer" style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
        <div className="arena-hint" style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'var(--muted)' }}>
          {gameMode === 'cpu'
            ? 'DESLIZA PARA MOVER · TOCA LA HABILIDAD O DOBLE TOQUE PARA ACTIVAR'
            : 'J1 (IZQ) Y J2 (DER): DESLIZAR PARA MOVER · TOCAR HABILIDAD LATERAL PARA ACTIVAR'}
        </div>
      </div>
    </section>
  );
};

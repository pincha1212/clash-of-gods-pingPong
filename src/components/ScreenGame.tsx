import React, { useEffect, useRef, useState } from 'react';
import { GODS } from '../game/config.js';
import { engine } from '../game/engine.js';
import { survivalCampaign } from '../game/survival.js';

interface ScreenGameProps {
  preparationMode: 'classic' | 'chronicles' | 'mutation' | 'survival';
  selectedP1: string;
  selectedP2: string;
  winScore: number;
  gameMode: 'cpu' | 'local';
  onExit: () => void;
  onMatchFinished: (result: any) => void;
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

  const [scores, setScores] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });
  const [hud, setHud] = useState<any>({
    p1Skill: { name: 'PODER', state: 'LISTA', pct: 100 },
    p2Skill: { name: 'PODER', state: 'LISTA', pct: 100 },
    countdown: 3,
    paused: false,
    hint: 'MANTÉN EL CONTROL. BUSCA EL ÁNGULO.',
    arenaName: 'Arena divina',
    introLine: 'EL PRIMER GOLPE ES TUYO',
    introTitle: 'PREPARADOS'
  });

  const p1God = GODS[selectedP1] || GODS.raijin;
  const p2God = GODS[selectedP2] || GODS.fujin;
  const isSurvival = preparationMode === 'survival';
  const isMutation = preparationMode === 'mutation';

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

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const clientX = touch.clientX - rect.left;
      const clientY = touch.clientY - rect.top;
      const scaleY = 600 / rect.height;
      const canvasY = clientY * scaleY;

      if (clientX < rect.width / 2) {
        engine.setTouchDrag('p1', canvasY);
      } else if (gameMode !== 'cpu') {
        engine.setTouchDrag('p2', canvasY);
      }
    }
  };

  const handleCanvasTouchEnd = () => {
    engine.setTouchDrag('p1', null);
    engine.setTouchDrag('p2', null);
  };

  const togglePause = () => {
    engine.togglePause();
  };

  const completedEncounters = survivalCampaign.clearedEncounters || 0;
  const survivalProgress = survivalCampaign.outcome === 'victory' ? 16 : completedEncounters;

  return (
    <section id="screen-game" className="screen active game-screen" aria-hidden="false">
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

      <div className="arena-wrap">
        <div className="arena-corner arena-corner-tl"></div>
        <div className="arena-corner arena-corner-tr"></div>
        <div className="arena-corner arena-corner-bl"></div>
        <div className="arena-corner arena-corner-br"></div>

        <canvas
          ref={canvasRef}
          id="game-canvas"
          width={1000}
          height={600}
          aria-label="Arena de ping pong"
          onTouchMove={handleCanvasTouchMove}
          onTouchEnd={handleCanvasTouchEnd}
        />

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

      <div className="combat-footer">
        <div className="skill-status" id="skill-status-p1">
          <span className="skill-key">SPACE</span>
          <span>
            <b>{hud.p1Skill.name}</b>
            <small>{hud.p1Skill.state}</small>
          </span>
          <div className="cooldown-track">
            <i style={{ width: `${hud.p1Skill.pct}%` }}></i>
          </div>
        </div>

        <div className="arena-hint">{hud.hint}</div>

        <div className="skill-status right-skill" id="skill-status-p2">
          <span className="skill-key">{gameMode === 'cpu' ? 'CPU' : 'ENTER'}</span>
          <span>
            <b>{hud.p2Skill.name}</b>
            <small>{hud.p2Skill.state}</small>
          </span>
          <div className="cooldown-track">
            <i style={{ width: `${hud.p2Skill.pct}%` }}></i>
          </div>
        </div>
      </div>

      <div className="touch-controls" aria-label="Controles táctiles">
        <div className="touch-player touch-player-one">
          <span>JUGADOR 1</span>
          <button
            onTouchStart={() => engine.setTouchInput('p1', 'up', true)}
            onTouchEnd={() => engine.setTouchInput('p1', 'up', false)}
            aria-label="Mover jugador 1 arriba"
          >
            ▲
          </button>
          <button
            onTouchStart={() => engine.setTouchInput('p1', 'down', true)}
            onTouchEnd={() => engine.setTouchInput('p1', 'down', false)}
            aria-label="Mover jugador 1 abajo"
          >
            ▼
          </button>
          <button
            onTouchStart={() => engine.setTouchInput('p1', 'skill', true)}
            onTouchEnd={() => engine.setTouchInput('p1', 'skill', false)}
          >
            PODER
          </button>
        </div>

        {gameMode !== 'cpu' && (
          <div className="touch-player touch-player-two">
            <span>JUGADOR 2</span>
            <button
              onTouchStart={() => engine.setTouchInput('p2', 'up', true)}
              onTouchEnd={() => engine.setTouchInput('p2', 'up', false)}
              aria-label="Mover jugador 2 arriba"
            >
              ▲
            </button>
            <button
              onTouchStart={() => engine.setTouchInput('p2', 'down', true)}
              onTouchEnd={() => engine.setTouchInput('p2', 'down', false)}
              aria-label="Mover jugador 2 abajo"
            >
              ▼
            </button>
            <button
              onTouchStart={() => engine.setTouchInput('p2', 'skill', true)}
              onTouchEnd={() => engine.setTouchInput('p2', 'skill', false)}
            >
              PODER
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

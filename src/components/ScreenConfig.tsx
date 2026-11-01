import React, { useMemo } from 'react';
import { GODS, ARENAS, ARENA_MYTHOLOGIES } from '../game/config.js';

interface ScreenConfigProps {
  preparationMode: 'classic' | 'chronicles' | 'mutation' | 'survival';
  mythicMode: string;
  onMythicModeChange: (m: string) => void;
  arenaId: string;
  onArenaChange: (id: string) => void;
  gameMode: 'cpu' | 'local';
  onGameModeChange: (m: 'cpu' | 'local') => void;
  difficulty: 'easy' | 'normal' | 'hard';
  onDifficultyChange: (d: 'easy' | 'normal' | 'hard') => void;
  winScore: number;
  onWinScoreChange: (score: number) => void;
  arenaEventsEnabled: boolean;
  onArenaEventsChange: (val: boolean) => void;
  skillsEnabled: boolean;
  onSkillsChange: (val: boolean) => void;
  itemsEnabled: boolean;
  onItemsChange: (val: boolean) => void;
  mutationP1Color: string;
  onMutationP1ColorChange: (c: string) => void;
  mutationP2Color: string;
  onMutationP2ColorChange: (c: string) => void;
  selectedP1: string;
  selectedP2: string;
  onContinue: () => void;
  onBack: () => void;
}

export const ScreenConfig: React.FC<ScreenConfigProps> = ({
  preparationMode,
  mythicMode,
  onMythicModeChange,
  arenaId,
  onArenaChange,
  gameMode,
  onGameModeChange,
  difficulty,
  onDifficultyChange,
  winScore,
  onWinScoreChange,
  arenaEventsEnabled,
  onArenaEventsChange,
  skillsEnabled,
  onSkillsChange,
  itemsEnabled,
  onItemsChange,
  mutationP1Color,
  onMutationP1ColorChange,
  mutationP2Color,
  onMutationP2ColorChange,
  selectedP1,
  selectedP2,
  onContinue,
  onBack
}) => {
  const isChronicles = preparationMode === 'chronicles';
  const isMutation = preparationMode === 'mutation';
  const isSurvival = preparationMode === 'survival';

  const arenaGroups = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const a of ARENAS) {
      const myth = (ARENA_MYTHOLOGIES as any)[a.id] || 'Mitología por clasificar';
      if (!map.has(myth)) map.set(myth, []);
      map.get(myth)!.push(a);
    }
    return map;
  }, []);

  const p1God = GODS[selectedP1] || GODS.raijin;
  const p2God = GODS[selectedP2] || GODS.fujin;

  const currentArena = ARENAS.find(a => a.id === arenaId) || ARENAS[0];

  const kindLabel = (g: any) => {
    const KIND_LABEL: Record<string, string> = { hero: 'HÉROE', titan: 'TITÁN', monster: 'MONSTRUO' };
    return KIND_LABEL[g.kind] || 'DIOS';
  };

  const titleText = isChronicles
    ? 'PREPARA LA CRÓNICA'
    : isMutation
    ? 'PREPARA LA MUTACIÓN'
    : isSurvival
    ? 'PREPARA LA SUPERVIVENCIA'
    : 'PREPARA LA BATALLA';

  const subtitleText = isChronicles
    ? 'Elegí una historia y revisá sus reglas especiales.'
    : isMutation
    ? 'Elegí personajes y reglas para sobrevivir a la Cancha Mutante.'
    : isSurvival
    ? 'Elegí tu campeón. Los rivales cambiarán automáticamente en cada combate.'
    : 'Revisa la arena y las reglas antes de comenzar.';

  return (
    <section id="screen-config" className="screen active" aria-hidden="false">
      <div className="section-head">
        <div>
          <p className="eyebrow">
            {isChronicles
              ? 'PREPARACIÓN / CRÓNICAS'
              : isMutation
              ? 'PREPARACIÓN / MUTACIÓN'
              : isSurvival
              ? 'PREPARACIÓN / SUPERVIVENCIA'
              : 'PREPARACIÓN / PASO 03'}
          </p>
          <h2>{titleText}</h2>
          <p className="muted">{subtitleText}</p>
        </div>
        <button className="button button-quiet" onClick={onBack}>
          {isChronicles ? '← MODOS' : '← PERSONAJES'}
        </button>
      </div>

      <div className="config-layout">
        <div className="config-card config-main">
          {isChronicles && (
            <section className="config-group">
              <p className="config-group-title">01 · HISTORIA MITOLÓGICA</p>
              <label htmlFor="mythic-mode-select">ELEGÍ UNA CRÓNICA</label>
              <select
                id="mythic-mode-select"
                value={mythicMode}
                onChange={(e) => onMythicModeChange(e.target.value)}
              >
                <option value="olympus">La guerra del Olimpo · Zeus vs Poseidón</option>
                <option value="ragnarok">El presagio del Ragnarök · Thor vs Jörmungandr</option>
                <option value="throne">La disputa por el trono · Horus vs Seth</option>
                <option value="waters">La liberación de las aguas · Indra vs Vritra</option>
                <option value="boss-jormungandr">Jefe: Jörmungandr · El cerco de Midgard</option>
                <option value="boss-typhon">Jefe: Tifón · La tormenta primordial</option>
              </select>
              <p className="arena-selection-note">Cada crónica define sus contendientes y eventos.</p>
            </section>
          )}

          {!isChronicles && !isMutation && (
            <section className="config-group">
              <p className="config-group-title">01 · ARENA</p>
              <label htmlFor="arena-select">ARENA DE COMBATE</label>
              <select
                id="arena-select"
                value={arenaId}
                onChange={(e) => onArenaChange(e.target.value)}
              >
                {[...arenaGroups.entries()].map(([myth, arenas]) => (
                  <optgroup key={myth} label={myth}>
                    {arenas.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="arena-selection-note">
                {currentArena ? `${currentArena.name}: ${currentArena.desc || 'Escenario divino con ambientación propia.'}` : 'Elegí una arena de combate.'}
              </p>
            </section>
          )}

          {!isSurvival && (
            <section className="config-group">
              <p className="config-group-title">02 · PARTIDA</p>
              <label htmlFor="mode-select">TIPO DE PARTIDA</label>
              <select
                id="mode-select"
                value={gameMode}
                onChange={(e) => onGameModeChange(e.target.value as any)}
              >
                <option value="cpu">Un jugador vs CPU</option>
                <option value="local">Dos jugadores local</option>
              </select>

              {gameMode === 'cpu' && (
                <div style={{ marginTop: '16px' }}>
                  <label htmlFor="difficulty-select">DIFICULTAD DE LA CPU</label>
                  <select
                    id="difficulty-select"
                    value={difficulty}
                    onChange={(e) => onDifficultyChange(e.target.value as any)}
                  >
                    <option value="easy">Iniciación</option>
                    <option value="normal">Equilibrada</option>
                    <option value="hard">Divina</option>
                  </select>
                </div>
              )}

              {isMutation && (
                <div className="mutation-color-group">
                  <p className="config-group-title">COLORES GAMMA</p>
                  <p className="arena-selection-note">
                    Cada mitad de la cancha, las paletas y las grietas de energía usan el color de su jugador.
                  </p>
                  <div className="mutation-color-grid">
                    <label className="mutation-color-option" htmlFor="mutation-p1-color">
                      <span>JUGADOR 1</span>
                      <input
                        id="mutation-p1-color"
                        type="color"
                        value={mutationP1Color}
                        onChange={(e) => onMutationP1ColorChange(e.target.value)}
                      />
                      <small>Tu color de energía</small>
                    </label>
                    <label className="mutation-color-option" htmlFor="mutation-p2-color">
                      <span>{gameMode === 'cpu' ? 'COLOR DE LA CPU' : 'JUGADOR 2'}</span>
                      <input
                        id="mutation-p2-color"
                        type="color"
                        value={mutationP2Color}
                        disabled={gameMode === 'cpu'}
                        onChange={(e) => onMutationP2ColorChange(e.target.value)}
                      />
                      <small>{gameMode === 'cpu' ? 'La CPU elige un color aleatorio al iniciar' : 'Elegí el color del segundo jugador'}</small>
                    </label>
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="config-group">
            <p className="config-group-title">03 · REGLAS</p>
            <div id="score-target-config">
              <label>PUNTOS PARA GANAR</label>
              <div className="stepper">
                <button
                  type="button"
                  onClick={() => onWinScoreChange(Math.max(3, winScore - 1))}
                  aria-label="Restar puntos"
                >
                  −
                </button>
                <output id="score-value">{winScore}</output>
                <button
                  type="button"
                  onClick={() => onWinScoreChange(Math.min(21, winScore + 1))}
                  aria-label="Sumar puntos"
                >
                  +
                </button>
              </div>
            </div>

            <div className="toggle-row">
              <div>
                <b>Eventos ambientales</b>
                <small>Fenómenos activos de la arena y la crónica</small>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={arenaEventsEnabled}
                  onChange={(e) => onArenaEventsChange(e.target.checked)}
                />
                <span></span>
              </label>
            </div>

            <div className="toggle-row">
              <div>
                <b>Habilidades especiales</b>
                <small>Poderes únicos y tiempos de recarga</small>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={skillsEnabled}
                  onChange={(e) => onSkillsChange(e.target.checked)}
                />
                <span></span>
              </label>
            </div>

            <div className="toggle-row">
              <div>
                <b>{isMutation ? 'Vacunas de curación' : 'Objetos de arena'}</b>
                <small>
                  {isMutation
                    ? 'Activa o desactiva las vacunas que reducen corrupción'
                    : 'Potenciadores aleatorios durante el duelo'}
                </small>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={itemsEnabled}
                  onChange={(e) => onItemsChange(e.target.checked)}
                />
                <span></span>
              </label>
            </div>
          </section>

          {isSurvival && (
            <section className="config-group">
              <p className="config-group-title">REGLAS DE SUPERVIVENCIA</p>
              <p className="arena-selection-note">
                Sobreviví a 15 rivales y después enfrentá a un jefe final aleatorio. Elegí arriba los puntos necesarios para ganar: el mismo objetivo se mantiene en todos los combates, incluido el jefe. Tenés 3 vidas. Si perdés un combate completo, gastás una vida y volvés a enfrentar al mismo rival; solo una victoria te permite avanzar.
              </p>
            </section>
          )}
        </div>

        <div className="config-card duel-preview">
          <p className="eyebrow">RESUMEN DEL COMBATE</p>
          <div className="duel-versus">
            <div className="duel-god" style={{ '--god': p1God.color } as any}>
              <span className="god-symbol">{p1God.symbol}</span>
              <strong>{p1God.name}</strong>
              <small>{kindLabel(p1God)} · {p1God.skill.name}</small>
            </div>
            <span className="versus">VS</span>
            <div className="duel-god" style={{ '--god': p2God.color } as any}>
              <span className="god-symbol">{p2God.symbol}</span>
              <strong>{isSurvival ? 'RIVAL ALEATORIO' : p2God.name}</strong>
              <small>{isSurvival ? 'CAMPAÑA ARCADE' : `${kindLabel(p2God)} · ${p2God.skill.name}`}</small>
            </div>
          </div>
          <div className="config-summary">
            {isSurvival
              ? `Supervivencia con ${p1God.name}. First to ${winScore} puntos. 3 vidas para 15 rivales + jefe.`
              : isChronicles
              ? `Crónica: ${mythicMode.toUpperCase()}. First to ${winScore} pts. ${gameMode === 'cpu' ? 'vs CPU' : 'Local 2P'}.`
              : `${p1God.name} vs ${p2God.name}. First to ${winScore} pts. Arena: ${currentArena?.name}.`}
          </div>
          <div className="rule-note">
            <span>CONTROLES</span>
            <p>Jugador 1: <b>W / S</b> · Poder: <b>Espacio</b></p>
            <p>Jugador 2: <b>↑ / ↓</b> · Poder: <b>Enter</b></p>
            <p className="muted">En móvil: arrastra tu lado de la cancha o usa los botones táctiles.</p>
          </div>
          <button className="button button-primary full-width" onClick={onContinue}>
            REVISAR COMBATE <span>↗</span>
          </button>
        </div>
      </div>
    </section>
  );
};

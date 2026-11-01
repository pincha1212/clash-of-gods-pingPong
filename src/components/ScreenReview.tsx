import React from 'react';
import { GODS, ARENAS } from '../game/config.js';

interface ScreenReviewProps {
  preparationMode: 'classic' | 'chronicles' | 'mutation' | 'survival';
  mythicMode: string;
  arenaId: string;
  gameMode: 'cpu' | 'local';
  winScore: number;
  selectedP1: string;
  selectedP2: string;
  onStartBattle: () => void;
  onBack: () => void;
}

export const ScreenReview: React.FC<ScreenReviewProps> = ({
  preparationMode,
  mythicMode,
  arenaId,
  gameMode,
  winScore,
  selectedP1,
  selectedP2,
  onStartBattle,
  onBack
}) => {
  const p1God = GODS[selectedP1] || GODS.raijin;
  const p2God = GODS[selectedP2] || GODS.fujin;
  const currentArena = ARENAS.find(a => a.id === arenaId) || ARENAS[0];

  const modeLabel = {
    classic: 'CLÁSICO',
    chronicles: 'CRÓNICAS',
    mutation: 'MUTACIÓN',
    survival: 'SUPERVIVENCIA'
  }[preparationMode];

  const modeDescription = {
    classic: 'Combate libre con la arena y las reglas que elegiste.',
    chronicles: 'La crónica fija los contendientes y activa sus eventos mitológicos. Mutación está desactivada.',
    mutation: 'La Cancha Mutante y sus reglas de corrupción están activas. No se aplican reglas de Crónicas.',
    survival: '15 rivales que hay que derrotar, tres vidas compartidas y un jefe final reforzado. Si perdés, reintentás contra el mismo rival.'
  }[preparationMode];

  return (
    <section id="screen-review" className="screen active" aria-hidden="false">
      <div className="section-head">
        <div>
          <p className="eyebrow">PREPARACIÓN / PASO FINAL</p>
          <h2>REVISÁ EL <em>COMBATE</em></h2>
          <p className="muted">
            Confirmá los contendientes y las reglas efectivas. Podés volver sin perder tus elecciones.
          </p>
        </div>
        <button className="button button-quiet" onClick={onBack}>
          ← AJUSTES
        </button>
      </div>

      <div className="review-layout">
        <div className="config-card">
          <p className="eyebrow">CONTENDIENTES</p>
          <div className="duel-versus">
            <div className="duel-god" style={{ '--god': p1God.color } as any}>
              <span className="god-symbol">{p1God.symbol}</span>
              <strong>{p1God.name}</strong>
              <small>{p1God.skill.name}</small>
            </div>
            <span className="versus">VS</span>
            <div className="duel-god" style={{ '--god': p2God.color } as any}>
              <span className="god-symbol">{p2God.symbol}</span>
              <strong>{preparationMode === 'survival' ? 'RIVAL ALEATORIO' : p2God.name}</strong>
              <small>{preparationMode === 'survival' ? 'CAMPAÑA' : p2God.skill.name}</small>
            </div>
          </div>
          <div className="review-summary">
            {preparationMode === 'survival'
              ? `Campaña de Supervivencia: ${p1God.name} intentará superar 15 combates consecutivos y un jefe final, con 3 vidas y partidas a ${winScore} puntos.`
              : preparationMode === 'chronicles'
              ? `Crónica: ${mythicMode}. ${gameMode === 'cpu' ? '1 Jugador vs CPU' : '2 Jugadores local'}. Puntos para ganar: ${winScore}.`
              : `Duelo ${modeLabel}: ${p1God.name} vs ${p2God.name}. Arena: ${currentArena.name}. First to ${winScore}. ${gameMode === 'cpu' ? '1P vs CPU' : '2P local'}.`}
          </div>
        </div>

        <div className="config-card review-start-card">
          <p className="eyebrow">TODO LISTO</p>
          <h3>{modeLabel}</h3>
          <p className="muted">{modeDescription}</p>
          <button className="button button-primary full-width" onClick={onStartBattle}>
            ENTRAR EN LA ARENA <span>↗</span>
          </button>
          <button className="button button-quiet full-width" onClick={onBack}>
            VOLVER A EDITAR
          </button>
        </div>
      </div>
    </section>
  );
};

import React from 'react';

interface ScreenResultProps {
  result: {
    winner: 'p1' | 'p2';
    scores: { p1: number; p2: number };
    title: string;
    description: string;
    color: string;
    emblem: string;
    rematchText: string;
    survivalResult?: any;
  } | null;
  onRematch: () => void;
  onMainMenu: () => void;
}

export const ScreenResult: React.FC<ScreenResultProps> = ({ result, onRematch, onMainMenu }) => {
  if (!result) return null;

  return (
    <section id="screen-result" className="screen active" aria-hidden="false">
      <div className="result-card">
        <p className="eyebrow">COMBATE CONCLUIDO</p>
        <div className="result-emblem" style={{ color: result.color }}>
          {result.emblem || '✦'}
        </div>
        <h2 id="result-title" style={{ color: result.color }}>
          {result.title}
        </h2>
        <p id="result-description" className="muted">
          {result.description}
        </p>
        <div className="result-score">
          <span id="result-p1">{result.scores.p1}</span>
          <i>:</i>
          <span id="result-p2">{result.scores.p2}</span>
        </div>
        <div className="hero-actions centered">
          <button className="button button-primary" onClick={onRematch}>
            {result.rematchText || 'REVANCHA ↻'}
          </button>
          <button className="button button-quiet" onClick={onMainMenu}>
            MENÚ PRINCIPAL
          </button>
        </div>
      </div>
    </section>
  );
};

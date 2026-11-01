import React from 'react';

interface ScreenMenuProps {
  onStartCombat: () => void;
  onOpenCodex: () => void;
}

export const ScreenMenu: React.FC<ScreenMenuProps> = ({ onStartCombat, onOpenCodex }) => {
  return (
    <section id="screen-menu" className="screen active" aria-hidden="false">
      <div className="hero-copy">
        <p className="eyebrow">EL DESTINO SE DECIDE EN LA ARENA</p>
        <h1>
          EL PODER<br />
          TIENE <em>FORMA.</em>
        </h1>
        <p className="lead">
          124 personajes. Arenas mitológicas. Duelos y desafíos de supervivencia al borde del mito.
        </p>
        <div className="hero-actions">
          <button className="button button-primary" id="play-button" onClick={onStartCombat}>
            INICIAR COMBATE <span>↗</span>
          </button>
          <button className="button button-quiet" id="codex-button" onClick={onOpenCodex}>
            ABRIR EL CÓDICE
          </button>
        </div>
        <div className="hero-foot">
          <span><b className="live-dot"></b> COMBATE ARCADE</span>
          <span>1–2 JUGADORES LOCALES</span>
          <span>HTML · CANVAS · REACT</span>
        </div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-one"></div>
        <div className="orbit orbit-two"></div>
        <div className="hero-sigil">✦</div>
        <div className="hero-core"></div>
        <div className="hero-label label-top">DIVINE<br />ENERGY</div>
        <div className="hero-label label-bottom">EST. MMXXVI <span>／</span> ARENA 01</div>
        <div className="hero-stat"><span>124</span><small>PERSONAJES</small></div>
      </div>
    </section>
  );
};

import React, { useMemo } from 'react';
import { GODS, CHARACTER_CULTURAL_CLASSIFICATION } from '../game/config.js';
import { getSurvivalRecord } from '../game/survival.js';

interface ScreenSelectProps {
  preparationMode: 'classic' | 'chronicles' | 'mutation' | 'survival';
  rosterMode: string;
  onRosterModeChange: (mode: string) => void;
  selectedP1: string;
  selectedP2: string;
  onSelectP1: (id: string) => void;
  onSelectP2: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const ScreenSelect: React.FC<ScreenSelectProps> = ({
  preparationMode,
  rosterMode,
  onRosterModeChange,
  selectedP1,
  selectedP2,
  onSelectP1,
  onSelectP2,
  onContinue,
  onBack
}) => {
  const isSurvival = preparationMode === 'survival';

  const kindLabel = (g: any) => {
    const KIND_LABEL: Record<string, string> = { hero: 'HÉROE', titan: 'TITÁN', monster: 'MONSTRUO' };
    return KIND_LABEL[g.kind] || 'DIOS';
  };

  const getRosterIds = (side: 'p1' | 'p2') => {
    const entries = Object.values(GODS) as any[];
    if (isSurvival) return entries.map(c => c.id);

    const byKind = (kind: string) =>
      entries.filter(c => (kind === 'god' ? (!c.kind || c.kind === 'god') : c.kind === kind)).map(c => c.id);

    if (rosterMode === 'heroes') return byKind('hero');
    if (rosterMode === 'heroes-vs-gods') return side === 'p1' ? byKind('hero') : byKind('god');
    if (rosterMode === 'titans') return byKind('titan');
    if (rosterMode === 'monsters') return byKind('monster');
    if (rosterMode === 'titans-vs-monsters') return side === 'p1' ? byKind('titan') : byKind('monster');
    return byKind('god');
  };

  const p1Ids = useMemo(() => getRosterIds('p1'), [rosterMode, isSurvival]);
  const p2Ids = useMemo(() => getRosterIds('p2'), [rosterMode, isSurvival]);

  const p1God = GODS[selectedP1] || GODS.raijin;
  const p2God = GODS[selectedP2] || GODS.fujin;

  const summary = useMemo(() => {
    if (isSurvival) {
      const rec = getSurvivalRecord(selectedP1);
      const recText = rec
        ? ` Récord de ${p1God.name}: mejor avance ${rec.bestEncounter || 0}/15; partidas ${rec.campaigns || 0}; jefes derrotados ${rec.victories || 0}.`
        : '';
      return `${p1God.name} será tu campeón durante toda la partida. Superá 15 rivales y después derrotá al jefe final. Si perdés, gastás una vida y reintentás contra el mismo rival; tenés 3 vidas en total.${recText}`;
    }
    const cultureA = (CHARACTER_CULTURAL_CLASSIFICATION as any)[selectedP1]?.culture || 'tradición por clasificar';
    const cultureB = (CHARACTER_CULTURAL_CLASSIFICATION as any)[selectedP2]?.culture || 'tradición por clasificar';
    return `${p1God.name} (${cultureA}): ${p1God.skill.name}. ${p2God.name} (${cultureB}): ${p2God.skill.name}. Elegí la arena en la siguiente pantalla.`;
  }, [isSurvival, selectedP1, selectedP2, p1God, p2God]);

  return (
    <section id="screen-select" className="screen active" aria-hidden="false">
      <div className="section-head">
        <div>
          <p className="eyebrow">02 / PERSONAJES</p>
          <h2>ELIGE A TUS <em>PERSONAJES</em></h2>
          <p className="muted">
            {isSurvival
              ? 'Elegí a tu campeón; en Supervivencia, el elenco completo está disponible.'
              : 'Elegí a tus contendientes para la arena.'}
          </p>
        </div>
        <button className="button button-quiet" onClick={onBack}>
          ← VOLVER
        </button>
      </div>

      {!isSurvival && (
        <div className="roster-mode-row">
          <label htmlFor="roster-mode-select">ELENCO DEL COMBATE</label>
          <select
            id="roster-mode-select"
            value={rosterMode}
            onChange={(e) => onRosterModeChange(e.target.value)}
          >
            <option value="gods">Solo dioses</option>
            <option value="heroes">Solo héroes</option>
            <option value="heroes-vs-gods">Héroes vs dioses</option>
            <option value="titans">Solo titanes</option>
            <option value="monsters">Solo monstruos</option>
            <option value="titans-vs-monsters">Titanes vs monstruos</option>
          </select>
          <small id="roster-mode-note">
            {rosterMode === 'gods' && 'Ambos jugadores eligen dioses.'}
            {rosterMode === 'heroes' && 'Ambos jugadores eligen héroes.'}
            {rosterMode === 'heroes-vs-gods' && 'Jugador 1 elige héroe, Jugador 2 elige dios.'}
            {rosterMode === 'titans' && 'Ambos jugadores eligen titanes.'}
            {rosterMode === 'monsters' && 'Ambos jugadores eligen monstruos.'}
            {rosterMode === 'titans-vs-monsters' && 'Jugador 1 elige titán, Jugador 2 elige monstruo.'}
          </small>
        </div>
      )}

      <div className="selection-columns">
        <div className="selection-side">
          <div className="side-heading">
            <span>{isSurvival ? 'TU CAMPEÓN' : 'JUGADOR 01'}</span>
            <b>{p1God.name.toUpperCase()}</b>
          </div>
          <div className="god-grid">
            {p1Ids.map((id) => {
              const g = GODS[id];
              const isSelected = selectedP1 === id;
              return (
                <button
                  key={id}
                  className={`god-card ${isSelected ? 'selected' : ''}`}
                  style={{ '--god': g.color } as React.CSSProperties}
                  aria-pressed={isSelected}
                  onClick={() => onSelectP1(id)}
                >
                  <span className="god-symbol">{g.symbol}</span>
                  <strong>{g.name.toUpperCase()}</strong>
                  <small>{kindLabel(g)} · {g.role}</small>
                  <small className="god-skill-label">{g.skill.name}</small>
                </button>
              );
            })}
          </div>
        </div>

        <div className="selection-side">
          <div className="side-heading">
            <span>{isSurvival ? 'RIVAL ALEATORIO' : 'RIVAL / CPU'}</span>
            <b>{isSurvival ? 'SELECCIÓN AUTOMÁTICA' : p2God.name.toUpperCase()}</b>
          </div>
          <div className="god-grid">
            {isSurvival ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--muted)', gridColumn: '1 / -1' }}>
                <p>En el modo Supervivencia, tus 15 rivales y el jefe final se seleccionan de forma secuencial y automática.</p>
              </div>
            ) : (
              p2Ids.map((id) => {
                const g = GODS[id];
                const isSelected = selectedP2 === id;
                return (
                  <button
                    key={id}
                    className={`god-card ${isSelected ? 'selected' : ''}`}
                    style={{ '--god': g.color } as React.CSSProperties}
                    aria-pressed={isSelected}
                    onClick={() => onSelectP2(id)}
                  >
                    <span className="god-symbol">{g.symbol}</span>
                    <strong>{g.name.toUpperCase()}</strong>
                    <small>{kindLabel(g)} · {g.role}</small>
                    <small className="god-skill-label">{g.skill.name}</small>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="selection-footer">
        <div className="selected-summary">{summary}</div>
        <button className="button button-primary" onClick={onContinue}>
          {isSurvival ? 'CONFIGURAR SUPERVIVENCIA ↗' : 'CONFIGURAR DUELO ↗'}
        </button>
      </div>
    </section>
  );
};

import React from 'react';
import { GODS } from '../game/config.js';
import { getSavedSurvivalCampaign, clearSavedSurvivalCampaign } from '../game/survival.js';

interface ScreenModeProps {
  onSelectMode: (mode: 'classic' | 'chronicles' | 'mutation' | 'survival') => void;
  onResumeSurvival: () => void;
  onBack: () => void;
}

export const ScreenMode: React.FC<ScreenModeProps> = ({
  onSelectMode,
  onResumeSurvival,
  onBack
}) => {
  const savedCampaign = getSavedSurvivalCampaign();
  const rival = savedCampaign ? GODS[savedCampaign.currentOpponentId]?.name || 'rival pendiente' : '';
  const hero = savedCampaign ? GODS[savedCampaign.campaign.protagonistId]?.name || 'tu campeón' : '';

  return (
    <section id="screen-mode" className="screen active" aria-hidden="false">
      <div className="section-head">
        <div>
          <p className="eyebrow">PREPARACIÓN / PASO 01</p>
          <h2>ELIGE TU <em>MODO DE JUEGO</em></h2>
          <p className="muted">
            Cada modo tiene reglas propias. Crónicas y Mutación son independientes y no se combinan.
          </p>
        </div>
        <button className="button button-quiet" onClick={onBack}>
          ← MENÚ
        </button>
      </div>

      <div className="mode-cards">
        <button
          className="mode-card mode-classic"
          onClick={() => onSelectMode('classic')}
        >
          <span className="mode-card-icon">⚔</span>
          <span className="mode-card-kicker">COMBATE LIBRE</span>
          <strong>CLÁSICO</strong>
          <small>Elegí personajes, elenco, arena y reglas del duelo.</small>
          <span className="mode-card-cta">CONFIGURAR CLÁSICO ↗</span>
        </button>

        <button
          className="mode-card mode-chronicles"
          onClick={() => onSelectMode('chronicles')}
        >
          <span className="mode-card-icon">✦</span>
          <span className="mode-card-kicker">HISTORIAS MITOLÓGICAS</span>
          <strong>CRÓNICAS</strong>
          <small>Escenarios especiales con contendientes y condiciones definidas por cada historia.</small>
          <span className="mode-card-cta">ELEGIR CRÓNICA ↗</span>
        </button>

        <button
          className="mode-card mode-mutation"
          onClick={() => onSelectMode('mutation')}
        >
          <span className="mode-card-icon">✚</span>
          <span className="mode-card-kicker">REGLAS ALTERADAS</span>
          <strong>MUTACIÓN</strong>
          <small>Cancha propia, corrupción creciente y vacunas. Sin reglas de Crónicas.</small>
          <span className="mode-card-cta">ENTRAR A MUTACIÓN ↗</span>
        </button>

        <button
          className="mode-card mode-survival"
          onClick={() => onSelectMode('survival')}
        >
          <span className="mode-card-icon">♥</span>
          <span className="mode-card-kicker">DESAFÍO ARCADE</span>
          <strong>SUPERVIVENCIA</strong>
          <small>Elegí un campeón y sobreviví a 15 rivales y un jefe final. Tendrás tres vidas para completar el desafío.</small>
          <span className="mode-card-cta">JUGAR SUPERVIVENCIA ↗</span>
        </button>
      </div>

      {savedCampaign && (
        <aside id="survival-resume-panel" className="survival-resume-panel" style={{ marginTop: '24px' }}>
          <div>
            <p className="eyebrow">PARTIDA GUARDADA</p>
            <strong>
              {hero} · {savedCampaign.campaign.boss ? 'Jefe final' : `Rival ${savedCampaign.campaign.encounter}/15`}
            </strong>
            <p className="muted">
              Rival: {rival}. Vidas restantes: {savedCampaign.campaign.lives}/3. Podés retomar desde el comienzo de este combate.
            </p>
          </div>
          <div className="survival-resume-actions">
            <button
              type="button"
              className="button button-primary"
              onClick={onResumeSurvival}
            >
              CONTINUAR PARTIDA ↗
            </button>
            <button
              type="button"
              className="button button-quiet"
              onClick={() => {
                if (window.confirm('¿Descartar la partida de Supervivencia guardada? No se puede recuperar.')) {
                  clearSavedSurvivalCampaign();
                  window.location.reload();
                }
              }}
            >
              DESCARTAR GUARDADO
            </button>
          </div>
        </aside>
      )}
    </section>
  );
};

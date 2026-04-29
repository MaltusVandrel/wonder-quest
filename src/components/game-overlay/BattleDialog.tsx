import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BattleContext } from '@/core/battle-context';
import type { BattleScheme } from '@/core/battle-context';
import { useBattleRenderer } from './hooks/useBattleRenderer';
import { PhaserBlock } from './PhaserBlock';
import { RelationshipBehaviour } from '@/core/battle/types';
import { GaugeCalc } from '@/models/gauge';

interface BattleDialogProps {
  scheme: BattleScheme;
  onClose: () => void;
}

function toNameKey(name: string): string {
  return name.trim().toLocaleLowerCase().replaceAll(' ', '-');
}

export const BattleDialog: React.FC<BattleDialogProps> = ({ scheme, onClose }) => {
  const { t } = useTranslation();
  const [canClose, setCanClose] = useState(false);
  const { state, renderer } = useBattleRenderer();

  useEffect(() => {
    const battContext = BattleContext.build(renderer, scheme);

    battContext.onEnd(() => {
      setCanClose(true);
    });

    battContext.start();

    return () => {
      BattleContext.ACTIVE_CONTEXTS['battle'] = undefined;
    };
  }, [scheme, renderer]);

  const adversarialTeams = state.teams.filter((team) => !team.supporter);
  const supporterTeams = state.teams.filter((team) => team.supporter);

  const getTeamClasses = (team: typeof adversarialTeams[0]) => {
    const classes = ['team'];
    if (team.supporter) classes.push('supporter');
    if (team.adversarial) classes.push('adversarial');
    if (
      team.relationships.filter(
        (rel) => rel.team.isPlayer && rel.behaviour >= RelationshipBehaviour.FOE
      ).length > 0
    ) {
      classes.push('foe');
    }
    if (
      team.relationships.filter(
        (rel) => rel.team.isPlayer && rel.behaviour === RelationshipBehaviour.ALLY
      ).length > 0
    ) {
      classes.push('ally');
    }
    if (team.isPlayer) classes.push('player');
    return classes.join(' ');
  };

  return (
    <PhaserBlock className="dialog-overlay battle-dialog-overlay">
      <div className="dialog-element dialog-battle-element">
        {canClose && (
          <button className="dismiss" onClick={onClose} type="button">
            ✕
          </button>
        )}
        <header>
          <h3>{t('dialog.battleTitle')}</h3>
        </header>

        <section className="teams adversarial-teams">
          {adversarialTeams.map((team) => (
            <div key={team.id} id={team.id} className={getTeamClasses(team)}>
              {team.actors.map((actor) => (
                <div
                  key={actor.character.id}
                  id={actor.character.id}
                  className={`actor ${actor.character.isFainted() ? 'defeated' : ''}`}
                >
                  <p>
                    <strong>{actor.character.name}</strong>{' '}
                    {GaugeCalc.getCurrentValueString(
                      actor.character,
                      actor.character.gauges.VITALITY
                    )}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </section>

        <div className="battle-content">
          <div className="text-panel">
            {state.messages.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
          <div className="order-panel">
            {state.actionSlots.slice(0, 15).map((slot) => (
              <p
                key={slot.id}
                className={`turn-slot turn-slot-${toNameKey(slot.battleActor.team.name)}-${toNameKey(
                  slot.battleActor.character.name
                )}`}
              >
                {slot.battleActor.character.name}
              </p>
            ))}
          </div>
        </div>

        <section className="teams ally-teams">
          {supporterTeams.map((team) => (
            <div key={team.id} id={team.id} className={getTeamClasses(team)}>
              {team.actors.map((actor) => (
                <div
                  key={actor.character.id}
                  id={actor.character.id}
                  className={`actor ${actor.character.isFainted() ? 'defeated' : ''}`}
                >
                  <p>
                    <strong>{actor.character.name}</strong>{' '}
                    {GaugeCalc.getCurrentValueString(
                      actor.character,
                      actor.character.gauges.VITALITY
                    )}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </section>

        <menu>
          {state.actionMenu && (
            <>
              <p className="action-menu-title">{state.actionMenu.actorName}</p>
              {state.actionMenu.options.map((opt, i) => (
                <button
                  key={i}
                  className="ui-game-button"
                  onClick={opt.onSelect}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </>
          )}
          {state.targetSelection && (
            <>
              <p className="action-menu-title">{t('battle.chooseTarget')}</p>
              {state.targetSelection.targets.map((target, i) => (
                <button
                  key={i}
                  className="ui-game-button"
                  onClick={() => state.targetSelection!.onSelectTarget(target)}
                  type="button"
                >
                  {target.character.name} ({target.team.name})
                </button>
              ))}
              {state.targetSelection.onCancel && (
                <button
                  className="ui-game-button"
                  onClick={state.targetSelection.onCancel}
                  type="button"
                >
                  ← {t('battle.back')}
                </button>
              )}
            </>
          )}
        </menu>
      </div>
    </PhaserBlock>
  );
};

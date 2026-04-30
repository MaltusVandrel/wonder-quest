import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BattleContext } from '@/core/battle-context';
import type { BattleScheme } from '@/core/battle-context';
import {
  useBattleRenderer,
  isActorSelected,
  isTeamSelected,
  isActorSelectable,
  isTeamSelectable,
  selectedCount,
} from './hooks/useBattleRenderer';
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
  const {
    state,
    renderer,
    setActive,
    toggleActorSelection,
    toggleTeamSelection,
    confirmTargetSelection,
    cancelTargetSelection,
  } = useBattleRenderer();

  useEffect(() => {
    setActive(true);

    const battContext = BattleContext.build(renderer, scheme);

    battContext.onEnd(() => {
      setCanClose(true);
    });

    battContext.start();

    return () => {
      // Desativa o renderer para ignorar callbacks de BattleContext antigos
      setActive(false);
      // Força o término da batalha
      battContext.fallbackEndBattle = true;
      BattleContext.ACTIVE_CONTEXTS['battle'] = undefined;
    };
  }, [scheme, renderer, setActive]);

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

  const isInTargetSelection = state.targetSelection !== null;
  const ts = state.targetSelection;

  const handleActorClick = (actor: typeof adversarialTeams[0]['actors'][0]) => {
    if (!isInTargetSelection) return;
    if (!isActorSelectable(state, actor)) return;
    toggleActorSelection(actor);
  };

  const handleTeamClick = (team: typeof adversarialTeams[0]) => {
    if (!isInTargetSelection) return;
    if (!isTeamSelectable(state, team)) return;
    toggleTeamSelection(team);
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
          {adversarialTeams.map((team) => {
            const teamSelectable = isInTargetSelection && isTeamSelectable(state, team);
            const teamSel = isTeamSelected(state, team);
            return (
              <div
                key={team.id}
                id={team.id}
                className={[
                  getTeamClasses(team),
                  teamSelectable ? 'target-selectable' : '',
                  teamSel ? 'target-selected' : '',
                  isInTargetSelection && !teamSelectable ? 'target-unavailable' : '',
                ].join(' ')}
                onClick={() => handleTeamClick(team)}
                role={teamSelectable ? 'button' : undefined}
                tabIndex={teamSelectable ? 0 : undefined}
              >
                {team.actors.map((actor) => {
                  const actorSelectable = isInTargetSelection && isActorSelectable(state, actor);
                  const actorSel = isActorSelected(state, actor);
                  return (
                    <div
                      key={actor.character.id}
                      id={actor.character.id}
                      className={[
                        'actor',
                        actor.character.isFainted() ? 'defeated' : '',
                        actorSelectable ? 'target-selectable' : '',
                        actorSel ? 'target-selected' : '',
                        isInTargetSelection && !actorSelectable ? 'target-unavailable' : '',
                      ].join(' ')}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActorClick(actor);
                      }}
                      role={actorSelectable ? 'button' : undefined}
                      tabIndex={actorSelectable ? 0 : undefined}
                    >
                      <p>
                        <strong>{actor.character.name}</strong>{' '}
                        {GaugeCalc.getCurrentValueString(
                          actor.character,
                          actor.character.gauges.VITALITY
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
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
          {supporterTeams.map((team) => {
            const teamSelectable = isInTargetSelection && isTeamSelectable(state, team);
            const teamSel = isTeamSelected(state, team);
            return (
              <div
                key={team.id}
                id={team.id}
                className={[
                  getTeamClasses(team),
                  teamSelectable ? 'target-selectable' : '',
                  teamSel ? 'target-selected' : '',
                  isInTargetSelection && !teamSelectable ? 'target-unavailable' : '',
                ].join(' ')}
                onClick={() => handleTeamClick(team)}
                role={teamSelectable ? 'button' : undefined}
                tabIndex={teamSelectable ? 0 : undefined}
              >
                {team.actors.map((actor) => {
                  const actorSelectable = isInTargetSelection && isActorSelectable(state, actor);
                  const actorSel = isActorSelected(state, actor);
                  return (
                    <div
                      key={actor.character.id}
                      id={actor.character.id}
                      className={[
                        'actor',
                        actor.character.isFainted() ? 'defeated' : '',
                        actorSelectable ? 'target-selectable' : '',
                        actorSel ? 'target-selected' : '',
                        isInTargetSelection && !actorSelectable ? 'target-unavailable' : '',
                      ].join(' ')}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActorClick(actor);
                      }}
                      role={actorSelectable ? 'button' : undefined}
                      tabIndex={actorSelectable ? 0 : undefined}
                    >
                      <p>
                        <strong>{actor.character.name}</strong>{' '}
                        {GaugeCalc.getCurrentValueString(
                          actor.character,
                          actor.character.gauges.VITALITY
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
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

          {ts && (
            <div className="target-selection-ui">
              <p className="action-menu-title">
                {ts.config.moveName || t('battle.chooseTarget')}
              </p>
              <p className="target-selection-hint">
                {ts.config.minTargets === ts.config.maxTargets
                  ? ts.config.minTargets === 1
                    ? t('battle.selectOneTarget', {
                        selected: selectedCount(state),
                      })
                    : t('battle.selectNTargets', {
                        count: ts.config.minTargets,
                        selected: selectedCount(state),
                      })
                  : t('battle.selectTargetsRange', {
                      min: ts.config.minTargets,
                      max: ts.config.maxTargets,
                      selected: selectedCount(state),
                    })}
              </p>
              <div className="target-selection-actions">
                <button
                  className="ui-game-button"
                  onClick={confirmTargetSelection}
                  disabled={selectedCount(state) < ts.config.minTargets}
                  type="button"
                >
                  {t('battle.confirm')}
                </button>
                {ts.config.onCancel && (
                  <button
                    className="ui-game-button"
                    onClick={cancelTargetSelection}
                    type="button"
                  >
                    {t('battle.cancel')}
                  </button>
                )}
              </div>
            </div>
          )}
        </menu>
      </div>
    </PhaserBlock>
  );
};

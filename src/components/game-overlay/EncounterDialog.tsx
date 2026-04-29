import React from 'react';
import type { Encounter, GameActionResult } from '@/data/bank/encounter';
import { showDialog, showGameActionResultDialog } from '@/utils/ui-notification.util';
import { PhaserBlock } from './PhaserBlock';

interface EncounterDialogProps {
  encounter: Encounter;
  onClose: () => void;
}

export const EncounterDialog: React.FC<EncounterDialogProps> = ({ encounter, onClose }) => {
  const description = Array.isArray(encounter.description)
    ? encounter.description
    : [encounter.description];

  const handleAction = (params: Record<string, unknown>, actionResult: GameActionResult) => {
    if (actionResult.customReturnBehaviour) {
      actionResult.customReturnBehaviour(params);
      return;
    }

    if (actionResult.dialogType) {
      showDialog(params, actionResult.dialogType);
    } else {
      showGameActionResultDialog(actionResult);
    }
    if (!(actionResult.keepParentOpen == true)) {
      onClose();
    }
  };

  return (
    <PhaserBlock className="dialog-overlay">
      <div className="dialog-element dialog-encounter-element">
        {encounter.canDismiss && (
          <button className="dismiss" onClick={onClose} type="button">
            ✕
          </button>
        )}
        <header>
          <h3>{encounter.title}</h3>
        </header>
        <section>
          {description.map((desc, index) => (
            <p key={index}>{desc}</p>
          ))}
        </section>
        <menu>
          {encounter.actions?.map((action, index) => {
            const params = { ...encounter.overallGameDataParamter };
            const actionResult = action.isAble(params);
            return (
              <button
                key={index}
                className="ui-game-button"
                disabled={!actionResult.able}
                title={action.hint || actionResult.reason || ''}
                onClick={() => {
                  const result = action.action(params);
                  handleAction(params, result);
                }}
                type="button"
              >
                {action.title}
              </button>
            );
          })}
        </menu>
      </div>
    </PhaserBlock>
  );
};

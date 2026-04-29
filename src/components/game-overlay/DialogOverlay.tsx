import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeDialog } from '@/store/slices/uiSlice';
import { DIALOG_TYPES } from '@/types/dialog';
import type { Encounter, GameActionResult } from '@/data/bank/encounter';
import { AlertDialog } from './AlertDialog';
import { GameActionResultDialog } from './GameActionResultDialog';
import { EncounterDialog } from './EncounterDialog';
import { CompanyDialog } from './CompanyDialog';
import { BattleDialog } from './BattleDialog';

export const DialogOverlay: React.FC = () => {
  const dispatch = useAppDispatch();
  const dialogs = useAppSelector((s) => s.ui.dialogs);

  const reactDialogs = dialogs;

  return (
    <>
      {reactDialogs.map((dialog) => {
        const handleClose = () => dispatch(removeDialog(dialog.id));
        switch (dialog.type) {
          case DIALOG_TYPES.ALERT:
            return (
              <AlertDialog key={dialog.id} message={dialog.data as string} onClose={handleClose} />
            );
          case DIALOG_TYPES.GAME_ACTION_RESULT:
            return (
              <GameActionResultDialog
                key={dialog.id}
                result={dialog.data as GameActionResult}
                onClose={handleClose}
              />
            );
          case DIALOG_TYPES.ENCOUNTER:
            return (
              <EncounterDialog
                key={dialog.id}
                encounter={dialog.data as Encounter}
                onClose={handleClose}
              />
            );
          case DIALOG_TYPES.COMPANY:
            return <CompanyDialog key={dialog.id} onClose={handleClose} />;
          case DIALOG_TYPES.BATTLE:
            return (
              <BattleDialog
                key={dialog.id}
                scheme={
                  (dialog.data as { battleScheme: import('@/core/battle-context').BattleScheme })
                    .battleScheme
                }
                onClose={handleClose}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
};

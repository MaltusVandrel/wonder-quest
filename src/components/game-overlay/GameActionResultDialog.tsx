import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PhaserBlock } from './PhaserBlock';
import type { GameActionResult } from '@/data/bank/encounter';

interface GameActionResultDialogProps {
  result: GameActionResult;
  onClose: () => void;
}

const MAX_TIME = 15000;
const TICK = 60;

export const GameActionResultDialog: React.FC<GameActionResultDialogProps> = ({
  result,
  onClose,
}) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (isMouseOver) return;
      setProgress((prev) => {
        const next = prev + (TICK / MAX_TIME) * 100;
        if (next >= 100) {
          onClose();
          return 100;
        }
        return next;
      });
    }, TICK);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMouseOver, onClose]);

  return (
    <PhaserBlock className="dialog-overlay">
      <div
        className="dialog-element dialog-result-element"
        onMouseEnter={() => setIsMouseOver(true)}
        onMouseLeave={() => setIsMouseOver(false)}
      >
        <button className="dismiss" onClick={onClose} type="button">
          ✕
        </button>
        <section>
          {result.result && <p>{result.result}</p>}
          {result.reason && (
            <>
              <br />
              <small>{result.reason}</small>
            </>
          )}
        </section>
        <menu>
          <button className="ui-game-button" onClick={onClose} type="button">
            {t('dialog.ok')}
          </button>
        </menu>
        <progress className="dialog-closing-progress" max={100} value={progress} />
      </div>
    </PhaserBlock>
  );
};

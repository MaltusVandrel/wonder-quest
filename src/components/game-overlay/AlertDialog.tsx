import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PhaserBlock } from './PhaserBlock';

interface AlertDialogProps {
  message: string;
  onClose: () => void;
}

const MAX_TIME = 15000;
const TICK = 60;

export const AlertDialog: React.FC<AlertDialogProps> = ({ message, onClose }) => {
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
        className="dialog-element dialog-alert-element"
        onMouseEnter={() => setIsMouseOver(true)}
        onMouseLeave={() => setIsMouseOver(false)}
      >
        <button className="dismiss" onClick={onClose} type="button">
          ✕
        </button>
        <section>
          <p>{message}</p>
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

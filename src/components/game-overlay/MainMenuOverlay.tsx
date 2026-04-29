import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameDataService } from '@/services/game-data.service';

export const MainMenuOverlay: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    const check = () => {
      const scene = window.game?.scene?.getScene('main-menu-scene');
      const active = !!scene?.scene.isActive();
      setIsVisible(active);
      if (active) setHasSave(GameDataService.existsData());
    };
    check();
    const interval = setInterval(check, 500);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    const scene = window.game?.scene?.getScene('main-menu-scene');
    scene?.startGame?.(false);
  };

  const handleContinue = () => {
    const scene = window.game?.scene?.getScene('main-menu-scene');
    scene?.loadGame?.();
  };

  const handleOptions = () => {
    // TODO: abrir menu de opções
    alert(t('menu.optionsPlaceholder'));
  };

  if (!isVisible) return null;

  return (
    <div className="game-overlay main-menu-overlay">
      <div className="ui-element ui-display-column ui-pos-center mainmenu-button-holder">
        <button className="ui-game-button mainmenu-button" onClick={handleStart} type="button">
          {t('menu.startGame')}
        </button>
        {hasSave && (
          <button className="ui-game-button mainmenu-button" onClick={handleContinue} type="button">
            {t('menu.continue')}
          </button>
        )}
        <button className="ui-game-button mainmenu-button" onClick={handleOptions} type="button">
          {t('menu.options')}
        </button>
      </div>
    </div>
  );
};

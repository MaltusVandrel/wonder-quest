import React, { useCallback, useEffect, useState } from 'react';
import { showCompanyDialog } from '@/utils/ui-notification.util';
import { RestButton } from './RestButton';
import { StatusPanel } from './StatusPanel';

export const GameOverlay: React.FC = () => {
  const [showMapUI, setShowMapUI] = useState(false);

  useEffect(() => {
    const checkScene = () => {
      const mapScene = window.game?.scene?.getScene('map-scene');
      setShowMapUI(!!mapScene?.scene.isActive());
    };

    checkScene();
    const interval = setInterval(checkScene, 500);
    return () => clearInterval(interval);
  }, []);

  const handleRest = useCallback(() => {
    const mapScene = window.game?.scene?.getScene('map-scene');
    const mapUIScene = window.game?.scene?.getScene('map-ui-scene');
    mapScene?.doColorFilter?.();
    mapUIScene?.showCurrentTime?.();
  }, []);

  const handleOpenCompany = useCallback(() => {
    showCompanyDialog();
  }, []);

  if (!showMapUI) {
    return null;
  }

  return (
    <div className="game-overlay">
      <RestButton onRest={handleRest} />
      <StatusPanel onOpenCompany={handleOpenCompany} />
    </div>
  );
};

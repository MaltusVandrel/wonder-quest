import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { IntroductionScene } from './scenes/introduction.scene';
import { MainMenuScene } from './scenes/main-menu.scene';
import { MapPathScene } from './scenes/map.path.scene';
import { MapPlayerScene } from './scenes/map.player.scene';
import { MapScene } from './scenes/map.scene';
import { MapUIScene } from './scenes/map.ui.scene';
import { GameDataService } from './services/game-data.service';
import { GameOverlay } from './components/game-overlay/GameOverlay';
import { MainMenuOverlay } from './components/game-overlay/MainMenuOverlay';
import { IntroductionOverlay } from './components/game-overlay/IntroductionOverlay';
import { ToastOverlay } from './components/game-overlay/ToastOverlay';
import { DialogOverlay } from './components/game-overlay/DialogOverlay';
import './App.scss';

function isOverUiElement(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return (
    target.closest('.game-overlay') !== null ||
    target.closest('.dialog-overlay') !== null ||
    target.closest('#toast-holder') !== null
  );
}

function setupPhaserInputGuard() {
  const handlePointerOver = (e: PointerEvent) => {
    MapScene.HOVER_UI_ELEMENT = isOverUiElement(e.target);
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (isOverUiElement(e.target)) {
      e.stopPropagation();
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (isOverUiElement(e.target)) {
      e.stopPropagation();
    }
  };

  document.addEventListener('pointerover', handlePointerOver);
  document.addEventListener('pointerdown', handlePointerDown, true);
  document.addEventListener('pointerup', handlePointerUp, true);

  return () => {
    document.removeEventListener('pointerover', handlePointerOver);
    document.removeEventListener('pointerdown', handlePointerDown, true);
    document.removeEventListener('pointerup', handlePointerUp, true);
  };
}

const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'phaser-game',
      width: window.innerWidth,
      height: window.innerHeight,
      scene: [MainMenuScene, IntroductionScene, MapScene, MapPathScene, MapPlayerScene, MapUIScene],
    };

    gameRef.current = window.game = new Phaser.Game(config);

    const handleResize = () => {
      gameRef.current?.scale.resize(window.innerWidth, window.innerHeight);
    };

    const handleBeforeUnload = () => {
      const mainMenuScene = gameRef.current?.scene
        .getScenes(true)
        .find((scene) => scene.scene.key === 'main-menu-scene');
      if (!mainMenuScene) GameDataService.saveData();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeunload', handleBeforeUnload);
    const removeInputGuard = setupPhaserInputGuard();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      removeInputGuard();
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <>
      <div id="phaser-game" />
      <div id="toast-holder" />
      <GameOverlay />
      <MainMenuOverlay />
      <IntroductionOverlay />
      <ToastOverlay />
      <DialogOverlay />
    </>
  );
};

export default App;

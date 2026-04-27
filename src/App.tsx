import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { IntroductionScene } from './scenes/introduction.scene';
import { MainMenuScene } from './scenes/main-menu.scene';
import { MapPathScene } from './scenes/map.path.scene';
import { MapPlayerScene } from './scenes/map.player.scene';
import { MapScene } from './scenes/map.scene';
import { MapUIScene } from './scenes/map.ui.scene';
import { GameDataService } from './services/game-data.service';
import './App.scss';

const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'phaser-game',
      width: window.innerWidth,
      height: window.innerHeight,
      scene: [
        MainMenuScene,
        IntroductionScene,
        MapScene,
        MapPathScene,
        MapPlayerScene,
        MapUIScene,
      ],
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

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <>
      <div id="phaser-game" />
      <div id="toast-holder" />
    </>
  );
};

export default App;

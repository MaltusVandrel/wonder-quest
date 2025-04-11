import { Component, OnInit } from '@angular/core';
import { IntroductionScene } from 'src/scenes/introduction.scene';

import { MainMenuScene } from 'src/scenes/main-menu.scene';
import { MapPathScene } from 'src/scenes/map.path.scene';
import { MapPlayerScene } from 'src/scenes/map.player.scene';
import { MapScene } from 'src/scenes/map.scene';
import { MapUIScene } from 'src/scenes/map.ui.scene';
import { GameDataService } from 'src/services/game-data.service';
import { MapPathUtils } from 'src/utils/map-path.utils';

declare global {
  interface Window {
    game: any;
  }
}

window.game = window.game || {};
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  title = 'wonder-quest';
  config: any;
  game: Phaser.Game | undefined;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      parent: 'wonder-quest',
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
  }
  ngOnInit(): void {
    /*do not delete yay!*/
    console.log('yay!');
    this.game = window.game = new Phaser.Game(this.config);

    window.addEventListener('resize', () => {
      this.resizeGame();
    });
    window.addEventListener('beforeunload', (event) => {
      let mainMenuScene = this.game?.scene
        .getScenes(true)
        .find((scene) => scene.scene.key == 'main-menu-scene');
      if (!mainMenuScene) GameDataService.saveData();
    });
  }
  resizeGame(): void {
    if (this.game) {
      this.game.scale.resize(window.innerWidth, window.innerHeight);
    }
  }
}

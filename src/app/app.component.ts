import { Component, OnInit } from '@angular/core';
import Alea from 'alea';
import { createNoise2D } from 'simplex-noise';
import { GameData } from 'src/core/game-data';

import { MainMenuScene } from 'src/scenes/main-menu.scene';
import { MapPathScene } from 'src/scenes/map.path.scene';
import { MapPlayerScene } from 'src/scenes/map.player.scene';
import { MapScene } from 'src/scenes/map.scene';
import { MapUIScene } from 'src/scenes/map.ui.scene';
import { GameDataService } from 'src/services/game-data.service';
import { MapPathUtils } from 'src/utils/map-path.utils';

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
        MapScene,
        MapPlayerScene,
        MapPathScene,
        MapUIScene,
      ],
    };
  }
  ngOnInit(): void {
    this.game = new Phaser.Game(this.config);
    window.addEventListener('resize', () => {
      this.resizeGame();
    });
  }
  resizeGame(): void {
    if (this.game) {
      this.game.scale.resize(window.innerWidth, window.innerHeight);
    }
  }
}

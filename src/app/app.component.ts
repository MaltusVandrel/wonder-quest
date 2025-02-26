import { Component, OnInit } from '@angular/core';
import Alea from 'alea';
import { createNoise2D } from 'simplex-noise';

import { MainMenuScene } from 'src/scenes/main-menu.scene';
import { MapScene } from 'src/scenes/map.scene';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'wonder-quest';
  config:any;
  game:Phaser.Game|undefined;
  constructor() {
    this.config = {
      type: Phaser.AUTO,
      parent: 'wonder-quest',
      width: window.innerWidth,
      height: window.innerHeight,
      scene: [ MainMenuScene,MapScene]
  };
  }
  ngOnInit(): void {    
    this.game=new Phaser.Game(this.config);
    
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

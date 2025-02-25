import { Component, OnInit } from '@angular/core';
import Alea from 'alea';
import { createNoise2D } from 'simplex-noise';
import { MapScene } from 'src/scenes/map';
import { MapGenScene } from 'src/scenes/map-gen';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'wonder-quest';
  width = 800;
  height = 600;
  config:any;
  game:Phaser.Game|undefined;
  constructor() { }
  ngOnInit(): void {    
   this.config = {
      type: Phaser.AUTO,
      parent: 'phaser-example',
      width: this.width,
      height: this.height,
      scene: [ MapGenScene]
  };
    this.game=new Phaser.Game(this.config); 
  }
  

}

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

  ngOnInit(): void {
    const config = {
        type: Phaser.AUTO,
        parent: 'phaser-example',
        width: 800,
        height: 600,
        scene: [ MapGenScene ]
    };
    
    const game = new Phaser.Game(config);

  }
  

}

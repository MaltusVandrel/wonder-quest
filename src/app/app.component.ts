import { Component, OnInit } from '@angular/core';
import { MapScene } from 'src/scenes/map';

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
      scene: [ MapScene ]
  };
  
  const game = new Phaser.Game(config);
  }
  
}

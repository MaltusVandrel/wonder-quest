import * as Phaser from 'phaser';
import { MapScene } from './map.scene';
import { MapPathScene } from './map.path.scene';

export class MapPlayerScene extends Phaser.Scene {
  player: Phaser.GameObjects.Rectangle | undefined;
  mapScene: any | MapScene;
  mapPathScene: any | MapPathScene;
  centeringOffset: number = 0;
  lockPath: boolean = false;
  pathSteps: any[] = [];

  constructor() {
    super({ key: 'map-player-scene' });
  }

  create() {
    this.mapPathScene = this.scene.get('map-player-scene');
    this.mapScene = this.scene.get('map-scene');
    this.centeringOffset = this.mapScene.tileSize / 2;

    this.createPlayer();
  }
  //posição do player muda com resize, deveria manter
  createPlayer() {
    let playerSize = this.mapScene.tileSize * 0.67;
    let strokeSize = 1;
    let centerPos = this.mapScene.gridCenter();
    const screenCenterX = centerPos.x;
    const screenCenterY = centerPos.y;
    this.player = this.add.rectangle(
      screenCenterX * this.mapScene.tileSize + this.centeringOffset,
      screenCenterY * this.mapScene.tileSize + this.centeringOffset,
      playerSize,
      playerSize,
      0x2222aa
    );
    this.player.setData({
      y: screenCenterY,
      x: screenCenterX,
      currentPositionY: screenCenterY,
      currentPositionX: screenCenterX,
      currentY: screenCenterY * this.mapScene.tileSize + this.centeringOffset,
      currentX: screenCenterX * this.mapScene.tileSize + this.centeringOffset,
    });
    this.player.setStrokeStyle(strokeSize, 0xffffff);
    this.player.setInteractive();
  }
}

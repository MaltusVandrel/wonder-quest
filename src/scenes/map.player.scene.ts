import * as Phaser from 'phaser';

export class MapPlayerScene extends Phaser.Scene {
  player: Phaser.GameObjects.Ellipse | undefined;
  mapScene: any;
  mapPathScene: any;
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

  createPlayer() {
    let playerSize = this.mapScene.tileSize - 2;
    let strokeSize = playerSize > 25 ? 3 : playerSize > 15 ? 2 : 1;
    const screenCenterX = Math.ceil(
      this.game.scale.width / this.mapScene.tileSize / 2
    );
    const screenCenterY = Math.ceil(
      this.game.scale.height / this.mapScene.tileSize / 2
    );
    this.player = this.add.ellipse(
      screenCenterX * this.mapScene.tileSize + this.centeringOffset,
      screenCenterY * this.mapScene.tileSize + this.centeringOffset,
      playerSize,
      playerSize,
      0xffff00
    );
    this.player.setData({
      y: screenCenterY,
      x: screenCenterX,
      currentPositionY: screenCenterY,
      currentPositionX: screenCenterX,
      currentY: screenCenterY * this.mapScene.tileSize + this.centeringOffset,
      currentX: screenCenterX * this.mapScene.tileSize + this.centeringOffset,
    });
    this.player.setStrokeStyle(strokeSize, 0x333333);
    this.player.setInteractive();
  }
}

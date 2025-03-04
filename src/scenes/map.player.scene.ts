import * as Phaser from 'phaser';

export class MapPlayerScene extends Phaser.Scene {
  player: Phaser.GameObjects.Ellipse | undefined;
  tileSize: number = 32;
  centeringOffset: number = this.tileSize / 2;
  lockPath: boolean = false;
  pathSteps: any[] = [];

  constructor() {
    super({ key: 'map-player-scene' });
  }

  create() {
    this.createPlayer();
  }

  createPlayer() {
    let playerSize = this.tileSize - 2;
    let strokeSize = playerSize > 25 ? 3 : playerSize > 15 ? 2 : 1;
    const screenCenterX = Math.ceil(this.game.scale.width / this.tileSize / 2);
    const screenCenterY = Math.ceil(this.game.scale.height / this.tileSize / 2);
    this.player = this.add.ellipse(
      screenCenterX * this.tileSize + this.centeringOffset,
      screenCenterY * this.tileSize + this.centeringOffset,
      playerSize,
      playerSize,
      0xffff00
    );
    this.player.setData({
      y: screenCenterY,
      x: screenCenterX,
      currentPositionY: screenCenterY,
      currentPositionX: screenCenterX,
      currentY: screenCenterY * this.tileSize + this.centeringOffset,
      currentX: screenCenterX * this.tileSize + this.centeringOffset,
    });
    this.player.setStrokeStyle(strokeSize, 0x333333);
    this.player.setInteractive();
  }
}

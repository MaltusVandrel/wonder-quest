import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload() {
    // Load assets for the main menu
  }

  create() {
    // Create main menu elements
    const startButton = this.add
      .text(400, 300, 'Start Game', { fontSize: '32px', color: '#fff' })
      .setInteractive()
      .on('pointerup', () => this.startGame());
  }

  startGame() {
    this.scene.start('MapScene');
  }
}

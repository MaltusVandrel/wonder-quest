import * as Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Monocraft Sans',
    color: '#ffffff',
    fontSize: '40px',
  };

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload() {
    // Load assets for the main menu
  }

  create() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');

    // Create main menu elements
    const startButton = this.add
      .text(width / 2, height / 2, 'Start Game', this.textStyle)
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on('pointerup', () => this.startGame());
  }

  startGame() {
    this.scene.start('MapScene');
  }
}

import * as Phaser from 'phaser';
import { GameDataService } from 'src/services/game-data.service';

export class MainMenuScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Monocraft Sans',
    color: '#ffffff',
    fontSize: '40px',
  };

  constructor() {
    super({ key: 'main-menu-scene' });
  }

  preload() {
    this.load.font(
      'Monocraft Sans',
      'assets/Monocraft-nerd-fonts-patched.ttf',
      'truetype'
    );
    this.load.image('particle', 'assets/particula.png'); // Ensure you have this image in your assets directory
  }

  create() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');

    // Create particle emitter
    const emitter = this.add.particles(0, 0, 'particle', {
      scale: { start: 1, end: 0 },
      lifespan: 10000,
      gravityY: -50,
      frequency: 20,
      maxVelocityX: 200,
      maxVelocityY: 200,
      blendMode: 'ADD',
    });

    const shape = new Phaser.Geom.Rectangle(0, 600, width, height);

    emitter.addEmitZone({ type: 'random', source: shape, quantity: 100 });
    const dataExists = GameDataService.existsData();
    if (dataExists) {
      const continueButton = this.add
        .text(width / 2, height / 2 - 20, 'Continue Game', this.textStyle)
        .setOrigin(0.5, 0.5)
        .setInteractive()
        .on('pointerup', () => this.loadGame())
        .on('pointerover', () => {
          continueButton.setShadow(0, 0, '#ffffff', 10, true, true);
        })
        .on('pointerout', () => {
          continueButton.setShadow(0, 0, '#ffffff', 0, false, false);
        });
    }

    // Create main menu elements
    const startButton = this.add
      .text(
        width / 2,
        height / 2 + (dataExists ? 40 : 0),
        dataExists ? 'New Game' : 'Start Game',
        this.textStyle
      )
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on('pointerup', () => this.startGame())
      .on('pointerover', () => {
        startButton.setShadow(0, 0, '#ffffff', 10, true, true);
      })
      .on('pointerout', () => {
        startButton.setShadow(0, 0, '#ffffff', 0, false, false);
      });

    window.addEventListener('resize', () => {
      const height = parseInt(this.game?.scale?.height + '');
      const width = parseInt(this.game?.scale?.width + '');
      startButton.setPosition(width / 2, height / 2);
      shape.setSize(width, height);
    });
  }

  startGame() {
    this.scene.start('map-scene');
  }
  loadGame() {
    GameDataService.loadData();
    this.startGame();
  }
}

import * as Phaser from 'phaser';
import { GameDataService } from 'src/services/game-data.service';
import {
  setUpMainMenuUI,
  tearDownMainMenuUI,
} from 'src/utils/ui-elements.util';

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
    setUpMainMenuUI();
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

    window.addEventListener('resize', () => {
      const height = parseInt(this.game?.scale?.height + '');
      const width = parseInt(this.game?.scale?.width + '');

      shape.setSize(width, height);
    });
  }

  startGame(isContinue: boolean = false) {
    tearDownMainMenuUI();
    this.scene.start('introduction-scene', { isContinue: isContinue });
  }
  loadGame() {
    tearDownMainMenuUI();
    GameDataService.loadData();
    this.startGame(true);
  }
}

import * as Phaser from 'phaser';
import { GameDataService } from 'src/services/game-data.service';
import { setUpIntroductionUI } from 'src/utils/ui-elements.util';

const READING_TIME = 5000;
const EASE_IN_TWEEN_DURATION = 1500;
const EASE_OUT_TWEEN_DURATION = 1250;
export class IntroductionScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Monocraft Sans',
    color: '#ffffff',
    fontSize: '30px',
  };
  blackBackground: Phaser.GameObjects.Graphics | undefined;
  textLayer: Phaser.GameObjects.Layer | undefined;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter | undefined;
  width: number = 0;
  height: number = 0;
  abortedIntroduction: boolean = false;
  isContinue: boolean | undefined;
  texts: Array<Array<string>> = [];
  constructor() {
    super({ key: 'introduction-scene' });
  }
  init(data: { isContinue: boolean }) {
    if (data && data.isContinue !== undefined)
      this.isContinue = data.isContinue;
  }
  preload() {
    this.load.font(
      'Monocraft Sans',
      'assets/Monocraft-nerd-fonts-patched.ttf',
      'truetype'
    );
    this.setBlackBackGround();
    this.scene.bringToTop();
    this.load.image('particle', 'assets/particula.png');
  }

  create() {
    this.height = parseInt(this.game?.scale?.height + '');
    this.width = parseInt(this.game?.scale?.width + '');

    // Create particle emitter
    this.emitter = this.add.particles(0, 0, 'particle', {
      scale: { start: 1, end: 0 },
      lifespan: 10000,
      gravityY: -50,
      frequency: 20,
      maxVelocityX: 200,
      maxVelocityY: 200,
      blendMode: 'ADD',
    });
    const shape = new Phaser.Geom.Rectangle(0, 600, this.width, this.height);

    this.emitter.addEmitZone({ type: 'random', source: shape, quantity: 100 });

    window.addEventListener('resize', () => {
      this.height = parseInt(this.game?.scale?.height + '');
      this.width = parseInt(this.game?.scale?.width + '');
      //welcomeText.setPosition(width / 2, height / 2);
      shape.setSize(this.width, this.height);
    });
    /*
    window.addEventListener('keydown', () => {
      this.fadeOutAndDestroy();
    });
    window.addEventListener('pointerup', () => {
      this.fadeOutAndDestroy();
    });
    */
    if (!this.isContinue) {
      setUpIntroductionUI();
    } else {
      this.fadeOutAndDestroy();
    }
  }

  setBlackBackGround() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');
    if (this.blackBackground) {
      this.blackBackground.destroy();
    }
    this.blackBackground = this.add.graphics();

    this.blackBackground.fillStyle(0x000000, 1);
    this.blackBackground.fillRect(0, 0, width, height);
  }
  fadeOutAndDestroy() {
    this.abortedIntroduction = true;
    this.scene.launch('map-scene');
    this.tweens.add({
      targets: [this.blackBackground, this.textLayer, this.emitter],
      alpha: 0, // Target alpha value
      duration: EASE_OUT_TWEEN_DURATION, // Duration of the fade-out effect in milliseconds
      ease: 'Power2', // Easing function
      onComplete: () => {
        this.scene.stop('introduction-scene');
      },
    });
  }
}

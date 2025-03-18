import * as Phaser from 'phaser';
import { GameDataService } from 'src/services/game-data.service';

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

  texts: Array<Array<string>> = [
    [
      'A realm welcomes you from beyond the misty veil',
      'It draws breath for ' + GameDataService.getTimeData().year + ' years',
    ],
    ['You awake across the sepia mist...'],
  ];

  constructor() {
    super({ key: 'introduction-scene' });
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

    this.textLayer = this.add.layer();
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

    this.presentTexts();
    window.addEventListener('resize', () => {
      this.height = parseInt(this.game?.scale?.height + '');
      this.width = parseInt(this.game?.scale?.width + '');
      //welcomeText.setPosition(width / 2, height / 2);
      shape.setSize(this.width, this.height);
    });
  }
  presentTexts() {
    let index = 0;
    const readingTime = 5000;
    const easeInTweenDuration = 1500;
    const easeOutTweenDuration = 1250;

    let showTexts = () => {
      const texts = this.texts[index];
      let timeoutFunction;
      let welcomeText = this.add
        .text(this.width / 2, this.height / 2, texts, this.textStyle)
        .setOrigin(0.5, 0.5)
        .setAlpha(0);
      this.textLayer?.add(welcomeText);

      this.tweens.chain({
        targets: welcomeText,
        tweens: [
          {
            alpha: 1, // Target alpha value
            duration: easeInTweenDuration, // Duration of the fade-in effect in milliseconds
            ease: 'Power2', // Easing function}
          },
          {
            alpha: 0, // Target alpha value
            duration: easeOutTweenDuration, // Duration of the fade-in effect in milliseconds
            ease: 'Power2', // Easing function
            delay: readingTime - easeInTweenDuration,
          },
        ],
      });

      /*  this.tweens.add();
       */
      if (index < this.texts.length) {
        index++;
        timeoutFunction = setTimeout(
          showTexts,
          readingTime + easeOutTweenDuration
        );
      } else {
        this.tweens.add({
          targets: [this.blackBackground, this.emitter],
          alpha: 0, // Target alpha value
          duration: easeOutTweenDuration, // Duration of the fade-out effect in milliseconds
          ease: 'Power2', // Easing function
        });
      }
    };
    showTexts();
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
}

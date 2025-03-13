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
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');

    this.textLayer = this.add.layer();
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
    const readingTime = 5000;
    for (let i = 0; i < this.texts.length; i++) {
      setTimeout(() => {
        let welcomeText = this.add
          .text(width / 2, height / 2, this.texts[i], this.textStyle)
          .setOrigin(0.5, 0.5)
          .setAlpha(0);
        this.textLayer?.add(welcomeText);
        this.tweens.add({
          targets: welcomeText,
          alpha: 1, // Target alpha value
          duration: 2000, // Duration of the fade-in effect in milliseconds
          ease: 'Power2', // Easing function
        });
        setTimeout(() => {
          this.tweens.add({
            targets: welcomeText,
            alpha: 0, // Target alpha value
            duration: 1250, // Duration of the fade-in effect in milliseconds
            ease: 'Power2', // Easing function
          });
        }, readingTime);
      }, i * readingTime);
    }
    setTimeout(() => {
      this.tweens.add({
        targets: [this.blackBackground, emitter],
        alpha: 0, // Target alpha value
        duration: 1250, // Duration of the fade-in effect in milliseconds
        ease: 'Power2', // Easing function
      });
      setTimeout(() => this.scene.remove(), 1250 + 1);
    }, this.texts.length * readingTime);
    // Create main menu elements

    // let welcomeText = this.add
    //   .text(width / 2, height / 2, 'WELCOME', this.textStyle)
    //   .setOrigin(0.5, 0.5)
    //   .setAlpha(0);

    // this.textLayer?.add(welcomeText);

    // this.tweens.add({
    //   targets: welcomeText,
    //   alpha: 1, // Target alpha value
    //   duration: 2000, // Duration of the fade-in effect in milliseconds
    //   ease: 'Power2', // Easing function
    // });
    // setTimeout(() => this.startGame(welcomeText), 10 * 1000);

    window.addEventListener('resize', () => {
      const height = parseInt(this.game?.scale?.height + '');
      const width = parseInt(this.game?.scale?.width + '');
      //welcomeText.setPosition(width / 2, height / 2);
      shape.setSize(width, height);
    });
  }

  startGame(welcomeText: any) {
    this.tweens.add({
      targets: welcomeText,
      alpha: 0, // Target alpha value
      duration: 1500, // Duration of the fade-in effect in milliseconds
      ease: 'Power2', // Easing function
    });
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

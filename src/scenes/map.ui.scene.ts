import * as Phaser from 'phaser';

export class MapUIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'map-ui-scene' });
  }

  create() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');

    // Create UI elements
    const uiText = this.add.text(width - 150, 20, 'UI Overlay', {
      fontFamily: 'Monocraft Sans',
      color: '#ffffff',
      fontSize: '20px',
    });

    // Example of a button
    const button = this.add
      .text(width - 150, 60, 'Button', {
        fontFamily: 'Monocraft Sans',
        color: '#ffffff',
        fontSize: '20px',
        backgroundColor: '#000000',
      })
      .setInteractive();

    button.on('pointerup', () => {
      console.log('Button clicked');
    });
  }
}

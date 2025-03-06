import * as Phaser from 'phaser';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';

export class MapUIScene extends Phaser.Scene {
  textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'Monocraft Sans',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2,
  };
  mapScene: any;
  textLayer: Phaser.GameObjects.Layer | undefined;

  constructor() {
    super({ key: 'map-ui-scene' });
  }

  create() {
    const height = parseInt(this.game?.scale?.height + '');
    const width = parseInt(this.game?.scale?.width + '');
    this.mapScene = this.scene.get('map-scene');
    this.textLayer = this.add.layer();
    // Create UI elements
    const uiText = this.add.text(width - 150, 20, 'UI Overlay', {
      ...this.textStyle,
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

  showTileInfo(x: number, y: number) {
    //probably best make it show each UI element individually.
    //maybe do a complext object with key , x + y, aligment (start end, center, etc)
    //and let a main function to put everyting correctly
    this.textLayer?.getAll().forEach((element) => {
      element.destroy();
    });
    let tile = MapGeneratorUtils.getBiomeData(
      x + this.mapScene.gridOffsetX,
      y + this.mapScene.gridOffsetY
    );
    let tileInfo = this.add.text(
      8,
      8,
      [
        tile.type.toUpperCase(),
        tile.staminaCost + ' Stamina Cost',
        tile.timeCost + 'm Time Cost',
      ],
      {
        ...this.textStyle,
        fontSize: '20px',
      }
    );
    this.textLayer?.add(tileInfo);
  }
}

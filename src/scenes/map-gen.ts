
import * as Phaser from 'phaser';
import { ColorUtils } from 'src/utils/color.util';
import mapData from '../data/map-data.json';
import mapDefinitions from '../data/map-definitions.json';
import Alea from 'alea';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { MapGeneratorUtils } from 'src/utils/map-generator.util';

export class MapGenScene extends Phaser.Scene {
    textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
        font: '10px Courier',
        color: '#000000',
      };
    
      size: number = 16;
      offset: number = this.size / 2;
      map: any = [];
      player: Phaser.GameObjects.Ellipse | undefined;
    
      tileLayer: Phaser.GameObjects.Layer | undefined;
      pathLayer: Phaser.GameObjects.Layer | undefined;
      playerLayer: Phaser.GameObjects.Layer | undefined;
      textLayer: Phaser.GameObjects.Layer | undefined;
    
      mapHeight = [];
      lockPath: boolean = false;
      pathSteps: any[] = [];
      invalidCellCost = 9999999;
      height = 38;
      width = 50;
      offsetX: number = 0;
      offsetY: number = 0;
   
      constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
          super(config);
      }
      preload() {
        // Load the tiles image
        this.load.spritesheet('tiles', '../assets/tiles.png', { frameWidth: 32, frameHeight: 32 });
        
    }
      create() {
        MapGeneratorUtils.initSeed("cool-cool");
        const height=parseInt(this.game?.config?.height+"");
        const width=parseInt(this.game?.config?.width+"");
        this.height=Math.ceil(height/this.size);
        this.width=Math.ceil(width/this.size);       

        this.tileLayer = this.add.layer();
        const moveActions =[
            {key:'keydown-D',x:1,y:0},
            {key:'keydown-W',x:0,y:-1},
            {key:'keydown-A',x:-1,y:0},
            {key:'keydown-S',x:0,y:1}  
        ];
        for(let action of moveActions){
            this.input.keyboard?.on(action.key, () => {
               
                this.offsetX += action.x;
                this.offsetY += action.y;
                MapGeneratorUtils.generateChunk(this.height, this.width, this.offsetX, this.offsetY);  
                this.drawMap();
            });
        }       
        MapGeneratorUtils.generateChunk(this.height, this.width, this.offsetX, this.offsetY);
        this.drawMap();
      }
      
  // Desenha o mapa no canvas, colorindo cada célula conforme o bioma
   drawMap() {
    this.tileLayer?.removeAll();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const color = MapGeneratorUtils.getBiomeColor(x+this.offsetX, y+this.offsetY);
        let cell = this.add.rectangle(
            x * this.size + this.offset,
            y * this.size + this.offset,
            this.size,
            this.size,
            color
        );           
        
        /*
        const frame = this.getTileFrame(e, m);
        let cell = this.add.sprite(
            x * this.size + this.offset,
            y * this.size + this.offset,
            'tiles',
            frame
        );
        */
        cell.setData({ y: y+this.offsetY, x: x+this.offsetX });
        this.tileLayer?.add(cell);  
      }
    }
    
  }



}

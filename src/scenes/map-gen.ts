
import * as Phaser from 'phaser';
import { ColorUtils } from 'src/utils/color-utils';
import mapData from '../data/map-data.json';
import mapDefinitions from '../data/map-definitions.json';
import Alea from 'alea';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';

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
      elevationMap:any[] = [];
      moistureMap:any[] = [];
      offsetX: number = 0;
      offsetY: number = 0;
      seed:String = Math.random().toString();
      prng = Alea(this.seed);
      elevationNoise = createNoise2D(this.prng);
      moistureNoise = createNoise2D(this.prng);
      constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
      }
      create() {
        this.tileLayer = this.add.layer();

        this.input.keyboard?.on('keydown-D', () => {
            this.offsetX += 1;
            this.generateMap();
            this.drawMap();
        });
        this.input.keyboard?.on('keydown-W', () => {
            this.offsetY -= 1;
            this.generateMap();
            this.drawMap();
        });
        this.input.keyboard?.on('keydown-A', () => {
            this.offsetX -= 1;
            this.generateMap();
            this.drawMap();
        });
        this.input.keyboard?.on('keydown-S', () => {
            this.offsetY += 1;
            this.generateMap();
            this.drawMap();
        });
       
        this.generateMap();
        this.drawMap();
      }
      generateMap() {
         // Parâmetros para ruído e seed
        
         // Dois geradores de ruído: um para elevação e outro para umidade (pode-se usar o mesmo PRNG com offset)
         
         
         for (let y = 0; y < this.height; y++) {
           this.elevationMap[y] = [];
           this.moistureMap[y] = [];
           for (let x = 0; x < this.width; x++) {
             // Gera a elevação com 6 octaves; ajuste o scale para controlar o zoom
             let e = this.fractalNoise(x + this.offsetX, y + this.offsetY, this.elevationNoise, 6, 0.5, 2.0, 100);
             // Gera a umidade com 4 octaves (pode-se aplicar um offset para variar)
             let m = this.fractalNoise(x + this.offsetX, y + this.offsetY, this.moistureNoise, 4, 0.5, 2.0, 150);
             // Os valores iniciais estão aproximadamente em [-1, 1]; remapeia para [0, 1]
             e = (e + 1) / 2;
             m = (m + 1) / 2;
             this.elevationMap[y][x] = e;
             this.moistureMap[y][x] = m;
           }
         }
 
         //applyErosion(elevationMap, 3);
         
      }
      
      
  /*/ Configurações iniciais
  const canvas = document.getElementById('mapCanvas');
  const ctx = canvas.getContext('2d');
  const width = 256, height = 256;
  canvas.width = width;
  canvas.height = height;
*/


  // Função que gera ruído fractal (fBm) – soma de vários octaves de ruído
   fractalNoise(x:number, y:number, noiseFunc: NoiseFunction2D, octaves = 5, persistence = 0.5, lacunarity = 2.0, scale = 100) {
    let amplitude = 1;
    let frequency = 1;
    let noiseValue = 0;
    let maxAmplitude = 0;
    for (let i = 0; i < octaves; i++) {
      let nx = (x / scale) * frequency;
      let ny = (y / scale) * frequency;
      noiseValue += noiseFunc(nx, ny) * amplitude;
      maxAmplitude += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }
    return noiseValue / maxAmplitude;
  }

  /*/ Simulação simples de erosão: aplica um filtro de suavização iterado
   applyErosion(elevationMap, iterations = 5) {
    const newMap = [];
    // Cria uma cópia da elevação
    for (let y = 0; y < height; y++) {
      newMap[y] = [];
      for (let x = 0; x < width; x++) {
        newMap[y][x] = elevationMap[y][x];
      }
    }
    // Suavização iterada (média dos vizinhos)
    for (let iter = 0; iter < iterations; iter++) {
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let soma = 0, cont = 0;
          for (let j = -1; j <= 1; j++) {
            for (let i = -1; i <= 1; i++) {
              soma += newMap[y + j][x + i];
              cont++;
            }
          }
          elevationMap[y][x] = soma / cont;
        }
      }
    }
    return elevationMap;
  }
    */
  // Gera os mapas de elevação e umidade usando fBm

  // Aplica uma simulação simples de erosão (suavização)
 

  // Função que define o bioma com base na elevação (e) e umidade (m)
   getBiomeColor(e:number, m:number) {
    if (e < 0.3) return 0x2c52a0;           // Oceanos
    if (e < 0.35) return 0x3766c8;          // Praias
    if (e < 0.6) {
      if (m < 0.3) return 0xd0d080;         // Áreas semiáridas
      if (m < 0.6) return 0x589619;         // Pradarias
      return 0x426220;                     // Florestas ou matas
    }
    if (e < 0.8) {
      if (m < 0.4) return 0x5c453e;         // Morros
      return 0x4d3b39;                     // Montanhas
    }
    return 0xffffff;                        // Picos nevados
  }

  // Desenha o mapa no canvas, colorindo cada célula conforme o bioma
   drawMap() {
    this.tileLayer?.removeAll();
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const e = this.elevationMap[y][x];
        const m = this.moistureMap[y][x];
        const color = this.getBiomeColor(e, m);

        let cell = this.add.rectangle(
            x * this.size + this.offset,
            y * this.size + this.offset,
            this.size,
            this.size,
            color
          );
        this.tileLayer?.add(cell);  
      }
    }
    
  }



}

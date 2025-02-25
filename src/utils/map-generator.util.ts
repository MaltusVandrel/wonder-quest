import { Injectable } from '@angular/core';
import Alea from 'alea';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';


export class MapGeneratorUtils {
  static seed:String = Math.random().toString();
    //prngMoisture = Alea(this.seed+"-moisture");
    
    //noiseElevation = createNoise2D(this.prngElevation);
    static layers:any[] = [
        {key:'elevation',octaves : 5, persistence : 0.5, lacunarity : 2.0, scale : 100},
        {key:'moisture',octaves : 4, persistence : 0.5, lacunarity : 2.0, scale : 150},
        {key:'temperature',octaves : 4, persistence : 0.5, lacunarity : 2.0, scale : 130},
        {key:'wonder',octaves : 5, persistence : 0.2, lacunarity : 2.0, scale : 160}
    ];
        
    
    static prngList:any = [];
    static noises:any = [];
    static generatedTiles:any = [];
      
    static initSeed(seed:String){
        this.seed=seed;
        for (let layer of this.layers){
            this.prngList[layer.key] = Alea(this.seed+"-"+layer.key);
            this.noises[layer.key] = createNoise2D(this.prngList[layer.key]);
        }       
    }

    static generateChunk(height:number, width:number, offsetX:number, offsetY:number){ 
        // Parâmetros para ruído e seed
       
        // Dois geradores de ruído: um para elevação e outro para umidade (pode-se usar o mesmo PRNG com offset)
        for (let layer of this.layers){
            if(!this.generatedTiles[layer.key])this.generatedTiles[layer.key]=[];
            for (let y = 0; y < height; y++) {
                if (!this.generatedTiles[layer.key][y + offsetY]) {
                    this.generatedTiles[layer.key][y + offsetY] = [];
                }
                for (let x = 0; x < width; x++) {
                    if(this.generatedTiles[layer.key][y + offsetY][x + offsetX])continue;
                    // Gera a elevação com 6 octaves; ajuste o scale para controlar o zoom
                    let tileValue = this.fractalNoise(x + offsetX, y + offsetY, this.noises[layer.key], layer.octaves, layer.persistence, layer.lacunarity, layer.scale);
                    // Os valores iniciais estão aproximadamente em [-1, 1]; remapeia para [0, 1]
                    tileValue = (tileValue + 1) / 2;
                    this.generatedTiles[layer.key][y + offsetY][x + offsetX] = tileValue;                    
                }
            }
        }
        
     }
     

 // Função que gera ruído fractal (fBm) – soma de vários octaves de ruído
 static fractalNoise(x:number, y:number, noiseFunc: NoiseFunction2D, octaves = 5, persistence = 0.5, lacunarity = 2.0, scale = 100) {
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

 

 // Função que define o bioma com base na elevação (e) e umidade (m)
 static getBiomeColor(x:number, y:number) {
    let elevation = this.generatedTiles['elevation'][y][x];
    let moisture = this.generatedTiles['moisture'][y][x];
   if (elevation < 0.3) return 0x2c52a0;           // Oceanos #2c52a0
   if (elevation < 0.35) return 0x3766c8;          // Praias #3766c8
   if (elevation < 0.6) {
     if (moisture < 0.3) return 0xd0d080;         // Áreas semiáridas #d0d080
     if (moisture < 0.6) return 0x589619;         // Pradarias #589619
     return 0x426220;                     // Florestas ou matas #426220
   }
   if (elevation < 0.8) {
     if (moisture < 0.4) return 0x5c453e;         // Morros #5c453e
     return 0x4d3b39;                      // Montanhas #4d3b39
   }
   return 0xffffff;                        // Picos nevados #ffffff
 }
 getTileFrame(e: number, m: number): number {
       // Define the logic to select the appropriate frame based on elevation and moisture
       // For example, you can map different ranges of e and m to different frames
       if (e < 0.3) return 0; // Ocean
       if (e < 0.35) return 1; // Beach
       if (e < 0.6) {
           if (m < 0.3) return 2; // Semi-arid
           if (m < 0.6) return 3; // Grassland
           return 4; // Forest
       }
       if (e < 0.8) {
           if (m < 0.4) return 5; // Hills
           return 6; // Mountains
       }
       return 7; // Snowy peaks
   }


}
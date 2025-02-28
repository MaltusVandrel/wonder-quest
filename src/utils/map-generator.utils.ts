import { Injectable } from '@angular/core';
import Alea from 'alea';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { BiomeUtils } from './biome.utils';

export class MapGeneratorUtils {
  static seed: String = Math.random().toString();

  static layers: any[] = [
    {
      key: 'elevation',
      octaves: 5,
      persistence: 0.5,
      lacunarity: 2.0,
      scale: 100,
    },
    {
      key: 'moisture',
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
      scale: 150,
    },
    {
      key: 'temperature',
      octaves: 4,
      persistence: 0.5,
      lacunarity: 2.0,
      scale: 130,
    },
    {
      key: 'localVariation',
      octaves: 5,
      persistence: 0.2,
      lacunarity: 2.0,
      scale: 100,
    },
    {
      key: 'wonder',
      octaves: 5,
      persistence: 0.2,
      lacunarity: 2.0,
      scale: 160,
    },
  ];

  static prngList: any = [];
  static noises: any = [];
  static generatedTilesData: any = [];
  static generatedBiome: any = [];

  static initSeed(seed: String) {
    this.seed = seed;
    for (let layer of this.layers) {
      this.prngList[layer.key] = Alea(this.seed + '-' + layer.key);
      this.noises[layer.key] = createNoise2D(this.prngList[layer.key]);
    }
  }

  static generateChunk(
    height: number,
    width: number,
    offsetX: number,
    offsetY: number
  ) {
    // Parâmetros para ruído e seed

    // Dois geradores de ruído: um para elevação e outro para umidade (pode-se usar o mesmo PRNG com offset)
    for (let layer of this.layers) {
      if (!this.generatedTilesData[layer.key]) {
        this.generatedTilesData[layer.key] = [];
      }
      for (let y = 0; y < height; y++) {
        if (!this.generatedTilesData[layer.key][y + offsetY]) {
          this.generatedTilesData[layer.key][y + offsetY] = [];
        }
        for (let x = 0; x < width; x++) {
          if (this.generatedTilesData[layer.key][y + offsetY][x + offsetX])
            continue;
          // Gera a elevação com 6 octaves; ajuste o scale para controlar o zoom
          let tileDataValue = this.fractalNoise(
            x + offsetX,
            y + offsetY,
            this.noises[layer.key],
            layer.octaves,
            layer.persistence,
            layer.lacunarity,
            layer.scale
          );
          // Os valores iniciais estão aproximadamente em [-1, 1]; remapeia para [0, 1]
          tileDataValue = (tileDataValue + 1) / 2;
          this.generatedTilesData[layer.key][y + offsetY][x + offsetX] =
            tileDataValue;
        }
      }
    }
    if (!this.generatedBiome) {
      this.generatedBiome = [];
    }
    for (let y = 0; y < height; y++) {
      if (!this.generatedBiome[y + offsetY]) {
        this.generatedBiome[y + offsetY] = [];
      }
      for (let x = 0; x < width; x++) {
        if (this.generatedBiome[y + offsetY][x + offsetX]) continue;
        this.generatedBiome[y + offsetY][x + offsetX] = BiomeUtils.getBiomeData(
          x + offsetX,
          y + offsetY,
          this.generatedTilesData.elevation[y + offsetY][x + offsetX],
          this.generatedTilesData.moisture[y + offsetY][x + offsetX],
          this.generatedTilesData.temperature[y + offsetY][x + offsetX],
          this.generatedTilesData.localVariation[y + offsetY][x + offsetX],
          this.generatedTilesData.wonder[y + offsetY][x + offsetX]
        );
      }
    }
  }

  static getBiomeData(x: number, y: number): any {
    return this.generatedBiome[y][x];
  }

  // Função que gera ruído fractal (fBm) – soma de vários octaves de ruído
  static fractalNoise(
    x: number,
    y: number,
    noiseFunc: NoiseFunction2D,
    octaves = 5,
    persistence = 0.5,
    lacunarity = 2.0,
    scale = 100
  ) {
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

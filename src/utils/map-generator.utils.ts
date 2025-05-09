import { Injectable } from '@angular/core';
import Alea from 'alea';
import { createNoise2D, NoiseFunction2D } from 'simplex-noise';
import { BiomeUtils } from './biome.utils';
import { chooseBiome } from 'src/data/bank/biome';
import { Biome } from 'src/models/biome';

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
  static generatedBiome: Array<Array<Biome>> = [];

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

    for (let layer of this.layers) {
      if (!this.generatedTilesData[layer.key]) {
        this.generatedTilesData[layer.key] = [];
      }

      for (let y = 0; y < height; y++) {
        if (!this.generatedTilesData[layer.key][y + offsetY]) {
          this.generatedTilesData[layer.key][y + offsetY] = [];
        }
        for (let x = 0; x < width; x++) {
          this.generateTilesData(layer, x + offsetX, y + offsetY);
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
        this.seBiomeDataFromGeneratedTilesData(x + offsetX, y + offsetY);
      }
    }
  }

  static getBiomeData(x: number, y: number): Biome {
    if (!this.generatedBiome[y]) this.generatedBiome[y] = [];
    if (!this.generatedBiome[y][x]) {
      for (let layer of this.layers) {
        this.generateTilesData(layer, x, y);
      }
      this.seBiomeDataFromGeneratedTilesData(x, y);
    }
    return this.generatedBiome[y][x];
  }

  static seBiomeDataFromGeneratedTilesData(x: number, y: number) {
    if (this.generatedBiome[y][x]) return;
    this.generatedBiome[y][x] = chooseBiome(
      this.generatedTilesData.elevation[y][x],
      this.generatedTilesData.moisture[y][x],
      this.generatedTilesData.temperature[y][x],
      this.generatedTilesData.localVariation[y][x],
      this.generatedTilesData.wonder[y][x]
    );
  }
  static hasBiomeData(x: number, y: number) {
    try {
      if (this.generatedBiome[y][x]) return true;
    } catch (e) {}
    return false;
  }
  static generateTilesData(layer: any, x: number, y: number) {
    if (!this.generatedTilesData[layer.key][y])
      this.generatedTilesData[layer.key][y] = [];
    if (this.generatedTilesData[layer.key][y][x]) {
      return;
    }

    // Gera a elevação com 6 octaves; ajuste o scale para controlar o zoom
    let tileDataValue = this.fractalNoise(
      x,
      y,
      this.noises[layer.key],
      layer.octaves,
      layer.persistence,
      layer.lacunarity,
      layer.scale
    );
    // Os valores iniciais estão aproximadamente em [-1, 1]; remapeia para [0, 1]
    tileDataValue = (tileDataValue + 1) / 2;
    this.generatedTilesData[layer.key][y][x] = tileDataValue;
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
}

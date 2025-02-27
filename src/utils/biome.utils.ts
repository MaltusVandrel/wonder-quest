import { Biome } from 'src/models/biome';

export class BiomeUtils {
  static getBiomeData(x: number, y: number, generatedTilesData: any): Biome {
    let elevation = generatedTilesData.elevation[y][x];
    let moisture = generatedTilesData.moisture[y][x];
    let temperature = generatedTilesData.temperature[y][x];
    let localVariation = generatedTilesData.localVariation[y][x];
    let wonder = generatedTilesData.wonder[y][x];
    let influenceValues = {
      elevation: elevation,
      moisture,
      temperature,
      localVariation,
      wonder,
    };

    if (elevation < 0.25) {
      return {
        type: 'Deep Waters',
        color: 0x2c52a0, //color:rgb(50, 105, 179)
        staminaCost: 100,
        timeCost: 60 * 16,
        influenceValues: influenceValues,
      };
    }
    if (elevation < 0.3) {
      return {
        type: 'Shalow Waters',
        color: 0x4596d8, //color: #4596d8
        staminaCost: 30,
        timeCost: 60,
        influenceValues: influenceValues,
      };
    }
    if (elevation < 0.32) {
      return {
        type: 'Beach',
        color: 0xdfd392, //color: #dfd392
        staminaCost: 15,
        timeCost: 30,
        influenceValues: influenceValues,
      };
    }
    if (elevation < 0.7) {
      if (moisture < 0.3) {
        if (localVariation > 0.6) {
          return {
            type: 'Dunes',
            color: 0xc2a243, //color: #c2a243
            staminaCost: 15,
            timeCost: 30,
            influenceValues: influenceValues,
          }; // Hills
        }
        return {
          type: 'Desert',
          color: 0xe0c060, //color: #e0c060
          staminaCost: 15,
          timeCost: 30,
          influenceValues: influenceValues,
        };
      }
      if (moisture < 0.6) {
        if (localVariation > 0.6) {
          return {
            type: 'Hills',
            color: 0x8d9e2b, //color: #8d9e2b
            staminaCost: 15,
            timeCost: 30,
            influenceValues: influenceValues,
          }; // Hills
        }
        return {
          type: 'Plains',
          color: 0x87bb35, //color: #87bb35
          staminaCost: 15,
          timeCost: 30,
          influenceValues: influenceValues,
        };
      }
      if (moisture < 0.8) {
        return {
          type: 'Forest',
          color: 0x5b8b28, //color: #5b8b28
          staminaCost: 15,
          timeCost: 30,
          influenceValues: influenceValues,
        };
      }

      return {
        type: 'Swamp',
        color: 0x0d521e, //color: #0d521e
        staminaCost: 15,
        timeCost: 30,
        influenceValues: influenceValues,
      };
    }
    if (elevation < 0.85) {
      return {
        type: 'Mountains',
        color: 0x634e46, //color: #634e46
        staminaCost: 15,
        timeCost: 30,
        influenceValues: influenceValues,
      }; // Mountains
    }
    return {
      type: 'Snowy peaks',
      color: 0xfaeaea,
      staminaCost: 15,
      timeCost: 30,
      influenceValues: influenceValues,
    }; // Snowy peaks
  }
}

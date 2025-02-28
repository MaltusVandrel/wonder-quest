import { BIOME_CONFIG } from 'src/data/bank/biome';
import { Biome } from 'src/models/biome';

export class BiomeUtils {
  static getBiomeData(
    x: number,
    y: number,
    elevation: number,
    moisture: number,
    temperature: number,
    localVariation: number,
    wonder: number
  ): Biome {
    let influenceValues = {
      elevation: elevation,
      moisture: moisture,
      temperature: temperature,
      localVariation: localVariation,
      wonder: wonder,
    };
    for (const config of BIOME_CONFIG) {
      if (
        config.condition(
          elevation,
          moisture,
          temperature,
          localVariation,
          wonder
        )
      ) {
        return {
          ...config.biome,
          influenceValues: influenceValues,
        };
      }
    }

    // Default biome if no condition matches (should not happen with the current config)
    return {
      type: 'Unknown',
      color: 0x000000,
      staminaCost: 15,
      timeCost: 30,
      influenceValues: influenceValues,
    };
  }
}

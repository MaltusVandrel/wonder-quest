import { Biome } from 'src/models/biome';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';
import { MapPathUtils } from 'src/utils/map-path.utils';

export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value < max;
}
const DIFICULTY_STAMINA = 0.1;
const DIFICULTY_TIME = 0.25;
export const BIOME_DEFAULTS = { staminaCost: 15, timeCost: 15 };
export enum BIOME_TYPES {
  DEEP_WATERS = 'Deep Waters',
  SHALLOW_WATERS = 'Shallow Waters',
  REEFS = 'Reefs',
  BEACH = 'Beach',
  CLIFF = 'Cliff',
  MARSH = 'Marsh',
  DUNES = 'Dunes',
  DESERT = 'Desert',
  HILLS = 'Hills',
  PLAINS = 'Plains',
  HIGH_GRASS = 'High Grass',
  GROVE = 'Grove',
  WOODS = 'Woods',
  ENCHANTED_WOODS = 'Enchanted Woods',
  SWAMP = 'Swamp',
  MOUNTAINS = 'Mountains',
  HIGH_MOUNTAINS = 'High Mountains',
  SNOWY_PEAKS = 'Snowy peaks',
  VOID = 'Void',
}

export const BIOMES: { [key in BIOME_TYPES]: Biome } = {
  [BIOME_TYPES.VOID]: {
    type: BIOME_TYPES.VOID,
    color: 0xff00ff,
    staminaCost: 190 * DIFICULTY_STAMINA,
    timeCost: 160 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.DEEP_WATERS]: {
    type: BIOME_TYPES.DEEP_WATERS,
    color: 0x2c52a0,
    staminaCost: 90 * DIFICULTY_STAMINA,
    timeCost: 60 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.SHALLOW_WATERS]: {
    type: BIOME_TYPES.SHALLOW_WATERS,
    color: 0x4596d8,
    staminaCost: 40 * DIFICULTY_STAMINA,
    timeCost: 40 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.REEFS]: {
    type: BIOME_TYPES.REEFS,
    color: 0x45c6d8,
    staminaCost: 40 * DIFICULTY_STAMINA,
    timeCost: 40 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.BEACH]: {
    type: BIOME_TYPES.BEACH,
    color: 0xdfd392,
    staminaCost: 15 * DIFICULTY_STAMINA,
    timeCost: 15 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.DUNES]: {
    type: BIOME_TYPES.DUNES,
    color: 0xc2a243,
    staminaCost: 40 * DIFICULTY_STAMINA,
    timeCost: 40 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.DESERT]: {
    type: BIOME_TYPES.DESERT,
    color: 0xe0c060,
    staminaCost: 30 * DIFICULTY_STAMINA,
    timeCost: 30 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.HILLS]: {
    type: BIOME_TYPES.HILLS,
    color: 0x8d9e2b,
    staminaCost: 25 * DIFICULTY_STAMINA,
    timeCost: 25 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.PLAINS]: {
    type: BIOME_TYPES.PLAINS,
    color: 0x87bb35,
    staminaCost: 15 * DIFICULTY_STAMINA,
    timeCost: 15 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.WOODS]: {
    type: BIOME_TYPES.WOODS,
    color: 0x5b8b28,
    staminaCost: 30 * DIFICULTY_STAMINA,
    timeCost: 30 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.SWAMP]: {
    type: BIOME_TYPES.SWAMP,
    color: 0x0d521e,
    staminaCost: 60 * DIFICULTY_STAMINA,
    timeCost: 30 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.MOUNTAINS]: {
    type: BIOME_TYPES.MOUNTAINS,
    color: 0x634e46,
    staminaCost: 85 * DIFICULTY_STAMINA,
    timeCost: 50 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.HIGH_MOUNTAINS]: {
    type: BIOME_TYPES.HIGH_MOUNTAINS,
    color: 0x432e26,
    staminaCost: 89 * DIFICULTY_STAMINA,
    timeCost: 55 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.SNOWY_PEAKS]: {
    type: BIOME_TYPES.SNOWY_PEAKS,
    color: 0xfaeaea,
    staminaCost: 90 * DIFICULTY_STAMINA,
    timeCost: 60 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.CLIFF]: {
    type: BIOME_TYPES.CLIFF,
    color: 0x8a8a8d,
    staminaCost: 25 * DIFICULTY_STAMINA,
    timeCost: 25 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.MARSH]: {
    type: BIOME_TYPES.MARSH,
    color: 0x0d521e,
    staminaCost: 60 * DIFICULTY_STAMINA,
    timeCost: 30 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.HIGH_GRASS]: {
    type: BIOME_TYPES.HIGH_GRASS,
    color: 0x679b05,
    staminaCost: 15 * DIFICULTY_STAMINA,
    timeCost: 15 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.GROVE]: {
    type: BIOME_TYPES.GROVE,
    color: 0x6b9b38,
    staminaCost: 30 * DIFICULTY_STAMINA,
    timeCost: 30 * DIFICULTY_TIME,
  },
  [BIOME_TYPES.ENCHANTED_WOODS]: {
    type: BIOME_TYPES.ENCHANTED_WOODS,
    color: 0x5bab58,
    staminaCost: 30 * DIFICULTY_STAMINA,
    timeCost: 30 * DIFICULTY_TIME,
  },
};

export function chooseBiome(
  elevation: number,
  moisture: number,
  temperature: number,
  localVariation: number,
  wonder: number,
  x?: number,
  y?: number
): Biome {
  let biome = BIOMES[BIOME_TYPES.VOID];

  if (inRange(elevation, 0, 0.25)) {
    biome = BIOMES[BIOME_TYPES.DEEP_WATERS];
  } else if (inRange(elevation, 0.25, 0.3)) {
    biome = BIOMES[BIOME_TYPES.SHALLOW_WATERS];
    if (inRange(wonder, 0.6, 1) && inRange(elevation, 0.29, 0.3)) {
      biome = BIOMES[BIOME_TYPES.REEFS];
    }
  } else if (inRange(elevation, 0.3, 0.32)) {
    biome = BIOMES[BIOME_TYPES.BEACH];
    if (inRange(moisture, 0.8, 1)) {
      biome = BIOMES[BIOME_TYPES.MARSH];
    }
    if (inRange(elevation, 0.31, 0.32) && inRange(localVariation, 0.8, 1)) {
      biome = BIOMES[BIOME_TYPES.CLIFF];
    }
  } else if (inRange(elevation, 0.32, 0.7)) {
    if (inRange(moisture, 0, 0.2)) {
      biome = BIOMES[BIOME_TYPES.DESERT];
      if (inRange(localVariation, 0.6, 1)) {
        biome = BIOMES[BIOME_TYPES.DUNES];
      }
    } else if (inRange(moisture, 0.2, 0.6)) {
      biome = BIOMES[BIOME_TYPES.PLAINS];
      if (inRange(localVariation, 0.4, 0.6)) {
        biome = BIOMES[BIOME_TYPES.HIGH_GRASS];
      }
      if (inRange(localVariation, 0.6, 1)) {
        biome = BIOMES[BIOME_TYPES.HILLS];
      }
    } else if (inRange(moisture, 0.6, 0.62)) {
      biome = BIOMES[BIOME_TYPES.GROVE];
    } else if (inRange(moisture, 0.62, 0.8)) {
      biome = BIOMES[BIOME_TYPES.WOODS];

      if (inRange(wonder, 0.85, 1)) {
        biome = BIOMES[BIOME_TYPES.ENCHANTED_WOODS];
      }
    } else if (inRange(moisture, 0.8, 1)) {
      biome = BIOMES[BIOME_TYPES.SWAMP];
    }
  } else if (inRange(elevation, 0.7, 0.78)) {
    biome = BIOMES[BIOME_TYPES.MOUNTAINS];
  } else if (inRange(elevation, 0.78, 0.85)) {
    biome = BIOMES[BIOME_TYPES.HIGH_MOUNTAINS];
  } else if (inRange(elevation, 0.85, 1)) {
    biome = BIOMES[BIOME_TYPES.SNOWY_PEAKS];
  }

  const genBiome = {
    ...biome,
    influenceValues: {
      elevation,
      moisture,
      temperature,
      localVariation,
      wonder,
    },
  };

  return genBiome;
}

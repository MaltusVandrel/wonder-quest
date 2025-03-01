export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value < max;
}
export const BIOME_DEFAULTS = { staminaCost: 15, timeCost: 30 };
export const BIOME_CONFIG = [
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) =>
      inRange(elevation, 0, 0.25) &&
      inRange(moisture, 0, 1) &&
      inRange(temperature, 0, 1) &&
      inRange(localVariation, 0, 1) &&
      inRange(wonder, 0, 1),

    biome: {
      type: 'Deep Waters',
      color: 0x2c52a0,
      staminaCost: 100,
      timeCost: 60 * 16,
    },
  },
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) =>
      inRange(elevation, 0.25, 0.3) &&
      inRange(moisture, 0, 1) &&
      inRange(temperature, 0, 1) &&
      inRange(localVariation, 0, 1) &&
      inRange(wonder, 0, 1),
    biome: {
      type: 'Shallow Waters',
      color: 0x4596d8,
      staminaCost: 30,
      timeCost: 60,
    },
  },
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) =>
      inRange(elevation, 0.3, 0.32) &&
      inRange(moisture, 0, 1) &&
      inRange(temperature, 0, 1) &&
      inRange(localVariation, 0, 1) &&
      inRange(wonder, 0, 1),
    biome: {
      type: 'Beach',
      color: 0xdfd392,
      staminaCost: 15,
      timeCost: 30,
    },
  },
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) =>
      inRange(elevation, 0.32, 0.7) &&
      inRange(moisture, 0, 0.3) &&
      inRange(temperature, 0, 1) &&
      inRange(localVariation, 0.6, 1) &&
      inRange(wonder, 0, 1),
    biome: {
      type: 'Dunes',
      color: 0xc2a243,
      staminaCost: 60,
      timeCost: 60,
    },
  },
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) =>
      inRange(elevation, 0.32, 0.7) &&
      inRange(moisture, 0, 0.3) &&
      inRange(temperature, 0, 1) &&
      inRange(localVariation, 0, 0.6) &&
      inRange(wonder, 0, 1),
    biome: {
      type: 'Desert',
      color: 0xe0c060,
      staminaCost: 40,
      timeCost: 40,
    },
  },
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) =>
      inRange(elevation, 0.32, 0.7) &&
      inRange(moisture, 0.3, 0.6) &&
      inRange(temperature, 0, 1) &&
      inRange(localVariation, 0.6, 1) &&
      inRange(wonder, 0, 1),
    biome: {
      type: 'Hills',
      color: 0x8d9e2b,
      staminaCost: 25,
      timeCost: 45,
    },
  },
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) =>
      inRange(elevation, 0.32, 0.7) &&
      inRange(moisture, 0.3, 0.6) &&
      inRange(temperature, 0, 1) &&
      inRange(localVariation, 0, 0.6) &&
      inRange(wonder, 0, 1),
    biome: {
      type: 'Plains',
      color: 0x87bb35,
      staminaCost: 15,
      timeCost: 30,
    },
  },
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) =>
      inRange(elevation, 0.32, 0.7) &&
      inRange(moisture, 0.6, 0.8) &&
      inRange(temperature, 0, 1) &&
      inRange(localVariation, 0, 1) &&
      inRange(wonder, 0, 1),
    biome: {
      type: 'Forest',
      color: 0x5b8b28,
      staminaCost: 30,
      timeCost: 60,
    },
  },
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) =>
      inRange(elevation, 0.32, 0.7) &&
      inRange(moisture, 0.8, 1) &&
      inRange(temperature, 0, 1) &&
      inRange(localVariation, 0, 1) &&
      inRange(wonder, 0, 1),
    biome: {
      type: 'Swamp',
      color: 0x0d521e,
      staminaCost: 60,
      timeCost: 60 * 2,
    },
  },
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) =>
      inRange(elevation, 0.7, 0.85) &&
      inRange(moisture, 0, 1) &&
      inRange(temperature, 0, 1) &&
      inRange(localVariation, 0, 1) &&
      inRange(wonder, 0, 1),
    biome: {
      type: 'Mountains',
      color: 0x634e46,
      staminaCost: 80,
      timeCost: 60 * 4,
    },
  },
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) =>
      inRange(elevation, 0.85, 1) &&
      inRange(moisture, 0, 1) &&
      inRange(temperature, 0, 1) &&
      inRange(localVariation, 0, 1) &&
      inRange(wonder, 0, 1),
    biome: {
      type: 'Snowy peaks',
      color: 0xfaeaea,
      staminaCost: 100,
      timeCost: 60 * 16,
    },
  },
];

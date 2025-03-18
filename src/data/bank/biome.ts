export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value < max;
}
const DIFICULTY_STAMINA = 0.1;
const DIFICULTY_TIME = 0.25;
export const BIOME_DEFAULTS = { staminaCost: 15, timeCost: 15 };
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
      color: 0x2c52a0, // #2c52a0
      staminaCost: 90 * DIFICULTY_STAMINA,
      timeCost: 60 * DIFICULTY_TIME,
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
      color: 0x4596d8, // #4596d8
      staminaCost: 40 * DIFICULTY_STAMINA,
      timeCost: 40 * DIFICULTY_TIME,
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
      color: 0xdfd392, // #eadf92
      staminaCost: 15 * DIFICULTY_STAMINA,
      timeCost: 15 * DIFICULTY_TIME,
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
      color: 0xc2a243, // #c2a243
      staminaCost: 40 * DIFICULTY_STAMINA,
      timeCost: 40 * DIFICULTY_TIME,
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
      color: 0xe0c060, // #e0c060
      staminaCost: 30 * DIFICULTY_STAMINA,
      timeCost: 30 * DIFICULTY_TIME,
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
      color: 0x8d9e2b, // #8d9e2b
      staminaCost: 25 * DIFICULTY_STAMINA,
      timeCost: 25 * DIFICULTY_TIME,
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
      color: 0x87bb35, // #87bb35
      staminaCost: 15 * DIFICULTY_STAMINA,
      timeCost: 15 * DIFICULTY_TIME,
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
      color: 0x5b8b28, // #5b8b28
      staminaCost: 30 * DIFICULTY_STAMINA,
      timeCost: 30 * DIFICULTY_TIME,
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
      color: 0x0d521e, // #0d521e
      staminaCost: 60 * DIFICULTY_STAMINA,
      timeCost: 30 * DIFICULTY_TIME,
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
      color: 0x634e46, // #634e46
      staminaCost: 85 * DIFICULTY_STAMINA,
      timeCost: 50 * DIFICULTY_TIME,
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
      color: 0xfaeaea, // #faeaea
      staminaCost: 90 * DIFICULTY_STAMINA,
      timeCost: 60 * DIFICULTY_TIME,
    },
  },
];

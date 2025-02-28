export const BIOME_CONFIG = [
  {
    condition: (
      elevation: number,
      moisture: number,
      temperature: number,
      localVariation: number,
      wonder: number
    ) => {
      return (
        elevation >= 0 &&
        elevation < 0.25 &&
        moisture >= 0 &&
        moisture < 1 &&
        temperature >= 0 &&
        temperature < 1 &&
        localVariation >= 0 &&
        localVariation < 1 &&
        wonder >= 0 &&
        wonder < 1
      );
    },
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
      elevation >= 0.25 &&
      elevation < 0.3 &&
      moisture >= 0 &&
      moisture < 1 &&
      temperature >= 0 &&
      temperature < 1 &&
      localVariation >= 0 &&
      localVariation < 1 &&
      wonder >= 0 &&
      wonder < 1,
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
      elevation >= 0.3 &&
      elevation < 0.32 &&
      moisture >= 0 &&
      moisture < 1 &&
      temperature >= 0 &&
      temperature < 1 &&
      localVariation >= 0 &&
      localVariation < 1 &&
      wonder >= 0 &&
      wonder < 1,
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
      elevation >= 0.32 &&
      elevation < 0.7 &&
      moisture >= 0 &&
      moisture < 0.3 &&
      temperature >= 0 &&
      temperature < 1 &&
      localVariation >= 0.6 &&
      localVariation < 1 &&
      wonder >= 0 &&
      wonder < 1,
    biome: {
      type: 'Dunes',
      color: 0xc2a243,
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
      elevation >= 0.32 &&
      elevation < 0.7 &&
      moisture >= 0 &&
      moisture < 0.3 &&
      temperature >= 0 &&
      temperature < 1 &&
      localVariation >= 0 &&
      localVariation < 0.6 &&
      wonder >= 0 &&
      wonder < 1,
    biome: {
      type: 'Desert',
      color: 0xe0c060,
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
      elevation >= 0.32 &&
      elevation < 0.7 &&
      moisture >= 0.3 &&
      moisture < 0.6 &&
      temperature >= 0 &&
      temperature < 1 &&
      localVariation >= 0.6 &&
      localVariation < 1 &&
      wonder >= 0 &&
      wonder < 1,
    biome: {
      type: 'Hills',
      color: 0x8d9e2b,
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
      elevation >= 0.32 &&
      elevation < 0.7 &&
      moisture >= 0.3 &&
      moisture < 0.6 &&
      temperature >= 0 &&
      temperature < 1 &&
      localVariation >= 0 &&
      localVariation < 0.6 &&
      wonder >= 0 &&
      wonder < 1,
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
      elevation >= 0.32 &&
      elevation < 0.7 &&
      moisture >= 0.6 &&
      moisture < 0.8 &&
      temperature >= 0 &&
      temperature < 1 &&
      localVariation >= 0 &&
      localVariation < 1 &&
      wonder >= 0 &&
      wonder < 1,
    biome: {
      type: 'Forest',
      color: 0x5b8b28,
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
      elevation >= 0.32 &&
      elevation < 0.7 &&
      moisture >= 0.8 &&
      moisture < 1 &&
      temperature >= 0 &&
      temperature < 1 &&
      localVariation >= 0 &&
      localVariation < 1 &&
      wonder >= 0 &&
      wonder < 1,
    biome: {
      type: 'Swamp',
      color: 0x0d521e,
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
      elevation >= 0.7 &&
      elevation < 0.85 &&
      moisture >= 0 &&
      moisture < 1 &&
      temperature >= 0 &&
      temperature < 1 &&
      localVariation >= 0 &&
      localVariation < 1 &&
      wonder >= 0 &&
      wonder < 1,
    biome: {
      type: 'Mountains',
      color: 0x634e46,
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
      elevation >= 0.85 &&
      elevation < 1 &&
      moisture >= 0 &&
      moisture < 1 &&
      temperature >= 0 &&
      temperature < 1 &&
      localVariation >= 0 &&
      localVariation < 1 &&
      wonder >= 0 &&
      wonder < 1,
    biome: {
      type: 'Snowy peaks',
      color: 0xfaeaea,
      staminaCost: 15,
      timeCost: 30,
    },
  },
];

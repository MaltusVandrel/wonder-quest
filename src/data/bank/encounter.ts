import { Party } from 'src/models/party';
import { BIOME_TYPES } from './biome';
import { Biome } from 'src/models/biome';
import { GameDataService } from 'src/services/game-data.service';
import { getRegionSeed } from './map-region';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';
const TRIGGER_MULTIPLIER = 11;
/*
interface EncounterScheme {
  key: string;
  title: string;
  description: string;
  chance: number;
  requirement: (
    data: {party?:Party,date?:Date,biome?:BIOME_TYPES} ,
  ) => [boolean, 
   // @description requirement explanation 
   string];
}
*/
export interface EncounterScheme {
  key: string;
  title: string;
  description: string;
  chance: number;
}
export interface Encounter {
  key: string;
  title: string;
  description: string;
}
BIOME_TYPES;
export const ENCOUNTERS: { [key in BIOME_TYPES]: Array<EncounterScheme> } = {
  [BIOME_TYPES.VOID]: [],
  [BIOME_TYPES.DEEP_WATERS]: [],
  [BIOME_TYPES.SHALLOW_WATERS]: [],
  [BIOME_TYPES.REEFS]: [],
  [BIOME_TYPES.BEACH]: [],
  [BIOME_TYPES.DUNES]: [],
  [BIOME_TYPES.DESERT]: [],
  [BIOME_TYPES.HILLS]: [],
  [BIOME_TYPES.PLAINS]: [
    {
      key: 'bunny.funny',
      title: 'Funny Bunny',
      description: 'A funny bunny appears and dashes by!',
      chance: 0.01 * TRIGGER_MULTIPLIER,
    },
    {
      key: 'fox.wolf.bunny',
      title: 'A weird thing happened',
      description:
        'A wolf with a fox on top of it with a bunny on top of it crossed your path, they look dangerous, luckly you survived to see another day! +1LUK',
      chance: 0.001 * TRIGGER_MULTIPLIER,
    },
  ],
  [BIOME_TYPES.WOODS]: [],
  [BIOME_TYPES.SWAMP]: [],
  [BIOME_TYPES.MOUNTAINS]: [],
  [BIOME_TYPES.HIGH_MOUNTAINS]: [],
  [BIOME_TYPES.SNOWY_PEAKS]: [],
  [BIOME_TYPES.CLIFF]: [],
  [BIOME_TYPES.MARSH]: [],
  [BIOME_TYPES.HIGH_GRASS]: [],
  [BIOME_TYPES.GROVE]: [],
  [BIOME_TYPES.ENCHANTED_WOODS]: [],
};
function populateEncounter(scheme: EncounterScheme): Encounter {
  return {
    key: scheme.key,
    title: scheme.title,
    description: scheme.description,
  };
}
//fuck that is a great name, thank you *Lady gaga voice* Fernando
export function checkIfEncounterHappens(
  x: number,
  y: number
): Encounter | null {
  const biome = MapGeneratorUtils.getBiomeData(x, y);
  const biomeType: BIOME_TYPES = biome.type;
  const seed = getRegionSeed(x, y, biome);

  const triggeredEncounters = ENCOUNTERS[biomeType].filter(
    (scheme: EncounterScheme) => scheme.chance > Math.random()
  );

  return triggeredEncounters.length > 0
    ? populateEncounter(triggeredEncounters[0])
    : null;
}

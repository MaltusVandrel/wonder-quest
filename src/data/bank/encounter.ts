import { Party } from 'src/models/party';
import { BIOME_TYPES } from './biome';
import { Biome } from 'src/models/biome';
import {
  GameDataService,
  OveralGameDataParamter,
} from 'src/services/game-data.service';
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
export interface EncounterActionResult {
  able?: boolean;
  result?: string;
  reason?: string;
}
export interface EncounterAction {
  title: string;
  hint?: string;
  action: (params: OveralGameDataParamter) => EncounterActionResult;
  isAble: (params: OveralGameDataParamter) => EncounterActionResult;
}
export interface EncounterScheme {
  key: string;
  title: string;
  description: string | Array<string>;
  chance: number;
  demandsAttention: boolean;
  blocksOtherEncounters?: boolean;
  priority?: number;
  canDismiss?: boolean;
  actions?: Array<EncounterAction>;
  onTrigger?: (data: OveralGameDataParamter) => void;
  canTrigger?: (data: OveralGameDataParamter) => boolean;
}
export interface Encounter {
  key: string;
  title: string;
  description: string | Array<string>;
  demandsAttention: boolean;
  blocksOtherEncounters?: boolean;
  priority?: number;
  canDismiss?: boolean;
  actions?: Array<EncounterAction>;
  onTrigger?: (data: OveralGameDataParamter) => void;
  canTrigger?: (data: OveralGameDataParamter) => boolean;
  overalGameDataParamter: OveralGameDataParamter;
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
      demandsAttention: false,

      onTrigger: (data: OveralGameDataParamter) => {
        let hapenstance =
          GameDataService.GAME_DATA.encounterData['bunny.funny.happenstance'] ||
          0;
        GameDataService.GAME_DATA.encounterData['bunny.funny.happenstance'] =
          ++hapenstance;
      },
    },
    {
      key: 'fox.wolf.bunny',
      title: 'A weird thing happened',
      description:
        'A wolf with a fox on top of it with a bunny on top of it crossed your path, they look dangerous, luckly you survived to see another day!',
      chance: 0.001 * TRIGGER_MULTIPLIER,
      demandsAttention: false,
    },
    {
      key: 'dangerous.heroic.bunny',
      title: 'A weird thing happened',
      description:
        'A cool bunny with a scar and a red flowy scarf appears for a duel!',
      chance: 0.01 * TRIGGER_MULTIPLIER,
      demandsAttention: true,
      blocksOtherEncounters: true,
      canDismiss: false,
      priority: 0,
      actions: [
        {
          title: 'Fight',
          action: (data: OveralGameDataParamter) => {
            return {
              result:
                'The Bunny sense your weakness, you too, you give up and he spares you. You live to see another day.',
            };
          },
          isAble: (data: OveralGameDataParamter) => {
            return { able: true };
          },
        },
        {
          title: 'Run',
          action: (data: OveralGameDataParamter) => {
            return {
              result:
                'Theres no way to outrun The Bunny. It catches up to you, but then spares you. You live to see another day.',
            };
          },
          isAble: (data: OveralGameDataParamter) => {
            return { able: true };
          },
        },
        {
          title: 'Destroy it',
          action: (data: OveralGameDataParamter) => {
            return { able: false };
          },
          isAble: (data: OveralGameDataParamter) => {
            return {
              able: false,
              reason: 'Theres nothing strong enough to do this.',
            };
          },
        },
      ],
      canTrigger: (data: OveralGameDataParamter) => {
        let bunnyHapenstance =
          GameDataService.GAME_DATA.encounterData['bunny.funny.happenstance'] ||
          0;
        if (bunnyHapenstance > 100 / TRIGGER_MULTIPLIER) {
          return true;
        }
        return false;
      },
      onTrigger: (data: OveralGameDataParamter) => {
        GameDataService.GAME_DATA.encounterData['bunny.funny.happenstance'] = 0;
      },
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

function populateEncounter(
  scheme: EncounterScheme,
  overalGameDataParamter: OveralGameDataParamter
): Encounter {
  return {
    key: scheme.key,
    title: scheme.title,
    description: scheme.description,
    demandsAttention: scheme.demandsAttention,
    blocksOtherEncounters: scheme.blocksOtherEncounters,
    priority: scheme.priority,
    canDismiss: scheme.canDismiss,
    actions: scheme.actions,
    onTrigger: scheme.onTrigger,
    canTrigger: scheme.canTrigger,
    overalGameDataParamter: overalGameDataParamter,
  };
}
//fuck that is a great name, thank you *Lady gaga voice* Fernando
export function checkIfEncountersHappens(
  x: number,
  y: number
): Array<Encounter> | null {
  const biome = MapGeneratorUtils.getBiomeData(x, y);
  const biomeType: BIOME_TYPES = biome.type;
  const seed = getRegionSeed(x, y, biome);
  const enconters = ENCOUNTERS[biomeType];
  const overalGameDataParamter: OveralGameDataParamter = {
    biome: biome,
    pos: { x, y },
  };

  const triggerableEncounters = enconters.filter((scheme: EncounterScheme) =>
    scheme.canTrigger ? scheme.canTrigger(overalGameDataParamter) : true
  );

  const toTriggerEncounters = triggerableEncounters.filter(
    (scheme: EncounterScheme) => scheme.chance > Math.random()
  );

  const blockingEvents = toTriggerEncounters
    .filter((scheme: EncounterScheme) => scheme.blocksOtherEncounters == true)
    .sort(
      (schemeA: EncounterScheme, schemeB: EncounterScheme) =>
        (schemeA.priority || 99) - (schemeB.priority || 99)
    );
  if (blockingEvents && blockingEvents.length > 0) {
    if (blockingEvents[0].onTrigger)
      blockingEvents[0].onTrigger(overalGameDataParamter);
    return [populateEncounter(blockingEvents[0], overalGameDataParamter)];
  }
  const demandsAttentionEncounter = toTriggerEncounters
    .filter((scheme: EncounterScheme) => scheme.demandsAttention == true)
    .sort(
      (schemeA: EncounterScheme, schemeB: EncounterScheme) =>
        (schemeA.priority || 99) - (schemeB.priority || 99)
    );

  const toastEncounter = toTriggerEncounters.filter(
    (scheme: EncounterScheme) => scheme.demandsAttention != true
  );
  let triggeredEncounters: Array<EncounterScheme> = [];
  if (toastEncounter && toastEncounter.length > 0) {
    triggeredEncounters = toastEncounter;
  }
  if (demandsAttentionEncounter && demandsAttentionEncounter.length > 0) {
    triggeredEncounters.push(demandsAttentionEncounter[0]);
  }
  if (!(triggeredEncounters.length > 0)) return null;
  const encounters = triggeredEncounters.map((e) =>
    populateEncounter(e, overalGameDataParamter)
  );
  encounters.forEach((encounter: Encounter) => {
    encounter.onTrigger && encounter.onTrigger(overalGameDataParamter);
  });
  return encounters;
}

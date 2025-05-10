import { Company } from 'src/models/company';
import { BIOME_TYPES } from './biome';
import { Biome } from 'src/models/biome';
import {
  GameDataService,
  OverallGameDataParamter as OverallGameDataParamter,
} from 'src/services/game-data.service';
import { getRegionSeed } from './map-region';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';
import { DIALOG_TYPES } from 'src/utils/ui-notification.util';
import {
  BATTLE_EVENT_TYPE,
  BattleContext,
  BattleEvent,
  BattleGroup,
  BattleScheme,
} from 'src/core/battle-context';
import { SLIME_BUILDER } from '../builder/slime-builder';
import { ChallangeDificultyXPInfluence } from 'src/core/xp-calc';
import { BATTLE_INSTRUCTIONS } from 'src/core/battle-instructions';
const TRIGGER_MULTIPLIER = 1;
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
export interface GameActionResult {
  able?: boolean;
  result?: string;
  keepParentOpen?: boolean;
  reason?: string;
  dialogType?: DIALOG_TYPES;
  customReturnBehaviour?: (params: OverallGameDataParamter) => void;
}
export interface GameAction {
  title: string;
  hint?: string;
  action: (params: OverallGameDataParamter) => GameActionResult;
  isAble: (params: OverallGameDataParamter) => GameActionResult;
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
  actions?: Array<GameAction>;
  onTrigger?: (data: OverallGameDataParamter) => void;
  canTrigger?: (data: OverallGameDataParamter) => boolean;
}
export interface Encounter {
  key: string;
  title: string;
  description: string | Array<string>;
  demandsAttention: boolean;
  blocksOtherEncounters?: boolean;
  priority?: number;
  canDismiss?: boolean;
  actions?: Array<GameAction>;
  onTrigger?: (data: OverallGameDataParamter) => void;
  canTrigger?: (data: OverallGameDataParamter) => boolean;
  overallGameDataParamter: OverallGameDataParamter;
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

      onTrigger: (data: OverallGameDataParamter) => {
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
          action: (data: OverallGameDataParamter) => {
            return {
              result:
                'The Bunny sense your weakness, you too, you give up and he spares you. You live to see another day.',
            };
          },
          isAble: (data: OverallGameDataParamter) => {
            return { able: true };
          },
        },
        {
          title: 'Run',
          action: (data: OverallGameDataParamter) => {
            return {
              result:
                'Theres no way to outrun The Bunny. It catches up to you, but then spares you. You live to see another day.',
            };
          },
          isAble: (data: OverallGameDataParamter) => {
            return { able: true };
          },
        },
        {
          title: 'Destroy it',
          action: (data: OverallGameDataParamter) => {
            return { able: false };
          },
          isAble: (data: OverallGameDataParamter) => {
            return {
              able: false,
              reason: 'Theres nothing strong enough to do this.',
            };
          },
        },
      ],
      canTrigger: (data: OverallGameDataParamter) => {
        let bunnyHapenstance =
          GameDataService.GAME_DATA.encounterData['bunny.funny.happenstance'] ||
          0;
        if (bunnyHapenstance > 100 / TRIGGER_MULTIPLIER) {
          return true;
        }
        return false;
      },
      onTrigger: (data: OverallGameDataParamter) => {
        GameDataService.GAME_DATA.encounterData['bunny.funny.happenstance'] = 0;
      },
    },
    {
      key: 'monster.fight.slime',
      title: 'A slime appears',
      description: 'An aggressive slime attacks!',
      chance: 0.05 * TRIGGER_MULTIPLIER,
      demandsAttention: true,
      blocksOtherEncounters: true,
      canDismiss: false,
      priority: 0,
      actions: [
        {
          title: 'Fight',
          action: (data: OverallGameDataParamter) => {
            const groups: Array<BattleGroup> = [];
            const level = 1;
            const names = 'AB'.split('');
            const enemies = names.map((_, i) => {
              const slime = SLIME_BUILDER.getASlime(level);
              slime.name += ' ' + names[i];
              return {
                character: slime,
                fainted: false,
                legendaryActions: 0,
                dificulty: ChallangeDificultyXPInfluence.EASY,
                battleInstructions:
                  BATTLE_INSTRUCTIONS.GET_RANDOM_ALIVE_ADVERSARY,
              };
            });

            groups.push({
              members: enemies,
              teamName: 'Slimes',
              teamKey: 'slime',
              disavantage: false,
              adversarial: true,
              supporter: false,
              actionBehaviour: BattleContext.ACTION_BEHAVIOUR.AUTO,
              relationships: [
                {
                  teamKey: BattleContext.TEAM_KEY_PLAYER,
                  behaviour: BattleContext.RELATIONSHIP_BEHAVIOUR.FOE,
                },
              ],
            });
            const scheme: BattleScheme = {
              groups: groups,
              events: [],
              introductionText: 'A horde of pathetic slimes attacks!',
              playerDisadvantage: false,
            };
            const event: BattleEvent = {
              type: BATTLE_EVENT_TYPE.BEFORE_ACTION,
              startingTurn: 0,
              turnGapForRecurrence: 5,
              calculatedOccurence: false,
              event: (battle: BattleContext, me: BattleEvent) => {
                const numberOfSlimes = battle.battleActors.filter(
                  (actor) => actor.team.key == 'slime'
                ).length;
                const interloperSlime = SLIME_BUILDER.getASlime(level);
                interloperSlime.name = `Slime #${numberOfSlimes}`;

                battle.addNewBattleActor(
                  battle.turnInfo.activeSlot?.timeStamp || 0,
                  {
                    character: interloperSlime,
                    fainted: false,
                    legendaryActions: 0,
                    dificulty: ChallangeDificultyXPInfluence.EASY,
                    battleInstructions:
                      BATTLE_INSTRUCTIONS.GET_RANDOM_ALIVE_ADVERSARY,
                  },
                  battle.getTeamByKey('slime')
                );
                return {
                  stopBattle: false,
                  stopAll: false,
                  message: `The very unique slime #${numberOfSlimes} appears!`,
                };
              },
            };
            scheme.events.push(event);

            data.battleScheme = scheme;

            return {
              result: 'The battle begins!',
              dialogType: DIALOG_TYPES.BATTLE,
            };
          },
          isAble: (data: OverallGameDataParamter) => {
            return { able: true };
          },
        },
        {
          title: 'Run',
          action: (data: OverallGameDataParamter) => {
            return {
              result: 'You fleed!',
            };
          },
          isAble: (data: OverallGameDataParamter) => {
            return { able: true };
          },
        },
      ],
    },
    {
      key: 'monster.fight.confused_sabos',
      title: 'A weirdly big number of Sabos Appeared',
      description: 'A weirdly big number of Sabos Appeared!',
      chance: 0.5 * TRIGGER_MULTIPLIER,
      demandsAttention: true,
      blocksOtherEncounters: true,
      canDismiss: false,
      priority: 0,
      actions: [
        {
          title: 'Fight',
          action: (data: OverallGameDataParamter) => {
            const groups: Array<BattleGroup> = [];
            const level = 1;
            const names = [
              'Alva',
              'Bleu',
              'Cyaa',
              'Dow',
              'Eron',
              'Frian',
              'Grax',
              'Helin',
              'Ica',
              'Jaiu',
              'Kairo',
              'Leu',
              'Mow',
              'Netro',
              'Oro',
              'Pyra',
              'Quiin',
              'Roj',
              'Suon',
              'Tren',
              'Uco',
              'Veli',
              'Wulv',
              'Xil',
              'Yva',
              'Zerin',
            ];
            const numberOfTeams = Math.ceil(Math.random() * 15) + 5;

            Array.from({ length: numberOfTeams }).map((_, teamIndex) => {
              const name = names[teamIndex];
              const numberOfEnemies = Math.ceil(Math.random() * 6) + 1;

              const enemies = Array.from({ length: numberOfEnemies }).map(
                (_, charIndex) => {
                  const sabo = SLIME_BUILDER.getASlime(level);
                  sabo.name = name + ' Sabo  #' + (charIndex + 1);
                  return {
                    character: sabo,
                    fainted: false,
                    legendaryActions: 0,
                    dificulty: ChallangeDificultyXPInfluence.EASY,
                    battleInstructions:
                      BATTLE_INSTRUCTIONS.GET_RANDOM_ALIVE_ADVERSARY,
                  };
                }
              );

              let adversarial = Math.random() > 0.5999;
              let supporter = Math.random() > 0.3999 && !adversarial;

              groups.push({
                members: enemies,
                teamName: name + ' Sabo',
                teamKey: 'sabo_' + name.toLocaleLowerCase(),
                disavantage: true,
                adversarial: adversarial,
                supporter: supporter,
                actionBehaviour: BattleContext.ACTION_BEHAVIOUR.AUTO,
                relationships: [],
              });
            });
            groups.forEach((group) => {
              const noMes = groups.filter(
                (oGroup) => oGroup.teamKey != group.teamKey
              );
              const adversarial = group.adversarial;
              const supporter = group.supporter;
              const neutral = !(supporter || adversarial);
              let groupsToHelp: BattleGroup[] = [];
              let groupsToHarm: BattleGroup[] = [];

              if (adversarial) {
                groupsToHelp = noMes.filter((oGroup) => oGroup.adversarial);
                groupsToHarm = noMes.filter((oGroup) => !oGroup.adversarial);
                if (Math.random() > 0.4) {
                  group.relationships.push({
                    teamKey: BattleContext.TEAM_KEY_PLAYER,
                    behaviour: BattleContext.RELATIONSHIP_BEHAVIOUR.FOE,
                  });
                }
              } else if (supporter) {
                groupsToHelp = noMes.filter((oGroup) => oGroup.supporter);
                groupsToHarm = noMes.filter((oGroup) => !oGroup.supporter);
                if (Math.random() > 0.4) {
                  group.relationships.push({
                    teamKey: BattleContext.TEAM_KEY_PLAYER,
                    behaviour: BattleContext.RELATIONSHIP_BEHAVIOUR.ALLY,
                  });
                }
              } else {
                groupsToHelp = noMes.filter(
                  (oGroup) => !(oGroup.supporter || oGroup.adversarial)
                );
                groupsToHarm = noMes.filter(
                  (oGroup) => oGroup.supporter || oGroup.adversarial
                );
              }
              groupsToHelp
                .filter((g) => Math.random() > 0.5)
                .forEach((g) => {
                  group.relationships.push({
                    teamKey: g.teamKey,
                    behaviour: BattleContext.RELATIONSHIP_BEHAVIOUR.ALLY,
                  });
                  g.relationships.push({
                    teamKey: group.teamKey,
                    behaviour: BattleContext.RELATIONSHIP_BEHAVIOUR.ALLY,
                  });
                });
              groupsToHarm
                .filter((g) => Math.random() > 0.5)
                .forEach((g) => {
                  group.relationships.push({
                    teamKey: g.teamKey,
                    behaviour: BattleContext.RELATIONSHIP_BEHAVIOUR.FOE,
                  });
                  g.relationships.push({
                    teamKey: group.teamKey,
                    behaviour: BattleContext.RELATIONSHIP_BEHAVIOUR.FOE,
                  });
                });
            });

            const scheme: BattleScheme = {
              groups: groups,
              events: [],
              introductionText:
                'A surprisingly large amount of snake faced giant frogs attacks... some of them do, most are just confused.',
              playerDisadvantage: false,
            };
            const event: BattleEvent = {
              type: BATTLE_EVENT_TYPE.ON_TEAM_RETREAT,
              startingTurn: 0,
              turnGapForRecurrence: 1,
              calculatedOccurence: false,
              event: (battle: BattleContext, me: BattleEvent) => {
                console.log('somebody got out');
                return {
                  stopBattle: false,
                  stopAll: false,
                };
              },
            };
            scheme.events.push(event);

            data.battleScheme = scheme;

            return {
              result: 'The battle begins!',
              dialogType: DIALOG_TYPES.BATTLE,
            };
          },
          isAble: (data: OverallGameDataParamter) => {
            return { able: true };
          },
        },
        {
          title: 'Run',
          action: (data: OverallGameDataParamter) => {
            return {
              result: 'You fleed!',
            };
          },
          isAble: (data: OverallGameDataParamter) => {
            return { able: true };
          },
        },
      ],
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
  overalGameDataParamter: OverallGameDataParamter
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
    overallGameDataParamter: overalGameDataParamter,
  };
}

export function checkIfEncountersHappensOnTravel(
  x: number,
  y: number
): Array<Encounter> | null {
  const biome = MapGeneratorUtils.getBiomeData(x, y);
  const biomeType: BIOME_TYPES = biome.type;

  const overalGameDataParamter: OverallGameDataParamter = {
    biome: biome,
    pos: { x, y },
    encounterTriggerType: 'travel',
  };

  return checkIfEncountersHappens(overalGameDataParamter);
}

//fuck that is a great name, thank you *Lady gaga voice* Fernando
function checkIfEncountersHappens(
  overalGameDataParamter: OverallGameDataParamter
): Array<Encounter> | null {
  if (overalGameDataParamter.biome == null) throw 'Tell the biome ya fucker!';
  if (overalGameDataParamter.pos == null) throw 'Tell the position ya fucker!';
  if (overalGameDataParamter.encounterTriggerType == null)
    throw 'Tell the trigger type ya fucker!';

  const pos: { x: number; y: number } = overalGameDataParamter.pos;
  const biome = overalGameDataParamter.biome;
  const biomeType: BIOME_TYPES = biome.type;
  const seed = getRegionSeed(pos.x, pos.y, biome);
  const enconters = ENCOUNTERS[biomeType];
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

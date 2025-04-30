import { Property, PROPERTY_LIST } from './property';
import { STAT_KEY } from './stats';

export enum MoveType {
  //@description the most generic
  MOVE = 'move',
  //@description do magic
  SPELL = 'spell',
  //@description do something somewhate esoteric, in btween spell and technic
  ART = 'art',
  //@description usually phisical moves
  TECHNIC = 'technic',
  //@description the most generic
  SKILL = 'skill',
}
export enum MoveLearningStatus {
  CONCEPTUALIZED = 'conceptualized',
  LEARNED = 'learned',
  MASTERED = 'mastered',
}
export enum MoveClassificationType {
  DAMAGE = 'damage',
  HEALING = 'healing',
  EFFECT = 'effect',
  OTHER = 'other',
}
/**
 * @description a version/instance of the move aquired by a Figure
 * @TODO conditionals need to be done later; fuck u mean weapons??? we dont have itens yet */
export interface MoveExpression {
  moveKey: string;
  type: MoveType;

  name: string;
  level: number;
  xp: number;
  learned: MoveLearningStatus;

  power: number;
  criticalChance: number;
  criticalMultiplier: number;
  hitChance: number;
  overHitInfluence: number;
  statusInfluence: Array<{ stat: STAT_KEY; influence: number }>;
  hitStatus: Array<{ stat: STAT_KEY; influence: number }>;
  dodgingStatus: Array<{ stat: STAT_KEY; influence: number }>;
  resistenceStatus: Array<{ stat: STAT_KEY; influence: number }>;

  characteristics: Array<Property>;
}

export interface Move {
  key: string;
  name: string;
  defaultExpression: MoveExpression;
}

export const MoveBonk: Move = {
  key: 'aggression.bonk',
  name: 'Bonk',
  defaultExpression: {
    moveKey: 'aggression.bonk',
    type: MoveType.MOVE,

    name: 'bonk',
    level: 1,
    xp: 0,
    learned: MoveLearningStatus.LEARNED,

    power: 25,
    criticalChance: 0.25,
    criticalMultiplier: 2,
    hitChance: 0.99,
    overHitInfluence: 0.25,
    statusInfluence: [{ stat: STAT_KEY.STRENGTH, influence: 5 }],
    hitStatus: [{ stat: STAT_KEY.DEXTERITY, influence: 1 }],

    dodgingStatus: [{ stat: STAT_KEY.AGILITY, influence: 1 }],
    resistenceStatus: [{ stat: STAT_KEY.ENDURANCE, influence: 1 }],
    characteristics: [PROPERTY_LIST['damage_type_impact']],
  },
};

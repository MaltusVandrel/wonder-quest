import { GAUGE_KEYS } from './gauge';
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
export interface StatInfluence {
  stat: STAT_KEY;
  influence: number;
}
/**
 * @description a version/instance of the move aquired by a Figure
 * @TODO conditionals need to be done later; fuck u mean weapons??? we dont have itens yet */
export interface MoveExpression {
  moveKey: string;
  type: MoveType;

  name: string;
  description: string;
  level: number;
  xp: number;
  learned: MoveLearningStatus;

  power: number;
  hitChance: number;
  overHitInfluence: number;

  criticalChance: number;
  criticalMultiplier: number;

  gaugeCostDampeningOnFumble: number;
  gaugeCostDampeningOnDodge: number;
  gaugeCosts: Array<{
    gauge: GAUGE_KEYS;
    cost: number;
    costReduction: Array<StatInfluence>;
  }>;
  //targetFilter [number|random|maxmin?][team|position|enemy|numberOfEnemies|position|adversarial|support|ally|foe|property|anemyType|item|move]

  //windup // set atack to happen fowards, pushing the progress order
  //recover // push the progress order after the

  //multiTurnAttack?
  //multiTurnAttackLockBehaviour?

  //createDelayedActionAttack //push the action not the actor
  //isConcentration
  //turnRecharge

  //creationActionAttack?
  //endNextActionsAttackOnMiss?

  //isMultiAttack?
  //multiAttackMaxHits
  //multiAttackEndOnMiss?
  //multiAttackHitChanceOnHitProgression
  //multiAttackPowerOnHitProgression
  //multiAttackCriticalChanceOnHitProgression
  //multiAttackCriticalMultiplierOnHitProgression

  statusInfluence: Array<StatInfluence>;
  hitStatus: Array<StatInfluence>;
  critStatus: Array<StatInfluence>;
  dodgingStatus: Array<StatInfluence>;
  resistenceStatus: Array<StatInfluence>;

  characteristics: Array<Property>;

  //secondaryEffect:MoveExpression

  //conditionalBehaviour:boolean // action(battleContext,MoveExpression):MoveExpression
  //specialBehaviour:boolean // action(battleContext,MoveExpression)
}

export interface Move {
  key: string;
  name: string;
  defaultExpression: MoveExpression;
}

export const StruggleAttack: Move = {
  key: 'aggression.struggle-attack',
  name: 'Bonk',
  defaultExpression: {
    moveKey: 'aggression.bonk',
    type: MoveType.MOVE,
    name: 'bonk',
    description: '',
    level: 1,
    xp: 0,
    learned: MoveLearningStatus.LEARNED,

    power: 1,
    criticalChance: 0.25,
    criticalMultiplier: 2,
    hitChance: 0.99,
    overHitInfluence: 0.25,

    gaugeCostDampeningOnFumble: 0,
    gaugeCostDampeningOnDodge: 0,
    gaugeCosts: [
      {
        gauge: GAUGE_KEYS.VITALITY,
        cost: 15,
        costReduction: [],
      },
    ],

    statusInfluence: [{ stat: STAT_KEY.STRENGTH, influence: 5 }],
    hitStatus: [{ stat: STAT_KEY.DEXTERITY, influence: 1 }],
    critStatus: [{ stat: STAT_KEY.LUCK, influence: 1 }],

    dodgingStatus: [{ stat: STAT_KEY.AGILITY, influence: 1 }],
    resistenceStatus: [{ stat: STAT_KEY.ENDURANCE, influence: 1 }],
    characteristics: [PROPERTY_LIST['damage_type_impact']],
  },
};

export const MoveBonk: Move = {
  key: 'aggression.bonk',
  name: 'Bonk',
  defaultExpression: {
    moveKey: 'aggression.bonk',
    type: MoveType.MOVE,
    name: 'bonk',
    description: '',
    level: 1,
    xp: 0,
    learned: MoveLearningStatus.LEARNED,

    power: 25,
    criticalChance: 0.25,
    criticalMultiplier: 2,
    hitChance: 0.99,
    overHitInfluence: 0.25,

    gaugeCostDampeningOnFumble: 0,
    gaugeCostDampeningOnDodge: 0.5,

    gaugeCosts: [
      {
        gauge: GAUGE_KEYS.STAMINA,
        cost: 15,
        costReduction: [{ stat: STAT_KEY.ENDURANCE, influence: 1 }],
      },
    ],

    statusInfluence: [{ stat: STAT_KEY.STRENGTH, influence: 5 }],
    hitStatus: [{ stat: STAT_KEY.DEXTERITY, influence: 1 }],
    critStatus: [{ stat: STAT_KEY.LUCK, influence: 1 }],

    dodgingStatus: [{ stat: STAT_KEY.AGILITY, influence: 1 }],
    resistenceStatus: [{ stat: STAT_KEY.ENDURANCE, influence: 1 }],
    characteristics: [PROPERTY_LIST['damage_type_impact']],
  },
};

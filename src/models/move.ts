import { GAUGE_KEYS, GaugeKey } from './gauge';
import { Property, PROPERTY_LIST } from './property';
import { STAT_KEY, StatKey } from './stats';

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
  stat: StatKey;
  influence: number;
}
/**
 * @TODO Criar componentização das partes do ataque. Cura é mais perigosa baseado na quantidade de aliados do curador. Alvos prioritários são  escolhidos baseado em tipos de ataques.
 * @TODO Ver como fazer interpretador de matematica pois talvez pode ser mais facil.
 * @TODO Fazer mapeamento das fases da batalha para melhor usar status, fazer eventos terem before e after, permitirem cancel (evento não pode triggar multiplas vezes para mesmo source ou a si mesmo, fazer status que após dano recebido causa ) e obtenção de dados ()
 * @TODO Depois que todos ativos foram ao menos 1 vez, trigga 1 turno. Importante para status evento. Sunny day status passivo onbeforedamage pega o source e aumenta o poder em 15%? sources do tipo flora, non-dark, light, sun, fire 
 * @TODO Fazer properties com parents, childrens, e relations(agua relativo a cura com elo parental de magia positivo, agua relativo a fpgp com elo parental de elemento negativo)
 * @TODO fazer texto de batalha para niveis de agressividade, sendo o padrão the ritual fog yearns for violence, o amigavel como mists bless your squirmish, 
 * @TODO ataques do tipo dano 100xtargets, cura 75xalliesxtargets, especial/other(turn bulshists) 125xtargets; arena effecs counts targets as all enemies/allies or both 
 * / 
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

  isMultiAttack: boolean;
  multiAttackMaxHits: number;
  multiAttackEndOnMiss: boolean;
  multiAttackHitChanceOnHitInfluence: number;
  multiAttackOverHitOnHitInfluence: number;
  multiAttackPowerOnHitInfluence: number;
  multiAttackCriticalChanceOnHitInfluence: number;
  multiAttackCriticalOnHitInfluence: number;

  gaugeCostInfluenceOnFumble: number;
  gaugeCostInfluenceOnDodge: number;
  gaugeCosts: Array<{
    gauge: GaugeKey;
    cost: number;
    costReduction: Array<StatInfluence>;
  }>;
  //nao deixar morrer de dano de recoil ???!
  //fazer
  //targetFilter [number|random|maxmin?][all|any|self|team|position|enemy|numberOfEnemies|adversarial|support|beneficial|detrimental|ally|foe|property|anemyType|item|move|function(busca pirata)]
  //fazer um target simples inicialmente e iterar
  /*
  targetFilter: [
    {
      targetingAmount: { amount?: number; type: string };
      targetType: { type: string; special: () => void };
    }
  ];
  */
  //unbloodiedPowerInfluence
  //unbloodiedCriticalChanceInfluence
  //unbloodiedCriticalInfluence
  //unbloodiedHitChanceInfluence
  //unbloodiedOverHitInfluence

  //bloodiedPowerInfluence
  //bloodiedCriticalChanceInfluence
  //bloodiedCriticalInfluence
  //bloodiedHitChanceInfluence
  //bloodiedOverHitInfluence

  //unbloodiedPowerInfluence
  //unbloodiedCriticalChanceInfluence
  //unbloodiedCriticalInfluence
  //unbloodiedHitChanceInfluence
  //unbloodiedOverHitInfluence

  //windup // set atack to happen fowards, pushing the progress order
  //recover // push the progress order after the

  //multiTurnAttack?
  //multiTurnAttackLockBehaviour?

  //createDelayedActionAttack //push the action not the actor
  //isConcentration
  //turnRecharge

  //creationActionAttack?
  //endNextActionsAttackOnMiss?
  statusInfluence: Array<StatInfluence>;
  hitStatus: Array<StatInfluence>;
  critStatus: Array<StatInfluence>;
  dodgingStatus: Array<StatInfluence>;
  resistenceStatus: Array<StatInfluence>;
  characteristics: Array<Property>;
  //secondaryEffect:MoveExpression
  //i think the one down is a good idea to put one after another and like
  //-20% mana cost on targeting water property, then 50% stronger against warriors
  //conditionalTransformer:[ ](battleContext,MoveExpression)=>{detail:{msg:string,data:any},transformedExpression:MoveExpression}// action
  //conditionalBehaviour:boolean // action(battleContext,MoveExpression):MoveExpression
  //specialBehaviour:boolean // action(battleContext,MoveExpression)
  steps: Array<MoveBehaviour>;
}
export type MoveBehaviour =
  | { type: 'GET'; key: string; value: string }
  | {
      type: 'CONDITION';
      check: string;
      then: MoveBehaviour[];
      else?: MoveBehaviour[];
    }
  | {
      type: 'APPLY';
      target: string;
      key: string;
      op: 'add' | 'sub' | 'set';
      value: string;
    }
  | { type: 'HIT'; action: string; key: string; value: string };

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
    description: '',
    level: 1,
    xp: 0,
    learned: MoveLearningStatus.LEARNED,
    steps: [
      {
        type: 'GET',
        key: 'reduction',
        value: '$target.stats.ENDURANCE.value * 0.1',
      },
      { type: 'GET', key: 'damage', value: '$source.stats.STRENGTH.value * 2' },
      { type: 'GET', key: 'hit', value: '$random' },
      {
        type: 'CONDITION',
        check: '$hit > 0.3',
        then: [
          {
            type: 'HIT',
            action: 'bonked',
            key: 'hit',
            value: '$damage - $reduction',
          },
        ],
        else: [
          { type: 'HIT', action: 'bruised', key: 'hit', value: '1' }, // glancing blow
        ],
      },
    ],
    power: 15,
    criticalChance: 0.25,
    criticalMultiplier: 2,
    hitChance: 0.75,
    overHitInfluence: 0.15,

    gaugeCostInfluenceOnFumble: 0,
    gaugeCostInfluenceOnDodge: 0.5,

    isMultiAttack: true,
    multiAttackMaxHits: 3,
    multiAttackEndOnMiss: false,
    multiAttackHitChanceOnHitInfluence: 0.975,
    multiAttackOverHitOnHitInfluence: 1.05,
    multiAttackPowerOnHitInfluence: 1,
    multiAttackCriticalChanceOnHitInfluence: 1,
    multiAttackCriticalOnHitInfluence: 1,

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

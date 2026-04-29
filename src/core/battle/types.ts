import { Actor } from '@/models/actor';
import { MoveExpression } from '@/models/move';
import { ChallangeDificultyXPInfluence } from '@/core/xp-calc';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export enum BATTLE_EVENT_TYPE {
  BEFORE_BATTLE_START,
  TURN_START,
  TURN_END,
  BEFORE_ACTION,
  AFTER_ACTION,
  ON_ARRIVAL,
  ON_AGGRESSION,
  //ON_HEAL,
  //ON_BUFF,
  //ON_DEBUFF,
  ON_SLAIN,
  ON_DEMISSE,
  //ON_FLEE_FAIL,
  ON_TEAM_RETREAT,
  AFTER_BATTLE_END,
}

export enum BattlePhase {
  BEFORE_BATTLE_START = 'before-battle-start',
  ON_ENTER_BATTLE = 'on-enter-battle',
  BEFORE_TURN_START = 'before-turn-start',
  TURN_START = 'turn-start',
  BEFORE_ACTION_SELECT = 'before-action-select',
  ON_ACTION_SELECT = 'on-action-select',
  BEFORE_ACTION_EXECUTE = 'before-action-execute',
  ON_ACTION_EXECUTE = 'on-action-execute',
  ON_HIT_LANDED = 'on-hit-landed',
  ON_DAMAGE_CALCULATED = 'on-damage-calculated',
  ON_TARGET_HIT = 'on-target-hit',
  AFTER_ACTION_EXECUTE = 'after-action-execute',
  ON_AGGRESSION = 'on-aggression',
  BEFORE_TURN_END = 'before-turn-end',
  TURN_END = 'turn-end',
  BEFORE_STATUS_RESOLVE = 'before-status-resolve',
  ON_STATUS_RESOLVE = 'on-status-resolve',
  AFTER_STATUS_RESOLVE = 'after-status-resolve',
  CHECK_BATTLE_END = 'check-battle-end',
  BEFORE_BATTLE_END = 'before-battle-end',
  AFTER_BATTLE_END = 'after-battle-end',
}

export enum BattleActionType {
  ATTACK = 'attack',
  WAIT = 'wait',
  FLEE = 'flee',
  DEFEND = 'defend',
  USE_ITEM = 'use-item',
  CONVINCE = 'convince',
}

export enum RelationshipBehaviour {
  ALLY = -1,
  PLAYER = 0,
  FOE = 1,
}

export enum ActionBehaviour {
  PLAYER = 0,
  AUTO = 1,
}

// ---------------------------------------------------------------------------
// Relationships & Teams
// ---------------------------------------------------------------------------

export interface TeamRelationship {
  team: BattleTeam;
  behaviour: RelationshipBehaviour;
}

export interface BattleTeam {
  id: string;
  name: string;
  key: string;
  actors: Array<BattleActor>;
  actionBehaviour: ActionBehaviour;
  isPlayer: boolean;
  relationships: Array<TeamRelationship>;
  /** @deprecated typo alias, use `disadvantage` */
  disavantage?: boolean;
  disadvantage?: boolean;
  adversarial: boolean;
  supporter: boolean;
}

export interface BattleGroup {
  members: Array<BattleActorSchema>;
  teamName: string;
  teamKey: string;
  actionBehaviour: ActionBehaviour;
  relationships: Array<{ teamKey: string; behaviour: RelationshipBehaviour }>;
  /** @deprecated typo alias, use `disadvantage` */
  disavantage?: boolean;
  disadvantage?: boolean;
  adversarial: boolean;
  supporter: boolean;
}

// ---------------------------------------------------------------------------
// Actors
// ---------------------------------------------------------------------------

export interface BattleActor {
  character: Actor;
  team: BattleTeam;
  speed: number;
  progress: number;
  isAuto: boolean;
  arrivalTurn: number;
  legendaryActions: number;
  dificulty: ChallangeDificultyXPInfluence;
  fainted: boolean;
  /** Chave de instrução serializável (ex: 'GET_RANDOM_ALIVE_ADVERSARY').
   *  Em runtime pode conter uma função legada durante a transição. */
  battleInstructions?: string | BattleInstruction;
}

export interface BattleActorSchema {
  character: Actor;
  fainted?: boolean;
  legendaryActions?: number;
  dificulty?: ChallangeDificultyXPInfluence;
  /** Chave de instrução serializável ou função de instrução (legado). */
  battleInstructions?: string | BattleInstruction;
}

// ---------------------------------------------------------------------------
// Actions & Slots
// ---------------------------------------------------------------------------

export interface BattleActionSlot {
  id: string;
  battleActor: BattleActor;
  speed: number;
  timeStamp: number;
  localProgress: number;
}

export interface BattleInstructionExpression {
  actionType: BattleActionType;
  move?: MoveExpression;
  self?: boolean;
  teamTargets?: Array<Array<BattleTeam>>;
  actorTargets?: Array<Array<BattleActor>>;
  battleActionTargets?: Array<Array<BattleActionSlot>>;
}

/** Tipo de função de instrução (transicional — será substituído por chaves de estratégia).
 *  O parâmetro `battle` usa `any` propositalmente para evitar
 *  dependência circular com `BattleContext` durante a transição. */
export type BattleInstruction = (battle: any, self: BattleActor) => BattleInstructionExpression;

// ---------------------------------------------------------------------------
// Turn & Events
// ---------------------------------------------------------------------------

export interface BattleEvent {
  type: BattlePhase;
  startingTurn: number;
  turnGapForRecurrence: number;
  calculatedOccurence: boolean;
  getNextTurnToOccur?: (state: BattleState) => number;
  nextTurnToOccur?: number;
  event: (
    state: BattleState,
    itself: BattleEvent
  ) => {
    stopBattle?: boolean;
    stopAll?: boolean;
    message?: string;
  };
}

export interface BattleScheme {
  groups: Array<BattleGroup>;
  introductionText?: string;
  endText?: string;
  events: Array<BattleEvent>;
  playerDisadvantage: boolean;
}

export interface BattleTurnInfo {
  turn: number;
  activeSlot?: BattleActionSlot;
  activeActor?: BattleActor;
  activeMove?: unknown;
  aimedActor?: BattleActor;
  isPlayer?: boolean;
  isMove?: boolean;
  isHeal?: boolean;
  moves: unknown[];
}

// ---------------------------------------------------------------------------
// Battle State
// ---------------------------------------------------------------------------

export interface BattleState {
  actionSlots: BattleActionSlot[];
  battleActors: BattleActor[];
  battleTeams: BattleTeam[];
  timeProgress: number;
  sets: number;
  turn: number;
  turnDuration: number;
  scheme: BattleScheme;
  events: BattleEvent[];
  data: Record<string, unknown>;
  fallbackEndBattle: boolean;
  turnInfo: BattleTurnInfo;
  turnInfoHistory: BattleTurnInfo[];
  actionSlotHistory: BattleActionSlot[];
  retreatedTeams: BattleTeam[];
}

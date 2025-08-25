import { Actor } from '../models/actor';
import { Context } from './context';
import { MessageHandler } from './message-handler';
import { BehaviorSubject, first } from 'rxjs';
import { CalcUtil } from 'src/utils/calc.utils';
import { STAT_KEY, StatCalc } from 'src/models/stats';
import {
  GAUGE_ABBREVIATION,
  GAUGE_KEYS,
  GaugeCalc,
  GaugeKey,
} from 'src/models/gauge';
import { GameDataService } from 'src/services/game-data.service';
import { SLIME_BUILDER } from 'src/data/builder/slime-builder';
import { COMPANY_POSITION } from 'src/models/company';
import {
  ChallangeDificultyXPInfluence,
  defaultXPGrowthPlan,
  XPGrowth,
} from './xp-calc';
import { showStaminaGauge } from 'src/utils/ui-elements.util';
import { MoveBonk, MoveExpression } from 'src/models/move';
import { BATTLE_INSTRUCTIONS } from './battle-instructions';
import { doAttack } from './battle-context.attack';

export interface BattleTeam {
  id: string;
  name: string;
  key: string;
  actors: Array<BattleActor>;
  actionBehaviour: number;
  isPlayer: boolean;
  relationships: Array<TeamRelationship>;
  disadvantage: boolean;
  adversarial: boolean;
  supporter: boolean;
}
interface TeamRelationship {
  team: BattleTeam;
  behaviour: number;
}
export interface BattleInstructionExpression {
  actionType: BattleActionType;
  move?: MoveExpression;
  self?: boolean;
  teamTargets?: Array<Array<BattleTeam>>;
  actorTargets?: Array<Array<BattleActor>>;
  battleActionTargets?: Array<Array<BattleActionSlot>>;
}
export interface BattleInstruction {
  (battle: BattleContext, self: BattleActor): BattleInstructionExpression;
}
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
  battleInstructions: BattleInstruction;
}
interface BattleActorSchema {
  character: Actor;
  fainted?: boolean;
  legendaryActions?: number;
  dificulty?: ChallangeDificultyXPInfluence;
  battleInstructions?: BattleInstruction;
}
export enum BattleActionType {
  FLEE,
  ATTACK,
  WAIT,
}
export interface BattleActionSlot {
  id: string;
  battleActor: BattleActor;
  speed: number;
  timeStamp: number;
  localProgress: number;
}
export interface BattleGroup {
  members: Array<BattleActorSchema>;
  teamName: string;
  teamKey: string;
  actionBehaviour: number;
  relationships: Array<{ teamKey: string; behaviour: number }>;
  disavantage: boolean;
  adversarial: boolean;
  supporter: boolean;
}

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
export interface BattleEvent {
  type: BATTLE_EVENT_TYPE;
  startingTurn: number;
  turnGapForRecurrence: number;
  calculatedOccurence: boolean;
  getNextTurnToOccur?: (battle: BattleContext) => number;
  nextTurnToOccur?: number;
  event: (
    battle: BattleContext,
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
  turn?: number;
  activeSlot?: BattleActionSlot;
  activeActor?: BattleActor;
  activeMove?: any; //'delayed' move or action, interface to be defined
  aimedActor?: BattleActor;
  isPlayer?: boolean;
  isMove?: boolean;
  isHeal?: boolean;
  moves: any[];
}

export class BattleContext extends Context {
  static TEAM_KEY_PLAYER: string = 'player';
  static DISADVANTAGE_INFLUENCE: number = 5;

  static RELATIONSHIP_BEHAVIOUR = {
    ALLY: -1,
    PLAYER: 0,
    FOE: 1,
  };
  static ACTION_BEHAVIOUR = {
    PLAYER: 0,
    AUTO: 1,
  };
  static WAIT_TIME = 1; //300;
  self: BattleContext = this;
  textPanel: HTMLElement;
  orderPanel: HTMLElement;
  actionMenu: HTMLElement;
  adversarialTeamsPanel: HTMLElement;
  allyTeamsPanel: HTMLElement;

  actionSlots: Array<BattleActionSlot> = [];
  battleActors: Array<BattleActor> = [];
  battleTeams: Array<BattleTeam> = [];
  timeProgress: number = 0;
  sets: number = 0;
  turn: number = 0;
  turnDuration: number = 0;
  scheme: BattleScheme;
  events: BattleEvent[] = [];
  data: any = {};
  //caso eventos sejam chamados fora do contexto
  //do unravel
  fallbackEndBattle: boolean = false;
  turnInfo: BattleTurnInfo = {
    turn: 0,
    moves: [],
  };
  turnInfoHistory: Array<BattleTurnInfo> = [];
  actionSlotHistory: Array<BattleActionSlot> = [];
  retreatedTeams: Array<BattleTeam> = [];

  onEndCallback: () => void = () => {};

  constructor(
    textPanel: HTMLElement,
    orderPanel: HTMLElement,
    adversarialTeamsPanel: HTMLElement,
    allyTeamsPanel: HTMLElement,
    actionMenu: HTMLElement,
    scheme: BattleScheme
  ) {
    super('battle');
    Context.ACTIVE_CONTEXTS[this.type] = this;

    this.textPanel = textPanel;
    this.orderPanel = orderPanel;
    this.adversarialTeamsPanel = adversarialTeamsPanel;
    this.allyTeamsPanel = allyTeamsPanel;
    this.actionMenu = actionMenu;
    this.scheme = scheme;
  }

  static build(
    textPanel: HTMLElement,
    orderPanel: HTMLElement,
    adversarialTeamsPanel: HTMLElement,
    allyTeamsPanel: HTMLElement,
    actionMenu: HTMLElement,
    scheme: BattleScheme
  ): BattleContext {
    return new BattleContext(
      textPanel,
      orderPanel,
      adversarialTeamsPanel,
      allyTeamsPanel,
      actionMenu,
      scheme
    );
  }
  async triggerEvents(type: BATTLE_EVENT_TYPE) {
    if (this.fallbackEndBattle) return this.fallbackEndBattle;

    if (type != BATTLE_EVENT_TYPE.AFTER_BATTLE_END) this.updateTeamInfoUI();
    const eventsOfType = this.events.filter(
      (event) => event.type == type && event.startingTurn <= this.turn
    );
    if (eventsOfType.length == 0) return;
    eventsOfType
      .filter((event) => event.calculatedOccurence == true)
      .forEach((event) => {
        if (event.getNextTurnToOccur)
          event.nextTurnToOccur = event.getNextTurnToOccur(this);
      });

    const eventsToTrigger = eventsOfType.filter(
      (event) =>
        event.nextTurnToOccur == this.turn ||
        event.startingTurn == this.turn ||
        (this.turn - event.startingTurn) % event.turnGapForRecurrence == 0
    );

    let stop: boolean = false;
    for (const event of eventsToTrigger) {
      await BattleContext.delay(50);
      const eventReturn = event.event(this, event);
      stop =
        stop || eventReturn.stopAll == true || eventReturn.stopBattle == true;
      this.fallbackEndBattle = this.fallbackEndBattle || stop;
      if (eventReturn.message) this.writeMessage(eventReturn.message);
      if (eventReturn.stopAll) break;
    }

    return stop;
  }
  doTeams() {
    const groups: Array<BattleGroup> = this.scheme.groups;
    const company = GameDataService.GAME_DATA.companyData;

    groups
      .filter((group) => group.relationships.length == 0)
      .forEach((group) => {
        group.relationships.push({
          teamKey: BattleContext.TEAM_KEY_PLAYER,
          behaviour: BattleContext.RELATIONSHIP_BEHAVIOUR.FOE,
        });
      });

    const playerTeam: BattleGroup = {
      members: company.members.map(
        (member: { character: Actor; positions: COMPANY_POSITION[] }) => {
          return {
            character: member.character,
            fainted: false,
            legendaryActions: 0,
            dificulty: ChallangeDificultyXPInfluence.NORMAL,
            battleInstructions: BATTLE_INSTRUCTIONS.GET_RANDOM_ALIVE_ADVERSARY,
          };
        }
      ),
      teamName: company.title || 'company',
      teamKey: BattleContext.TEAM_KEY_PLAYER,
      actionBehaviour: BattleContext.ACTION_BEHAVIOUR.PLAYER,
      disavantage: this.scheme.playerDisadvantage,
      supporter: true,
      adversarial: false,
      relationships: groups
        .filter(
          (group) =>
            group.relationships.filter(
              (rel) => rel.teamKey == BattleContext.TEAM_KEY_PLAYER
            ).length > 0
        )
        .map((group) => {
          return {
            teamKey: group.teamKey,
            behaviour: group.relationships.filter(
              (rel) => rel.teamKey == BattleContext.TEAM_KEY_PLAYER
            )[0].behaviour,
          };
        }),
    };
    groups.unshift(playerTeam);
    this.battleTeams = groups.map((group) => {
      const isPlayer =
        group.actionBehaviour == BattleContext.ACTION_BEHAVIOUR.PLAYER;

      const battleTeam: BattleTeam = {
        id: CalcUtil.genId(),
        name: group.teamName,
        key: group.teamKey,
        actionBehaviour: group.actionBehaviour,
        isPlayer: isPlayer,
        actors: [],
        relationships: [],
        supporter: group.supporter,
        adversarial: group.adversarial,
        disadvantage: group.disavantage,
      };

      battleTeam.actors = group.members.map(
        (actorSchema: BattleActorSchema) => {
          const character = actorSchema.character;
          const battleActor: BattleActor = {
            team: battleTeam,
            character: character,
            legendaryActions: actorSchema.legendaryActions || 0,
            dificulty:
              actorSchema.dificulty || ChallangeDificultyXPInfluence.NORMAL,
            fainted: actorSchema.fainted || character.isFainted(),
            battleInstructions:
              actorSchema.battleInstructions ||
              BATTLE_INSTRUCTIONS.GET_RANDOM_ALIVE_ADVERSARY,
            progress: battleTeam.disadvantage
              ? BattleContext.DISADVANTAGE_INFLUENCE
              : 0,
            speed: character.getNormalSpeed(),
            isAuto: isPlayer
              ? character.data.configuration.autoBattle == true
              : true,
            arrivalTurn: this.turn,
          };
          return battleActor;
        }
      );
      return battleTeam;
    });
    this.battleTeams.forEach((team: BattleTeam, index: number) => {
      const group = groups[index];
      team.relationships = group.relationships.map((rel) => {
        return {
          team: this.getTeamByKey(rel.teamKey),
          behaviour: rel.behaviour,
        };
      });
    });
    this.battleActors = [];
    this.battleTeams.forEach((team) =>
      team.actors.forEach((actor) => this.battleActors.push(actor))
    );
  }

  onEnd(callback: () => void) {
    this.onEndCallback = callback;
  }

  async start() {
    this.doTeams();
    this.events = this.scheme.events;
    /**
     * Alterar pra mudar behaviour da batalha conforme desejado
     * e ou idealizado
     */
    this.turnDuration = this.battleActors[0].speed * 2.25;
    this.doActionList();

    this.battleActors.sort((actorA: BattleActor, actorB: BattleActor) => {
      return actorB.speed - actorA.speed;
    });

    /**
     * DO BATTLE
     */

    if (await this.triggerEvents(BATTLE_EVENT_TYPE.BEFORE_BATTLE_START)) return;
    const message = this.scheme.introductionText || 'A battle starts!';
    this.textPanel.innerHTML = `<p>${message}</p>`;
    BattleContext.delay().then(() => this.unravelBattle());
  }
  doActionList() {
    const activeActors = this.battleActors
      .filter((actor: BattleActor) => !actor.character.isFainted())
      .sort((a: BattleActor, b: BattleActor) => b.speed - a.speed);
    const actionSlots: BattleActionSlot[] = [];
    //let startingTurn = this.turn;
    //if (this.actionSlots.length > 0) { }
    //let runs = 0;
    activeActors.forEach((actor: BattleActor) => {
      while (actor.progress < this.turnDuration * (10 + this.turn)) {
        const speed = actor.character.getActionSpeed();
        //me da valor pequeno pra quem tem velocidade alta
        //o oposto é real
        const progress = this.turnDuration - speed;
        Array.from({
          length: 1 + actor.legendaryActions,
        }).forEach((_) => {
          actionSlots.push({
            id: CalcUtil.genId(),
            battleActor: actor,
            speed: speed,
            timeStamp: actor.progress + progress,
            localProgress: progress,
          });
        });
        actor.progress += progress;
      }
    });
    actionSlots.sort(
      (a: BattleActionSlot, b: BattleActionSlot) => a.timeStamp - b.timeStamp
    );
    actionSlots.forEach((actionSlot: BattleActionSlot, index: number) => {
      this.actionSlotToElementUI(actionSlot);
    });
    this.actionSlots.push(...actionSlots);
    this.setOrderActionListUI();
  }
  removeActorFromBattle(actorToRemove: BattleActor) {
    this.actionSlots = this.actionSlots.filter(
      (actionSlot: BattleActionSlot) =>
        actionSlot.battleActor.character.id != actorToRemove.character.id
    );
    const elements = document.getElementsByClassName(
      `turn-slot-${this.toNameKey(actorToRemove.team.name)}-${this.toNameKey(
        actorToRemove.character.name
      )}`
    );
    Array.from(elements).forEach((el) => {
      el.remove();
    });
  }

  async addNewBattleActor(
    timeStamp: number,
    actorSchema: BattleActorSchema,
    team: BattleTeam
  ) {
    const char = actorSchema.character;
    const dificulty =
      actorSchema.dificulty || ChallangeDificultyXPInfluence.NORMAL;
    const legendaryActions = actorSchema.legendaryActions || 0;

    const actorProgress = this.turnDuration - char.getActionSpeed();
    const isPlayer = team.isPlayer;
    const actor: BattleActor = {
      team: team,
      character: char,
      legendaryActions: legendaryActions,
      dificulty: dificulty,
      fainted: false,
      battleInstructions:
        actorSchema.battleInstructions ||
        BATTLE_INSTRUCTIONS.GET_RANDOM_ALIVE_ADVERSARY,
      progress:
        timeStamp +
        actorProgress +
        (team.disadvantage ? BattleContext.DISADVANTAGE_INFLUENCE : 1),
      speed: char.getNormalSpeed(),
      isAuto: isPlayer ? char.data.configuration.autoBattle == true : true,
      arrivalTurn: this.turn,
    };
    team.actors.push(actor);
    this.battleActors.push(actor);
    this.battleActors.sort((actorA: BattleActor, actorB: BattleActor) => {
      return actorB.speed - actorA.speed;
    });
    while (actor.progress < this.turnDuration * (10 + this.turn)) {
      const speed = actor.character.getActionSpeed();
      const progress = this.turnDuration - speed;
      const actionSlot: BattleActionSlot = {
        id: CalcUtil.genId(),
        battleActor: actor,
        speed: speed,
        timeStamp: actor.progress + progress,
        localProgress: progress,
      };
      this.actionSlots.push(actionSlot);
      actor.progress += progress;
      this.actionSlotToElementUI(actionSlot);
    }
    this.actionSlots.sort((a, b) => a.timeStamp - b.timeStamp);
    this.setOrderActionListUI();

    if (await this.triggerEvents(BATTLE_EVENT_TYPE.ON_ARRIVAL)) return;
  }
  async unravelBattle() {
    const actionSlot: BattleActionSlot | undefined = this.actionSlots.shift();
    if (actionSlot == undefined) throw 'Populate the battle slots ya fucker';
    await this.retreatFoelessTeams();
    this.turn++;

    this.turnInfo = { turn: this.turn, moves: [] };

    this.doActionList();

    const battleActor: BattleActor = actionSlot.battleActor;
    const char: Actor = actionSlot.battleActor.character;
    const team: BattleTeam = battleActor.team;

    this.turnInfo.activeActor = battleActor;
    this.turnInfo.isPlayer = team.isPlayer;
    this.turnInfo.activeSlot = actionSlot;

    if (await this.triggerEvents(BATTLE_EVENT_TYPE.TURN_START)) return;

    if (await this.triggerEvents(BATTLE_EVENT_TYPE.BEFORE_ACTION)) return;
    let isAggression = false;

    if (!team.isPlayer || battleActor.isAuto) {
      this.turnInfo.isHeal = false;
      await doAttack(
        this,
        char,
        BATTLE_INSTRUCTIONS.GET_RANDOM_ALIVE_ADVERSARY(
          this,
          this.turnInfo.activeActor
        )
      );
      isAggression = true;
    } else {
      this.turnInfo.isHeal = false;
      const battleInstructionExpression: BattleInstructionExpression =
        await this.chooseAction(char);
      await doAttack(this, char, battleInstructionExpression);
      isAggression = true;
    }

    this.removeActionFromUI(actionSlot);
    await this.markFaintedActors();
    if (isAggression) {
      if (await this.triggerEvents(BATTLE_EVENT_TYPE.ON_AGGRESSION)) return;
    }
    if (await this.triggerEvents(BATTLE_EVENT_TYPE.AFTER_ACTION)) return;

    if (await this.triggerEvents(BATTLE_EVENT_TYPE.TURN_END)) return;
    await this.retreatFoelessTeams();

    this.turnInfoHistory.push(this.turnInfo);
    this.actionSlotHistory.push(actionSlot);

    await this.doEndOrNextTurn(team);
  }
  writeMessage(message: string) {
    const newP = document.createElement('p');
    newP.innerHTML += message;
    this.textPanel.insertBefore(newP, this.textPanel.childNodes[0]);
  }
  isThereAnyAnimosity() {
    let isThereAnimosity = false;
    this.battleTeams
      .filter(
        (team) =>
          team.actors.filter((actor) => !actor.character.isFainted()).length > 0
      )
      .forEach((team) => {
        isThereAnimosity =
          isThereAnimosity ||
          team.relationships.filter(
            (rel) =>
              rel.behaviour >= BattleContext.RELATIONSHIP_BEHAVIOUR.FOE &&
              rel.team.actors.filter((actor) => !actor.character.isFainted())
                .length > 0
          ).length > 0;
      });
    return isThereAnimosity;
  }
  isThereAnyAdversaryAlive(team: BattleTeam): boolean {
    //Unilateral behaviour cannot ever happen, it may be assimetric but never unilateral
    const enemyTeams: Array<BattleTeam> = this.getEnemyTeams(team);

    const adversarialTeams: BattleTeam[] = this.getAdversarialTeams(team);

    const detrimentalTeams: BattleTeam[] = this.getDetrimentalTeams(team);

    const allAdvTeams = [
      ...enemyTeams,
      ...adversarialTeams,
      ...detrimentalTeams,
    ];

    const allBitches: Array<BattleActor> = allAdvTeams
      .map((team) => {
        return team.actors;
      })
      .reduce((previous: BattleActor[], current: BattleActor[]) => {
        return previous.concat(current);
      });

    return (
      allBitches.filter((battleActor) => {
        return !battleActor.character.isFainted();
      }).length > 0
    );
  }
  getTeamsWithAliveActors(teamCluster: Array<BattleTeam>): Array<BattleTeam> {
    return teamCluster.filter((team) => this.doTeamHasAliveActors(team));
  }
  doTeamHasAliveActors(team: BattleTeam): boolean {
    return team.actors.filter((a) => !a.character.isFainted()).length > 0;
  }
  chooseAction(char: Actor): Promise<BattleInstructionExpression> {
    const promise = new Promise<BattleInstructionExpression>((resolve) => {
      const doShitButton = document.createElement('button');
      doShitButton.classList.add('ui-game-button');
      doShitButton.innerHTML = 'Do Shit ' + char.name + '!';
      doShitButton.addEventListener('click', () => {
        this.actionMenu.innerHTML = '';
        if (this.turnInfo.activeActor) {
          const instruction: BattleInstructionExpression =
            BATTLE_INSTRUCTIONS.GET_RANDOM_ALIVE_ADVERSARY(
              this,
              this.turnInfo.activeActor
            );
          resolve(instruction);
        } else {
          throw 'WTF dude!!  Set the turn BattleActor!!';
        }
      });
      this.actionMenu.appendChild(doShitButton);
    });

    return promise;
  }

  async markFaintedActors() {
    const activeActor = this.turnInfo.activeActor;

    const toFell = this.battleActors.filter((actor) => {
      return actor.character.isFainted() && !actor.fainted;
    });
    for (const actorToFell of toFell) {
      actorToFell.fainted = true;
      const isActiveActor =
        activeActor?.character.id == actorToFell.character.id || false;
      const charToFell = actorToFell.character;

      if (isActiveActor) {
        this.removeActorFromBattle(actorToFell);
        await BattleContext.delay().then(() => {
          this.writeMessage(
            `${this.turn} - ${charToFell.name} met his demise.`
          );
        });
        if (await this.triggerEvents(BATTLE_EVENT_TYPE.ON_DEMISSE)) return;
      } else {
        this.removeActorFromBattle(actorToFell);

        await BattleContext.delay().then(() => {
          this.writeMessage(`${this.turn} - ${charToFell.name} was felled.`);
        });
        if (await this.triggerEvents(BATTLE_EVENT_TYPE.ON_SLAIN)) return;
        //gay xp and shit
        if (activeActor && activeActor.team.isPlayer) {
          const playerChar = activeActor.character;
          const xpGrowth = XPGrowth.get(playerChar.data.core.growthPlan);
          let earnedXp = xpGrowth.xpGain(playerChar.level, charToFell.level);
          const xpToUp = xpGrowth.xpToUp(playerChar.level);
          if (playerChar.data.core.xp + earnedXp > xpToUp) {
            const remaningXP = playerChar.data.core.xp + earnedXp - xpToUp;
            const earnedRemainingXP = Math.ceil(remaningXP / 10);
            playerChar.data.core.xp = xpToUp + earnedRemainingXP;
            earnedXp = Math.max(earnedXp - remaningXP + earnedRemainingXP, 1);
          }
          playerChar.data.core.xp += earnedXp;

          await BattleContext.delay().then(() => {
            this.writeMessage(
              `${this.turn} - ${playerChar.name} earned ${earnedXp}XP.`
            );
          });
        } else if (actorToFell.team.isPlayer) {
          const xpGrowth = XPGrowth.get(charToFell.data.core.growthPlan);
          //its reverse, so you lose less XP if the mosnter is stronger
          //and a lot if it is weaker
          let lostXp = Math.ceil(
            xpGrowth.xpGain(charToFell.level, charToFell.level + 1) / 10
          );
          charToFell.data.core.xp -= lostXp;
          await BattleContext.delay().then(() => {
            this.writeMessage(
              `${this.turn} - ${charToFell.name} lost ${lostXp}XP.`
            );
          });
        }
      }
    }
  }
  async retreatFoelessTeams() {
    let wasTeamRemoved = false;
    let teamsRemoved: Array<BattleTeam> = [];
    let actorRemoved: Array<BattleActor> = [];
    do {
      wasTeamRemoved = false;
      let teamsToRemove: Array<BattleTeam> = [];
      this.battleTeams
        .filter((team) => !team.isPlayer)
        .forEach((currentTeam) => {
          const isThereAnyAdversaryAlive =
            this.isThereAnyAdversaryAlive(currentTeam);
          if (!isThereAnyAdversaryAlive) {
            console.log(
              `retreatFoeLessTeams().isThereAnyAdversaryAlive??${isThereAnyAdversaryAlive}`
            );
          }
          if (!isThereAnyAdversaryAlive) teamsToRemove.push(currentTeam);
        });
      teamsToRemove.forEach((currentTeam) => {
        //If not player then reatreat team
        const hasRelationshipWithPlayer =
          currentTeam.relationships.filter((rel) => rel.team.isPlayer).length >
          0;
        console.log(
          `retreatFoeLessTeams().hasRelationshipWithPlayer??${hasRelationshipWithPlayer}`
        );
        if (!hasRelationshipWithPlayer) {
          teamsRemoved.push(currentTeam);
          actorRemoved = actorRemoved.concat(currentTeam.actors);
          this.battleTeams = this.battleTeams.filter(
            (team) => team.id != currentTeam.id
          );
          this.battleActors = this.battleActors.filter(
            (actor) => actor.team.id != currentTeam.name
          );
          wasTeamRemoved = true;
        }
      });
    } while (wasTeamRemoved);
    for (const team of teamsRemoved) {
      this.retreatedTeams.push(team);
      await BattleContext.delay(50);
      this.writeMessage(`${this.turn} - ${team.name} retreated from battle...`);
      await this.triggerEvents(BATTLE_EVENT_TYPE.ON_TEAM_RETREAT);
    }
  }
  async doEndOrNextTurn(currentTeam: BattleTeam) {
    //check if theres any foe alive

    const isThereAnimosity = this.isThereAnyAnimosity();

    const playerTeam = this.battleTeams.filter(
      (team) => team.actionBehaviour == BattleContext.ACTION_BEHAVIOUR.PLAYER
    )[0];

    const thereIsAnyPlayerAlive =
      playerTeam.actors.filter((actor) => !actor.character.isFainted()).length >
      0;

    let thereIsAnyAllyAlive = false;
    const playerAlliesTeam: Array<BattleTeam> = playerTeam.relationships
      .filter(
        (rel) => rel.behaviour == BattleContext.RELATIONSHIP_BEHAVIOUR.ALLY
      )
      .map((rel) => rel.team);
    playerAlliesTeam.forEach((allyTeam) => {
      if (thereIsAnyAllyAlive) return;
      thereIsAnyAllyAlive =
        allyTeam.actors.filter((actor) => !actor.character.isFainted()).length >
        0;
    });

    if (!thereIsAnyPlayerAlive && !thereIsAnyAllyAlive) {
      //*
      // If theres no ally to withnesses, the battle ends.
      // Usually this the end when the player fells
      // */
      let message = '';
      if (playerAlliesTeam && playerAlliesTeam.length > 0) {
        const allies = playerAlliesTeam.join(', ');
        message = `The battle ended. ${playerTeam.name} and the allies ${allies} got dragged by the mist...`;
      } else {
        message = `The battle ended. ${playerTeam.name} got dragged by the mist...`;
      }
      //put them back up and tear down their mana and stamina
      playerTeam.actors.forEach((actor) => {
        Object.keys(GAUGE_KEYS).forEach((gaugeKey) => {
          var gauge = actor.character.gauges[gaugeKey as GaugeKey];
          gauge.consumed = Math.ceil(
            GaugeCalc.getValue(actor.character, gauge) * 0.975
          );
        });
      });
      //Set max consumed stamina for company
      GameDataService.GAME_DATA.companyData.stamina.consumed =
        GaugeCalc.getValue(
          GameDataService.GAME_DATA.companyData,
          GameDataService.GAME_DATA.companyData.stamina
        );
      GameDataService.GAME_DATA.time += 60 * 4;
      const mapScene = window.game.scene.getScene('map-scene');
      const mapUIScene = window.game.scene.getScene('map-ui-scene');
      mapScene.doColorFilter();
      showStaminaGauge();
      mapUIScene.showCurrentTime();
      if (this.scheme.endText) message += '<br/>' + this.scheme.endText;
      await BattleContext.delay().then(() => {
        this.writeMessage(message);
      });

      if (await this.triggerEvents(BATTLE_EVENT_TYPE.AFTER_BATTLE_END)) return;

      await BattleContext.delay().then(() => {
        this.onEndCallback();
      });
    } else if (isThereAnimosity) {
      //*
      // If battle to be had stuff continues
      // */
      await BattleContext.delay().then(() => this.unravelBattle());
    } else {
      //do retreat before ending turn so it is easier to manage
      //*
      // If player wons OR unrelated team wins
      // */
      const alliesTeam: Array<BattleTeam> = currentTeam.relationships
        .filter(
          (rel) => rel.behaviour == BattleContext.RELATIONSHIP_BEHAVIOUR.ALLY
        )
        .map((rel) => rel.team);

      let message = '';
      if (alliesTeam && alliesTeam.length > 0) {
        const allies = alliesTeam.map((team) => team.name).join(', ');
        message = `${currentTeam.name} and the allies ${allies} won!`;
      } else {
        message = `${currentTeam.name} won!`;
      }

      await BattleContext.delay().then(() => {
        this.writeMessage(message);
      });
      this.onEndCallback();
    }
  }
  static delay(ms?: number): Promise<any> {
    return new Promise((res) => setTimeout(res, ms || BattleContext.WAIT_TIME));
  }
  toNameKey(name: string) {
    return name.trim().toLocaleLowerCase().replaceAll(' ', '-');
  }
  getTeamByName(teamName: string): BattleTeam {
    return this.battleTeams.filter((team) => team.name == teamName)[0];
  }
  getTeamByKey(teamKey: string): BattleTeam {
    return this.battleTeams.filter((team) => team.key == teamKey)[0];
  }
  getTeamByID(teamId: string): BattleTeam {
    return this.battleTeams.filter((team) => team.id == teamId)[0];
  }
  getAllyTeams(team: BattleTeam): Array<BattleTeam> {
    const alliesTeam: Array<BattleTeam> = team.relationships
      .filter(
        (rel) => rel.behaviour == BattleContext.RELATIONSHIP_BEHAVIOUR.ALLY
      )
      .map((rel) => rel.team);
    return alliesTeam;
  }
  //supportive are allies of allies
  getSupportiveTeams(team: BattleTeam): Array<BattleTeam> {
    const alliesTeam: Array<BattleTeam> = this.getAllyTeams(team);
    let searchedIdsTeam: Array<string> = alliesTeam.map((a) => a.id);
    let searchedTeams: Array<BattleTeam> = alliesTeam;
    let wasTeamAdded = false;
    let supportiveTeams: Array<BattleTeam> = [];
    do {
      wasTeamAdded = false;
      let teamsToAdd: Array<BattleTeam> = [];
      for (let allyToSearch of searchedTeams) {
        teamsToAdd = teamsToAdd.concat(
          this.getAllyTeams(allyToSearch).filter(
            (b) => searchedIdsTeam.indexOf(b.id) == -1
          )
        );
      }
      if (teamsToAdd && teamsToAdd.length > 0) {
        wasTeamAdded = true;
        searchedTeams = teamsToAdd;
        supportiveTeams = supportiveTeams.concat(teamsToAdd);
        searchedIdsTeam = searchedIdsTeam.concat(teamsToAdd.map((a) => a.id));
      }
    } while (wasTeamAdded);
    return supportiveTeams;
  }
  //Enemies of Foes
  getBeneficialTeams(team: BattleTeam): Array<BattleTeam> {
    const enemiesTeam: Array<BattleTeam> = this.getEnemyTeams(team);
    const alliesTeam: Array<BattleTeam> = this.getAllyTeams(team);
    const supportivesTeam: Array<BattleTeam> = this.getSupportiveTeams(team);
    let searchedIdsTeam: Array<string> = enemiesTeam.map((a) => a.id);
    searchedIdsTeam = searchedIdsTeam.concat(alliesTeam.map((a) => a.id));
    searchedIdsTeam = searchedIdsTeam.concat(supportivesTeam.map((a) => a.id));
    let beneficialTeams: Array<BattleTeam> = [];
    let teamsToAdd: Array<BattleTeam> = [];
    for (let enemyToSearch of enemiesTeam) {
      teamsToAdd = teamsToAdd.concat(
        this.getEnemyTeams(enemyToSearch).filter(
          (b) => searchedIdsTeam.indexOf(b.id) == -1
        )
      );
    }
    beneficialTeams = beneficialTeams.concat(teamsToAdd);
    return beneficialTeams;
  }
  getEnemyTeams(team: BattleTeam): Array<BattleTeam> {
    const enemiesTeam: Array<BattleTeam> = team.relationships
      .filter(
        (rel) => rel.behaviour == BattleContext.RELATIONSHIP_BEHAVIOUR.FOE
      )
      .map((rel) => rel.team);
    return enemiesTeam;
  }
  //adversarial are allies of foes
  getAdversarialTeams(team: BattleTeam): Array<BattleTeam> {
    const enemiesTeam: Array<BattleTeam> = this.getEnemyTeams(team);
    let searchedIdsTeam: Array<string> = enemiesTeam.map((a) => a.id);
    let searchedTeams: Array<BattleTeam> = enemiesTeam;
    let wasTeamAdded = false;
    let adversarialTeams: Array<BattleTeam> = [];
    do {
      wasTeamAdded = false;
      let teamsToAdd: Array<BattleTeam> = [];
      for (let allyToSearch of searchedTeams) {
        teamsToAdd = teamsToAdd.concat(
          this.getAllyTeams(allyToSearch).filter(
            (b) => searchedIdsTeam.indexOf(b.id) == -1
          )
        );
      }
      if (teamsToAdd && teamsToAdd.length > 0) {
        wasTeamAdded = true;
        searchedTeams = teamsToAdd;
        adversarialTeams = adversarialTeams.concat(teamsToAdd);
        searchedIdsTeam = searchedIdsTeam.concat(teamsToAdd.map((a) => a.id));
      }
    } while (wasTeamAdded);
    return adversarialTeams;
  }
  //Enemies of allies
  getDetrimentalTeams(team: BattleTeam): Array<BattleTeam> {
    const enemiesTeam: Array<BattleTeam> = this.getEnemyTeams(team);
    const alliesTeam: Array<BattleTeam> = this.getAllyTeams(team);
    const adversarialTeam: Array<BattleTeam> = this.getAdversarialTeams(team);
    let searchedIdsTeam: Array<string> = enemiesTeam.map((a) => a.id);
    searchedIdsTeam = searchedIdsTeam.concat(alliesTeam.map((a) => a.id));
    searchedIdsTeam = searchedIdsTeam.concat(adversarialTeam.map((a) => a.id));
    let detrimentalTeams: Array<BattleTeam> = [];
    let teamsToAdd: Array<BattleTeam> = [];
    for (let allyToSearch of alliesTeam) {
      teamsToAdd = teamsToAdd.concat(
        this.getEnemyTeams(allyToSearch).filter(
          (b) => searchedIdsTeam.indexOf(b.id) == -1
        )
      );
    }
    detrimentalTeams = detrimentalTeams.concat(teamsToAdd);
    return detrimentalTeams;
  }
  async removeActionFromUI(action: BattleActionSlot) {
    this.removeElFromUI(document.getElementById(action.id));
  }
  actionSlotToElementUI(actionSlot: BattleActionSlot) {
    const slotP = document.createElement('p');
    slotP.classList.add(
      `turn-slot-${this.toNameKey(
        actionSlot.battleActor.team.name
      )}-${this.toNameKey(actionSlot.battleActor.character.name)}`
    );
    const message = `${actionSlot.battleActor.character.name}`;
    slotP.innerHTML = message;
    slotP.id = actionSlot.id;
    this.orderPanel.appendChild(slotP);
  }
  async updateTeamInfoUI() {
    const adversarialTeams = this.battleTeams.filter((team) => !team.supporter);
    const supporterTeams = this.battleTeams.filter(
      (team) => team.supporter == true
    );

    //this.allyTeamsPanel.innerHTML = '';
    //this.adversarialTeamsPanel.innerHTML = '';
    adversarialTeams.forEach((team) => {
      doTeamHolderUI(team, this.adversarialTeamsPanel);
    });
    supporterTeams.forEach((team) => {
      doTeamHolderUI(team, this.allyTeamsPanel);
    });

    function doTeamHolderUI(team: BattleTeam, teamHolderPanel: HTMLElement) {
      let teamPanel = document.getElementById(team.id);
      let teamPanelExists = true;
      if (!teamPanel) {
        teamPanelExists = false;
        teamPanel = document.createElement('div');
        teamPanel.id = team.id;
      }
      teamPanel.classList.add('team');
      if (team.supporter) teamPanel.classList.add('supporter');
      if (team.adversarial) teamPanel.classList.add('adversarial');
      if (
        team.relationships.filter(
          (rel) =>
            rel.team.isPlayer &&
            rel.behaviour >= BattleContext.RELATIONSHIP_BEHAVIOUR.FOE
        ).length > 0
      ) {
        teamPanel.classList.add('foe');
      }
      if (
        team.relationships.filter(
          (rel) =>
            rel.team.isPlayer &&
            rel.behaviour == BattleContext.RELATIONSHIP_BEHAVIOUR.ALLY
        ).length > 0
      ) {
        teamPanel.classList.add('ally');
      }
      if (team.isPlayer) {
        teamPanel.classList.add('player');
      }

      team.actors.forEach((actor) => {
        const chara = actor.character;
        let actorEl = document.getElementById(actor.character.id);
        let actorElPanelExists = true;
        if (!actorEl) {
          actorElPanelExists = false;
          actorEl = document.createElement('div');
          actorEl.id = actor.character.id;
          const actorText = document.createElement('p');
          actorEl.appendChild(actorText);
        }
        actorEl.getElementsByTagName('p')[0].innerHTML = `<strong>${
          chara.name
        }</strong> ${GaugeCalc.getCurrentValueString(
          chara,
          chara.gauges.VITALITY
        )}`;

        actorEl.classList.add('actor');
        if (chara.isFainted()) {
          actorEl.classList.add('defeated');
        }

        if (!actorElPanelExists) teamPanel.appendChild(actorEl);
      });
      if (!teamPanelExists) teamHolderPanel.appendChild(teamPanel);
    }

    this.retreatedTeams.forEach((team) => {
      const id = team.id;
      const el = document.getElementById(id);
      if (el) {
      }
    });
  }
  setOrderActionListUI() {
    this.actionSlots.forEach((actionSlot: BattleActionSlot, index: number) => {
      const el = document.getElementById(actionSlot.id);
      if (el) el.style.order = `${index}`;
    });
  }
  showHitTakenOnTargetUI() {
    this.turnInfo.moves.forEach((move) => {
      move.targets.forEach((target: any) => {
        const aimedChar = target.aimedChar;
        const actor = aimedChar;
        const targetPanel = document.getElementById(actor.id);
        if (targetPanel) {
          targetPanel.classList.remove('hit-taken');
          targetPanel.classList.add('hit-taken');
        }
      });
    });
  }
  removeElFromUI(el: HTMLElement | null) {
    if (el) {
      el.classList.remove('shrink-slide-out');
      el.classList.add('shrink-slide-out');
      setTimeout(() => {
        el.remove();
      }, 300);
    }
  }
}

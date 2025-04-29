import { Figure } from '../models/figure';
import { Context } from './context';
import { MessageHandler } from './message-handler';
import { BehaviorSubject, first } from 'rxjs';
import { CalcUtil } from 'src/utils/calc.utils';
import { STAT_KEY } from 'src/models/stats';
import { GAUGE_KEYS } from 'src/models/gauge';
import { GameDataService } from 'src/services/game-data.service';
import { SLIME_BUILDER } from 'src/data/builder/slime-builder';
import { COMPANY_POSITION } from 'src/models/company';
import { defaultXPGrowthPlan, XPGrowth } from './xp-calc';
import { showStaminaGauge } from 'src/utils/ui-elements.util';

interface BattleTeam {
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
interface BattleActor {
  character: Figure;
  team: BattleTeam;
  speed: number;
  progress: number;
  isAuto: boolean;
  arrivalTurn: number;
}
interface BattleActionSlot {
  id: string;
  battleActor: BattleActor;
  speed: number;
  timeStamp: number;
  localProgress: number;
}
export interface BattleGroup {
  members: Array<Figure>;
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
  //ON_DEMISSE,
  //ON_FLEE_FAIL,
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
  static WAIT_TIME = 300;
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
  };

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
        (member: { character: Figure; positions: COMPANY_POSITION[] }) => {
          return member.character;
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

      battleTeam.actors = group.members.map((character: Figure) => {
        const battleActor: BattleActor = {
          team: battleTeam,
          character: character,
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
      });
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
  getTeamByName(teamName: string): BattleTeam {
    return this.battleTeams.filter((team) => team.name == teamName)[0];
  }
  getTeamByKey(teamKey: string): BattleTeam {
    return this.battleTeams.filter((team) => team.key == teamKey)[0];
  }
  getTeamByID(teamId: string): BattleTeam {
    return this.battleTeams.filter((team) => team.id == teamId)[0];
  }
  onEnd(callback: () => void) {
    this.onEndCallback = callback;
  }
  async updateTeamInfoUI() {
    const adversarialTeams = this.battleTeams.filter(
      (team) => team.adversarial == true
    );
    const supporterTeams = this.battleTeams.filter(
      (team) => team.supporter == true
    );

    this.allyTeamsPanel.innerHTML = '';
    this.adversarialTeamsPanel.innerHTML = '';
    adversarialTeams.forEach((team) => {
      const teamPanel = document.createElement('div');
      teamPanel.classList.add('team');
      teamPanel.classList.add('adversarial');
      if (
        team.relationships.filter(
          (rel) =>
            rel.team.isPlayer &&
            rel.behaviour >= BattleContext.RELATIONSHIP_BEHAVIOUR.FOE
        ).length > 0
      ) {
        teamPanel.classList.add('foe');
      }
      team.actors.forEach((actor) => {
        console.log(actor.character.name);
        const actorEl = document.createElement('div');
        const actorText = document.createElement('p');
        actorText.innerHTML = `<strong>${
          actor.character.name
        }</strong> ${actor.character
          .getGauge(GAUGE_KEYS.VITALITY)
          .getCurrentValue()
          .toFixed(0)}/${actor.character
          .getGauge(GAUGE_KEYS.VITALITY)
          .getModValue()
          .toFixed(0)}`;
        actorEl.classList.add('actor');
        if (
          actor.character.getGauge(GAUGE_KEYS.VITALITY).getCurrentValue() <= 0
        ) {
          actorEl.classList.add('defeated');
        }
        actorEl.appendChild(actorText);
        teamPanel.appendChild(actorEl);
      });
      this.adversarialTeamsPanel.appendChild(teamPanel);
    });
    supporterTeams.forEach((team) => {
      const teamPanel = document.createElement('div');
      teamPanel.classList.add('team');
      teamPanel.classList.add('supporter');
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
        const actorEl = document.createElement('div');
        const actorText = document.createElement('p');
        actorText.innerHTML = `<strong>${
          actor.character.name
        }</strong> ${actor.character
          .getGauge(GAUGE_KEYS.VITALITY)
          .getCurrentValue()
          .toFixed(0)}/${actor.character
          .getGauge(GAUGE_KEYS.VITALITY)
          .getModValue()
          .toFixed(0)}`;
        actorEl.classList.add('actor');
        if (
          actor.character.getGauge(GAUGE_KEYS.VITALITY).getCurrentValue() <= 0
        ) {
          actorEl.classList.add('defeated');
        }
        actorEl.appendChild(actorText);
        teamPanel.appendChild(actorEl);
      });
      this.allyTeamsPanel.appendChild(teamPanel);
    });
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
        actionSlots.push({
          id: CalcUtil.genId(),
          battleActor: actor,
          speed: speed,
          timeStamp: actor.progress + progress,
          localProgress: progress,
        });
        actor.progress += progress;
      }
    });
    actionSlots.sort(
      (a: BattleActionSlot, b: BattleActionSlot) => a.timeStamp - b.timeStamp
    );
    actionSlots.forEach((actionSlot: BattleActionSlot, index: number) => {
      this.actionSlotToElement(actionSlot);
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
  actionSlotToElement(actionSlot: BattleActionSlot) {
    const slotP = document.createElement('p');
    slotP.classList.add(
      `turn-slot-${this.toNameKey(
        actionSlot.battleActor.team.name
      )}-${this.toNameKey(actionSlot.battleActor.character.name)}`
    );
    const message = `${actionSlot.timeStamp.toFixed(0)} - ${
      actionSlot.battleActor.character.name
    }`;
    slotP.innerHTML = message;
    slotP.id = actionSlot.id;
    this.orderPanel.appendChild(slotP);
  }
  removeActionFromUI(action: BattleActionSlot) {
    document.getElementById(action.id)?.remove();
  }
  setOrderActionListUI() {
    this.actionSlots.forEach((actionSlot: BattleActionSlot, index: number) => {
      const el = document.getElementById(actionSlot.id);
      if (el) el.style.order = `${index}`;
    });
  }
  async addNewBattleActor(
    timeStamp: number,
    character: Figure,
    team: BattleTeam
  ) {
    const actorProgress = this.turnDuration - character.getActionSpeed();
    const isPlayer = team.isPlayer;
    const actor: BattleActor = {
      team: team,
      character: character,
      progress:
        timeStamp +
        actorProgress +
        (team.disadvantage ? BattleContext.DISADVANTAGE_INFLUENCE : 1),
      speed: character.getNormalSpeed(),
      isAuto: isPlayer ? character.data.configuration.autoBattle == true : true,
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
      this.actionSlotToElement(actionSlot);
    }
    this.actionSlots.sort((a, b) => a.timeStamp - b.timeStamp);
    this.setOrderActionListUI();

    if (await this.triggerEvents(BATTLE_EVENT_TYPE.ON_ARRIVAL)) return;
  }
  async unravelBattle() {
    const actionSlot: BattleActionSlot | undefined = this.actionSlots.shift();
    if (actionSlot == undefined) throw 'Populate the battle slots ya fucker';

    this.turn++;

    this.turnInfo.turn = this.turn;

    this.doActionList();

    const battleActor: BattleActor = actionSlot.battleActor;
    const char: Figure = actionSlot.battleActor.character;
    const team: BattleTeam = battleActor.team;

    this.turnInfo.activeActor = battleActor;
    this.turnInfo.isPlayer = team.isPlayer;
    this.turnInfo.activeSlot = actionSlot;

    if (await this.triggerEvents(BATTLE_EVENT_TYPE.TURN_START)) return;

    const alliesTeam: Array<BattleTeam> = team.relationships
      .filter(
        (rel) => rel.behaviour == BattleContext.RELATIONSHIP_BEHAVIOUR.ALLY
      )
      .map((rel) => rel.team);

    const enemyTeams: Array<BattleTeam> = team.relationships
      .filter(
        (rel) => rel.behaviour >= BattleContext.RELATIONSHIP_BEHAVIOUR.FOE
      )
      .sort((relA, relB) => relB.behaviour - relA.behaviour)
      .map((rel) => rel.team);

    const aimedTeam = enemyTeams[0];

    //add some Relevant Decision Making RDM in future, for now, get random
    const aliveAimedBattleActors = aimedTeam.actors.filter(
      (actor: BattleActor) => !actor.character.isFainted()
    );
    const aimedBattleActor =
      aliveAimedBattleActors[
        Math.floor(aliveAimedBattleActors.length * Math.random())
      ];

    this.turnInfo.aimedActor = aimedBattleActor;

    const aimedChar = aimedBattleActor.character;

    if (await this.triggerEvents(BATTLE_EVENT_TYPE.BEFORE_ACTION)) return;
    let isAggression = false;
    if (!team.isPlayer || battleActor.isAuto) {
      this.turnInfo.isHeal = false;
      this.doAttack(char, aimedChar);
      isAggression = true;
    } else {
      this.turnInfo.isHeal = false;
      const res: any = await this.chooseAction(char);
      this.doAttack(char, aimedChar);
      isAggression = true;
    }
    this.removeActionFromUI(actionSlot);

    if (isAggression) {
      if (await this.triggerEvents(BATTLE_EVENT_TYPE.ON_AGGRESSION)) return;
    }
    if (await this.triggerEvents(BATTLE_EVENT_TYPE.AFTER_ACTION)) return;

    if (aimedChar.isFainted()) {
      this.removeActorFromBattle(aimedBattleActor);

      await BattleContext.delay().then(() => {
        this.writeMessage(`${this.turn} - ${aimedChar.name} was felled.`);
      });
      if (await this.triggerEvents(BATTLE_EVENT_TYPE.ON_SLAIN)) return;
      //gay xp and shit
      if (team.isPlayer) {
        const xpGrowth = XPGrowth.get(char.data.core.growthPlan);
        let earnedXp = xpGrowth.xpGain(char.level, aimedChar.level);
        const xpToUp = xpGrowth.xpToUp(char.level);
        if (char.data.core.xp + earnedXp > xpToUp) {
          const remaingXP = char.data.core.xp + earnedXp - xpToUp;
          const earnedRemainingXP = Math.ceil(remaingXP / 10);
          char.data.core.xp = xpToUp + earnedRemainingXP;
          earnedXp = Math.max(earnedXp - remaingXP + earnedRemainingXP, 1);
        } else {
          char.data.core.xp += earnedXp;
        }
        await BattleContext.delay().then(() => {
          this.writeMessage(
            `${this.turn} - ${char.name} earned ${earnedXp}XP.`
          );
        });
      } else if (aimedTeam.isPlayer) {
        const xpGrowth = XPGrowth.get(char.data.core.growthPlan);
        //its reverse, so you lose less XP if the mosnter is stronger
        //and a lot if it is weaker
        let lostXp = Math.ceil(
          xpGrowth.xpGain(char.level, aimedChar.level) / 10
        );
        aimedChar.data.core.xp -= lostXp;
        await BattleContext.delay().then(() => {
          this.writeMessage(
            `${this.turn} - ${aimedChar.name} lost ${lostXp}XP.`
          );
        });
      }
    }
    if (await this.triggerEvents(BATTLE_EVENT_TYPE.TURN_END)) return;

    this.doEndOrNextTurn(team, enemyTeams, alliesTeam);
  }
  writeMessage(message: string) {
    const newP = document.createElement('p');
    newP.innerHTML += message;
    this.textPanel.insertBefore(newP, this.textPanel.childNodes[0]);
  }
  isThereAnyAdversaryAlive(
    enemyTeams: BattleTeam[],
    alliesTeam: BattleTeam[]
  ): boolean {
    //Unilateral behaviour cannot ever happen, it may be assimetric but never unilateral
    const adversarialTeams: BattleTeam[] = enemyTeams.concat([]);
    alliesTeam.forEach((allyTeam) => {
      adversarialTeams.concat(
        allyTeam.relationships
          .filter(
            (rel) => rel.behaviour >= BattleContext.RELATIONSHIP_BEHAVIOUR.FOE
          )
          .map((rel) => rel.team)
      );
    });

    const adversarialTeamsString = adversarialTeams
      .map((battleTeam) => battleTeam.name)
      .join('|');

    return (
      this.battleActors.filter((battleActor) => {
        return (
          adversarialTeamsString.indexOf(battleActor.team.name) > -1 &&
          !battleActor.character.isFainted()
        );
      }).length > 0
    );
  }

  chooseAction(char: Figure): Promise<any> {
    const promise = new Promise((resolve) => {
      const doShitButton = document.createElement('button');
      doShitButton.classList.add('ui-game-button');
      doShitButton.innerHTML = 'Do Shit ' + char.name + '!';
      doShitButton.addEventListener('click', () => {
        this.actionMenu.innerHTML = '';
        resolve('Lol');
      });
      this.actionMenu.appendChild(doShitButton);
    });

    return promise;
  }
  async doAttack(char: Figure, aimedChar: Figure) {
    const leveDiff = char.level - aimedChar.level;
    const leveDiffOposing = leveDiff * -1;

    //do moves in the future, for now simple damage
    const stronk = char.getStat(STAT_KEY.STRENGTH).getInfluenceValue();
    const damage = 10 * (1 + stronk / 10) * (1 + leveDiff / 10);

    const destronk = aimedChar.getStat(STAT_KEY.ENDURANCE).getInfluenceValue();
    const reduction = destronk * (1 + leveDiffOposing / 10);
    const calculedDamage = damage - reduction;
    const effectiveDamate = calculedDamage >= 1 ? calculedDamage : 1;
    aimedChar.getGauge(GAUGE_KEYS.VITALITY).consumed += effectiveDamate;
    const message = `${this.turn} - ${char.name} bonked ${
      aimedChar.name
    } for ${effectiveDamate.toFixed(0)}dmg!`;
    this.writeMessage(message);
  }
  async doEndOrNextTurn(
    currentTeam: BattleTeam,
    enemyTeams: Array<BattleTeam>,
    alliesTeam: Array<BattleTeam>
  ) {
    //check if theres any foe alive

    const isThereAnyAdversaryAlive = this.isThereAnyAdversaryAlive(
      enemyTeams,
      alliesTeam
    );

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
        actor.character.gauges.forEach((gauge) => {
          gauge.consumed = Math.ceil(gauge.getModValue() * 0.975);
        });
      });
      //Set max consumed stamina for company
      GameDataService.GAME_DATA.companyData.stamina.consumed =
        GameDataService.GAME_DATA.companyData.stamina.getModValue();
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
    } else if (isThereAnyAdversaryAlive) {
      //*
      // If battle to be had stuff continues
      // */
      await BattleContext.delay().then(() => this.unravelBattle());
    } else {
      //*
      // If player wons OR unrelated team wins
      // */

      let message = '';
      if (alliesTeam && alliesTeam.length > 0) {
        const allies = alliesTeam.map((team) => team.name).join(', ');
        message = `${currentTeam.name} and the allies ${allies} won!`;
      } else {
        message = `${currentTeam.name} won!`;
      }
      //If not player then reatreat team
      if (
        !currentTeam.isPlayer &&
        currentTeam.relationships.filter((rel) => rel.team.isPlayer).length == 0
      ) {
        message += ' They retreated from the battle.';
        if (this.scheme.endText) message += '<br/>' + this.scheme.endText;
        BattleContext.delay().then(() => {
          this.battleActors = this.battleActors.filter(
            (actor) => actor.team.name != currentTeam.name
          );
          this.battleTeams = this.battleTeams.filter(
            (battleTeam) => battleTeam.name != currentTeam.name
          );
          alliesTeam.forEach((allyTeam) => {
            this.battleActors = this.battleActors.filter(
              (actor) => actor.team.name != allyTeam.name
            );
            this.battleTeams = this.battleTeams.filter(
              (battleTeam) => battleTeam.name != allyTeam.name
            );
          });
          this.doActionList();
        });
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
}

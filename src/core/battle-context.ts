import { Figure } from '../models/figure';
import { Context } from './context';
import { MessageHandler } from './message-handler';
import { BehaviorSubject, first } from 'rxjs';
import { Injectable } from '@angular/core';
import { CalcUtil } from 'src/utils/calc.utils';
import { STAT_KEY } from 'src/models/stats';
import { GAUGE_KEYS } from 'src/models/gauge';
import { GameDataService } from 'src/services/game-data.service';
import { SLIME_BUILDER } from 'src/data/builder/slime-builder';
import { COMPANY_POSITION } from 'src/models/company';
import { group } from '@angular/animations';

interface BattleTeam {
  id: string;
  name: string;
  key: string;
  actors: Array<BattleActor>;
  actionBehaviour: number;
  isPlayer: boolean;
  relationships: Array<TeamRelationship>;
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
}
export class BattleContext extends Context {
  static TEAM_KEY_PLAYER: string = 'player';

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
  actionSlots: Array<BattleActionSlot> = [];
  battleActors: Array<BattleActor> = [];
  battleTeams: Array<BattleTeam> = [];
  timeProgress: number = 0;
  sets: number = 0;
  turn: number = 0;
  turnDuration: number = 0;
  groups: Array<BattleGroup> = [];
  onEndCallback: () => void = () => {};
  constructor(
    textPanel: HTMLElement,
    orderPanel: HTMLElement,
    actionMenu: HTMLElement,
    groups: Array<BattleGroup>
  ) {
    super('battle');
    Context.ACTIVE_CONTEXTS[this.type] = this;

    this.textPanel = textPanel;
    this.orderPanel = orderPanel;
    this.actionMenu = actionMenu;
    this.groups = groups;
  }
  static build(
    textPanel: HTMLElement,
    orderPanel: HTMLElement,
    actionMenu: HTMLElement,
    groups: Array<BattleGroup>
  ): BattleContext {
    return new BattleContext(textPanel, orderPanel, actionMenu, groups);
  }
  doTeams() {
    const groups: Array<BattleGroup> = this.groups;
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
      };
      battleTeam.actors = group.members.map((character: Figure) => {
        const battleActor: BattleActor = {
          team: battleTeam,
          character: character,
          progress: 0,
          speed: character.getNormalSpeed(),
          isAuto: isPlayer ? character.data.autoBattle == true : true,
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
  start() {
    this.doTeams();

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

    this.textPanel.innerHTML = `<p>A battle starts!</p>`;
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
    slotP.innerHTML = `${actionSlot.timeStamp.toFixed(0)} - ${
      actionSlot.battleActor.character.name
    }`;
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
  addNewBattleActor(timeStamp: number, character: Figure, team: BattleTeam) {
    const actorProgress = this.turnDuration - character.getActionSpeed();
    const isPlayer = team.isPlayer;
    const actor: BattleActor = {
      team: team,
      character: character,
      progress: timeStamp + actorProgress,
      speed: character.getNormalSpeed(),
      isAuto: isPlayer ? character.data.autoBattle == true : true,
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
  }
  async unravelBattle() {
    const actionSlot: BattleActionSlot | undefined = this.actionSlots.shift();
    if (actionSlot == undefined) throw 'Populate the battle slots ya fucker';

    this.turn++;

    /*
    
    //transform this into a scheme event that is recived from parameter
    //make pretty and shit, mwah mwah! xoxoxoxo

    if (this.turn == 3) {
      const slime = SLIME_BUILDER.getASlime(2);
      slime.name =
        'XSlime ' +
        'ABCDEFGHIJKLMNOPQRSTVUWXYZ'.split('')[Math.floor(Math.random() * 26)];
      this.addNewBattleActor(
        actionSlot.timeStamp,
        slime,
        this.getTeamByKey('foes')
      );

      //this.actionSlots.map((slot)=>slot)
      BattleContext.delay().then(() => {
        const newP = document.createElement('p');
        newP.innerHTML += `${this.turn} - ${slime.name} arrived in the battle.`;
        this.textPanel.insertBefore(newP, this.textPanel.childNodes[0]);
      });
    }
    */

    this.doActionList();

    const battleActor: BattleActor = actionSlot.battleActor;
    const char: Figure = actionSlot.battleActor.character;
    const team: BattleTeam = battleActor.team;

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

    const aimedChar = aimedBattleActor.character;

    if (!team.isPlayer || battleActor.isAuto) {
      this.doAttack(char, aimedChar);
    } else {
      const res: any = await this.chooseAction(char);
      console.log(res);
      this.doAttack(char, aimedChar);
    }
    this.removeActionFromUI(actionSlot);

    if (aimedChar.isFainted()) {
      //gay xp and shit
      await BattleContext.delay().then(() => {
        const newP = document.createElement('p');
        newP.innerHTML += `${this.turn} - ${aimedChar.name} was felled.`;
        this.textPanel.insertBefore(newP, this.textPanel.childNodes[0]);
      });
      this.removeActorFromBattle(aimedBattleActor);
    }

    this.doEndOrNextTurn(team, enemyTeams, alliesTeam);
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
  doAttack(char: Figure, aimedChar: Figure) {
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
    const newP = document.createElement('p');
    newP.innerHTML += `${this.turn} - ${char.name} bonked ${
      aimedChar.name
    } for ${effectiveDamate.toFixed(0)}dmg!`;
    this.textPanel.insertBefore(newP, this.textPanel.childNodes[0]);
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
      await BattleContext.delay().then(() => {
        const newP = document.createElement('p');
        newP.innerHTML = message;
        this.textPanel.insertBefore(newP, this.textPanel.childNodes[0]);
      });
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
        const newP = document.createElement('p');
        newP.innerHTML = message;
        this.textPanel.insertBefore(newP, this.textPanel.childNodes[0]);
      });

      this.onEndCallback();
    }
  }
  static delay(ms?: number): Promise<any> {
    return new Promise((res) => setTimeout(res, BattleContext.WAIT_TIME));
  }
  toNameKey(name: string) {
    return name.trim().toLocaleLowerCase().replaceAll(' ', '-');
  }
}

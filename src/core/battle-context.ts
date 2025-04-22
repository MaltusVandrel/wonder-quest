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

interface TeamRelationship {
  team: string;
  behaviour: number;
  relationships: Array<{ team: string; aggresion: number }>;
}
interface BattleTeam {
  name: string;
  actors: Array<BattleActor>;
  actionBehaviour: number;
  isPlayer: boolean;
  relationships: Array<{ team: BattleTeam; behaviour: number }>;
}

interface BattleActor {
  character: Figure;
  team: BattleTeam;
  speed: number;
  progress: number;
  overallProgress: number;
}
interface BattleActionSlot {
  battleActor: BattleActor;
  speed: number;
  timeStamp: number;
}

export class BattleContext extends Context {
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
  actionSlots: Array<BattleActionSlot> = [];
  teamRelationships: Array<TeamRelationship> = [];
  battleActors: Array<BattleActor> = [];
  battleTeams: Array<BattleTeam> = [];
  timeProgress: number = 0;
  sets: number = 0;
  turn: number = 0;
  turnDuration: number = 0;
  onEndCallback: () => void = () => {};
  constructor(textPanel: HTMLElement, orderPanel: HTMLElement) {
    super('battle');
    Context.ACTIVE_CONTEXTS[this.type] = this;

    this.textPanel = textPanel;
    this.orderPanel = orderPanel;
  }
  static build(textPanel: HTMLElement, orderPanel: HTMLElement): BattleContext {
    return new BattleContext(textPanel, orderPanel);
  }
  doTeams(
    groups: Array<{
      members: Array<Figure>;
      teamName: string;
      actionBehaviour: number;
      relationships: Array<{ teamName: string; behaviour: number }>;
    }>
  ) {
    this.battleTeams = groups.map((group) => {
      const battleTeam: BattleTeam = {
        name: group.teamName,
        actionBehaviour: group.actionBehaviour,
        isPlayer:
          group.actionBehaviour == BattleContext.ACTION_BEHAVIOUR.PLAYER,
        actors: [],
        relationships: [],
      };
      battleTeam.actors = group.members.map((character: Figure) => {
        const battleActor: BattleActor = {
          team: battleTeam,
          character: character,
          progress: 0,
          overallProgress: 0,
          speed: character.getNormalSpeed(),
        };
        return battleActor;
      });
      return battleTeam;
    });
    this.battleTeams.forEach((team: BattleTeam, index: number) => {
      const group = groups[index];
      team.relationships = group.relationships.map((rel) => {
        return {
          team: this.getTeamByName(rel.teamName),
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
  onEnd(callback: () => void) {
    this.onEndCallback = callback;
  }
  start() {
    const company = GameDataService.GAME_DATA.companyData;

    const friend = company.members[0].character;
    const letters = 'ABC'.split('');
    const slime = SLIME_BUILDER.getASlime(1);
    slime.name = 'Slime A';
    const friends = [friend];
    const foes: Figure[] = [slime];
    foes; /*
    letters.forEach((letter) => {
      const slime = SLIME_BUILDER.getASlime(1);
      slime.name = 'Slime ' + letter;
      foes.push(slime);
    });
    letters.forEach((letter) => {
      const slime = SLIME_BUILDER.getASlime(1);
      slime.name = 'Slome ' + letter;
      friends.push(slime);
    });
*/

    this.doTeams([
      {
        teamName: 'friends',
        members: friends,
        actionBehaviour: BattleContext.ACTION_BEHAVIOUR.PLAYER,
        relationships: [
          {
            teamName: 'foes',
            behaviour: BattleContext.RELATIONSHIP_BEHAVIOUR.FOE,
          },
        ],
      },
      {
        teamName: 'foes',
        members: foes,
        actionBehaviour: BattleContext.ACTION_BEHAVIOUR.AUTO,
        relationships: [
          {
            teamName: 'friends',
            behaviour: BattleContext.RELATIONSHIP_BEHAVIOUR.FOE,
          },
        ],
      },
    ]);

    /**
     * DO ORDER
     */
    this.turnDuration = this.battleActors[0].speed * 2.25;
    this.doActionList();

    //remove action from list
    //this.showActionListUI();
    //coloca o mais rapido na frente
    this.battleActors.sort((actorA: BattleActor, actorB: BattleActor) => {
      return actorB.speed - actorA.speed;
    });

    /**
     * DO BATTLE
     */

    this.textPanel.innerHTML = `<p>Foes attack ${friend.name}!</p>`;
    BattleContext.delay().then(() => this.unravelBattle());
  }
  doActionList() {
    const activeActors = this.battleActors
      .filter((actor: BattleActor) => !actor.character.isFainted())
      .sort((a: BattleActor, b: BattleActor) => b.speed - a.speed);
    const actionSlots: BattleActionSlot[] = [];
    let startingTurn = this.turn;
    if (this.actionSlots.length > 0) {
    }
    let runs = 0;
    activeActors.forEach((actor: BattleActor) => {
      while (actor.progress < this.turnDuration * (10 + this.turn)) {
        const speed = actor.character.getActionSpeed();
        const progress = this.turnDuration - speed;
        actionSlots.push({
          battleActor: actor,
          speed: speed,
          timeStamp: actor.progress + progress,
        });
        actor.progress += progress;
      }
    });
    actionSlots.sort(
      (a: BattleActionSlot, b: BattleActionSlot) => a.timeStamp - b.timeStamp
    );
    actionSlots.forEach((actionSlot: BattleActionSlot) => {
      const nameP = document.createElement('p');
      nameP.classList.add(
        `turn-slot-${this.toNameKey(
          actionSlot.battleActor.team.name
        )}-${this.toNameKey(actionSlot.battleActor.character.name)}`
      );
      nameP.innerHTML = `${actionSlot.timeStamp.toFixed(0)} - ${
        actionSlot.battleActor.character.name
      }`;
      this.orderPanel.appendChild(nameP);
    });
    this.actionSlots.push(...actionSlots);
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

  removeFirstFromActionListUI() {
    Array.from(this.orderPanel.children)[0].remove();
  }

  addNewBattleActor(
    activeSlot: BattleActionSlot,
    actualSet: number,
    character: Figure,
    team: BattleTeam
  ) {}
  async unravelBattle() {
    const actionSlot: BattleActionSlot | undefined = this.actionSlots.shift();
    if (actionSlot == undefined) throw 'Populate the battle slots ya fucker';

    this.removeFirstFromActionListUI();
    this.turn++;
    /*
    if (this.turn == 10) {
      const slime = SLIME_BUILDER.getASlime(9);
      slime.name =
        'XSlime ' +
        'ABCDEFGHIJKLMNOPQRSTVUWXYZ'.split('')[Math.floor(Math.random() * 26)];
      this.addNewBattleActor(
        actionSlot,
        slime,
        this.getTeamByName('foes')
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

    this.doAttack(char, aimedChar);

    if (aimedChar.isFainted()) {
      //gay xp and shit
      BattleContext.delay().then(() => {
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
  doAttack(char: Figure, aimedChar: Figure) {
    const leveDiff = char.level - aimedChar.level;
    const leveDiffOposing = leveDiff * -1;

    //do moves in the future, for now simple damage
    const stronk = char.getStat(STAT_KEY.STRENGTH).getInfluenceValue();
    const damage = 30 * (1 + stronk / 10) * (1 + leveDiff / 10);

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
      BattleContext.delay().then(() => {
        const newP = document.createElement('p');
        newP.innerHTML = message;
        this.textPanel.insertBefore(newP, this.textPanel.childNodes[0]);
      });
      BattleContext.delay().then(() => {
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

      BattleContext.delay().then(() => {
        const newP = document.createElement('p');
        newP.innerHTML = message;
        this.textPanel.insertBefore(newP, this.textPanel.childNodes[0]);
      });

      BattleContext.delay().then(() => {
        this.onEndCallback();
      });
    }
  }
  static delay(ms?: number): Promise<any> {
    return new Promise((res) => setTimeout(res, BattleContext.WAIT_TIME));
  }
  toNameKey(name: string) {
    return name.trim().toLocaleLowerCase().replaceAll(' ', '-');
  }
}

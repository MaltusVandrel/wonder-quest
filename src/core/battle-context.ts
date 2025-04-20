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
  self: BattleContext = this;
  textPanel: HTMLElement;
  orderPanel: HTMLElement;
  actionSlots: Array<BattleActionSlot> = [];
  teamRelationships: Array<TeamRelationship> = [];
  battleActors: Array<BattleActor> = [];
  battleTeams: Array<BattleTeam> = [];
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
      relationships: Array<{ teamName: string; behaviour: number }>;
    }>
  ) {
    this.battleTeams = groups.map((group) => {
      const battleTeam: BattleTeam = {
        name: group.teamName,
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
    const slimeA = SLIME_BUILDER.getASlime(2);
    slimeA.name = 'Slime Jason';
    const slimeB = SLIME_BUILDER.getASlime(2);
    slimeB.name = 'Slime Carlos';

    const friends = [friend];
    const foes = [slimeA, slimeB];
    this.doTeams([
      {
        teamName: 'friends',
        members: friends,
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
    this.doActionList();
    //coloca o mais rapido na frente
    this.battleActors.sort((actorA: BattleActor, actorB: BattleActor) => {
      return actorB.speed - actorA.speed;
    });

    /**
     * DO BATTLE
     */

    this.textPanel.innerHTML = `<p>Foes attack ${friend.name}!</p>`;
    BattleContext.delay(300).then(() => this.unravelBattle());
  }
  doActionList() {
    //usa a maior speed como referencia
    const treadmill = this.battleActors[0].speed;
    this.actionSlots = [];
    let rollingIndex = 0;
    do {
      const battleActor = this.battleActors[rollingIndex];
      const actionSpeed = battleActor.character.getActionSpeed();
      battleActor.progress += actionSpeed;
      battleActor.overallProgress += actionSpeed;
      if (battleActor.progress >= treadmill) {
        battleActor.progress -= treadmill;
        this.actionSlots.push({
          battleActor: battleActor,
          speed: actionSpeed,
          timeStamp: battleActor.overallProgress,
        });
      }
      rollingIndex++;
      if (rollingIndex >= this.battleActors.length) rollingIndex = 0;
    } while (this.actionSlots.length < 60);
  }
  showActionList(activeSlot: BattleActionSlot) {
    this.orderPanel.innerHTML = '';
    if (activeSlot) {
      const nameP = document.createElement('p');
      nameP.innerHTML = `<strong>${activeSlot.battleActor.character.name}</strong>`;
      this.orderPanel.appendChild(nameP);
    }
    this.actionSlots.forEach((actionSlot: BattleActionSlot, index: number) => {
      const nameP = document.createElement('p');
      nameP.innerHTML = `${index + 1} - ${
        actionSlot.battleActor.character.name
      }`;
      this.orderPanel.appendChild(nameP);
    });
  }
  async unravelBattle() {
    const actionSlot: BattleActionSlot | undefined = this.actionSlots.shift();
    if (actionSlot == undefined) throw 'Populate the battle slots ya fucker';

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

    //remove action from list
    this.showActionList(actionSlot);

    const aimedTeam = enemyTeams[0];

    //add some Relevant Decision Making RDM in future, for now, get random
    const aimedBattleActor =
      aimedTeam.actors[Math.floor(aimedTeam.actors.length * Math.random())];
    const aimedChar = aimedBattleActor.character;

    this.doAttack(char, aimedChar);
    if (aimedChar.isFainted()) {
      //gay xp and shit
      BattleContext.delay(300).then(
        () =>
          (this.textPanel.innerHTML += `<p>${aimedChar.name} was felled.</p>`)
      );
      this.doActionList();
    }
    //check if theres any foe alive

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

    let thereIsAnyAdversaryAlive =
      this.battleActors.filter((battleActor) => {
        return (
          adversarialTeamsString.indexOf(battleActor.team.name) > -1 &&
          !battleActor.character.isFainted()
        );
      }).length > 0;

    let thereIsAnyPlayerAlive =
      team.actors.filter((actor) => !actor.character.isFainted()).length > 0;

    let thereIsAnyAllyAlive = false;

    alliesTeam.forEach((allyTeam) => {
      if (thereIsAnyAllyAlive) return;
      thereIsAnyAllyAlive =
        allyTeam.actors.filter((actor) => !actor.character.isFainted()).length >
        0;
    });
    if (!thereIsAnyPlayerAlive && !thereIsAnyAllyAlive) {
      //está entrando aqui erroneamente
      let message = '';

      if (alliesTeam && alliesTeam.length > 0) {
        const allies = alliesTeam.join(', ');
        message = `The battle ended. ${team.name} and the allies ${allies} got dragged by the mist...`;
      } else {
        message = `The battle ended. ${team.name} got dragged by the mist...`;
      }
      BattleContext.delay(300).then(
        () => (this.textPanel.innerHTML += `<p>${message}</p>`)
      );
      BattleContext.delay(300).then(() => {
        this.onEndCallback();
      });
    } else if (thereIsAnyAdversaryAlive) {
      await BattleContext.delay(300).then(() => this.unravelBattle());
    } else {
      let message = '';
      if (alliesTeam && alliesTeam.length > 0) {
        const allies = alliesTeam.map((team) => team.name).join(', ');
        message = `${team.name} and the allies ${allies} won!`;
      } else {
        message = `${team.name} won!`;
      }
      //checar se foi player ou inimigo. ha uma chance de um grupo neutro simplesmente ganhar a vazar
      //mas ainda ter animosidade entre player e outrs times
      //tambem tem que refazer a listagem de ordem após a queda e ou retorno de alguem
      BattleContext.delay(300).then(
        () => (this.textPanel.innerHTML += `<p>${message}</p>`)
      );
      BattleContext.delay(300).then(() => {
        this.onEndCallback();
      });
    }
  }
  doAttack(char: Figure, aimedChar: Figure) {
    const leveDiff = char.level - aimedChar.level;
    const leveDiffOposing = leveDiff * -1;

    //do moves in the future, for now simple damage
    const stronk = char.getStat(STAT_KEY.STRENGTH).getInfluenceValue();
    const damage = 50 * (1 + stronk / 10) * (1 + leveDiff / 10);

    const destronk = aimedChar.getStat(STAT_KEY.ENDURANCE).getInfluenceValue();
    const reduction = destronk * (1 + leveDiffOposing / 10);
    const calculedDamage = damage - reduction;
    const effectiveDamate = calculedDamage >= 1 ? calculedDamage : 1;
    aimedChar.getGauge(GAUGE_KEYS.VITALITY).consumed += effectiveDamate;

    this.textPanel.innerHTML += `<p>${char.name} bonked ${aimedChar.name} for ${effectiveDamate}dmg!</p>`;
  }
  static delay(ms: number): Promise<any> {
    return new Promise((res) => setTimeout(res, ms));
  }
}

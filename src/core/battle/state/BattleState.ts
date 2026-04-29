import { Actor } from '@/models/actor';
import { COMPANY_POSITION } from '@/models/company';
import { GameDataService } from '@/services/game-data.service';
import { CalcUtil } from '@/utils/calc.utils';
import { ChallangeDificultyXPInfluence, XPGrowth } from '@/core/xp-calc';

import {
  ActionBehaviour,
  BattleActionSlot,
  BattleActor,
  BattleActorSchema,
  BattleEvent,
  BattleGroup,
  BattlePhase,
  BattleScheme,
  BattleTeam,
  BattleTurnInfo,
  RelationshipBehaviour,
  TeamRelationship,
} from '@/core/battle/types';

export class BattleState {
  static TEAM_KEY_PLAYER = 'player';
  static DISADVANTAGE_INFLUENCE = 5;
  static RELATIONSHIP_BEHAVIOUR = { ALLY: -1, PLAYER: 0, FOE: 1 };
  static ACTION_BEHAVIOUR = { PLAYER: 0, AUTO: 1 };
  static WAIT_TIME = 1;

  actionSlots: BattleActionSlot[] = [];
  battleActors: BattleActor[] = [];
  battleTeams: BattleTeam[] = [];
  turn = 0;
  turnDuration = 0;
  scheme: BattleScheme;
  events: BattleEvent[] = [];
  turnInfo: BattleTurnInfo = { turn: 0, moves: [] };
  turnInfoHistory: BattleTurnInfo[] = [];
  actionSlotHistory: BattleActionSlot[] = [];
  retreatedTeams: BattleTeam[] = [];
  data: Record<string, unknown> = {};
  fallbackEndBattle = false;
  timeProgress = 0;
  sets = 0;

  constructor(scheme: BattleScheme) {
    this.scheme = scheme;
  }

  initialize(): void {
    const groups: BattleGroup[] = this.scheme.groups.map((group) => ({
      ...group,
      relationships: [...group.relationships],
    }));
    const company = GameDataService.GAME_DATA.companyData;

    groups
      .filter((group) => group.relationships.length === 0)
      .forEach((group) => {
        group.relationships.push({
          teamKey: BattleState.TEAM_KEY_PLAYER,
          behaviour: RelationshipBehaviour.FOE,
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
            battleInstructions: 'GET_RANDOM_ALIVE_ADVERSARY',
          };
        }
      ),
      teamName: company.title || 'company',
      teamKey: BattleState.TEAM_KEY_PLAYER,
      actionBehaviour: ActionBehaviour.PLAYER,
      disadvantage: this.scheme.playerDisadvantage,
      supporter: true,
      adversarial: false,
      relationships: groups
        .filter(
          (group) =>
            group.relationships.filter((rel) => rel.teamKey === BattleState.TEAM_KEY_PLAYER)
              .length > 0
        )
        .map((group) => {
          return {
            teamKey: group.teamKey,
            behaviour: group.relationships.filter(
              (rel) => rel.teamKey === BattleState.TEAM_KEY_PLAYER
            )[0].behaviour,
          };
        }),
    };

    groups.unshift(playerTeam);

    this.battleTeams = groups.map((group) => {
      const isPlayer = group.actionBehaviour === ActionBehaviour.PLAYER;

      const battleTeam: BattleTeam = {
        id: CalcUtil.genId(),
        name: group.teamName,
        key: group.teamKey,
        actionBehaviour: group.actionBehaviour,
        isPlayer,
        actors: [],
        relationships: [],
        supporter: group.supporter,
        adversarial: group.adversarial,
        disadvantage: group.disadvantage,
      };

      battleTeam.actors = group.members.map((actorSchema: BattleActorSchema) => {
        const character = actorSchema.character;
        const battleActor: BattleActor = {
          team: battleTeam,
          character,
          legendaryActions: actorSchema.legendaryActions || 0,
          dificulty: actorSchema.dificulty || ChallangeDificultyXPInfluence.NORMAL,
          fainted: actorSchema.fainted || character.isFainted(),
          battleInstructions: actorSchema.battleInstructions || 'GET_RANDOM_ALIVE_ADVERSARY',
          progress: battleTeam.disadvantage ? BattleState.DISADVANTAGE_INFLUENCE : 0,
          speed: character.getNormalSpeed(),
          isAuto: isPlayer ? character.data.configuration?.autoBattle === true : true,
          arrivalTurn: this.turn,
        };
        return battleActor;
      });

      return battleTeam;
    });

    this.battleTeams.forEach((team: BattleTeam, index: number) => {
      const group = groups[index];
      team.relationships = group.relationships
        .map((rel) => {
          const relatedTeam = this.getTeamByKey(rel.teamKey);
          if (!relatedTeam) {
            return null;
          }
          return {
            team: relatedTeam,
            behaviour: rel.behaviour,
          } as TeamRelationship;
        })
        .filter((rel): rel is TeamRelationship => rel !== null);
    });

    this.battleActors = [];
    this.battleTeams.forEach((team) =>
      team.actors.forEach((actor) => this.battleActors.push(actor))
    );
  }

  computeActionSlots(): void {
    const aliveActors = this.battleActors
      .filter((actor: BattleActor) => !actor.character.isFainted())
      .sort((a: BattleActor, b: BattleActor) => b.speed - a.speed);

    if (aliveActors.length === 0) {
      return;
    }

    this.turnDuration = aliveActors[0].speed * 2.25;

    const newSlots: BattleActionSlot[] = [];
    aliveActors.forEach((actor: BattleActor) => {
      while (actor.progress < this.turnDuration * (10 + this.turn)) {
        const speed = actor.character.getActionSpeed();
        const progress = this.turnDuration - speed;
        for (let i = 0; i < 1 + actor.legendaryActions; i++) {
          newSlots.push({
            id: CalcUtil.genId(),
            battleActor: actor,
            speed,
            timeStamp: actor.progress + progress,
            localProgress: progress,
          });
        }
        actor.progress += progress;
      }
    });

    newSlots.sort((a: BattleActionSlot, b: BattleActionSlot) => a.timeStamp - b.timeStamp);
    this.actionSlots.push(...newSlots);
  }

  getNextActionSlot(): BattleActionSlot | undefined {
    return this.actionSlots.shift();
  }

  isThereAnyAnimosity(): boolean {
    let isThereAnimosity = false;
    this.battleTeams
      .filter((team) => team.actors.filter((actor) => !actor.character.isFainted()).length > 0)
      .forEach((team) => {
        isThereAnimosity =
          isThereAnimosity ||
          team.relationships.filter(
            (rel) =>
              rel.behaviour >= BattleState.RELATIONSHIP_BEHAVIOUR.FOE &&
              rel.team.actors.filter((actor) => !actor.character.isFainted()).length > 0
          ).length > 0;
      });
    return isThereAnimosity;
  }

  isThereAnyAdversaryAlive(team: BattleTeam): boolean {
    const enemyTeams = this.getEnemyTeams(team);
    const adversarialTeams = this.getAdversarialTeams(team);
    const detrimentalTeams = this.getDetrimentalTeams(team);

    const allAdvTeams = [...enemyTeams, ...adversarialTeams, ...detrimentalTeams];

    const allAdversaries = allAdvTeams.flatMap((t) => t.actors);

    return allAdversaries.filter((battleActor) => !battleActor.character.isFainted()).length > 0;
  }

  getEnemyTeams(team: BattleTeam): BattleTeam[] {
    return team.relationships
      .filter((rel) => rel.behaviour === BattleState.RELATIONSHIP_BEHAVIOUR.FOE)
      .map((rel) => rel.team);
  }

  getAllyTeams(team: BattleTeam): BattleTeam[] {
    return team.relationships
      .filter((rel) => rel.behaviour === BattleState.RELATIONSHIP_BEHAVIOUR.ALLY)
      .map((rel) => rel.team);
  }

  getAdversarialTeams(team: BattleTeam): BattleTeam[] {
    const enemiesTeam = this.getEnemyTeams(team);
    const searchedIdsTeam: string[] = enemiesTeam.map((a) => a.id);
    let searchedTeams: BattleTeam[] = enemiesTeam;
    let wasTeamAdded = false;
    const adversarialTeams: BattleTeam[] = [];
    do {
      wasTeamAdded = false;
      let teamsToAdd: BattleTeam[] = [];
      for (const allyToSearch of searchedTeams) {
        teamsToAdd = teamsToAdd.concat(
          this.getAllyTeams(allyToSearch).filter((b) => searchedIdsTeam.indexOf(b.id) === -1)
        );
      }
      if (teamsToAdd && teamsToAdd.length > 0) {
        wasTeamAdded = true;
        searchedTeams = teamsToAdd;
        adversarialTeams.push(...teamsToAdd);
        searchedIdsTeam.push(...teamsToAdd.map((a) => a.id));
      }
    } while (wasTeamAdded);
    return adversarialTeams;
  }

  getSupportiveTeams(team: BattleTeam): BattleTeam[] {
    const alliesTeam = this.getAllyTeams(team);
    const searchedIdsTeam: string[] = alliesTeam.map((a) => a.id);
    let searchedTeams: BattleTeam[] = alliesTeam;
    let wasTeamAdded = false;
    const supportiveTeams: BattleTeam[] = [];
    do {
      wasTeamAdded = false;
      let teamsToAdd: BattleTeam[] = [];
      for (const allyToSearch of searchedTeams) {
        teamsToAdd = teamsToAdd.concat(
          this.getAllyTeams(allyToSearch).filter((b) => searchedIdsTeam.indexOf(b.id) === -1)
        );
      }
      if (teamsToAdd && teamsToAdd.length > 0) {
        wasTeamAdded = true;
        searchedTeams = teamsToAdd;
        supportiveTeams.push(...teamsToAdd);
        searchedIdsTeam.push(...teamsToAdd.map((a) => a.id));
      }
    } while (wasTeamAdded);
    return supportiveTeams;
  }

  getBeneficialTeams(team: BattleTeam): BattleTeam[] {
    const enemiesTeam = this.getEnemyTeams(team);
    const alliesTeam = this.getAllyTeams(team);
    const supportivesTeam = this.getSupportiveTeams(team);
    const searchedIdsTeam: string[] = [
      ...enemiesTeam.map((a) => a.id),
      ...alliesTeam.map((a) => a.id),
      ...supportivesTeam.map((a) => a.id),
    ];
    const beneficialTeams: BattleTeam[] = [];
    let teamsToAdd: BattleTeam[] = [];
    for (const enemyToSearch of enemiesTeam) {
      teamsToAdd = teamsToAdd.concat(
        this.getEnemyTeams(enemyToSearch).filter((b) => searchedIdsTeam.indexOf(b.id) === -1)
      );
    }
    beneficialTeams.push(...teamsToAdd);
    return beneficialTeams;
  }

  getDetrimentalTeams(team: BattleTeam): BattleTeam[] {
    const enemiesTeam = this.getEnemyTeams(team);
    const alliesTeam = this.getAllyTeams(team);
    const adversarialTeam = this.getAdversarialTeams(team);
    const searchedIdsTeam: string[] = [
      ...enemiesTeam.map((a) => a.id),
      ...alliesTeam.map((a) => a.id),
      ...adversarialTeam.map((a) => a.id),
    ];
    const detrimentalTeams: BattleTeam[] = [];
    let teamsToAdd: BattleTeam[] = [];
    for (const allyToSearch of alliesTeam) {
      teamsToAdd = teamsToAdd.concat(
        this.getEnemyTeams(allyToSearch).filter((b) => searchedIdsTeam.indexOf(b.id) === -1)
      );
    }
    detrimentalTeams.push(...teamsToAdd);
    return detrimentalTeams;
  }

  getTeamByKey(key: string): BattleTeam | undefined {
    return this.battleTeams.filter((team) => team.key === key)[0];
  }

  getTeamByName(name: string): BattleTeam | undefined {
    return this.battleTeams.filter((team) => team.name === name)[0];
  }

  getTeamByID(id: string): BattleTeam | undefined {
    return this.battleTeams.filter((team) => team.id === id)[0];
  }

  doTeamHasAliveActors(team: BattleTeam): boolean {
    return team.actors.filter((a) => !a.character.isFainted()).length > 0;
  }

  getTeamsWithAliveActors(teams: BattleTeam[]): BattleTeam[] {
    return teams.filter((team) => this.doTeamHasAliveActors(team));
  }

  markFaintedActors(): BattleActor[] {
    const toFell = this.battleActors.filter((actor) => {
      return actor.character.isFainted() && !actor.fainted;
    });
    for (const actorToFell of toFell) {
      actorToFell.fainted = true;
    }
    return toFell;
  }

  retreatFoelessTeams(): BattleTeam[] {
    let wasTeamRemoved = false;
    const teamsRemoved: BattleTeam[] = [];
    do {
      wasTeamRemoved = false;
      const teamsToRemove: BattleTeam[] = [];
      this.battleTeams
        .filter((t) => !t.isPlayer)
        .forEach((currentTeam) => {
          if (!this.isThereAnyAdversaryAlive(currentTeam)) {
            teamsToRemove.push(currentTeam);
          }
        });
      teamsToRemove.forEach((currentTeam) => {
        const hasRelationshipWithPlayer =
          currentTeam.relationships.filter((rel) => rel.team.isPlayer).length > 0;
        if (!hasRelationshipWithPlayer) {
          teamsRemoved.push(currentTeam);
          this.battleTeams = this.battleTeams.filter((t) => t.id !== currentTeam.id);
          this.battleActors = this.battleActors.filter((actor) => actor.team.id !== currentTeam.id);
          wasTeamRemoved = true;
        }
      });
    } while (wasTeamRemoved);

    for (const team of teamsRemoved) {
      this.retreatedTeams.push(team);
    }

    return teamsRemoved;
  }

  addNewBattleActor(schema: BattleActorSchema, team: BattleTeam, timeStamp?: number): BattleActor {
    const char = schema.character;
    const dificulty = schema.dificulty || ChallangeDificultyXPInfluence.NORMAL;
    const legendaryActions = schema.legendaryActions || 0;
    const isPlayer = team.isPlayer;

    const actorProgress = this.turnDuration - char.getActionSpeed();
    const initialProgress =
      timeStamp != null
        ? timeStamp + actorProgress + (team.disadvantage ? BattleState.DISADVANTAGE_INFLUENCE : 1)
        : team.disadvantage
          ? BattleState.DISADVANTAGE_INFLUENCE
          : 0;

    const actor: BattleActor = {
      team,
      character: char,
      legendaryActions,
      dificulty,
      fainted: false,
      battleInstructions: schema.battleInstructions || 'GET_RANDOM_ALIVE_ADVERSARY',
      progress: initialProgress,
      speed: char.getNormalSpeed(),
      isAuto: isPlayer ? char.data.configuration?.autoBattle === true : true,
      arrivalTurn: this.turn,
    };

    team.actors.push(actor);
    this.battleActors.push(actor);
    this.battleActors.sort((actorA, actorB) => actorB.speed - actorA.speed);

    while (actor.progress < this.turnDuration * (10 + this.turn)) {
      const speed = actor.character.getActionSpeed();
      const progress = this.turnDuration - speed;
      const actionSlot: BattleActionSlot = {
        id: CalcUtil.genId(),
        battleActor: actor,
        speed,
        timeStamp: actor.progress + progress,
        localProgress: progress,
      };
      this.actionSlots.push(actionSlot);
      actor.progress += progress;
    }

    this.actionSlots.sort((a, b) => a.timeStamp - b.timeStamp);
    return actor;
  }

  removeActorFromBattle(actor: BattleActor): void {
    this.actionSlots = this.actionSlots.filter(
      (actionSlot: BattleActionSlot) => actionSlot.battleActor.character.id !== actor.character.id
    );
  }

  calculateXPGain(killer: BattleActor, slain: BattleActor): number {
    const playerChar = killer.character;
    const charToFell = slain.character;
    const xpGrowth = XPGrowth.get(playerChar.data.core.growthPlan);
    let earnedXp = xpGrowth.xpGain(playerChar.level, charToFell.level);
    const xpToUp = xpGrowth.xpToUp(playerChar.level);
    if (playerChar.data.core.xp + earnedXp > xpToUp) {
      const remaningXP = playerChar.data.core.xp + earnedXp - xpToUp;
      const earnedRemainingXP = Math.ceil(remaningXP / 10);
      earnedXp = Math.max(earnedXp - remaningXP + earnedRemainingXP, 1);
    }
    return earnedXp;
  }

  calculateXPLoss(fallen: BattleActor): number {
    const charToFell = fallen.character;
    const xpGrowth = XPGrowth.get(charToFell.data.core.growthPlan);
    const lostXp = Math.ceil(xpGrowth.xpGain(charToFell.level, charToFell.level + 1) / 10);
    return lostXp;
  }

  getEligibleEvents(phase: BattlePhase): BattleEvent[] {
    const eventsOfType = this.events.filter(
      (event) => event.type === phase && event.startingTurn <= this.turn
    );

    eventsOfType
      .filter((event) => event.calculatedOccurence)
      .forEach((event) => {
        if (event.getNextTurnToOccur) {
          event.nextTurnToOccur = event.getNextTurnToOccur(this);
        }
      });

    return eventsOfType.filter(
      (event) =>
        event.nextTurnToOccur === this.turn ||
        event.startingTurn === this.turn ||
        (this.turn - event.startingTurn) % event.turnGapForRecurrence === 0
    );
  }

  static delay(ms?: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms || BattleState.WAIT_TIME));
  }
}

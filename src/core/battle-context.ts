import { Actor } from '../models/actor';
import { Context } from './context';
import { MessageHandler } from './message-handler';
import { BehaviorSubject, first } from 'rxjs';
import { CalcUtil } from '@/utils/calc.utils';
import { STAT_KEY, StatCalc } from '@/models/stats';
import { GAUGE_ABBREVIATION, GAUGE_KEYS, GaugeCalc, GaugeKey } from '@/models/gauge';
import { GameDataService } from '@/services/game-data.service';
import { SLIME_BUILDER } from '@/data/builder/slime-builder';
import { COMPANY_POSITION } from '@/models/company';
import { ChallangeDificultyXPInfluence, defaultXPGrowthPlan, XPGrowth } from './xp-calc';

import { MoveBonk, MoveExpression, MoveTempest, MoveWhirlwind } from '@/models/move';
import { BattleInstructionRegistry } from '@/core/battle/instructions';
import { doAttack } from './battle-context.attack';
import { BattleState } from '@/core/battle/state/BattleState';
import type { IBattleRenderer } from '@/core/battle/renderer/IBattleRenderer';
import { BattleEventBus } from '@/core/battle/state/BattleEventBus';
import { PhasePipeline } from '@/core/battle/state/BattlePhase';
import {
  BattleActionSlot,
  BattleActionType,
  BattleActor,
  BattleActorSchema,
  BattleGroup,
  BattleInstruction,
  BattleInstructionExpression,
  BattlePhase,
  BattleTeam,
  BattleTurnInfo,
  TeamRelationship,
} from '@/core/battle/types';

export type {
  BattleActionSlot,
  BattleActionType,
  BattleActor,
  BattleActorSchema,
  BattleGroup,
  BattleInstruction,
  BattleInstructionExpression,
  BattleTeam,
  BattleTurnInfo,
  TeamRelationship,
} from '@/core/battle/types';

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
  static WAIT_TIME = 16; //300;
  self: BattleContext = this;
  scheme: BattleScheme;
  onEndCallback: () => void = () => {};
  state: BattleState;
  renderer: IBattleRenderer;
  bus: BattleEventBus;
  pipeline: PhasePipeline;

  /** Delegação para BattleState — propriedades legadas migradas para estado unificado */
  get actionSlots(): Array<BattleActionSlot> {
    return this.state.actionSlots;
  }
  set actionSlots(v: Array<BattleActionSlot>) {
    this.state.actionSlots = v;
  }
  get battleActors(): Array<BattleActor> {
    return this.state.battleActors;
  }
  set battleActors(v: Array<BattleActor>) {
    this.state.battleActors = v;
  }
  get battleTeams(): Array<BattleTeam> {
    return this.state.battleTeams;
  }
  set battleTeams(v: Array<BattleTeam>) {
    this.state.battleTeams = v;
  }
  get timeProgress(): number {
    return this.state.timeProgress;
  }
  set timeProgress(v: number) {
    this.state.timeProgress = v;
  }
  get sets(): number {
    return this.state.sets;
  }
  set sets(v: number) {
    this.state.sets = v;
  }
  get turn(): number {
    return this.state.turn;
  }
  set turn(v: number) {
    this.state.turn = v;
  }
  get turnDuration(): number {
    return this.state.turnDuration;
  }
  set turnDuration(v: number) {
    this.state.turnDuration = v;
  }
  get events(): any {
    return this.state.events;
  }
  set events(v: any) {
    this.state.events = v;
  }
  get data(): any {
    return this.state.data;
  }
  set data(v: any) {
    this.state.data = v;
  }
  get fallbackEndBattle(): boolean {
    return this.state.fallbackEndBattle;
  }
  set fallbackEndBattle(v: boolean) {
    this.state.fallbackEndBattle = v;
  }
  get turnInfo(): BattleTurnInfo {
    return this.state.turnInfo;
  }
  set turnInfo(v: BattleTurnInfo) {
    this.state.turnInfo = v;
  }
  get turnInfoHistory(): Array<BattleTurnInfo> {
    return this.state.turnInfoHistory;
  }
  set turnInfoHistory(v: Array<BattleTurnInfo>) {
    this.state.turnInfoHistory = v;
  }
  get actionSlotHistory(): Array<BattleActionSlot> {
    return this.state.actionSlotHistory;
  }
  set actionSlotHistory(v: Array<BattleActionSlot>) {
    this.state.actionSlotHistory = v;
  }
  get retreatedTeams(): Array<BattleTeam> {
    return this.state.retreatedTeams;
  }
  set retreatedTeams(v: Array<BattleTeam>) {
    this.state.retreatedTeams = v;
  }

  constructor(renderer: IBattleRenderer, scheme: BattleScheme) {
    super('battle');
    Context.ACTIVE_CONTEXTS[this.type] = this;

    this.scheme = scheme;
    this.state = new BattleState(scheme as any);
    this.renderer = renderer;
    this.bus = new BattleEventBus();
    this.pipeline = new PhasePipeline();
  }

  static build(renderer: IBattleRenderer, scheme: BattleScheme): BattleContext {
    return new BattleContext(renderer, scheme);
  }
  async triggerEvents(type: BATTLE_EVENT_TYPE) {
    if (this.fallbackEndBattle) return this.fallbackEndBattle;

    // Emite a fase equivalente no novo barramento (transicional)
    const phase = this.mapEventTypeToPhase(type);
    const cancelled = await this.emitPhase(phase);
    if (cancelled) return true;

    if (type != BATTLE_EVENT_TYPE.AFTER_BATTLE_END) this.updateTeamInfoUI();
    const eventsOfType = (this.events as BattleEvent[]).filter(
      (event: BattleEvent) => event.type == type && event.startingTurn <= this.turn
    );
    if (eventsOfType.length == 0) return;
    eventsOfType
      .filter((event: BattleEvent) => event.calculatedOccurence == true)
      .forEach((event: BattleEvent) => {
        if (event.getNextTurnToOccur) event.nextTurnToOccur = event.getNextTurnToOccur(this);
      });

    const eventsToTrigger = eventsOfType.filter(
      (event: BattleEvent) =>
        event.nextTurnToOccur == this.turn ||
        event.startingTurn == this.turn ||
        (this.turn - event.startingTurn) % event.turnGapForRecurrence == 0
    );

    let stop: boolean = false;
    for (const event of eventsToTrigger) {
      await BattleContext.delay(50);
      const eventReturn = event.event(this, event);
      stop = stop || eventReturn.stopAll == true || eventReturn.stopBattle == true;
      this.fallbackEndBattle = this.fallbackEndBattle || stop;
      if (eventReturn.message) this.writeMessage(eventReturn.message);
      if (eventReturn.stopAll) break;
    }

    return stop;
  }

  /** Emite uma fase no barramento de eventos. Retorna `true` se algum listener cancelou. */
  async emitPhase(phase: BattlePhase): Promise<boolean> {
    if (this.fallbackEndBattle) return this.fallbackEndBattle;
    const payload = await this.bus.emit(phase, { state: this.state as any });
    return payload.cancel || false;
  }

  /** Mapeamento transicional de eventos legados para fases do novo pipeline. */
  private mapEventTypeToPhase(type: BATTLE_EVENT_TYPE): BattlePhase {
    switch (type) {
      case BATTLE_EVENT_TYPE.BEFORE_BATTLE_START:
        return BattlePhase.BEFORE_BATTLE_START;
      case BATTLE_EVENT_TYPE.TURN_START:
        return BattlePhase.TURN_START;
      case BATTLE_EVENT_TYPE.TURN_END:
        return BattlePhase.TURN_END;
      case BATTLE_EVENT_TYPE.BEFORE_ACTION:
        return BattlePhase.BEFORE_ACTION_EXECUTE;
      case BATTLE_EVENT_TYPE.AFTER_ACTION:
        return BattlePhase.AFTER_ACTION_EXECUTE;
      case BATTLE_EVENT_TYPE.ON_ARRIVAL:
        return BattlePhase.ON_ENTER_BATTLE;
      case BATTLE_EVENT_TYPE.ON_AGGRESSION:
        return BattlePhase.ON_AGGRESSION;
      case BATTLE_EVENT_TYPE.ON_SLAIN:
        return BattlePhase.ON_TARGET_HIT;
      case BATTLE_EVENT_TYPE.ON_DEMISSE:
        return BattlePhase.ON_TARGET_HIT;
      case BATTLE_EVENT_TYPE.ON_TEAM_RETREAT:
        return BattlePhase.TURN_END;
      case BATTLE_EVENT_TYPE.AFTER_BATTLE_END:
        return BattlePhase.AFTER_BATTLE_END;
      default:
        return BattlePhase.CHECK_BATTLE_END;
    }
  }

  onEnd(callback: () => void) {
    this.onEndCallback = callback;
  }

  async start() {
    this.state.initialize();
    this.events = this.scheme.events;
    this.state.computeActionSlots();
    this.state.battleActors.sort(
      (actorA: BattleActor, actorB: BattleActor) => actorB.speed - actorA.speed
    );

    this.renderer.clearOrderPanel();
    this.renderer.clearTeamPanels();
    this.actionSlots.forEach((slot) => this.actionSlotToElementUI(slot));
    this.setOrderActionListUI();

    if (await this.triggerEvents(BATTLE_EVENT_TYPE.BEFORE_BATTLE_START)) return;
    const message = this.scheme.introductionText || 'A battle starts!';
    this.renderer.setIntroductionMessage(message);
    BattleContext.delay().then(() => this.unravelBattle());
  }
  doActionList() {
    this.state.computeActionSlots();
    this.renderer.clearOrderPanel();
    this.actionSlots.forEach((slot) => this.actionSlotToElementUI(slot));
    this.setOrderActionListUI();
  }
  removeActorFromBattle(actorToRemove: BattleActor) {
    this.state.removeActorFromBattle(actorToRemove);
    this.renderer.removeActorSlotsFromUI(actorToRemove);
  }

  async addNewBattleActor(timeStamp: number, actorSchema: BattleActorSchema, team: BattleTeam) {
    this.state.addNewBattleActor(actorSchema, team, timeStamp);
    this.renderer.clearOrderPanel();
    this.actionSlots.forEach((slot) => this.actionSlotToElementUI(slot));
    this.setOrderActionListUI();

    if (await this.triggerEvents(BATTLE_EVENT_TYPE.ON_ARRIVAL)) return;
  }
  async unravelBattle() {
    const actionSlot = this.state.getNextActionSlot();
    if (actionSlot == undefined) throw 'Populate the battle slots ya fucker';
    await this.state.retreatFoelessTeams();
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
      const strategy = BattleInstructionRegistry.get('GET_RANDOM_ALIVE_ADVERSARY');
      const instruction = strategy
        ? strategy.execute(this.state, this.turnInfo.activeActor!)
        : { actionType: BattleActionType.WAIT, actorTargets: [] };
      await doAttack(this, char, instruction);
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
    this.renderer.writeMessage(message);
  }
  isThereAnyAnimosity(): boolean {
    return this.state.isThereAnyAnimosity();
  }
  isThereAnyAdversaryAlive(team: BattleTeam): boolean {
    return this.state.isThereAnyAdversaryAlive(team);
  }
  getTeamsWithAliveActors(teamCluster: Array<BattleTeam>): Array<BattleTeam> {
    return this.state.getTeamsWithAliveActors(teamCluster);
  }
  doTeamHasAliveActors(team: BattleTeam): boolean {
    return this.state.doTeamHasAliveActors(team);
  }
  chooseAction(char: Actor): Promise<BattleInstructionExpression> {
    return new Promise<BattleInstructionExpression>((resolve) => {
      const actor = this.turnInfo.activeActor;
      if (!actor) {
        throw 'WTF dude!!  Set the turn BattleActor!!';
      }

      const showMainMenu = () => {
        this.renderer.clearActionMenu();

        const resolveAttack = () => {
          // Coleta alvos adversários vivos
          const enemyTeams = this.state.getEnemyTeams(actor.team);
          const adversarialTeams = this.state.getAdversarialTeams(actor.team);
          const detrimentalTeams = this.state.getDetrimentalTeams(actor.team);
          const allAdvTeams = [...enemyTeams, ...adversarialTeams, ...detrimentalTeams];
          const targets = allAdvTeams
            .flatMap((t) => t.actors)
            .filter((a) => !a.character.isFainted());

          if (targets.length === 0) {
            this.writeMessage('Não há alvos disponíveis!');
            resolve({ actionType: BattleActionType.WAIT });
            return;
          }

          this.renderer.startTargetSelection({
            mode: 'actor',
            availableActors: targets,
            minTargets: 1,
            maxTargets: 1,
            moveName: MoveBonk.defaultExpression.name || 'Atacar',
            onConfirm: (selectedActors) => {
              this.renderer.clearActionMenu();
              resolve({
                actionType: BattleActionType.ATTACK,
                move: MoveBonk.defaultExpression,
                actorTargets: [selectedActors],
              });
            },
            onCancel: showMainMenu,
          });
        };

        const resolveDefend = () => {
          this.renderer.clearActionMenu();
          resolve({ actionType: BattleActionType.DEFEND, self: true });
        };

        const resolveFlee = () => {
          this.renderer.clearActionMenu();
          resolve({ actionType: BattleActionType.FLEE });
        };

        const resolveUseItem = () => {
          this.renderer.clearActionMenu();
          this.writeMessage(`${char.name} tenta usar um item... (não implementado)`);
          resolve({ actionType: BattleActionType.WAIT });
        };

        const resolveConvince = () => {
          this.renderer.clearActionMenu();
          this.writeMessage(`${char.name} tenta convencer... (não implementado)`);
          resolve({ actionType: BattleActionType.WAIT });
        };

        const resolveTechnique = () => {
          this.renderer.clearActionMenu();

          const availableMoves: MoveExpression[] = [
            MoveWhirlwind.defaultExpression,
            MoveTempest.defaultExpression,
          ];

          this.renderer.showActionMenu(char.name, [
            ...availableMoves.map((move) => ({
              label: move.name,
              onSelect: () => resolveMove(move),
            })),
            { label: 'Voltar', onSelect: showMainMenu },
          ]);
        };

        const resolveMove = (move: MoveExpression) => {
          const mode = move.targetMode || 'actor';
          const minTargets = move.targetMinCount ?? 1;
          const maxTargets = move.targetMaxCount ?? 1;

          const enemyTeams = this.state.getEnemyTeams(actor.team);
          const adversarialTeams = this.state.getAdversarialTeams(actor.team);
          const detrimentalTeams = this.state.getDetrimentalTeams(actor.team);
          const allAdvTeams = [...enemyTeams, ...adversarialTeams, ...detrimentalTeams];

          const availableActors = allAdvTeams
            .flatMap((t) => t.actors)
            .filter((a) => !a.character.isFainted());

          const availableTeams = allAdvTeams.filter((t) =>
            t.actors.some((a) => !a.character.isFainted())
          );

          const hasActors = availableActors.length > 0;
          const hasTeams = availableTeams.length > 0;

          if (
            (mode === 'actor' && !hasActors) ||
            (mode === 'team' && !hasTeams) ||
            (mode === 'mixed' && !hasActors && !hasTeams)
          ) {
            this.writeMessage('Não há alvos disponíveis!');
            resolve({ actionType: BattleActionType.WAIT });
            return;
          }

          this.renderer.startTargetSelection({
            mode,
            availableActors,
            availableTeams,
            minTargets,
            maxTargets,
            moveName: move.name,
            onConfirm: (selectedActors, selectedTeams) => {
              this.renderer.clearActionMenu();
              const instruction: BattleInstructionExpression = {
                actionType: BattleActionType.ATTACK,
                move,
              };
              if (selectedActors.length > 0) {
                instruction.actorTargets = [selectedActors];
              }
              if (selectedTeams.length > 0) {
                instruction.teamTargets = [selectedTeams];
              }
              resolve(instruction);
            },
            onCancel: showMainMenu,
          });
        };

        this.renderer.showActionMenu(char.name, [
          { label: 'Atacar', onSelect: resolveAttack },
          { label: 'Técnica', onSelect: resolveTechnique },
          { label: 'Defender', onSelect: resolveDefend },
          { label: 'Item', onSelect: resolveUseItem },
          { label: 'Convencer', onSelect: resolveConvince },
          { label: 'Fugir', onSelect: resolveFlee },
        ]);
      };

      showMainMenu();
    });
  }

  async markFaintedActors() {
    const activeActor = this.turnInfo.activeActor;
    const toFell = this.state.markFaintedActors();

    for (const actorToFell of toFell) {
      const isActiveActor = activeActor?.character.id == actorToFell.character.id || false;
      const charToFell = actorToFell.character;

      if (isActiveActor) {
        this.removeActorFromBattle(actorToFell);
        await BattleContext.delay().then(() => {
          this.writeMessage(`${this.turn} - ${charToFell.name} met his demise.`);
        });
        if (await this.triggerEvents(BATTLE_EVENT_TYPE.ON_DEMISSE)) return;
      } else {
        this.removeActorFromBattle(actorToFell);

        await BattleContext.delay().then(() => {
          this.writeMessage(`${this.turn} - ${charToFell.name} was felled.`);
        });
        if (await this.triggerEvents(BATTLE_EVENT_TYPE.ON_SLAIN)) return;
        // XP gain/loss
        if (activeActor && activeActor.team.isPlayer) {
          const playerChar = activeActor.character;
          const earnedXp = this.state.calculateXPGain(activeActor, actorToFell);
          playerChar.data.core.xp += earnedXp;
          await BattleContext.delay().then(() => {
            this.writeMessage(`${this.turn} - ${playerChar.name} earned ${earnedXp}XP.`);
          });
        } else if (actorToFell.team.isPlayer) {
          const lostXp = this.state.calculateXPLoss(actorToFell);
          charToFell.data.core.xp -= lostXp;
          await BattleContext.delay().then(() => {
            this.writeMessage(`${this.turn} - ${charToFell.name} lost ${lostXp}XP.`);
          });
        }
      }
    }
  }
  async retreatFoelessTeams() {
    const teamsRemoved = this.state.retreatFoelessTeams();
    for (const team of teamsRemoved) {
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
      playerTeam.actors.filter((actor) => !actor.character.isFainted()).length > 0;

    let thereIsAnyAllyAlive = false;
    const playerAlliesTeam: Array<BattleTeam> = playerTeam.relationships
      .filter((rel) => rel.behaviour == BattleContext.RELATIONSHIP_BEHAVIOUR.ALLY)
      .map((rel) => rel.team);
    playerAlliesTeam.forEach((allyTeam) => {
      if (thereIsAnyAllyAlive) return;
      thereIsAnyAllyAlive =
        allyTeam.actors.filter((actor) => !actor.character.isFainted()).length > 0;
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
          gauge.consumed = Math.ceil(GaugeCalc.getValue(actor.character, gauge) * 0.975);
        });
      });
      //Set max consumed stamina for company
      GameDataService.GAME_DATA.companyData.stamina.consumed = GaugeCalc.getValue(
        GameDataService.GAME_DATA.companyData,
        GameDataService.GAME_DATA.companyData.stamina
      );
      GameDataService.GAME_DATA.time += 60 * 4;
      const mapScene = window.game?.scene?.getScene('map-scene');
      const mapUIScene = window.game?.scene?.getScene('map-ui-scene');
      mapScene.doColorFilter();
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
        .filter((rel) => rel.behaviour == BattleContext.RELATIONSHIP_BEHAVIOUR.ALLY)
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
  getTeamByName(teamName: string): BattleTeam | undefined {
    return this.state.getTeamByName(teamName);
  }
  getTeamByKey(teamKey: string): BattleTeam | undefined {
    return this.state.getTeamByKey(teamKey);
  }
  getTeamByID(teamId: string): BattleTeam | undefined {
    return this.state.getTeamByID(teamId);
  }
  getAllyTeams(team: BattleTeam): Array<BattleTeam> {
    return this.state.getAllyTeams(team);
  }
  getSupportiveTeams(team: BattleTeam): Array<BattleTeam> {
    return this.state.getSupportiveTeams(team);
  }
  getBeneficialTeams(team: BattleTeam): Array<BattleTeam> {
    return this.state.getBeneficialTeams(team);
  }
  getEnemyTeams(team: BattleTeam): Array<BattleTeam> {
    return this.state.getEnemyTeams(team);
  }
  getAdversarialTeams(team: BattleTeam): Array<BattleTeam> {
    return this.state.getAdversarialTeams(team);
  }
  getDetrimentalTeams(team: BattleTeam): Array<BattleTeam> {
    return this.state.getDetrimentalTeams(team);
  }
  async removeActionFromUI(action: BattleActionSlot) {
    this.renderer.removeActionSlotById(action.id);
  }
  actionSlotToElementUI(actionSlot: BattleActionSlot) {
    this.renderer.actionSlotToElementUI(actionSlot);
  }
  async updateTeamInfoUI() {
    this.renderer.updateTeamInfoUI(this.battleTeams, this.retreatedTeams);
  }
  setOrderActionListUI() {
    this.renderer.setOrderActionListUI();
  }
  showHitTakenOnTargetUI() {
    this.renderer.showHitTakenOnTargetUI();
  }
}

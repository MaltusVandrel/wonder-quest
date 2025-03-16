import { Figure } from '../models/figure';
import { Context } from './context';
import { MessageHandler } from './message-handler';
import { first } from 'rxjs';
import { GAUGE_KEYS } from '../data/bank/gauge';
import { Injectable } from '@angular/core';
import { CalcUtil } from 'src/utils/calc.utils';
import { STAT_KEYS } from 'src/data/bank/stats';

@Injectable()
export class BattleContext extends Context {
  public static defaultTurnTiming: number = 6000;
  public type: String = 'battle';
  public player: Figure = new Figure();
  public foe: Figure = new Figure();
  public elapsedTime: number = 0;
  public choosingAction?: Promise<boolean>;
  public actionList: { actor: Figure; time: number }[] = [];

  constructor(private messageHandler: MessageHandler) {
    super();
  }
  public setParticipants(player: Figure, foe: Figure) {
    this.foe = foe;
    this.player = player;
    console.log('player', this.player);
  }

  private getListOrder(): Figure[] {
    let playerInitiative = this.player.getInitiative();
    let foeInitiative = this.foe.getInitiative();
    let percentage60 = 1.6;
    let a: Figure;
    let b: Figure;
    if (playerInitiative >= foeInitiative * percentage60) {
      a = this.player;
      b = this.foe;
    } else if (foeInitiative >= playerInitiative * percentage60) {
      a = this.foe;
      b = this.player;
    } else {
      if (
        CalcUtil.getRandom(this.player.getStat(STAT_KEYS.LUCK).value) >=
        CalcUtil.getRandom(this.foe.getStat(STAT_KEYS.LUCK).value)
      ) {
        a = this.player;
        b = this.foe;
      } else {
        a = this.foe;
        b = this.player;
      }
    }
    return [a, b];
  }
  private buildActionList() {
    let order: Figure[] = this.getListOrder();
    let fist = true;

    for (let being of order) {
      let time = being.getTurnTime() / (fist ? 2 : 1);
      fist = false;
      let turns = 0;
      while (turns < 60) {
        this.actionList.push({ actor: being, time: time });
        time += being.getTurnTime();
        turns++;
      }
    }
    this.actionList.sort((a, b) => {
      return a.time >= b.time ? 1 : -1;
    });
  }

  private getTarget(being: Figure) {
    if (being == this.player) {
      return this.foe;
    } else {
      return this.player;
    }
  }
  //add atack action in the player turn
  //add atacks
  //add winding up time
  //add post attack recharge time
  public async run() {
    this.buildActionList();

    this.messageHandler.add(
      'A battle between <span class="bold">' +
        this.player.name +
        '(' +
        this.player.getGauge(GAUGE_KEYS.VITALITY).getCurrentValue() +
        'hp)' +
        '</span> and <span class="bold">' +
        this.foe.name +
        '(' +
        this.foe.getGauge(GAUGE_KEYS.VITALITY).getCurrentValue() +
        'hp) </span> ' +
        ' has begun!'
    );

    while (
      this.actionList.length > 0 &&
      this.foe.getGauge(GAUGE_KEYS.VITALITY).getCurrentValue() > 0 &&
      this.player.getGauge(GAUGE_KEYS.VITALITY).getCurrentValue() > 0
    ) {
      let actionTurn = this.actionList.shift();
      if (actionTurn) {
        if (actionTurn.actor == this.player) {
          await this.waitForAction();
        } else {
          await this.delay(900);
        }
        let msg = this.getAttack(
          actionTurn.actor,
          this.getTarget(actionTurn.actor)
        );
        this.messageHandler.add(msg);
      } else {
        break;
      }
    }
    let being = this.player;
    if (this.foe.getGauge(GAUGE_KEYS.VITALITY).getCurrentValue() > 0)
      being = this.foe;
    this.messageHandler.add(
      '<span class="bold">' + being.name + '</span> won the battle!'
    );
  }
  private getAttack(a: Figure, b: Figure): string {
    let attackPower = 3;
    let strengthInfluence = 1 + a.getStat(STAT_KEYS.STRENGTH).value / 10;
    let levelDiffInfluence = 1 + (a.level - b.level / 10) / 100;
    let damage =
      attackPower *
      levelDiffInfluence *
      strengthInfluence *
      (CalcUtil.getAValueBetween(80, 120) / 100);
    damage = Math.round(damage);
    b.getGauge(GAUGE_KEYS.VITALITY).consumed += damage;
    return (
      '<span class="bold">' +
      a.name +
      '</span> attacks <span class="bold">' +
      b.name +
      '! (' +
      damage +
      'dmg)</span>'
    );
  }
  private delay(ms: number): Promise<any> {
    return new Promise((res) => setTimeout(res, ms));
  }
  private waitForAction(): Promise<any> {
    this.choosingAction = new Promise<boolean>(function (resolve, reject) {
      window.addEventListener('actionSelected', ((event: CustomEvent) => {
        resolve(true);
      }) as EventListener);
    });

    return this.choosingAction;
  }
  public triggerAction() {
    window.dispatchEvent(new CustomEvent('actionSelected', {}));
  }
}

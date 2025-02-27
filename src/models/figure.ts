import { BattleContext } from '../core/battle-context';
import { STAT_KEYS } from '../data/bank/stats';

import { Stat } from './stats';
import { ChildComponent } from './child-component';
import { Gauge } from './gauge';
import { CalcUtil } from 'src/utils/calc-util';

export class Figure {
  //gauge
  //stats
  /*
  turn = sum of all participants = cap
  initiative (speed+bullshit +-15%rand) everyone runs against eachother to hit the cap, everytime someones hits cap its their turn.
  */
  name: string = '';
  level: number = 1;
  gauges: Gauge[] = [];
  stats: Stat[] = [];
  //takes usually 2+level monster of same level to level up
  //
  xpForNextLevel: number = 9;
  xp: number = 0;

  constructor() {}

  getStat(key: string): Stat {
    let att = this.stats.find((a) => a.key == key);
    if (!att) throw 'Stat not present.';
    return att;
  }
  getGauge(key: string): Gauge {
    let gauge = this.gauges.find((a) => a.key == key);
    if (!gauge) throw 'Gauge not present.';
    return gauge;
  }
  getInitiative(): number {
    return this.getSpeed() / 10 + this.level / 4;
  }

  getSpeed(): number {
    let agi = this.getStat(STAT_KEYS.AGILITY);
    let dex = this.getStat(STAT_KEYS.DEXTERITY);
    let prc = this.getStat(STAT_KEYS.PERCEPTION);
    let itt = this.getStat(STAT_KEYS.INTUITION);
    let luk = this.getStat(STAT_KEYS.LUCK);
    return (
      agi.value * 2.5 -
      (dex.value + prc.value + itt.value) -
      CalcUtil.getRandom(luk.value * 10)
    );
  }
  getTurnTime(): number {
    const speedAmount = this.getSpeed();
    return BattleContext.defaultTurnTiming * (1 + speedAmount / 100);
  }
}

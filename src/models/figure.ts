import { BattleContext } from '../core/battle-context';

import { Stat, STAT_KEY } from './stats';
import { ChildComponent } from './child-component';
import { Gauge } from './gauge';
import { CalcUtil } from 'src/utils/calc.utils';

export class Figure {
  //gauge
  //stats
  /*
  turn = sum of all participants = cap
  initiative (speed+bullshit +-15%rand) everyone runs against eachother to hit the cap, everytime someones hits cap its their turn.
  */
  name: string = '';
  level: number = 1;
  data: any = {};

  gauges: Gauge[] = [];
  stats: Stat[] = [];
  //takes usually 2+level monster of same level to level up
  //
  xpForNextLevel: number = 9;
  xp: number = 0;

  constructor() {}
  static untieCircularReference(figure: Figure): any {
    let data = { ...figure };
    for (let gauge of data.gauges) {
      gauge.parent = undefined;
    }
    for (let stat of data.stats) {
      stat.parent = undefined;
    }
    return data;
  }
  static instantiate(data: any): Figure {
    let obj = new Figure();

    obj.name = data.name;
    obj.level = data.level;

    obj.xpForNextLevel = data.xpForNextLevel;
    obj.xp = data.xp;
    obj.gauges = [];
    obj.stats = [];
    for (let gauge of data.gauges) {
      obj.gauges.push(Gauge.instantiate({ ...gauge, parent: obj }));
    }
    for (let stat of data.stats) {
      obj.stats.push(Stat.instantiate({ ...stat, parent: obj }));
    }

    return obj;
  }
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
    return this.getActionSpeed();
  }

  getNormalSpeed(): number {
    const agi = this.getStat(STAT_KEY.AGILITY);
    const dex = this.getStat(STAT_KEY.DEXTERITY);
    const prc = this.getStat(STAT_KEY.PERCEPTION);
    const itt = this.getStat(STAT_KEY.INTUITION);
    const speed =
      agi.getInfluenceValue() * 2.5 +
      (dex.getInfluenceValue() +
        prc.getInfluenceValue() +
        itt.getInfluenceValue());
    return speed > 0 ? speed : 1;
  }

  getActionSpeed(): number {
    const luk = this.getStat(STAT_KEY.LUCK);
    const normalSpeed = this.getNormalSpeed();
    normalSpeed + CalcUtil.getRandom(luk.getInfluenceValue()) + this.level / 4;
    return normalSpeed > 0 ? normalSpeed : 1;
  }

  getTurnTime(): number {
    const speedAmount = this.getActionSpeed();
    return BattleContext.defaultTurnTiming * (1 + speedAmount / 100);
  }
}

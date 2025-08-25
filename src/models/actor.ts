import { BattleContext } from '../core/battle-context';

import { Stat, STAT_KEY, StatCalc, StatKey } from './stats';
import { ChildComponent } from './child-component';
import { Gauge, GAUGE_KEYS, GaugeCalc, GaugeKey } from './gauge';
import { CalcUtil } from 'src/utils/calc.utils';
import { defaultXPGrowthPlan, XPGrowthPlan } from 'src/core/xp-calc';

export interface FigureData {
  core: { xp: number; skillPoints: number; growthPlan: XPGrowthPlan };
  configuration?: any;
  extra?: any;
}
export class Actor {
  id: string = CalcUtil.genId();
  //gauge
  //stats
  /*
  turn = sum of all participants = cap
  initiative (speed+bullshit +-15%rand) everyone runs against eachother to hit the cap, everytime someones hits cap its their turn.
  */
  name: string = '';
  level: number = 1;
  data: FigureData = {
    core: { xp: 0, skillPoints: 0, growthPlan: { ...defaultXPGrowthPlan } },
    configuration: { autoBattle: false },
  };
  gauges: Record<GaugeKey, Gauge> = (
    Object.values(GAUGE_KEYS) as GaugeKey[]
  ).reduce((acc, key) => {
    acc[key] = { key, title: key.toLowerCase(), value: 1, consumed: 1 };
    return acc;
  }, {} as Record<GaugeKey, Gauge>);

  stats: Record<StatKey, Stat> = (Object.values(STAT_KEY) as StatKey[]).reduce(
    (acc, key) => {
      acc[key] = { key, title: key.toLowerCase(), value: 1, modValue: 1 };
      return acc;
    },
    {} as Record<StatKey, Stat>
  );
  //takes usually 2+level monster of same level to level up
  //

  constructor() {}
  static untieCircularReference(figure: Actor): any {
    let data = { ...figure };

    return data;
  }
  static instantiate(data: any): Actor {
    let obj = new Actor();
    obj.id = data.id;
    obj.data = data.data as FigureData;
    obj.name = data.name;
    obj.level = data.level;

    obj.gauges = data.gauges;
    obj.stats = data.stats;

    return obj;
  }

  isFainted(): boolean {
    return (
      GaugeCalc.getCurrentValue(this, this.gauges[GAUGE_KEYS.VITALITY]) <= 0
    );
  }
  getInitiative(): number {
    return this.getActionSpeed();
  }

  getNormalSpeed(): number {
    const agi = this.stats[STAT_KEY.AGILITY];
    const dex = this.stats[STAT_KEY.DEXTERITY];
    const prc = this.stats[STAT_KEY.PERCEPTION];
    const itt = this.stats[STAT_KEY.INTUITION];
    const speed =
      (StatCalc.getInfluenceValue(this, agi) * 2.5 +
        (StatCalc.getInfluenceValue(this, dex) +
          StatCalc.getInfluenceValue(this, prc) +
          StatCalc.getInfluenceValue(this, itt))) /
      2.5;
    return speed > 0 ? speed : 1;
  }

  getActionSpeed(): number {
    const luk = this.stats[STAT_KEY.LUCK];
    const normalSpeed = this.getNormalSpeed();
    normalSpeed +
      CalcUtil.getRandom(StatCalc.getInfluenceValue(this, luk)) +
      this.level / 4;
    return normalSpeed > 0 ? normalSpeed : 1;
  }
}

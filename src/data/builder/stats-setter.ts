import { defaultStat, Stat, STAT_KEY, STAT_TITLES } from '../../models/stats';
import { Actor } from '../../models/actor';

let STATS: Stat[] = [];

export function setStats(being: Actor, maxValue: number) {
  const randomPart = maxValue - 10;
  const positiveVariance = Math.round(randomPart * (1 + 1 / 3));
  const negativeVariance = Math.round(randomPart / 3);

  for (let key of Object.keys(STAT_KEY)) {
    let attr = { ...defaultStat };
    attr.title = { ...STAT_TITLES }[key] || '';
    attr.key = key || '';
    attr.value =
      10 + (Math.ceil(Math.random() * positiveVariance) - negativeVariance);
    attr.modValue = attr.value;
    being.stats.push(attr);
  }
}

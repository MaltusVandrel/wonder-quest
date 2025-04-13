import { Stat, STAT_KEYS, STAT_TITLES } from '../../models/stats';
import { Figure } from '../../models/figure';

let STATS: Stat[] = [];

export function setStats(being: Figure) {
  for (let key of Object.keys(STAT_KEYS)) {
    let attr = new Stat(being);
    attr.title = { ...STAT_TITLES }[key] || '';
    attr.key = key || '';
    attr.value = 10 + (Math.ceil(Math.random() * 16) - 4);
    attr.modValue = attr.value;
    being.stats.push(attr);
  }
}

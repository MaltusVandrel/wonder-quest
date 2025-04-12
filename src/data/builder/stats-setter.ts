import { Stat } from '../../models/stats';
import { Figure } from '../../models/figure';
import { STAT_KEYS, STAT_TITLES } from '../bank/stats';

let STATS: Stat[] = [];

export function setStats(being: Figure) {
  for (let key of Object.keys(STAT_KEYS)) {
    let attr = new Stat();
    attr.title = { ...STAT_TITLES }[key] || '';
    attr.key = key || '';
    attr.value = 10 + (Math.ceil(Math.random() * 15) - 5);
    attr.parent = being;
    being.stats.push(attr);
  }
}

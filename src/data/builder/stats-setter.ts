import { Stat } from '../../models/stats';
import { Figure } from '../../models/figure';
import { STAT_KEYS, STAT_TITLES } from '../bank/stats';

let STATS: Stat[] = [];

export function setStats(being: Figure) {
  for (let key of Object.keys(STAT_KEYS)) {
    let attr = new Stat();
    attr.title = { ...STAT_TITLES }[key] || '';
    attr.key = key || '';
    being.stats.push(attr);
  }
}

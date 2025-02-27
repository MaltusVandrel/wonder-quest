import { Figure } from '../../models/figure';
import { setGauges } from './gauge-setter';
import { setStats } from './stats-setter';

export let SLIME_BUILDER = {
  getASlime(level: number): Figure {
    let being: Figure = new Figure();
    being.name = 'Slime';
    being.level = level;
    setGauges(being);
    setStats(being);
    return being;
  },
};

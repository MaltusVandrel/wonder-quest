import { Figure } from '../../models/figure';

import { setGauges } from './gauge-setter';
import { setStats } from './stats-setter';

export let HERO_BUILDER = {
  getAHero(level: number): Figure {
    let being: Figure = new Figure();
    being.name = 'Hero';
    being.level = level;
    setGauges(being);
    setStats(being);
    return being;
  },
};

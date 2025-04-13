import { Figure } from '../../models/figure';

import { setGauges } from './gauge-setter';
import { setStats } from './stats-setter';

export let HERO_BUILDER = {
  getAHero(level: number, data: any): Figure {
    let being: Figure = new Figure();
    being.name = data.name;
    being.level = level;
    setStats(being);
    setGauges(being);
    return being;
  },
};

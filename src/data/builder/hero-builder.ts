import { Actor } from '../../models/actor';

import { setGauges } from './gauge-setter';
import { setStats } from './stats-setter';

export let HERO_BUILDER = {
  getAHero(level: number, data: any): Actor {
    let being: Actor = new Actor();
    being.name = data.name;
    being.level = level;
    setStats(being, 22);
    setGauges(being, 100);
    console.log('HERO_BUILDER', being);
    return being;
  },
};

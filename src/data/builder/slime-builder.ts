import { Actor } from '../../models/actor';
import { setGauges } from './gauge-setter';
import { setStats } from './stats-setter';

export let SLIME_BUILDER = {
  getASlime(level: number): Actor {
    let being: Actor = new Actor();
    being.name = 'Slime';
    being.level = level;
    setStats(being, 9 + level);
    setGauges(being, 60);
    return being;
  },
};

import { ChildComponent } from './child-component';
import { Company, COMPANY_POSITION } from './company';
import { Actor } from './actor';
import { STAT_KEY, StatCalc, StatKey } from './stats';

export const STATUS_MODFIERS_INTENSITY = 1;
export const STATUS_MODFIERS_INFLUENCE = {
  MAX: 7,
  STRONG: 5,
  MILD: 2.5,
  WEAK: 1.5,
  MIN: 1,
  DETRIMENTAL: 0.75,
  DAMPENING: 0.5,
  NEGATIVE: 0.25,
  IMPEDITIVE: 0.05,
};
export const GAUGE_KEYS = {
  VITALITY: 'VITALITY',
  STAMINA: 'STAMINA',
  MANA: 'MANA',
} as const;
export type GaugeKey = keyof typeof GAUGE_KEYS;

interface GaugeInfo {
  title: string;
  description: string;
}

export const GAUGE_TITLES: { [key in GaugeKey]: string } = {
  VITALITY: 'vitality',
  STAMINA: 'stamina',
  MANA: 'mana',
};
export const GAUGE_ABBREVIATION: { [key in GaugeKey]: string } = {
  VITALITY: 'hp',
  STAMINA: 'sp',
  MANA: 'mp',
};
export const GAUGE_DESCRIPTIONS: { [key in GaugeKey]: string } = {
  VITALITY:
    'Represents the overall health and energy that keeps you awake and alive.',
  STAMINA:
    'Represents the energy reserve that allows you to do task and an extra boost in actions. ',
  MANA: 'Represents the allowance to manipulate the supernatural powers.',
};
export const GAUGE_INFOS: { [key in GaugeKey]: GaugeInfo } = Object.keys(
  GAUGE_KEYS
).reduce((acc, key) => {
  acc[key as GaugeKey] = {
    title: GAUGE_TITLES[key as GaugeKey],
    description: GAUGE_DESCRIPTIONS[key as GaugeKey],
  };
  return acc;
}, {} as { [key in GaugeKey]: GaugeInfo });
export const GAUGE_MODFIERS: {
  [key in GaugeKey]: { [key in StatKey]: number };
} = {
  VITALITY: {
    VIGOR: STATUS_MODFIERS_INFLUENCE.MAX * STATUS_MODFIERS_INTENSITY,
    ENDURANCE: STATUS_MODFIERS_INFLUENCE.MAX * STATUS_MODFIERS_INTENSITY,
    RESOLVE: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    RESISTENCE: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    STRENGTH: STATUS_MODFIERS_INFLUENCE.MILD * STATUS_MODFIERS_INTENSITY,
    DEXTERITY: STATUS_MODFIERS_INFLUENCE.MILD * STATUS_MODFIERS_INTENSITY,
    POTENCY: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    ESOTERISM: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    KARMA: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    AGILITY: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    PERCEPTION: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    INTELLIGENCE: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    CUNNING: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    INTUITION: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    LUCK: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    CHARISMA: STATUS_MODFIERS_INFLUENCE.MIN * STATUS_MODFIERS_INTENSITY,
  },
  STAMINA: {
    ENDURANCE: STATUS_MODFIERS_INFLUENCE.MAX * STATUS_MODFIERS_INTENSITY,
    VIGOR: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    DEXTERITY: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    AGILITY: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    RESISTENCE: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    RESOLVE: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    INTUITION: STATUS_MODFIERS_INFLUENCE.MILD * STATUS_MODFIERS_INTENSITY,
    STRENGTH: STATUS_MODFIERS_INFLUENCE.MILD * STATUS_MODFIERS_INTENSITY,
    POTENCY: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    PERCEPTION: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    CUNNING: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    LUCK: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    INTELLIGENCE: STATUS_MODFIERS_INFLUENCE.MIN * STATUS_MODFIERS_INTENSITY,
    CHARISMA: STATUS_MODFIERS_INFLUENCE.MIN * STATUS_MODFIERS_INTENSITY,
    ESOTERISM: STATUS_MODFIERS_INFLUENCE.MIN * STATUS_MODFIERS_INTENSITY,
    KARMA: STATUS_MODFIERS_INFLUENCE.MIN * STATUS_MODFIERS_INTENSITY,
  },
  MANA: {
    POTENCY: STATUS_MODFIERS_INFLUENCE.MAX * STATUS_MODFIERS_INTENSITY,
    INTELLIGENCE: STATUS_MODFIERS_INFLUENCE.MAX * STATUS_MODFIERS_INTENSITY,
    ESOTERISM: STATUS_MODFIERS_INFLUENCE.MAX * STATUS_MODFIERS_INTENSITY,
    KARMA: STATUS_MODFIERS_INFLUENCE.MAX * STATUS_MODFIERS_INTENSITY,
    VIGOR: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    CUNNING: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    RESISTENCE: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    ENDURANCE: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    RESOLVE: STATUS_MODFIERS_INFLUENCE.STRONG * STATUS_MODFIERS_INTENSITY,
    INTUITION: STATUS_MODFIERS_INFLUENCE.MILD * STATUS_MODFIERS_INTENSITY,
    CHARISMA: STATUS_MODFIERS_INFLUENCE.MILD * STATUS_MODFIERS_INTENSITY,
    PERCEPTION: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    LUCK: STATUS_MODFIERS_INFLUENCE.WEAK * STATUS_MODFIERS_INTENSITY,
    DEXTERITY: STATUS_MODFIERS_INFLUENCE.MIN * STATUS_MODFIERS_INTENSITY,
    AGILITY: STATUS_MODFIERS_INFLUENCE.MIN * STATUS_MODFIERS_INTENSITY,
    STRENGTH: STATUS_MODFIERS_INFLUENCE.MIN * STATUS_MODFIERS_INTENSITY,
  },
};

/*
  
  */

export interface Gauge {
  key: string;
  //@description tua mãe tem um
  title: string;
  //@description mostra valor maximo sem modificadores
  value: number;
  //@description 'dano' sofrido no gauge
  consumed: number;
}
export const defaultGauge: Gauge = {
  key: 'base',
  title: 'base',
  value: 80,
  consumed: 0,
};

export class GaugeCalc {
  static getPercentualValueString(
    parent: Actor | Company,
    gauge: Gauge
  ): string {
    return GaugeCalc.getPercentualValue(parent, gauge).toFixed(2);
  }
  static getPercentualValue(parent: Actor | Company, gauge: Gauge): number {
    return (
      (GaugeCalc.getCurrentValue(parent, gauge) /
        GaugeCalc.getValue(parent, gauge)) *
      100
    );
  }
  static getCurrentValueString(parent: Actor | Company, gauge: Gauge): string {
    return (
      GaugeCalc.getCurrentValue(parent, gauge).toFixed(0) +
      '/' +
      GaugeCalc.getValue(parent, gauge).toFixed(0)
    );
  }
  static getCurrentValue(parent: Actor | Company, gauge: Gauge) {
    return GaugeCalc.getValue(parent, gauge) - gauge.consumed;
  }
  static canHandleValue(
    value: number,
    parent: Actor | Company,
    gauge: Gauge
  ): boolean {
    return GaugeCalc.getUnhandableValue(value, parent, gauge) > 0;
  }
  static getUnhandableValue(
    value: number,
    parent: Actor | Company,
    gauge: Gauge
  ): number {
    return GaugeCalc.getCurrentValue(parent, gauge) - value;
  }

  static getValue(parent: Actor | Company, gauge: Gauge): number {
    if (parent instanceof Actor) {
      const char = parent as Actor;
      const mods = GAUGE_MODFIERS[gauge.key as GaugeKey];
      let value = gauge.value;
      for (let mod of Object.keys(mods)) {
        value +=
          StatCalc.getInfluenceValue(char, char.stats[mod as StatKey]) *
          (mods[mod as StatKey] || 1);
      }

      return value * (1 + parent.level / 15);
    } else if (parent instanceof Company) {
      let value = 0;
      let biggestValue = 0;
      let leaderValue = 0;
      for (let member of parent.members) {
        const localValue = GaugeCalc.getValue(
          member.character,
          member.character.gauges[GAUGE_KEYS.STAMINA]
        );
        if (
          member.positions.some(
            (position) => position == COMPANY_POSITION.LEADER
          )
        ) {
          leaderValue = localValue;
        }
        if (localValue > biggestValue) {
          biggestValue = localValue;
        }
        value += localValue;
      }
      return (value + biggestValue + leaderValue) / (parent.members.length + 2);
    } else {
      return 0;
    }
  }
}

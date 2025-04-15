import { ChildComponent } from './child-component';
import { Company, COMPANY_POSITION } from './company';
import { Figure } from './figure';
import { STAT_KEY } from './stats';

const MODFIERS_INTENSITY = 1;
const MODFIERS_INFLUENCE = {
  MAX: 7,
  STRONG: 5,
  MILD: 2.5,
  WEAK: 1.5,
  MIN: 1,
};
export enum GAUGE_KEYS {
  VITALITY = 'VITALITY',
  STAMINA = 'STAMINA',
  MANA = 'MANA',
}
interface GaugeInfo {
  title: string;
  description: string;
}

export const GAUGE_TITLES: { [key in GAUGE_KEYS]: string } = {
  VITALITY: 'vitality',
  STAMINA: 'stamina',
  MANA: 'mana',
};
export const GAUGE_DESCRIPTIONS: { [key in GAUGE_KEYS]: string } = {
  VITALITY:
    'Represents the overall health and energy that keeps you awake and alive.',
  STAMINA:
    'Represents the energy reserve that allows you to do task and an extra boost in actions. ',
  MANA: 'Represents the allowance to manipulate the supernatural powers.',
};
export const GAUGE_INFOS: { [key in GAUGE_KEYS]: GaugeInfo } = Object.keys(
  GAUGE_KEYS
).reduce((acc, key) => {
  acc[key as GAUGE_KEYS] = {
    title: GAUGE_TITLES[key as GAUGE_KEYS],
    description: GAUGE_DESCRIPTIONS[key as GAUGE_KEYS],
  };
  return acc;
}, {} as { [key in GAUGE_KEYS]: GaugeInfo });
export const GAUGE_MODFIERS: {
  [key in GAUGE_KEYS]: { [key in STAT_KEY]: number };
} = {
  VITALITY: {
    VIGOR: MODFIERS_INFLUENCE.MAX * MODFIERS_INTENSITY,
    ENDURANCE: MODFIERS_INFLUENCE.MAX * MODFIERS_INTENSITY,
    RESOLVE: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    RESISTENCE: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    STRENGTH: MODFIERS_INFLUENCE.MILD * MODFIERS_INTENSITY,
    DEXTERITY: MODFIERS_INFLUENCE.MILD * MODFIERS_INTENSITY,
    POTENCY: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    ESOTERISM: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    KARMA: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    AGILITY: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    PERCEPTION: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    INTELLIGENCE: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    CUNNING: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    INTUITION: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    LUCK: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    CHARISMA: MODFIERS_INFLUENCE.MIN * MODFIERS_INTENSITY,
  },
  STAMINA: {
    ENDURANCE: MODFIERS_INFLUENCE.MAX * MODFIERS_INTENSITY,
    VIGOR: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    DEXTERITY: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    AGILITY: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    RESISTENCE: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    RESOLVE: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    INTUITION: MODFIERS_INFLUENCE.MILD * MODFIERS_INTENSITY,
    STRENGTH: MODFIERS_INFLUENCE.MILD * MODFIERS_INTENSITY,
    POTENCY: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    PERCEPTION: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    CUNNING: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    LUCK: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    INTELLIGENCE: MODFIERS_INFLUENCE.MIN * MODFIERS_INTENSITY,
    CHARISMA: MODFIERS_INFLUENCE.MIN * MODFIERS_INTENSITY,
    ESOTERISM: MODFIERS_INFLUENCE.MIN * MODFIERS_INTENSITY,
    KARMA: MODFIERS_INFLUENCE.MIN * MODFIERS_INTENSITY,
  },
  MANA: {
    POTENCY: MODFIERS_INFLUENCE.MAX * MODFIERS_INTENSITY,
    INTELLIGENCE: MODFIERS_INFLUENCE.MAX * MODFIERS_INTENSITY,
    ESOTERISM: MODFIERS_INFLUENCE.MAX * MODFIERS_INTENSITY,
    KARMA: MODFIERS_INFLUENCE.MAX * MODFIERS_INTENSITY,
    VIGOR: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    CUNNING: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    RESISTENCE: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    ENDURANCE: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    RESOLVE: MODFIERS_INFLUENCE.STRONG * MODFIERS_INTENSITY,
    INTUITION: MODFIERS_INFLUENCE.MILD * MODFIERS_INTENSITY,
    CHARISMA: MODFIERS_INFLUENCE.MILD * MODFIERS_INTENSITY,
    PERCEPTION: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    LUCK: MODFIERS_INFLUENCE.WEAK * MODFIERS_INTENSITY,
    DEXTERITY: MODFIERS_INFLUENCE.MIN * MODFIERS_INTENSITY,
    AGILITY: MODFIERS_INFLUENCE.MIN * MODFIERS_INTENSITY,
    STRENGTH: MODFIERS_INFLUENCE.MIN * MODFIERS_INTENSITY,
  },
};

/*
  
  */

export class Gauge extends ChildComponent {
  //@description tua mãe tem um
  title: string = '';
  //@description mostra valor maximo sem modificadores
  value: number = 80;
  //@description 'dano' sofrido no gauge
  consumed: number = 0;
  constructor(parent: Figure | Company) {
    super(parent);
  }
  static instantiate(data: any): Gauge {
    let obj = new Gauge(data.parent);

    obj.key = data.key;
    obj.title = data.title;
    obj.value = data.value;
    obj.consumed = data.consumed;

    return obj;
  }
  getModValue(): number {
    if (this.parent instanceof Figure) {
      const mods = GAUGE_MODFIERS[this.key as GAUGE_KEYS];
      let value = this.value;
      for (let mod of Object.keys(mods)) {
        value +=
          (this.parent as Figure).getStat(mod).getInfluenceValue() *
          (mods[mod as STAT_KEY] || 1);
      }

      return value * (1 + this.parent.level / 15);
    } else if (this.parent instanceof Company) {
      let value = 0;
      let biggestValue = 0;
      let leaderValue = 0;
      for (let member of this.parent.members) {
        const localValue = member.character
          .getGauge(GAUGE_KEYS.STAMINA)
          .getModValue();
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
      return (
        (value + biggestValue + leaderValue) / (this.parent.members.length + 2)
      );
    } else {
      return 0;
    }
  }
  getCurrentValue() {
    return this.getModValue() - this.consumed;
  }
  canHandleValue(value: number): boolean {
    return this.getCurrentValue() - value > 0;
  }
}

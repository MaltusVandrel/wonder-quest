import { EventEmitter } from '@angular/core';
import { ChildComponent } from './child-component';
import { Figure } from './figure';
import { Company } from './company';
export enum STAT_KEYS {
  STRENGTH = 'STRENGTH',
  ENDURANCE = 'ENDURANCE',
  VIGOR = 'VIGOR',
  AGILITY = 'AGILITY',
  DEXTERITY = 'DEXTERITY',
  PERCEPTION = 'PERCEPTION',
  INTELLIGENCE = 'INTELLIGENCE',
  CUNNING = 'CUNNING',
  RESOLVE = 'RESOLVE',
  CHARISMA = 'CHARISMA',
  INTUITION = 'INTUITION',
  LUCK = 'LUCK',
  POTENCY = 'POTENCY',
  RESISTENCE = 'RESISTENCE',
  ESOTERISM = 'ESOTERISM',
  KARMA = 'KARMA',
}
export const STAT_TITLES = {
  STRENGTH: 'strength', //how phisically powerful the body is, good for regular damage,
  ENDURANCE: 'endurace', //bodly strenght to reduce and sustain damage, good for defense and stamina
  VIGOR: 'vigor', //how lively the body is, good for vitality and stamina and a little for mana
  AGILITY: 'agility', //how fast someone is, good for attack priority, evasion, finese damage, map movement and stamina
  DEXTERITY: 'dexterity', //how precise someone are, good for accurracy, finese damage, stamina, and a bit of everything
  PERCEPTION: 'perception', //how sharp your senses are, good accurracy and evasion
  INTELLIGENCE: 'intelligence', // How easy is for someone to store and new information, good for most spells and mana, raises XP potential
  CUNNING: 'cunning', // how sharp and knolegeable someone is, good for most spells and mana, raises XP potential
  RESOLVE: 'resolve', //mental resilience, good for resisting some spells, good for mana
  CHARISMA: 'charisma', //aprocheability and vibes, helps with interactions, good for some spells
  INTUITION: 'intuition', //not exactly supernatural sense, its more gut feeling. good for sensing deception, and gathering unspoke info
  LUCK: 'luck', // useful in random situations, in the world or critical strikes, and a little good for everything
  POTENCY: 'potency', //base power and mastery of magic, good for magic/spells, good for mana
  RESISTENCE: 'resistence', //resistence to magical attacks and effects
  ESOTERISM: 'esoterism', //familiarity with magic vibes, good for items and entity/god granted spells,  good for mana
  KARMA: 'karma', //useful in gathering randomnes of favor of entity/gods
};
export const STAT_DESCRIPTIONS = {
  STRENGTH:
    'Represents how phisically powerful the body is, its good for phisical damage',
  ENDURANCE:
    'Represents the capability of sustain and mitigate damage, good for its good for defense and stamina',
  VIGOR:
    'Represents the how lively the body is, its good for vitality and stamina and vigor, mildy affects positively mana',
  AGILITY:
    'Represents how fast someone acts and reacts, good for attack priority, evasion, finese damage, map movement and stamina',
  DEXTERITY:
    'Represents how precise someone are, good for accurracy, finese damage, stamina, and a bit of everything',
  PERCEPTION:
    'Represents how sharp your senses are, good accurracy and evasion',
  INTELLIGENCE:
    'Represents how dependable someone mind is, good for spells, mana, and reises XP potential',
  CUNNING:
    'Represents how sharp someone is, good for spells, mana, raises the quickness to learn something and helps with gathering info.',
  RESOLVE:
    'Represents mental resilience, great for mana, good for resisting some some spells and mildly affects positively stamina',
  CHARISMA:
    'Represents aprocheability and vibes, helps with interactions, good for some spells',
  INTUITION:
    'Represents the instrinsical instinct, the gut feeling, good for sensing deception, and gathering unspoke info',
  LUCK: 'Represents the likelyness of fortuitus results in random situations, good for critical strikes, and a little good for everything',
  POTENCY:
    'Represents the base power and will over magic, good for spells, good for mana',
  RESISTENCE: 'Represents the resistency agains magic and effects',
  ESOTERISM:
    'Represents familiarity with magic vibes, good for magic items, entity and god granted spells, good for mana',
  KARMA:
    'Represents the intensity of your impression on entities and gods, good for interaction with otherwordly, good for granted spells and mana',
};

export class Stat extends ChildComponent {
  title: string = '';
  value: number = 10;
  modValue: number = 10;

  static instantiate(data: any): Stat {
    let obj = new Stat(data.parent);

    obj.key = data.key;
    obj.title = data.title;
    obj.value = data.value;
    obj.modValue = data.modValue;

    return obj;
  }
  getCurrentValue(): number {
    return this.value;
  }
  getInfluenceValue(): number {
    return (this.value - 10) / 2;
  }
  constructor(parent: Figure | Company) {
    super(parent);
  }
}

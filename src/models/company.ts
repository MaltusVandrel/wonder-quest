import { Actor } from './actor';
import { defaultGauge, Gauge } from './gauge';
import { Item } from './item';

export enum COMPANY_POSITION {
  LEADER = 'LEADER',
  COMBATENT = 'COMBATENT',
  DEFENSOR = 'DEFENSOR',
  WORKER = 'WORKER',
  GUEST = 'GUEST',
  PROTECTED = 'PROTECTED',
  PRISIONER = 'PRISIONER',
}
export class Company {
  title: string = 'Company';
  members: { character: Actor; positions: COMPANY_POSITION[] }[] = [];
  inventory: Item[] = [];
  stamina: Gauge = { ...defaultGauge };
  static untieCircularReference(figure: Company): any {
    let data = { ...figure };
    for (let member of data.members) {
      member.character = Actor.untieCircularReference(member.character);
    }
    return data;
  }
  static instantiate(data: any): Company {
    let obj = new Company();
    obj.stamina = data.stamina;
    obj.title = data.title;
    for (let member of data.members) {
      member.character = Actor.instantiate(member.character);
      obj.members.push(member);
    }
    for (let item of data.inventory) {
      obj.inventory.push(item);
    }

    return obj;
  }
}
export interface CompanyTeam {
  members: Actor[];
  type: COMPANY_POSITION;
}

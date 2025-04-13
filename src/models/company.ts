import { Figure } from './figure';
import { Gauge } from './gauge';
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
  members: { character: Figure; positions: COMPANY_POSITION[] }[] = [];
  inventory: Item[] = [];
  stamina: Gauge = new Gauge(this);
  static untieCircularReference(figure: Company): any {
    let data = { ...figure };
    data.stamina.parent = undefined;
    for (let member of data.members) {
      member.character = Figure.untieCircularReference(member.character);
    }
    return data;
  }
  static instantiate(data: any): Company {
    let obj = new Company();
    data.stamina.parent = obj;
    for (let member of data.members) {
      member.character = Figure.instantiate(member.character);
      obj.members.push(member);
    }
    for (let item of data.inventory) {
      obj.inventory.push(item);
    }

    return obj;
  }
}
export interface CompanyTeam {
  members: Figure[];
  type: COMPANY_POSITION;
}

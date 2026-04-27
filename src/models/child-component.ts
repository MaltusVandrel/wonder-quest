import { Actor } from './actor';
import { Company } from './company';

export class ChildComponent {
  parent: Actor | Company | undefined;
  key: any;
  constructor(parent: Actor | Company) {
    this.parent = parent;
  }
  init(parent: Actor | Company) {
    this.parent = parent;
  }
}

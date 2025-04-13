import { EventEmitter } from '@angular/core';
import { Figure } from './figure';
import { Company } from './company';

export class ChildComponent extends EventEmitter {
  parent: Figure | Company | undefined;
  key: any;
  constructor(parent: Figure | Company) {
    super();
    this.parent = parent;
  }
  init(parent: Figure | Company) {
    this.parent = parent;
  }
}

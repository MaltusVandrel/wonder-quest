import { EventEmitter } from '@angular/core';
import { Actor } from './actor';
import { Company } from './company';

export class ChildComponent extends EventEmitter {
  parent: Actor | Company | undefined;
  key: any;
  constructor(parent: Actor | Company) {
    super();
    this.parent = parent;
  }
  init(parent: Actor | Company) {
    this.parent = parent;
  }
}

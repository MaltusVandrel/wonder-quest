import { EventEmitter } from '@angular/core';
import { ChildComponent } from './child-component';

export class Stat extends ChildComponent {
  title: string = '';
  value: number = 10;
  modValue: number = 10;

  static instantiate(data: any): Stat {
    let obj = new Stat();

    obj.key = data.key;
    obj.parent = data.parent;
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
  constructor() {
    super();
  }
}

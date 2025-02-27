import { EventEmitter } from '@angular/core';
import { ChildComponent } from './child-component';

export class Stat extends ChildComponent {
  title: string = '';
  value: number = 10;
  modValue: number = 10;
  constructor() {
    super();
  }
}

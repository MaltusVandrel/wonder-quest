import { ChildComponent } from './child-component';

export class Gauge extends ChildComponent {
  //@description tua mãe tem um
  title: string = '';
  //@description mostra valor maximo sem modificadores
  value: number = 100;
  //@description mostra valor maximo considerando modificadores
  modValue: number = 100;
  //@description 'dano' sofrido no gauge
  consumed: number = 0;
  constructor() {
    super();
  }
  getCurrentValue() {
    return this.modValue - this.consumed;
  }
  canHandleValue(value: number): boolean {
    return this.getCurrentValue() - value > 0;
  }
}

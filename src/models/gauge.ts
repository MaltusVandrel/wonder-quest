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
  static instantiate(data: any): Gauge {
    let obj = new Gauge();

    obj.key = data.key;
    obj.parent = data.parent;
    obj.title = data.title;
    obj.value = data.value;
    obj.modValue = data.modValue;
    obj.consumed = data.consumed;

    return obj;
  }
  getCurrentValue() {
    return this.modValue - this.consumed;
  }
  canHandleValue(value: number): boolean {
    return this.getCurrentValue() - value > 0;
  }
}

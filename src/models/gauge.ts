import { GAUGE_KEYS, GAUGE_MODFIERS } from 'src/data/bank/gauge';
import { ChildComponent } from './child-component';
import { Figure } from './figure';
import { STAT_KEYS } from 'src/data/bank/stats';

export class Gauge extends ChildComponent {
  //@description tua mãe tem um
  title: string = '';
  //@description mostra valor maximo sem modificadores
  value: number = 80;
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
    obj.consumed = data.consumed;

    return obj;
  }
  getModValue(): number {
    const mods = GAUGE_MODFIERS[this.key as GAUGE_KEYS];
    let value = this.value;
    for (let mod of Object.keys(mods)) {
      value +=
        (this.parent as Figure).getStat(mod).getInfluenceValue() *
        (mods[mod as STAT_KEYS] || 1);
    }

    return value * (1 + this.parent.level / 15);
  }
  getCurrentValue() {
    return this.getModValue() - this.consumed;
  }
  canHandleValue(value: number): boolean {
    return this.getCurrentValue() - value > 0;
  }
}

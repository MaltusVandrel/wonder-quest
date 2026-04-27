import { defaultGauge, Gauge } from './gauge';
import { Item } from './item';

export class ZoneResource {
  supply: Gauge;
  item: Item;
  constructor(item: Item) {
    this.supply = { ...defaultGauge };
    this.item = item;
  }
}

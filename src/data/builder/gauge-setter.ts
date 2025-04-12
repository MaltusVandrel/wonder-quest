import { Gauge } from '../../models/gauge';
import { Figure } from '../../models/figure';
import { GAUGE_KEYS, GAUGE_TITLES } from '../bank/gauge';

let GAUGES: Gauge[] = [];

export function setGauges(being: Figure) {
  for (let key of Object.keys(GAUGE_KEYS)) {
    let gauge = new Gauge();
    gauge.title = { ...GAUGE_TITLES }[key] || '';
    gauge.key = key || '';
    gauge.parent = being;
    being.gauges.push(gauge);
  }
}

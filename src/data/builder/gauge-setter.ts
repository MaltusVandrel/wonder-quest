import { Gauge, GAUGE_KEYS, GAUGE_TITLES } from '../../models/gauge';
import { Figure } from '../../models/figure';

let GAUGES: Gauge[] = [];

export function setGauges(being: Figure) {
  for (let key of Object.keys(GAUGE_KEYS)) {
    let gauge = new Gauge(being);
    gauge.title = { ...GAUGE_TITLES }[key] || '';
    gauge.key = key || '';
    being.gauges.push(gauge);
  }
}

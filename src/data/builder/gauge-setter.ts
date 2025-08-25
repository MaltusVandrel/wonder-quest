import {
  defaultGauge,
  Gauge,
  GAUGE_KEYS,
  GAUGE_TITLES,
  GaugeKey,
} from '../../models/gauge';
import { Actor } from '../../models/actor';

let GAUGES: Gauge[] = [];

export function setGauges(being: Actor, value?: number) {
  for (let key of Object.keys(GAUGE_KEYS)) {
    let gauge = { ...defaultGauge };
    gauge.title = { ...GAUGE_TITLES }[key] || '';
    gauge.key = key || '';
    if (value) gauge.value = value;
    being.gauges[key as GaugeKey] = gauge;
  }
}

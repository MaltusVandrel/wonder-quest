/**
 * @TODO lol imagine how many multi directional conections, like, not now tho */
export interface Property {
  key: string;
  name: string;
}

export const PROPERTY_LIST: { [key: string]: Property } = {
  damage_type_impact: { key: 'dmg.type.impact', name: 'impact' },
};

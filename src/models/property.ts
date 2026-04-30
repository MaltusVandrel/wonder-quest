/**
 * @TODO lol imagine how many multi directional conections, like, not now tho */
export interface Property {
  key: string;
  name: string;
}

export const PROPERTY_LIST: { [key: string]: Property } = {
  damage_type_impact: { key: 'dmg.type.impact', name: 'impact' },
  damage_type_slash: { key: 'dmg.type.slash', name: 'slash' },
  damage_type_electric: { key: 'dmg.type.electric', name: 'electric' },
};

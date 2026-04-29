import { BIOME_TYPES } from '@/data/bank/biome';

export interface Biome {
  type: BIOME_TYPES;
  color: number;
  staminaCost: number;
  timeCost: number;
  regionId?: string;
  influenceValues?: {
    elevation: number;
    moisture: number;
    temperature: number;
    localVariation: number;
    wonder: number;
  };
}

export interface Biome {
  type: string;
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

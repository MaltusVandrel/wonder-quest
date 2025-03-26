export interface Biome {
  type: string;
  color: number;
  staminaCost: number;
  timeCost: number;
  influenceValues?: {
    elevation: number;
    moisture: number;
    temperature: number;
    localVariation: number;
    wonder: number;
  };
}

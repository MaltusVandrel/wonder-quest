const MAP_ZONE_TYPES = {};

/**
 * @descrption Area that holds an amouth of enconters and resources and characteristics and encounters
 * */
export interface MapZone {
  /**
   * @descrption thats the zone health
   * */
  influence: number;
  /**
   * @descrption thats chance percentual of it spreading away from its original biome
   * */
  biomeBoundIntensity: number;
  /**
   * @descrption thats chance percentual of it spreading away from its original biome
   * */
  originBoundIntensity: number;
  origin: { x: number; y: number };
}

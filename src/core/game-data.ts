import { Figure } from 'src/models/figure';

export interface GameData {
  /**
   * @description it's in minutes
   *   */
  time: number;
  /**
   * @description it's the player, duh
   *   */
  playerData: Figure;
  mapSeed: string;
  mapPos: any;
}

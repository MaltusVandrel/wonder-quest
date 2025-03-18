import { Figure } from 'src/models/figure';

export interface GameData {
  /**
   * @description it's in minutes
   *   */
  time: number;

  playerData: Figure;
  mapSeed: string;
  mapPos: any;
}

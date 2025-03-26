import { Figure } from './figure';
import { Item } from './item';

export interface Party {
  members: Figure[];
  inventory: Item[];
}

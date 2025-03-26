import { Party } from 'src/models/party';

export interface EncounterScheme {
  key: string;
  title: string;
  description: string;
  chance: number;
  requirement: (
    data: Party
  ) => [boolean, /* @description requirement explanation*/ string];
}

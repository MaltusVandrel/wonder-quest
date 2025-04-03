import { Biome } from 'src/models/biome';
import { BIOME_TYPES, BIOMES } from './biome';
import { GameDataService } from 'src/services/game-data.service';
import { MapScene } from 'src/scenes/map.scene';
import { MapPathUtils } from 'src/utils/map-path.utils';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';
import seedrandom from 'seedrandom';
//import seedrandom from 'seedrandom';

interface MapRegionScheme {
  name: string;
  seedBiomeType: BIOME_TYPES;
  relativeBiomes: Array<BIOME_TYPES>;
  tileLimit: number;
}
export interface MapRegion {
  id: number;
  name: string;
  seedBiomeType: BIOME_TYPES;
  seedTile: { x: number; y: number };
  relativeBiomes: Array<BIOME_TYPES>;
  tiles: Array<{ x: number; y: number }>;
  tileLimit: number;
  funDebugColor: number;
  hitBox?: {
    topLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
}

const florestScheme: MapRegionScheme = {
  name: 'Florest',
  seedBiomeType: BIOME_TYPES.WOODS,
  relativeBiomes: [
    BIOME_TYPES.GROVE,
    BIOME_TYPES.WOODS,
    BIOME_TYPES.ENCHANTED_WOODS,
    BIOME_TYPES.SWAMP,
  ],
  tileLimit: 2500,
};
const mountainScheme: MapRegionScheme = {
  name: 'Mountain',
  seedBiomeType: BIOME_TYPES.MOUNTAINS,
  relativeBiomes: [
    BIOME_TYPES.MOUNTAINS,
    BIOME_TYPES.HIGH_MOUNTAINS,
    BIOME_TYPES.SNOWY_PEAKS,
  ],
  tileLimit: 2500,
};
const waterScheme: MapRegionScheme = {
  name: 'Water Body',
  seedBiomeType: BIOME_TYPES.DEEP_WATERS,
  relativeBiomes: [
    BIOME_TYPES.DEEP_WATERS,
    BIOME_TYPES.SHALLOW_WATERS,
    BIOME_TYPES.REEFS,
    BIOME_TYPES.BEACH,
    BIOME_TYPES.CLIFF,
    BIOME_TYPES.MARSH,
  ],
  tileLimit: 2500,
};
const plainsScheme: MapRegionScheme = {
  name: 'Plains',
  seedBiomeType: BIOME_TYPES.PLAINS,
  relativeBiomes: [
    BIOME_TYPES.PLAINS,
    BIOME_TYPES.HIGH_GRASS,
    BIOME_TYPES.HILLS,
  ],
  tileLimit: 2500,
};
const desertScheme: MapRegionScheme = {
  name: 'Desert',
  seedBiomeType: BIOME_TYPES.DESERT,
  relativeBiomes: [BIOME_TYPES.DESERT, BIOME_TYPES.DUNES],
  tileLimit: 2500,
};
const schemes: MapRegionScheme[] = [
  plainsScheme,
  florestScheme,
  waterScheme,
  mountainScheme,
  desertScheme,
];

const letras: Array<string> =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789☼☽Ω℧☃★☭☯♁♔♕♖♗♘♙♚♛♜♝♞♟♠♡♢♣♤♥♦♧⚀⚁⚂⚃⚄⚅⚆⚜⚬❦'.split(
    ''
  );
const regionSize: number = 128;
const goodPlaces = [
  'Bright',
  'Lush',
  'Serene',
  'Majestic',
  'Sacred',
  'Tranquil',
  'Verdant',
  'Glorious',
  'Radiant',
  'Harmonious',
];
const neutralPlaces = [
  'Vast',
  'Remote',
  'Endless',
  'Silent',
  'Steady',
  'Timeless',
  'Isolated',
  'Balanced',
  'Distant',
  'Uncharted',
];
const badPlaces = [
  'Hollow',
  'Desolate',
  'Dreadful',
  'Forlorn',
  'Cursed',
  'Gloomy',
  'Forsaken',
  'Bleak',
  'Sinister',
  'Haunted',
];
/*
const monsterPossession = [
  "of Goblins", "of the Undead", "of the Cursed", "of the Damned", "of the Shadows", 
  "of the Beasts", "of the Lurking Horrors", "of the Corrupted", "of the Darkspawn", "of the Infernal"
];

const humanPossession = [
  "of Kings","of Big Boobs", "of the Amazons", "of the Forgotten Warriors", "of the Noble Houses", "of the Lost Empire", 
  "of the Conquerors", "of the Silent Watchers", "of the Exiled", "of the Ancient Bloodline", "of the Betrayed"
];

const neutralPossession = [
  "of the Ancients", "of the Deep", "of the Unknown", "of the Forgotten Lands", "of the Endless Roads", 
  "of the Silent Plains", "of the Wandering Spirits", "of the Hidden Paths", "of the Eternal Cycle", "of the Vanishing Sun"
];
*/

export function getRegionSeed(x: number, y: number, biome: Biome): number {
  //here lie , yall were helpfull as fuck, thank u guys

  const regionX = Math.floor((x + regionSize / 2) / regionSize);
  const regionY = Math.floor((y + regionSize / 2) / regionSize);
  const symbolX = regionX < 0 ? '-' : '+';
  const symbolY = regionY < 0 ? '-' : '+';

  //está correto!!!!
  const indeX = Math.abs(regionX) % letras.length;
  //sim é indeY!!!!
  const indeY = Math.abs(regionY) % letras.length;
  const valueCode = symbolX + letras[indeX] + symbolY + letras[indeY];

  const rng = seedrandom(valueCode + '|' + biome.type);
  const truestRandomEver = rng();

  return truestRandomEver;
}
export function getRegionName(x: number, y: number, biome: Biome) {
  const truestRandomEver = getRegionSeed(x, y, biome);
  const wonder = biome.influenceValues?.wonder || Math.random();
  const index = Math.floor(truestRandomEver * 10);
  let title = '';
  if (wonder < 1 / 3) {
    title = badPlaces[index];
  } else if (wonder < 2 / 3) {
    title = neutralPlaces[index];
  } else {
    title = goodPlaces[index];
  }
  return title + ' ' + biome.type;
}

function getHitBox(region: MapRegion): {
  topLeft: { x: number; y: number };
  bottomRight: { x: number; y: number };
} {
  return {
    topLeft: getTopLeftHitArea(region),
    bottomRight: getBottomRightHitArea(region),
  };
}
function getTopLeftHitArea(region: MapRegion): { x: number; y: number } {
  const firstTopTile = getFirstTopTile(region);
  const firstLeftTile = getFirstLeftTile(region);
  return {
    x: firstLeftTile.x,
    y: firstTopTile.y,
  };
}
function getBottomRightHitArea(region: MapRegion): { x: number; y: number } {
  const lastBottomTile = getLastBottomTile(region);
  const lastRightTile = getLastRightTile(region);
  return {
    x: lastRightTile.x,
    y: lastBottomTile.y,
  };
}
function getFirstTopTile(region: MapRegion): { x: number; y: number } {
  return region.tiles.reduce((topTile, currentTile) => {
    return currentTile.y < topTile.y ? currentTile : topTile;
  }, region.tiles[0]);
}
function getLastBottomTile(region: MapRegion): { x: number; y: number } {
  return region.tiles.reduce((topTile, currentTile) => {
    return currentTile.y > topTile.y ? currentTile : topTile;
  }, region.tiles[0]);
}
function getFirstLeftTile(region: MapRegion): { x: number; y: number } {
  return region.tiles.reduce((topTile, currentTile) => {
    return currentTile.x < topTile.x ? currentTile : topTile;
  }, region.tiles[0]);
}
function getLastRightTile(region: MapRegion): { x: number; y: number } {
  return region.tiles.reduce((topTile, currentTile) => {
    return currentTile.x > topTile.x ? currentTile : topTile;
  }, region.tiles[0]);
}
//Deserves to live cuz was helpful once. they pastel colors btw.
const arrayzinhoFodase = [
  0xffffcc, 0xffcc99, 0xffcccc, 0xff99cc, 0xffccff, 0xccccff, 0x99ccff,
  0xcc99ff, 0xccffff, 0x99ffcc, 0xccffcc, 0xccff99,
];

//fazer por quadrantes semi randomicos direcionais
// havera problema na competição por bioma entre quadrantes

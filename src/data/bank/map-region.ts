import { Biome } from 'src/models/biome';
import { BIOME_TYPES, BIOMES } from './biome';
import { GameDataService } from 'src/services/game-data.service';
import { MapScene } from 'src/scenes/map.scene';
import { MapPathUtils } from 'src/utils/map-path.utils';
import { MapGeneratorUtils } from 'src/utils/map-generator.utils';

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
// quando o mapa for carregado ele tem que verificar se
// na zona visivel há alguma regiao e aplicar corretamente ás
// tiles apropriadas. Leve em consideracao grid offset, fuck u;
function loadKnewRegionsInVisibleMap(): void {}
//Fazer limitante (acho que planice tá expandindo muito)
// Fazer com um só schema pra testar (acho que montanha é preferencial)
export function findUnregistredRegionInVisibleMap(mapScene: MapScene): void {
  const tileLayer: Array<Array<Phaser.GameObjects.Rectangle>> =
    mapScene.tileLayer;
  const offsetX = mapScene.gridOffsetX;
  const offsetY = mapScene.gridOffsetY;
  const registeredRegions = GameDataService.GAME_DATA.registeredRegions || [];
  const directions = MapPathUtils.DIRECTIONS;
  for (let screenGridY = 0; screenGridY < tileLayer.length; screenGridY++) {
    for (
      let screenGridX = 0;
      screenGridX < tileLayer[screenGridY].length;
      screenGridX++
    ) {
      const tile = tileLayer[screenGridY][screenGridX];
      const biome = tile.getData('biome');
      if (tile.getData('region') != null) {
        continue;
      }

      const scheme = schemes.find((s) =>
        s.relativeBiomes.some((type) => type === biome.type)
      );

      if (scheme != undefined) {
        const x = screenGridX + offsetX;
        const y = screenGridY + offsetY;
        const newRegion: MapRegion = {
          id: registeredRegions.length,
          name: scheme.name,
          seedBiomeType: scheme.seedBiomeType,
          seedTile: { x, y },
          relativeBiomes: scheme.relativeBiomes,
          tiles: [],
          tileLimit: scheme.tileLimit,
          funDebugColor:
            arrayzinhoFodase[
              Math.floor(Math.random() * arrayzinhoFodase.length)
            ],
        };
        let foundRelative = false;
        let explorationArea: Array<{
          tile: { x: number; y: number };
          searched: boolean;
        }> = [{ tile: { x, y }, searched: false }];

        do {
          foundRelative = false;
          const unsearched = explorationArea.filter((e) => !e.searched);
          if (!unsearched) break;
          unsearched.forEach((unsearchedTile) => {
            directions.forEach((direction) => {
              const neigbourX = unsearchedTile.tile.x + direction[0];
              const neigbourY = unsearchedTile.tile.y + direction[1];
              const neighbourBiome: Biome = MapGeneratorUtils.getBiomeData(
                neigbourX,
                neigbourY
              );
              if (!neighbourBiome) {
                return;
              }
              const tileIsMapped = explorationArea.find(
                (e) => e.tile.x === neigbourX && e.tile.y === neigbourY
              );
              if (tileIsMapped) {
                return;
              }
              const biomeIsOfTypeScheme = scheme.relativeBiomes.find(
                (type) => type === neighbourBiome.type
              );
              if (biomeIsOfTypeScheme) {
                explorationArea.push({
                  tile: { x: neigbourX, y: neigbourY },
                  searched: false,
                });
                foundRelative = true;
              }
            });
            unsearchedTile.searched = true;
          });
        } while (
          foundRelative &&
          newRegion.tileLimit >= explorationArea.length
        );

        newRegion.tiles = explorationArea.map((e) => e.tile);

        explorationArea.forEach((e) => {
          try {
            tileLayer[e.tile.y - offsetY][e.tile.x - offsetX].setData(
              'region',
              newRegion.id
            );
          } catch (e) {}
        });

        registeredRegions.push(newRegion);
      }
    }
  }
  GameDataService.GAME_DATA.registeredRegions = registeredRegions;
}
//Deserves to live cuz was helpful once. they pastel colors btw.
const arrayzinhoFodase = [
  0xffffcc, 0xffcc99, 0xffcccc, 0xff99cc, 0xffccff, 0xccccff, 0x99ccff,
  0xcc99ff, 0xccffff, 0x99ffcc, 0xccffcc, 0xccff99,
];

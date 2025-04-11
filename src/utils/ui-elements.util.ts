import { GAUGE_KEYS } from 'src/data/bank/gauge';
import { MapScene } from 'src/scenes/map.scene';
import { GameDataService } from 'src/services/game-data.service';

function doRestButton() {
  const mapScene = window.game.scene.getScene('map-scene');
  const mapUIScene = window.game.scene.getScene('map-ui-scene');
  const button = document.createElement('button');
  button.classList.add('ui-game-button');
  button.innerHTML = 'REST';
  button.classList.add('rest-button');
  button.addEventListener('click', (event) => {
    let stamina = GameDataService.GAME_DATA.playerData.getGauge(
      GAUGE_KEYS.STAMINA
    );
    stamina.consumed = 0;
    GameDataService.GAME_DATA.time += 8 * 60;
    mapScene.doColorFilter();
    mapUIScene.showStaminaGauge();
    mapUIScene.showCurrentTime();
  });
  button.addEventListener('mouseenter', () => {
    MapScene.HOVER_UI_ELEMENT = true;
  });

  button.addEventListener('mouseleave', () => {
    MapScene.HOVER_UI_ELEMENT = false;
  });
  document.getElementsByTagName('body')[0].appendChild(button);
}

export function setUpUi() {
  doRestButton();
}

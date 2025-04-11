import { GAUGE_KEYS } from 'src/data/bank/gauge';
import { MapScene } from 'src/scenes/map.scene';
import { GameDataService } from 'src/services/game-data.service';

function setHoverBlocking(element: HTMLElement) {
  element.addEventListener('mouseenter', () => {
    MapScene.HOVER_UI_ELEMENT = true;
  });

  element.addEventListener('mouseleave', () => {
    MapScene.HOVER_UI_ELEMENT = false;
  });
}
function doRestButton() {
  const mapScene = window.game.scene.getScene('map-scene');
  const mapUIScene = window.game.scene.getScene('map-ui-scene');
  const button = document.createElement('button');
  button.classList.add('ui-element');
  button.classList.add('ui-game-button');
  button.innerHTML = 'REST!';
  button.classList.add('rest-button');
  button.addEventListener('click', (event) => {
    let stamina = GameDataService.GAME_DATA.playerData.getGauge(
      GAUGE_KEYS.STAMINA
    );
    stamina.consumed = 0;
    GameDataService.GAME_DATA.time += 8 * 60;
    mapScene.doColorFilter();
    showStaminaGauge();
    mapUIScene.showCurrentTime();
  });
  setHoverBlocking(button);
  document.getElementsByTagName('body')[0].appendChild(button);
}
function doStatusPanel() {
  const mapScene = window.game.scene.getScene('map-scene');
  const mapUIScene = window.game.scene.getScene('map-ui-scene');
  const panel = document.createElement('div');
  panel.classList.add('ui-element');
  panel.classList.add('ui-panel');
  panel.classList.add('ui-display-column');
  panel.classList.add('ui-pos-topright');
  panel.classList.add('ui-game-button');
  panel.classList.add('rest-button');

  const smol = document.createElement('small');
  const labelStamina = document.createElement('label');
  const outputStamina = document.createElement('output');
  labelStamina.innerHTML = 'Stamina: ';
  labelStamina.setAttribute('for', 'gauge-stamina');
  outputStamina.id = 'gauge-stamina-value';
  outputStamina.name = 'gauge-stamina';
  outputStamina.style.float = 'right';
  smol.appendChild(labelStamina);
  smol.appendChild(outputStamina);
  panel.appendChild(smol);
  //panel.addEventListener('click', (event) => {});
  const staminaMeter = document.createElement('meter');
  staminaMeter.id = 'gauge-stamina-meter';
  staminaMeter.setAttribute('min', '0');
  staminaMeter.setAttribute('max', '100');
  staminaMeter.setAttribute('low', '25');
  staminaMeter.setAttribute('high', '55');
  staminaMeter.setAttribute('optimum', '85');
  staminaMeter.setAttribute('value', '0');
  staminaMeter.classList.add('ui-width-100');
  staminaMeter.style.opacity = '0.6';
  panel.appendChild(staminaMeter);
  setHoverBlocking(panel);
  document.getElementsByTagName('body')[0].appendChild(panel);
}
export function setUpUi() {
  doRestButton();
  doStatusPanel();
  showStaminaGauge();
}

export function showStaminaGauge() {
  let elValue = document.getElementById('gauge-stamina-value');
  let elGauge = document.getElementById('gauge-stamina-meter');

  const stamina = GameDataService.GAME_DATA.playerData.getGauge(
    GAUGE_KEYS.STAMINA
  );
  const percentualStatus = (
    (stamina.getCurrentValue() / stamina.modValue) *
    100
  ).toFixed(2);
  if (elValue) {
    elValue.innerHTML = percentualStatus + '%';
  }
  if (elGauge) {
    elGauge.setAttribute('value', percentualStatus);
  }
}

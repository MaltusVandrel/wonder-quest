import { GAUGE_KEYS } from 'src/models/gauge';
import { MapScene } from 'src/scenes/map.scene';
import { GameDataService } from 'src/services/game-data.service';
import { showAlertDialog, showCompanyDialog } from './ui-notification.util';
import { FigureName, NAMES } from 'src/data/bank/names';
import { HERO_BUILDER } from 'src/data/builder/hero-builder';
import { Figure } from 'src/models/figure';
import { Stat } from 'src/models/stats';
import { COMPANY_POSITION } from 'src/models/company';

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
    let stamina = GameDataService.GAME_DATA.companyData.stamina;
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
  panel.classList.add('ui-display-row');
  panel.classList.add('ui-pos-topright');

  panel.classList.add('rest-button');

  const buttonsHold = document.createElement('div');
  buttonsHold.classList.add('ui-display-row');

  const characterButton = document.createElement('button');
  characterButton.classList.add('ra');
  characterButton.classList.add('ra-player');
  characterButton.classList.add('ui-game-button');
  characterButton.classList.add('dark-primary-text-color');
  characterButton.addEventListener('click', () => {
    showCompanyDialog();
  });
  buttonsHold.appendChild(characterButton);
  panel.appendChild(buttonsHold);

  const statusHolder = document.createElement('div');
  statusHolder.classList.add('ui-display-column');
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
  statusHolder.appendChild(smol);
  panel.appendChild(statusHolder);
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
  statusHolder.appendChild(staminaMeter);
  setHoverBlocking(panel);
  document.getElementsByTagName('body')[0].appendChild(panel);
}
export function showStaminaGauge() {
  let elValue = document.getElementById('gauge-stamina-value');
  let elGauge = document.getElementById('gauge-stamina-meter');

  const stamina = GameDataService.GAME_DATA.companyData.stamina;

  const percentualStatus = (
    (stamina.getCurrentValue() / stamina.getModValue()) *
    100
  ).toFixed(2);

  if (elValue) {
    elValue.innerHTML = percentualStatus + '%';
  }

  if (elGauge) {
    elGauge.setAttribute('value', percentualStatus);
  }
}

export function setMapUpUI() {
  doRestButton();
  doStatusPanel();
  showStaminaGauge();
}

const mainMenuUIElements: HTMLElement[] = [];
export function setUpMainMenuUI() {
  const mainMenuScene = window.game.scene.getScene('main-menu-scene');

  const buttonHolder = document.createElement('div');
  buttonHolder.classList.add('ui-element');
  buttonHolder.classList.add('ui-display-column');
  buttonHolder.classList.add('ui-pos-center');
  buttonHolder.classList.add('mainmenu-button-holder');

  const startButton = document.createElement('button');
  startButton.classList.add('ui-game-button');
  startButton.classList.add('mainmenu-button');
  startButton.innerHTML = 'START GAME';
  startButton.addEventListener('click', () => {
    mainMenuScene.startGame();
  });

  const continueButton = document.createElement('button');
  continueButton.classList.add('ui-game-button');
  continueButton.classList.add('mainmenu-button');
  continueButton.innerHTML = 'CONTINUE';
  continueButton.addEventListener('click', () => {
    mainMenuScene.loadGame();
  });

  const opcoesButton = document.createElement('button');
  opcoesButton.classList.add('ui-game-button');
  opcoesButton.classList.add('mainmenu-button');
  opcoesButton.innerHTML = 'OPTIONS';
  opcoesButton.addEventListener('click', () => {
    showAlertDialog(
      'Ask Fernando to take his head out of his ass and do the options menu.'
    );
  });

  buttonHolder.appendChild(startButton);
  if (GameDataService.existsData()) buttonHolder.appendChild(continueButton);
  buttonHolder.appendChild(opcoesButton);

  document.getElementsByTagName('body')[0].appendChild(buttonHolder);

  mainMenuUIElements.push(buttonHolder);
}
export function tearDownMainMenuUI() {
  mainMenuUIElements.forEach((el) => el.remove());
}

const characterCreationData: any = {};
export function setUpIntroductionUI() {
  const introductionScene = window.game.scene.getScene('introduction-scene');
  const mapScene = window.game.scene.getScene('map-scene');
  const introductionPanel = document.createElement('div');
  introductionPanel.id = 'introduction-panel';
  introductionPanel.classList.add('ui-element');
  introductionPanel.classList.add('ui-display-column');
  introductionPanel.classList.add('ui-pos-center');
  introductionPanel.classList.add('introduction-panel');

  const mainSection = document.createElement('section');
  mainSection.id = 'introduction-main-section';
  const menu = document.createElement('menu');
  menu.id = 'introduction-menu';
  const text = document.createElement('p');
  text.innerHTML = 'Choose the name of the vessel:';

  mainSection.appendChild(text);

  let index = 0;

  const names = [...NAMES];
  const popedNames: FigureName[] = [];

  do {
    const [popedElement] = names.splice(
      Math.floor(Math.random() * names.length),
      1
    );
    popedNames.push(popedElement);
    index++;
  } while (index < GameDataService.monthsInAYear);

  const nameHolder = document.createElement('div');
  nameHolder.classList.add('names-holder');

  popedNames.forEach((figureName: FigureName, index: number) => {
    const nameSelection = document.createElement('button');
    nameSelection.classList.add('name-option');
    nameSelection.innerHTML = figureName.name;
    nameSelection.addEventListener('click', () => {
      characterCreationData.month = index + 1;
      characterCreationData.figureName = figureName;
      mainSection.innerHTML = '';
      showTextIntroductionUI();
    });
    nameHolder.appendChild(nameSelection);
  });

  mainSection.appendChild(nameHolder);

  introductionPanel.appendChild(mainSection);
  introductionPanel.appendChild(menu);
  document.getElementsByTagName('body')[0].appendChild(introductionPanel);
}
function showTextIntroductionUI() {
  const introductionScene = window.game.scene.getScene('introduction-scene');
  const hero: Figure = HERO_BUILDER.getAHero(1, {
    name: characterCreationData.figureName.name,
    data: {
      genderQualifier: characterCreationData.figureName.qualifier,
      month: characterCreationData.month,
    },
  });

  let statMessage = hero.name + ' ';
  const stats = hero.stats.sort(
    (a: Stat, b: Stat) => b.getInfluenceValue() - a.getInfluenceValue()
  );
  let unremarkable: boolean = true;
  if (stats[0].getInfluenceValue() > 2) {
    statMessage +=
      " shines at their <strong class='capitalize'>" +
      stats[0].title +
      '</strong>';
    if (stats[1].getInfluenceValue() > 2) {
      statMessage +=
        " and <strong class='capitalize'>" + stats[1].title + '</strong>';
    }
    if (stats[stats.length - 1].getInfluenceValue() < 0) {
      statMessage += ' but ';
    }
    unremarkable = false;
  }
  if (stats[stats.length - 1].getInfluenceValue() < 0) {
    statMessage +=
      " is dull at their <strong class='capitalize'>" +
      stats[stats.length - 1].title +
      '</strong>';
    if (stats[stats.length - 2].getInfluenceValue() < 0) {
      statMessage +=
        " and <strong class='capitalize'>" +
        stats[stats.length - 2].title +
        '</strong>';
    }
    unremarkable = false;
  }
  if (unremarkable) {
    statMessage += 'is unremarkable';
  }
  statMessage += '.';

  const texts = [
    'A realm welcomes you from beyond the misty veil, it draws breath for ' +
      GameDataService.getTimeData().years +
      ' cicles.',
    'You are but a wish to shape it and you emerged the vessel <strong>' +
      hero.name +
      '</strong> from under the ghost fumes to enact your will.',
    'The vessel is hollow to be fill with memories lived.',
    statMessage,
    hero.name + ' cross the sepia mist...',
  ];
  const introductionPanel = document.getElementById('introduction-panel');
  const mainSection = document.getElementById('introduction-main-section');
  const menu = document.getElementById('introduction-menu');

  const arise = document.createElement('button');
  arise.classList.add('name-option');
  arise.innerHTML = 'Arise';
  arise.addEventListener('click', () => {
    GameDataService.GAME_DATA.companyData.members.push({
      character: hero,
      positions: [COMPANY_POSITION.LEADER, COMPANY_POSITION.COMBATENT],
    });
    introductionPanel?.remove();
    introductionScene.fadeOutAndDestroy();
  });
  stats.forEach((stat) => {
    console.log(stat.title + ':' + stat.getInfluenceValue());
  });
  menu?.appendChild(arise);
  texts.forEach((text) => {
    const p = document.createElement('p');
    p.innerHTML = text;
    mainSection?.appendChild(p);
  });
}

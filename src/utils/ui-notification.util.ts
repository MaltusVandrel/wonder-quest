import {
  Encounter,
  GameAction,
  GameActionResult,
} from 'src/data/bank/encounter';
import { SLIME_BUILDER } from 'src/data/builder/slime-builder';
import { Figure } from 'src/models/figure';
import { Gauge, GAUGE_INFOS, GAUGE_KEYS } from 'src/models/gauge';
import { Stat, STAT_INFOS, STAT_KEY } from 'src/models/stats';
import { MapScene } from 'src/scenes/map.scene';
import {
  GameDataService,
  OveralGameDataParamter,
} from 'src/services/game-data.service';

class HTMLToastElement extends HTMLDivElement {
  static readonly tagname = 'toast-element';
  static readonly extends = 'div';
  static readonly MAX_TIME: number = 7500;
  count: number = 1;
  key: string = '';
  constructor() {
    super();
    this.classList.add(HTMLToastElement.tagname);
  }
  setValue(encounter: Encounter) {
    this.key = encounter.key;
    this.classList.add(encounter.key);
    this.innerHTML = Array.isArray(encounter.description)
      ? encounter.description.join('<br/>')
      : encounter.description;

    this.show();
  }

  show() {
    const elements = document.getElementsByClassName(
      this.key
    ) as HTMLCollectionOf<HTMLToastElement>;
    Array.from(elements).forEach((el) => {
      if (el == this) return;
      this.count += el.count;

      el.remove();
    });
    if (this.count > 1) {
      const badge = document.createElement('strong');
      badge.innerText = `x${this.count}`;
      this.appendChild(badge);
    }

    setTimeout(() => {
      this.classList.add('removed');

      setTimeout(() => {
        this.remove();
      }, 300);
    }, HTMLToastElement.MAX_TIME);
  }
}
abstract class HTMLCustomDialogElement<T> extends HTMLDialogElement {
  static readonly PARENT_TAGNAME = 'dialog-element';
  static readonly extends = 'dialog';
  isMouseOver: boolean = false;
  dismissable: boolean = true;
  header: HTMLElement = document.createElement('header');
  content: HTMLElement = document.createElement('section');
  menu: HTMLElement = document.createElement('menu');
  menuTitle: HTMLElement = document.createElement('h3');
  dataContext: any;
  constructor() {
    super();
    this.classList.add(HTMLCustomDialogElement.PARENT_TAGNAME);

    MapScene.DIALOG_OPEN_COUNT++;

    document
      .getElementsByTagName('canvas')[0]
      ?.style.setProperty('pointer-events', 'none');
    this.addEventListener('close', () => {
      MapScene.DIALOG_OPEN_COUNT--;
      document
        .getElementsByTagName('canvas')[0]
        ?.style.setProperty('pointer-events', 'auto');
      this.remove();
    });

    this.addEventListener('cancel', (event) => {
      if (!this.dismissable) event.preventDefault();
    });
    this.addEventListener('keydown', (event) => {
      if (!this.dismissable && event.key === 'Escape') {
        event.preventDefault();
      }
    });
    this.addEventListener('mouseover', (event) => {
      this.isMouseOver = true;
    });
    this.addEventListener('mouseout', (event) => {
      this.isMouseOver = false;
    });
  }
  abstract setData(data: T): void;
  appendCloseButton() {
    if (this.dismissable) {
      const dismissButton = document.createElement('button');
      dismissButton.innerText = '✕';
      dismissButton.classList.add('dismiss');
      dismissButton.onclick = () => {
        this.close();
      };
      this.appendChild(dismissButton);
    }
  }
  setUpDefaultStructure() {
    this.appendCloseButton();
    this.appendChild(this.header);
    this.appendChild(this.content);
    this.appendChild(this.menu);
    this.header.appendChild(this.menuTitle);
  }
  setUpSimplifiedStructure() {
    this.appendCloseButton();
    this.appendChild(this.content);
    this.appendChild(this.menu);
  }
  setUpActions(
    actions: Array<GameAction>,
    overallGameDataParamter: OveralGameDataParamter,
    resultCallback?: (
      parentDialog: HTMLCustomDialogElement<any>,
      result: GameActionResult
    ) => void
  ) {
    actions?.forEach((action) => {
      const actionButton = document.createElement('button');
      actionButton.innerHTML = action.title;
      actionButton.classList.add('ui-game-button');
      const actionResult = action.isAble(overallGameDataParamter);
      if (actionResult.able) {
        actionButton.onclick = () => {
          const actionResult = action.action(overallGameDataParamter);
          if (resultCallback) resultCallback(this, actionResult);
        };
      } else {
        actionButton.disabled = true;
        actionButton.title = actionResult.reason || 'Action not available';
      }
      if (action.hint) actionButton.title = action.hint;
      this.menu.appendChild(actionButton);
    });
  }
  setUpSimpleTextContent(data: string | Array<string>) {
    if (Array.isArray(data)) {
      data.forEach((desc: string) => {
        const description = document.createElement('p');
        description.innerText = desc;
        this.content.appendChild(description);
      });
    } else {
      const description = document.createElement('p');
      description.innerText = data;
      this.content.appendChild(description);
    }
  }
}
class HTMLEncounterDialogElement extends HTMLCustomDialogElement<Encounter> {
  static readonly tagname = 'dialog-element';

  constructor() {
    super();
    this.classList.add(HTMLEncounterDialogElement.tagname);
  }

  setData(encounter: Encounter) {
    this.dismissable = encounter.canDismiss == true;
    this.setUpDefaultStructure();
    this.menuTitle.innerText = encounter.title;
    this.setUpSimpleTextContent(encounter.description);

    const resultCallback = (
      parent: HTMLCustomDialogElement<any>,
      actionResult: GameActionResult
    ) => {
      if (actionResult.customReturnBehaviour) {
        actionResult.customReturnBehaviour(encounter.overalGameDataParamter);
        return;
      }

      if (actionResult.dialogType) {
        showDialog(encounter.overalGameDataParamter, actionResult.dialogType);
      } else {
        showGameActionResultDialog(actionResult);
      }
      if (!(actionResult.keepParentOpen == true)) parent.close();
    };
    if (encounter.actions)
      this.setUpActions(
        encounter.actions,
        encounter.overalGameDataParamter,
        resultCallback
      );
    this.showModal();
  }
}
class HTMLGameActionResultDialogElement extends HTMLCustomDialogElement<GameActionResult> {
  static readonly tagname = 'dialog-result-element';

  static readonly MAX_TIME: number = 15000;
  timeProgress: number = 0;
  interval: any;
  constructor() {
    super();
    this.classList.add(HTMLGameActionResultDialogElement.tagname);
  }
  setData(result: GameActionResult) {
    this.setUpSimplifiedStructure();

    if (result.result) {
      const description = document.createElement('p');
      description.innerText = result.result;
      this.content.appendChild(description);
    }
    if (result.reason) {
      this.content.innerHTML += '<br/>';
      const description = document.createElement('small');
      description.innerText = result.reason;
      this.content.appendChild(description);
    }

    this.setUpActions(
      [
        {
          title: 'OK',
          action: ({}) => {
            this.close();
            return {};
          },
          isAble: ({}) => {
            return { able: true };
          },
        },
      ],
      {}
    );

    const progress = document.createElement('progress') as HTMLProgressElement;
    progress.classList.add('dialog-closing-progress');
    progress.setAttribute('max', '100');
    progress.setAttribute('value', '0');
    this.interval = setInterval(() => {
      if (this.isMouseOver) return;
      this.timeProgress += 60;

      const progressValue =
        (this.timeProgress / HTMLGameActionResultDialogElement.MAX_TIME) * 100;

      progress.setAttribute(
        'value',
        '' + (progressValue > 100 ? 100 : progressValue)
      );
      if (progressValue >= 100) {
        clearInterval(this.interval);
        this.close();
      }
    }, 60);
    this.addEventListener('close', () => {
      if (this.interval) clearInterval(this.interval);
    });

    this.appendChild(progress);
    this.showModal();
  }
}

class HTMLAlertDialogElement extends HTMLCustomDialogElement<string> {
  static readonly tagname = 'dialog-alert-element';

  static readonly MAX_TIME: number = 15000;
  timeProgress: number = 0;
  interval: any;
  constructor() {
    super();
    this.classList.add(HTMLAlertDialogElement.tagname);
  }
  setData(data: string) {
    this.setUpSimplifiedStructure();

    const description = document.createElement('p');
    description.innerText = data;
    this.content.appendChild(description);

    this.setUpActions(
      [
        {
          title: 'OK',
          action: ({}) => {
            this.close();
            return {};
          },
          isAble: ({}) => {
            return { able: true };
          },
        },
      ],
      {}
    );

    const progress = document.createElement('progress') as HTMLProgressElement;
    progress.setAttribute('max', '100');
    progress.setAttribute('value', '0');
    this.interval = setInterval(() => {
      if (this.isMouseOver) return;
      this.timeProgress += 60;

      const progressValue =
        (this.timeProgress / HTMLGameActionResultDialogElement.MAX_TIME) * 100;

      progress.setAttribute(
        'value',
        '' + (progressValue > 100 ? 100 : progressValue)
      );
      if (progressValue >= 100) {
        clearInterval(this.interval);
        this.close();
      }
    }, 60);
    this.addEventListener('close', () => {
      if (this.interval) clearInterval(this.interval);
    });

    this.appendChild(progress);
    this.showModal();
  }
}

class HTMLCompanyDialogElement extends HTMLCustomDialogElement<any> {
  static readonly tagname = 'dialog-company-element';

  static readonly MAX_TIME: number = 15000;
  timeProgress: number = 0;
  interval: any;
  constructor() {
    super();
    this.classList.add(HTMLCompanyDialogElement.tagname);
  }
  setData(data: any) {
    this.dismissable = true;
    this.setUpDefaultStructure();
    this.menuTitle.innerText = 'Company';
    const company = GameDataService.GAME_DATA.companyData;

    const memberPanel = document.createElement('div');
    memberPanel.classList.add('member-panel');

    const memberName = document.createElement('h4');

    const infoMemberPanel = document.createElement('div');
    infoMemberPanel.classList.add('info-member-panel');

    const gaugeHolder = document.createElement('table');
    gaugeHolder.classList.add('gauge-holder');

    const statsHolder = document.createElement('table');
    statsHolder.classList.add('stats-holder');

    infoMemberPanel.appendChild(gaugeHolder);
    infoMemberPanel.appendChild(statsHolder);

    const memberButtonHolder = document.createElement('div');
    memberButtonHolder.classList.add('member-button-holder');

    company.members.forEach((member) => {
      const memberButton = document.createElement('button');
      memberButton.classList.add('ui-game-button');
      memberButton.innerText = member.character.name;
      memberButton.addEventListener('click', () => {
        memberName.innerHTML = `${member.character.name}, Level ${member.character.level}`;

        gaugeHolder.innerHTML = '';
        GAUGE_INFOS;
        Object.keys(GAUGE_KEYS).forEach((key: string) => {
          const gauge: Gauge = member.character.getGauge(key);
          gaugeHolder.innerHTML += `<tr><td title="${
            GAUGE_INFOS[key as GAUGE_KEYS]?.description
          }"><strong>${gauge.title}:</strong></td>
            <td class='gauge-value' ><span>${gauge
              .getCurrentValue()
              .toFixed(0)}/${gauge
            .getModValue()
            .toFixed(0)} </span><progress  class='${key}' value='${
            (gauge.getCurrentValue() / gauge.getModValue()) * 100
          }' max='100'/></td></tr>`;
        });

        statsHolder.innerHTML = '';
        Object.keys(STAT_KEY).forEach((key: string) => {
          const stat: Stat = member.character.getStat(key);
          statsHolder.innerHTML += `<tr><td title="${
            STAT_INFOS[key as STAT_KEY]?.description
          }"><strong>${stat.title}:</strong></td>
            <td>${stat.getCurrentValue()} </td><td>
            (<span class='${
              stat.getInfluenceValue() < 0 ? 'negativo' : 'positivo'
            }' >${Math.abs(stat.getInfluenceValue())}</span>)</td></tr>`;
        });
      });
      memberButtonHolder.appendChild(memberButton);
    });

    this.content.appendChild(memberButtonHolder);
    memberPanel.appendChild(memberName);
    memberPanel.appendChild(infoMemberPanel);

    this.content.appendChild(memberPanel);

    this.showModal();
  }
}
class HTMLBattleDialogElement extends HTMLCustomDialogElement<any> {
  static readonly tagname = 'dialog-battle-element';

  static readonly MAX_TIME: number = 15000;
  timeProgress: number = 0;
  interval: any;
  constructor() {
    super();
    this.classList.add(HTMLBattleDialogElement.tagname);
  }
  setData(data: any) {
    this.dismissable = false;
    this.setUpDefaultStructure();
    this.menuTitle.innerText = 'Battle!!';
    const textPanel = document.createElement('div');
    const orderPanel = document.createElement('div');
    textPanel.classList.add('text-panel');
    orderPanel.classList.add('order-panel');

    const teamsAggressionSheet = [
      {
        team: 'friend',
        behaviour: 0,
        relationship: [{ team: 'foe', aggresion: 1 }],
      },
      {
        team: 'foe',
        behaviour: 1,
        relationships: [{ team: 'friend', aggresion: 1 }],
      },
    ];

    const BEHAVIOUR: { [key: string]: number } = {
      ALLY: -1,
      PLAYER: 0,
      FOE: 1,
    };
    interface TeamRelationship {
      team: string;
      behaviour: number;
      relationships: Array<{ team: string; aggresion: number }>;
    }

    interface BattleActor {
      actor: Figure;
      team: string;
      speed: number;
      progress: number;
    }
    interface BattleActionSlot {
      actor: BattleActor;
      speed: number;
    }
    const company = GameDataService.GAME_DATA.companyData;

    const friend = company.members[0].character;
    const foe = SLIME_BUILDER.getASlime(1);

    /**
     * SET ACTORS
     */

    const battleActors: BattleActor[] = [];
    battleActors.push({
      actor: friend,
      team: 'friend',
      speed: friend.getNormalSpeed(),
      progress: 0,
    });
    battleActors.push({
      actor: foe,
      team: 'foe',
      speed: foe.getNormalSpeed(),
      progress: 0,
    });

    /**
     * DO ORDER
     */

    //coloca o mais rapido na frente
    battleActors.sort((actorA: BattleActor, actorB: BattleActor) => {
      return actorB.speed - actorA.speed;
    });

    //usa a maior speed como referencia
    const treadmill = battleActors[0].speed;

    const orderList: BattleActionSlot[] = [];
    let rollingIndex = 0;
    do {
      const battleActor = battleActors[rollingIndex];
      const actionSpeed = battleActor.actor.getActionSpeed();
      battleActor.progress += actionSpeed;
      if (battleActor.progress >= treadmill) {
        battleActor.progress -= treadmill;
        orderList.push({ actor: battleActor, speed: actionSpeed });
      }
      rollingIndex++;
      if (rollingIndex >= battleActors.length) rollingIndex = 0;
    } while (orderList.length < 60);

    /**
     * DO BATTLE
     */

    textPanel.innerHTML = `<p>${foe.name} attacks ${friend.name}!</p>`;

    orderList.forEach((actionSlot: BattleActionSlot, index: number) => {
      const nameP = document.createElement('p');
      nameP.innerHTML = `${index + 1} - ${actionSlot.actor.actor.name}`;
      orderPanel.appendChild(nameP);
    });

    this.content.appendChild(textPanel);
    this.content.appendChild(orderPanel);

    this.menu.remove();

    this.showModal();
  }
}

customElements.define(HTMLToastElement.tagname, HTMLToastElement, {
  extends: HTMLToastElement.extends,
});

customElements.define(
  HTMLEncounterDialogElement.tagname,
  HTMLEncounterDialogElement,
  {
    extends: HTMLEncounterDialogElement.extends,
  }
);
customElements.define(
  HTMLGameActionResultDialogElement.tagname,
  HTMLGameActionResultDialogElement,
  {
    extends: HTMLGameActionResultDialogElement.extends,
  }
);
customElements.define(HTMLAlertDialogElement.tagname, HTMLAlertDialogElement, {
  extends: HTMLAlertDialogElement.extends,
});
customElements.define(
  HTMLCompanyDialogElement.tagname,
  HTMLCompanyDialogElement,
  {
    extends: HTMLCompanyDialogElement.extends,
  }
);
customElements.define(
  HTMLBattleDialogElement.tagname,
  HTMLBattleDialogElement,
  {
    extends: HTMLBattleDialogElement.extends,
  }
);

export function showToast(data: Encounter) {
  const toast = document.createElement(HTMLToastElement.extends, {
    is: HTMLToastElement.tagname,
  }) as HTMLToastElement;
  document.getElementById('toast-holder')?.appendChild(toast);
  toast.setValue(data);
}
export enum DIALOG_TYPES {
  ENCOUNTER = 'encounter',
  GAME_ACTION_RESULT = 'game-action-result',
  ALERT = 'alert',
  COMPANY = 'company',
  BATTLE = 'battle',
}

interface DialogClass<T> {
  new (): HTMLCustomDialogElement<T>; // Constructor signature
  extends: string; // Static property for the `extends` attribute
  tagname: string; // Static property for the `is` attribute
}
const MAP_DIALOG_TYPE_TO_CLASS: { [key in DIALOG_TYPES]: DialogClass<any> } = {
  [DIALOG_TYPES.ENCOUNTER]: HTMLEncounterDialogElement,
  [DIALOG_TYPES.GAME_ACTION_RESULT]: HTMLGameActionResultDialogElement,
  [DIALOG_TYPES.ALERT]: HTMLAlertDialogElement,
  [DIALOG_TYPES.COMPANY]: HTMLCompanyDialogElement,
  [DIALOG_TYPES.BATTLE]: HTMLBattleDialogElement,
};

export function showDialog<T>(data: T, type: DIALOG_TYPES) {
  const varClass = MAP_DIALOG_TYPE_TO_CLASS[type];
  const dialog = document.createElement(varClass.extends, {
    is: varClass.tagname,
  }) as HTMLCustomDialogElement<T>;
  document.body.appendChild(dialog);
  dialog.setData(data);
  dialog.showModal();
}

export function showEncounterDialog(data: Encounter) {
  const dialog = document.createElement(HTMLEncounterDialogElement.extends, {
    is: HTMLEncounterDialogElement.tagname,
  }) as HTMLEncounterDialogElement;

  document.getElementsByTagName('body')[0].appendChild(dialog);
  dialog.setData(data);
}
export function showGameActionResultDialog(data: GameActionResult) {
  const dialog = document.createElement(
    HTMLGameActionResultDialogElement.extends,
    {
      is: HTMLGameActionResultDialogElement.tagname,
    }
  ) as HTMLGameActionResultDialogElement;

  document.getElementsByTagName('body')[0].appendChild(dialog);
  dialog.setData(data);
}

export function showAlertDialog(data: string) {
  const dialog = document.createElement(HTMLAlertDialogElement.extends, {
    is: HTMLAlertDialogElement.tagname,
  }) as HTMLAlertDialogElement;

  document.getElementsByTagName('body')[0].appendChild(dialog);
  dialog.setData(data);
}
export function showCompanyDialog(data?: any) {
  const dialog = document.createElement(HTMLCompanyDialogElement.extends, {
    is: HTMLCompanyDialogElement.tagname,
  }) as HTMLCompanyDialogElement;

  document.getElementsByTagName('body')[0].appendChild(dialog);
  dialog.setData(data);
}

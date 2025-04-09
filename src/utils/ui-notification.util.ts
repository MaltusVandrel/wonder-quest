import {
  Encounter,
  GameAction,
  GameActionResult,
} from 'src/data/bank/encounter';
import { MapScene } from 'src/scenes/map.scene';
import { OveralGameDataParamter } from 'src/services/game-data.service';

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
      showGameActionResultDialog(actionResult);
      parent.close();
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

export function showToast(data: Encounter) {
  const toast = document.createElement(HTMLToastElement.extends, {
    is: HTMLToastElement.tagname,
  }) as HTMLToastElement;
  document.getElementById('toast-holder')?.appendChild(toast);
  toast.setValue(data);
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

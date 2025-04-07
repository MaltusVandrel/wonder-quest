import { Encounter, GameActionResult } from 'src/data/bank/encounter';
import { MapScene } from 'src/scenes/map.scene';

class HTMLToastElement extends HTMLDivElement {
  static readonly tagname = 'toast-element';
  static readonly extends = 'div';
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
    }, 1500);
  }
}
class HTMLEncounterDialogElement extends HTMLDialogElement {
  static readonly tagname = 'dialog-element';
  static readonly extends = 'dialog';
  backdrop: HTMLDivElement | undefined;

  constructor() {
    super();
    this.classList.add(HTMLEncounterDialogElement.tagname);
    MapScene.DIALOG_OPEN_COUNT++;
    this.backdrop = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(this.backdrop);
    this.backdrop?.classList.add(
      HTMLEncounterDialogElement.tagname + '-backdrop'
    );
    document
      .getElementsByTagName('canvas')[0]
      ?.style.setProperty('pointer-events', 'none');
    this.addEventListener('close', () => {
      MapScene.DIALOG_OPEN_COUNT--;
      document
        .getElementsByTagName('canvas')[0]
        ?.style.setProperty('pointer-events', 'auto');
      this.remove();
      this.backdrop?.remove();
    });
  }

  setEncounter(encounter: Encounter) {
    const header = document.createElement('header');
    const content = document.createElement('section');
    const menu = document.createElement('menu');
    if (encounter.canDismiss) {
      const dismissButton = document.createElement('button');
      dismissButton.innerText = '✕';
      dismissButton.classList.add('dismiss');
      dismissButton.onclick = () => {
        this.close();
      };
      this.appendChild(dismissButton);
    } else {
      this.addEventListener('cancel', (event) => {
        event.preventDefault();
      });
      this.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
        }
      });
    }

    this.appendChild(header);
    this.appendChild(content);
    this.appendChild(menu);
    const title = document.createElement('h3');
    title.innerText = encounter.title;
    header.appendChild(title);

    if (Array.isArray(encounter.description)) {
      encounter.description.forEach((desc: string) => {
        const description = document.createElement('p');
        description.innerText = desc;
        content.appendChild(description);
      });
    } else {
      const description = document.createElement('p');
      description.innerText = encounter.description;
      content.appendChild(description);
    }

    encounter.actions?.forEach((action) => {
      const actionButton = document.createElement('button');
      actionButton.innerHTML = action.title;
      const actionResult = action.isAble(encounter.overalGameDataParamter);
      if (actionResult.able) {
        actionButton.onclick = () => {
          const actionResult = action.action(encounter.overalGameDataParamter);

          const dialogResult = document.createElement(
            HTMLGameActionResultDialogElement.extends,
            {
              is: HTMLGameActionResultDialogElement.tagname,
            }
          ) as HTMLGameActionResultDialogElement;
          dialogResult.setValue(actionResult);
          document.getElementsByTagName('body')[0].appendChild(dialogResult);
          dialogResult.showModal();
          this.close();
        };
      } else {
        actionButton.disabled = true;
        actionButton.title = actionResult.reason || 'Action not available';
      }
      if (action.hint) actionButton.title = action.hint;
      menu.appendChild(actionButton);
    });
  }
}
class HTMLGameActionResultDialogElement extends HTMLDialogElement {
  static readonly tagname = 'dialog-result-element';
  static readonly extends = 'dialog';
  static readonly MAX_TIME: number = 3000;
  timeProgress: number = 0;

  backdrop: HTMLDivElement | undefined;

  constructor() {
    super();
    this.classList.add(HTMLEncounterDialogElement.tagname);
    MapScene.DIALOG_OPEN_COUNT++;
    this.backdrop = document.createElement('div');
    document.getElementsByTagName('body')[0].appendChild(this.backdrop);
    this.backdrop?.classList.add(
      HTMLEncounterDialogElement.tagname + '-backdrop'
    );
    document
      .getElementsByTagName('canvas')[0]
      ?.style.setProperty('pointer-events', 'none');
    this.addEventListener('close', () => {
      MapScene.DIALOG_OPEN_COUNT--;
      document
        .getElementsByTagName('canvas')[0]
        ?.style.setProperty('pointer-events', 'auto');
      this.remove();
      this.backdrop?.remove();
    });
  }
  setValue(result: GameActionResult) {
    const header = document.createElement('header');
    const content = document.createElement('section');
    const menu = document.createElement('menu');
    const progress = document.createElement('progress') as HTMLProgressElement;
    progress.setAttribute('max', '100');
    progress.setAttribute('value', '0');
    const dismissButton = document.createElement('button');
    dismissButton.innerText = '✕';
    dismissButton.classList.add('dismiss');
    dismissButton.onclick = () => {
      this.close();
    };
    this.appendChild(dismissButton);
    this.appendChild(content);
    this.appendChild(menu);
    this.appendChild(progress);

    if (result.result) {
      const description = document.createElement('p');
      description.innerText = result.result;
      content.appendChild(description);
    }
    if (result.reason) {
      content.innerHTML += '<br/>';
      const description = document.createElement('small');
      description.innerText = result.reason;
      content.appendChild(description);
    }
    const actionButton = document.createElement('button');
    actionButton.innerHTML = 'OK';
    actionButton.onclick = () => {
      this.close();
    };
    menu.appendChild(actionButton);
    this.appendChild(menu);
    let interval = setInterval(() => {
      this.timeProgress += 60;

      const progressValue =
        (this.timeProgress / HTMLGameActionResultDialogElement.MAX_TIME) * 100;

      progress.setAttribute(
        'value',
        '' + (progressValue > 100 ? 100 : progressValue)
      );
      if (progressValue >= 100) {
        clearInterval(interval);
        this.close();
      }
    }, 60);
  }
}
customElements.define(HTMLToastElement.tagname, HTMLToastElement, {
  extends: HTMLToastElement.extends,
});

//ESTILIZAR CARAI
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

export function showToast(encouter: Encounter) {
  const toast = document.createElement(HTMLToastElement.extends, {
    is: HTMLToastElement.tagname,
  }) as HTMLToastElement;

  toast.setValue(encouter);
  document.getElementById('toast-holder')?.appendChild(toast);
  toast.show();
}
export function showEncounterDialog(encouter: Encounter) {
  const dialog = document.createElement(HTMLEncounterDialogElement.extends, {
    is: HTMLEncounterDialogElement.tagname,
  }) as HTMLEncounterDialogElement;

  document.getElementsByTagName('body')[0].appendChild(dialog);
  dialog.setEncounter(encouter);
  dialog.showModal();
}

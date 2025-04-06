import { Encounter } from 'src/data/bank/encounter';

class HTMLToastElement extends HTMLDivElement {
  static readonly tagname = 'toast-element';
  static readonly extends = 'div';
  constructor() {
    super();
    this.classList.add(HTMLToastElement.tagname);
  }
  setValue(value: string) {
    this.innerHTML = value;
  }

  show() {
    setTimeout(() => {
      this.classList.add('removed');
      setTimeout(() => {
        this.remove();
      }, 300);
    }, 1500);
  }
}
class HTMLEncounterDialogElement extends HTMLDialogElement {
  static readonly tagname = 'encounter-dialog-element';
  static readonly extends = 'dialog';
  constructor() {
    super();
    this.classList.add(HTMLEncounterDialogElement.tagname);
  }
  setValue(value: string) {
    this.innerHTML = value;
  }
  setEncounter(encounter: Encounter) {
    if (encounter.canDismiss) {
      const dismissButton = document.createElement('button');
      dismissButton.innerText = 'X';
      dismissButton.onclick = () => {
        this.remove();
      };
    }
    const title = document.createElement('h2');
    title.innerText = encounter.title;
    this.appendChild(title);

    if (Array.isArray(encounter.description)) {
      encounter.description.forEach((desc: string) => {
        const description = document.createElement('p');
        description.innerText = desc;
        this.appendChild(description);
      });
    } else {
      const description = document.createElement('p');
      description.innerText = encounter.description;
      this.appendChild(description);
    }

    encounter.actions?.forEach((action) => {
      const actionButton = document.createElement('button');
      actionButton.innerHTML = action.title;
      if (action.isAble(encounter.overalGameDataParamter).able) {
        actionButton.onclick = () => {
          const actionResult = action.action(encounter.overalGameDataParamter);
          console.log(actionResult);

          this.remove();
        };
      } else {
        actionButton.disabled = true;
      }
      if (action.hint) actionButton.title = action.hint;
      this.appendChild(actionButton);
    });
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
export function showToast(encouter: Encounter) {
  const toast = document.createElement(HTMLToastElement.extends, {
    is: HTMLToastElement.tagname,
  }) as HTMLToastElement;
  const description = Array.isArray(encouter.description)
    ? encouter.description.join('<br/>')
    : encouter.description;
  toast.setValue(description);
  document.getElementById('toast-holder')?.appendChild(toast);
  toast.show();
}
export function showEncounterDialog(encouter: Encounter) {
  const dialog = document.createElement(HTMLEncounterDialogElement.extends, {
    is: HTMLEncounterDialogElement.tagname,
  }) as HTMLEncounterDialogElement;

  document.getElementsByTagName('body')[0].appendChild(dialog);
  dialog.setEncounter(encouter);
}

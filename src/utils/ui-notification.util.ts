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
customElements.define(HTMLToastElement.tagname, HTMLToastElement, {
  extends: HTMLToastElement.extends,
});

export function showToast(encouter: Encounter) {
  const toast = document.createElement(HTMLToastElement.extends, {
    is: HTMLToastElement.tagname,
  }) as HTMLToastElement;
  toast.setValue(encouter.description);
  document.getElementById('toast-holder')?.appendChild(toast);
  toast.show();
}

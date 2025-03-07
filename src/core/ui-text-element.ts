export class UITextElement {
  static ALIGNMENT = {
    START: 'START',
    END: 'END',
    CENTER: 'CENTER',
  };

  key: string;
  alignmentHorizontal: string = UITextElement.ALIGNMENT.START;
  alignmentVertical: string = UITextElement.ALIGNMENT.START;
  marginX: number = 0;
  marginY: number = 0;
  text: string[] = [];
  style: Phaser.Types.GameObjects.Text.TextStyle = {};
  constructor(key: string, text?: string[] | string) {
    this.key = key;
    if (text) {
      if (Array.isArray(text)) {
        this.text = text;
      } else {
        this.text = [text];
      }
    }
  }
  static build(key: string) {
    return new UITextElement(key);
  }
  setText(text: string[] | string) {
    if (Array.isArray(text)) {
      this.text = text;
    } else {
      this.text = [text];
    }
    return this;
  }
  addText(text: string[] | string) {
    if (Array.isArray(text)) {
      this.text.push(...text);
    } else {
      this.text.push(text);
    }
    return this;
  }
  horizontalPosition(alingment: string, margin?: number) {
    this.alignmentHorizontal = alingment;
    if (margin != undefined) {
      this.marginX = margin;
    }
    return this;
  }
  verticalPosition(alingment: string, margin?: number) {
    this.alignmentVertical = alingment;
    if (margin != undefined) {
      this.marginY = margin;
    }
    return this;
  }
  setStyle(style: Phaser.Types.GameObjects.Text.TextStyle) {
    this.style = style;
    return this;
  }
}

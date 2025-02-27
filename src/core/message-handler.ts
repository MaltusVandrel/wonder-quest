import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable()
export class MessageHandler {
  static messages: SafeHtml[] = [];
  private static messagesPile: string[] = [];
  private static intervalId: any;
  private static showMessageTimer: number = 10;

  constructor(private domSanitizer: DomSanitizer) {}

  public getMessages(): SafeHtml[] {
    return MessageHandler.messages;
  }

  static clear() {
    MessageHandler.messages = [];
  }
  add(...messages: string[]) {
    messages.forEach((m) => MessageHandler.messagesPile.push(m));
    this.showNewMessages();
  }
  private showNewMessages() {
    if (MessageHandler.intervalId == null) {
      MessageHandler.intervalId = setInterval(() => {
        MessageHandler.messages.push(
          this.domSanitizer.bypassSecurityTrustHtml(
            MessageHandler.messagesPile.shift() + ''
          )
        );
        if (MessageHandler.messagesPile.length == 0) {
          clearInterval(MessageHandler.intervalId);
          MessageHandler.intervalId = null;
        }
      }, MessageHandler.showMessageTimer);
    }
  }
}

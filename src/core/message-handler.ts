export class MessageHandler {
  static messages: string[] = [];
  private static messagesPile: string[] = [];
  private static intervalId: any;
  private static showMessageTimer: number = 10;

  public getMessages(): string[] {
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
        MessageHandler.messages.push(MessageHandler.messagesPile.shift() + '');
        if (MessageHandler.messagesPile.length == 0) {
          clearInterval(MessageHandler.intervalId);
          MessageHandler.intervalId = null;
        }
      }, MessageHandler.showMessageTimer);
    }
  }
}

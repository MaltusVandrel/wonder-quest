export abstract class Context {
  static ACTIVE_CONTEXTS: { [key: string]: any } = {};
  public type: string;
  constructor(type: string) {
    this.type = type;
  }
}

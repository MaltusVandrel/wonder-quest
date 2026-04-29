import { PassiveAbility } from './PassiveAbility';

/** Registro centralizado de habilidades passivas. */
export class PassiveRegistry {
  private static passives = new Map<string, PassiveAbility>();

  static register(passive: PassiveAbility): void {
    this.passives.set(passive.id, passive);
  }

  static get(id: string): PassiveAbility | undefined {
    return this.passives.get(id);
  }

  static has(id: string): boolean {
    return this.passives.has(id);
  }

  static keys(): string[] {
    return Array.from(this.passives.keys());
  }

  static clear(): void {
    this.passives.clear();
  }
}

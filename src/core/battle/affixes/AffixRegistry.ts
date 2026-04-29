import { MonsterAffix } from './MonsterAffix';

/** Registro centralizado de modificadores de monstros. */
export class AffixRegistry {
  private static affixes = new Map<string, MonsterAffix>();

  static register(affix: MonsterAffix): void {
    this.affixes.set(affix.id, affix);
  }

  static get(id: string): MonsterAffix | undefined {
    return this.affixes.get(id);
  }

  static has(id: string): boolean {
    return this.affixes.has(id);
  }

  static keys(): string[] {
    return Array.from(this.affixes.keys());
  }

  static clear(): void {
    this.affixes.clear();
  }
}

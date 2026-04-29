import { BattleInstructionStrategy } from './BattleInstructionStrategy';

/** Registro centralizado de estratégias de instrução de batalha. */
export class BattleInstructionRegistry {
  private static strategies = new Map<string, BattleInstructionStrategy>();

  /** Registra uma estratégia. Sobrescreve se a chave já existir. */
  static register(strategy: BattleInstructionStrategy): void {
    this.strategies.set(strategy.key, strategy);
  }

  /** Obtém uma estratégia pela chave. Retorna `undefined` se não encontrada. */
  static get(key: string): BattleInstructionStrategy | undefined {
    return this.strategies.get(key);
  }

  /** Verifica se uma chave está registrada. */
  static has(key: string): boolean {
    return this.strategies.has(key);
  }

  /** Lista todas as chaves registradas. */
  static keys(): string[] {
    return Array.from(this.strategies.keys());
  }

  /** Limpa o registro (útil para testes). */
  static clear(): void {
    this.strategies.clear();
  }
}

import { BattlePhase, BattleState, BattleActor, BattleActionSlot } from '@/core/battle/types';

export interface BattleEventPayload {
  phase: BattlePhase;
  state: BattleState;
  actor?: BattleActor;
  slot?: BattleActionSlot;
  cancel?: boolean;
  data?: Record<string, unknown>;
}

export type BattleEventListener = (payload: BattleEventPayload) => void | Promise<void>;

export type BattleEventMiddleware = (
  payload: BattleEventPayload
) => BattleEventPayload | Promise<BattleEventPayload>;

/**
 * Barramento de eventos tipado para o sistema de batalha.
 *
 * Executa middlewares antes dos listeners. Listeners são ordenados
 * por prioridade decrescente (maior valor → executa primeiro).
 * Qualquer listener pode definir `payload.cancel = true` para
 * interromper o processamento dos listeners subsequentes.
 */
export class BattleEventBus {
  private listeners: Map<BattlePhase, Array<{ priority: number; listener: BattleEventListener }>> =
    new Map();

  private middlewares: BattleEventMiddleware[] = [];

  /**
   * Registra um listener para uma fase específica.
   * @returns Função de desinscrição.
   */
  on(phase: BattlePhase, listener: BattleEventListener, priority: number = 0): () => void {
    const entry = { priority, listener };

    if (!this.listeners.has(phase)) {
      this.listeners.set(phase, []);
    }

    const list = this.listeners.get(phase)!;
    list.push(entry);
    list.sort((a, b) => b.priority - a.priority);

    return () => this.off(phase, listener);
  }

  /**
   * Remove um listener previamente registrado.
   */
  off(phase: BattlePhase, listener: BattleEventListener): void {
    const list = this.listeners.get(phase);
    if (!list) return;

    const index = list.findIndex((l) => l.listener === listener);
    if (index !== -1) {
      list.splice(index, 1);
    }
  }

  /**
   * Adiciona um middleware ao pipeline de eventos.
   */
  use(middleware: BattleEventMiddleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Emite um evento de fase, executando middlewares e listeners.
   * Se algum listener definir `cancel = true`, o processamento para.
   */
  async emit(
    phase: BattlePhase,
    payload: Omit<BattleEventPayload, 'phase'>
  ): Promise<BattleEventPayload> {
    let fullPayload: BattleEventPayload = { ...payload, phase };

    // Executa middlewares
    for (const middleware of this.middlewares) {
      fullPayload = await middleware(fullPayload);
    }

    const list = this.listeners.get(phase) ?? [];

    for (const { listener } of list) {
      if (fullPayload.cancel) {
        break;
      }
      await listener(fullPayload);
    }

    return fullPayload;
  }
}

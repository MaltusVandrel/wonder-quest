import { BattlePhase, BattleState } from '@/core/battle/types';
import { BattleEventBus } from './BattleEventBus';

const DEFAULT_PHASE_ORDER: BattlePhase[] = [
  BattlePhase.BEFORE_BATTLE_START,
  BattlePhase.ON_ENTER_BATTLE,
  BattlePhase.BEFORE_TURN_START,
  BattlePhase.TURN_START,
  BattlePhase.BEFORE_ACTION_SELECT,
  BattlePhase.ON_ACTION_SELECT,
  BattlePhase.BEFORE_ACTION_EXECUTE,
  BattlePhase.ON_ACTION_EXECUTE,
  BattlePhase.ON_HIT_LANDED,
  BattlePhase.ON_DAMAGE_CALCULATED,
  BattlePhase.ON_TARGET_HIT,
  BattlePhase.AFTER_ACTION_EXECUTE,
  BattlePhase.ON_AGGRESSION,
  BattlePhase.BEFORE_TURN_END,
  BattlePhase.TURN_END,
  BattlePhase.BEFORE_STATUS_RESOLVE,
  BattlePhase.ON_STATUS_RESOLVE,
  BattlePhase.AFTER_STATUS_RESOLVE,
  BattlePhase.CHECK_BATTLE_END,
  BattlePhase.BEFORE_BATTLE_END,
  BattlePhase.AFTER_BATTLE_END,
];

/**
 * Pipeline de execução de fases de batalha.
 *
 * Percorre as fases em ordem lógica a partir de uma fase inicial.
 * Suporta injeção dinâmica de fases e interrompe o fluxo caso
 * alguma fase seja cancelada pelo barramento de eventos.
 */
export class PhasePipeline {
  private phases: BattlePhase[];

  constructor(phases?: BattlePhase[]) {
    this.phases = phases ?? [...DEFAULT_PHASE_ORDER];
  }

  /**
   * Executa o pipeline a partir da fase informada.
   *
   * @param startingPhase Fase inicial do ciclo.
   * @param state Estado atual da batalha.
   * @param bus Barramento de eventos utilizado para emitir cada fase.
   */
  async execute(
    startingPhase: BattlePhase,
    state: BattleState,
    bus: BattleEventBus
  ): Promise<void> {
    const startIndex = this.phases.indexOf(startingPhase);
    if (startIndex === -1) {
      throw new Error(
        `Fase inicial desconhecida: "${startingPhase}". Não foi possível iniciar o pipeline.`
      );
    }

    // Fila de fases a serem executadas (permitindo injeção dinâmica)
    const queue: BattlePhase[] = this.phases.slice(startIndex);
    let queueIndex = 0;

    while (queueIndex < queue.length) {
      const currentPhase = queue[queueIndex];
      queueIndex++;

      const payload = await bus.emit(currentPhase, {
        state,
        data: {
          // Exposição da função de injeção para listeners
          injectPhase: (phase: BattlePhase) => {
            queue.splice(queueIndex, 0, phase);
          },
        },
      });

      if (payload.cancel) {
        break;
      }
    }
  }
}

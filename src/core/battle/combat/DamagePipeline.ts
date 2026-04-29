import { HitResult } from './HitResult';
import { Actor } from '@/models/actor';

/**
 * Passo do pipeline de cálculo de dano.
 * Recebe o hit atual, source e target, e retorna o valor modificado.
 */
export type DamagePipelineStep = (hit: HitResult, source: Actor, target: Actor) => number;

/**
 * Pipeline de cálculo de dano.
 *
 * Processa um valor bruto através de etapas sequenciais,
 * permitindo que sistemas externos (status, passivas, elementos)
 * se registrem como steps.
 */
export class DamagePipeline {
  private steps: DamagePipelineStep[] = [];

  /** Registra um novo passo no pipeline. */
  use(step: DamagePipelineStep): void {
    this.steps.push(step);
  }

  /**
   * Processa um hit através do pipeline.
   * @returns O valor final após todas as etapas.
   */
  process(hit: HitResult, source: Actor, target: Actor): number {
    let value = hit.rawValue;
    for (const step of this.steps) {
      value = step({ ...hit, finalValue: value }, source, target);
    }
    return value;
  }
}

/** Pipeline global padrão. */
export const defaultDamagePipeline = new DamagePipeline();

// Step base: garante que o valor nunca seja negativo (mínimo 0)
defaultDamagePipeline.use((hit) => Math.max(0, hit.finalValue));

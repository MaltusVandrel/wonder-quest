import { Actor } from '@/models/actor';
import { MoveExpression } from '@/models/move';
import { HitResult } from './HitResult';

/**
 * Contexto imutável de execução de um movimento.
 * Carrega o estado completo do movimento para que hooks
 * (passivas, status effects, etc.) possam inspecionar e modificar.
 */
export interface MoveContext {
  /** Movimento sendo executado. */
  move: MoveExpression;
  /** Ator que executa o movimento. */
  source: Actor;
  /** Alvos do movimento. */
  targets: Actor[];
  /** Hits gerados pelo movimento. */
  hitResults: HitResult[];
  /** Valores aplicados no contexto (ex: variáveis de steps GET/APPLY). */
  appliedValues: Record<string, unknown>;
  /** Se o movimento foi cancelado (ex: alvo inválido, custo insuficiente). */
  cancelled: boolean;
  /** Razão do cancelamento, se houver. */
  cancelReason?: string;
}

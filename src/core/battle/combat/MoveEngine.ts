import { Actor } from '@/models/actor';
import { MoveExpression, MoveBehaviour } from '@/models/move';
import { evaluateExpression } from './ExpressionParser';
import { HitResult } from './HitResult';
import { MoveContext } from './MoveContext';
import { defaultDamagePipeline } from './DamagePipeline';

export interface MoveHit {
  type: 'HIT';
  action: string;
  value: number;
}

export interface MoveResult {
  hits: MoveHit[];
  appliedValues: Record<string, unknown>;
}

function buildMoveContext(source: Actor, target: Actor): Record<string, unknown> {
  const randoms: Record<string, number> = {};
  for (let i = 0; i <= 10; i++) {
    randoms[`random${i === 0 ? '' : `_${i}`}`] = Math.random();
  }

  return {
    source,
    target,
    ...randoms,
    random: Math.random(),
  };
}

function execStep(step: MoveBehaviour, ctx: Record<string, unknown>, hits: HitResult[]) {
  switch (step.type) {
    case 'GET': {
      ctx[step.key] = evaluateExpression(step.value, ctx);
      break;
    }
    case 'CONDITION': {
      const checkResult = evaluateExpression(step.check, ctx);
      if (checkResult) {
        step.then.forEach((s) => execStep(s, ctx, hits));
      } else if (step.else) {
        step.else.forEach((s) => execStep(s, ctx, hits));
      }
      break;
    }
    case 'HIT': {
      const rawValue = evaluateExpression(step.value, ctx) as number;
      hits.push({
        action: step.action,
        rawValue: typeof rawValue === 'number' ? rawValue : 0,
        finalValue: typeof rawValue === 'number' ? rawValue : 0,
      });
      break;
    }
    case 'APPLY': {
      const targetObj = evaluateExpression(step.target, ctx);
      const val = evaluateExpression(step.value, ctx);
      if (targetObj && typeof targetObj === 'object' && step.key in targetObj) {
        const obj = targetObj as Record<string, unknown>;
        const numVal = typeof val === 'number' ? val : 0;
        switch (step.op) {
          case 'add':
            obj[step.key] = (obj[step.key] as number) + numVal;
            break;
          case 'sub':
            obj[step.key] = (obj[step.key] as number) - numVal;
            break;
          case 'set':
            obj[step.key] = numVal;
            break;
        }
      }
      break;
    }
  }
}

/**
 * Executa um movimento e retorna um contexto completo.
 * Versão extensível com suporte a DamagePipeline.
 */
export function executeMoveWithContext(
  move: MoveExpression,
  source: Actor,
  target: Actor
): MoveContext {
  const ctx: Record<string, unknown> = buildMoveContext(source, target);
  const hitResults: HitResult[] = [];

  move.steps.forEach((step) => execStep(step, ctx, hitResults));

  // Aplica o pipeline de dano em cada hit
  hitResults.forEach((hit) => {
    hit.finalValue = defaultDamagePipeline.process(hit, source, target);
  });

  return {
    move,
    source,
    targets: [target],
    hitResults,
    appliedValues: ctx,
    cancelled: false,
  };
}

/**
 * Executa um movimento e retorna o resultado legado.
 * Mantido para compatibilidade com código existente.
 */
export function executeMove(move: MoveExpression, source: Actor, target: Actor): MoveResult {
  const moveCtx = executeMoveWithContext(move, source, target);
  return {
    hits: moveCtx.hitResults.map((h) => ({
      type: 'HIT' as const,
      action: h.action,
      value: h.finalValue,
    })),
    appliedValues: moveCtx.appliedValues,
  };
}

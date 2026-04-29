import { BattleInstructionRegistry } from './BattleInstructionRegistry';
import { GetRandomAliveAdversaryStrategy } from './strategies/GetRandomAliveAdversary';

// Registra todas as estratégias padrão
BattleInstructionRegistry.register(GetRandomAliveAdversaryStrategy);

export { BattleInstructionRegistry } from './BattleInstructionRegistry';
export type { BattleInstructionStrategy } from './BattleInstructionStrategy';
export { GetRandomAliveAdversaryStrategy } from './strategies/GetRandomAliveAdversary';

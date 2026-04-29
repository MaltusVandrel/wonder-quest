import { Property, ELEMENTAL_RELATIONS } from './ElementalRelation';

/**
 * Calculadora de efetividade elemental.
 *
 * Será integrada no `DamagePipeline` como um step
 * que consulta as propriedades do movimento vs. resistências do alvo.
 */
export class ElementalCalc {
  /**
   * Calcula o multiplicador de efetividade.
   * @param moveProperties Propriedades do movimento (ex: ['element_fire', 'damage_type_slash']).
   * @param targetResistances Resistências do alvo (ex: ['element_water', 'resist_fire']).
   */
  static getEffectiveness(moveProperties: Property[], targetResistances: Property[]): number {
    let multiplier = 1.0;

    for (const moveProp of moveProperties) {
      for (const targetRes of targetResistances) {
        const relation = ELEMENTAL_RELATIONS.find(
          (r) => r.source === moveProp.key && r.target === targetRes.key
        );
        if (relation) {
          multiplier *= relation.multiplier;
        }
      }
    }

    return multiplier;
  }
}

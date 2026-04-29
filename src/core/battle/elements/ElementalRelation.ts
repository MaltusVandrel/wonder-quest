/** Categoria de uma propriedade/elemento. */
export type PropertyCategory = 'damage_type' | 'element' | 'status';

/** Propriedade de um movimento ou resistência de um ator. */
export interface Property {
  key: string;
  name: string;
  category: PropertyCategory;
  /** Descrição para UI. */
  description?: string;
}

/** Relação de efetividade entre duas propriedades. */
export interface ElementalRelation {
  source: string;
  target: string;
  /** Multiplicador de dano (ex: 2.0 para super-efetivo, 0.5 para não-efetivo). */
  multiplier: number;
}

/**
 * Matriz de relações elementais.
 *
 * Exemplo: fogo → gelo = 2.0x, gelo → fogo = 0.5x, água → fogo = 2.0x.
 */
export const ELEMENTAL_RELATIONS: ElementalRelation[] = [
  // TODO: preencher com as relações do jogo
];

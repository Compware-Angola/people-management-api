import { CriteriaCode } from 'src/modules/criteria/enums/criteria-code.enum'

/**
 * Calcula a nota de um único critério para um candidato.
 * O resultado é sempre normalizado no intervalo [0, 100].
 */
export interface ScoringStrategy {
  readonly code: CriteriaCode

  score(candidateId: number): Promise<number>
}

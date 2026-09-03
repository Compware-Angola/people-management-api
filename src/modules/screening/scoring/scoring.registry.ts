import { Injectable } from '@nestjs/common'

import { CriteriaCode } from 'src/modules/criteria/enums/criteria-code.enum'
import { ScoringStrategy } from './scoring-strategy.interface'
import { GrauAcademicoStrategy } from './grau-academico.strategy'
import { FormacaoAcademicaStrategy } from './formacao-academica.strategy'
import { ExpDocenteStrategy } from './exp-docente.strategy'
import { ExpProfissionalStrategy } from './exp-profissional.strategy'

/**
 * Mapeia cada SIGLA de critério para a sua estratégia de pontuação.
 * SIGLA sem estratégia registrada (ex.: OUTRAS_FORMACOES enquanto a tabela
 * GP_OUTRAS_FORMACOES não existir) é tratada como "não avaliada".
 */
@Injectable()
export class ScoringRegistry {
  private readonly strategies: Map<CriteriaCode, ScoringStrategy>

  constructor(
    grauAcademico: GrauAcademicoStrategy,
    formacaoAcademica: FormacaoAcademicaStrategy,
    expDocente: ExpDocenteStrategy,
    expProfissional: ExpProfissionalStrategy,
  ) {
    this.strategies = new Map<CriteriaCode, ScoringStrategy>([
      [grauAcademico.code, grauAcademico],
      [formacaoAcademica.code, formacaoAcademica],
      [expDocente.code, expDocente],
      [expProfissional.code, expProfissional],
    ])
  }

  get(sigla: string | null): ScoringStrategy | null {
    if (!sigla) {
      return null
    }

    return this.strategies.get(sigla as CriteriaCode) ?? null
  }
}

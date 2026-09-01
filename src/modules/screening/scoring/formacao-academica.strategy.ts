import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { CriteriaCode } from 'src/modules/criteria/enums/criteria-code.enum'
import { ScoringStrategy } from './scoring-strategy.interface'
import { ratioScore } from './scoring.util'

/** Quantidade de formações acadêmicas do candidato; satura em TARGET. */
@Injectable()
export class FormacaoAcademicaStrategy implements ScoringStrategy {
  private static readonly TARGET = 3

  readonly code = CriteriaCode.FORMACAO_ACADEMICA

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async score(candidateId: number): Promise<number> {
    const rows = await this.dataSource.query<Array<{ qtd: number }>>(
      `SELECT COUNT(*) AS "qtd" FROM GP_FORMACAO_ACADEMICA WHERE CANDIDATO_ID = :1`,
      [candidateId],
    )

    return ratioScore(Number(rows[0]?.qtd ?? 0), FormacaoAcademicaStrategy.TARGET)
  }
}

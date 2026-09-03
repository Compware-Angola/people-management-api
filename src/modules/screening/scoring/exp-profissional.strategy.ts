import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { CriteriaCode } from 'src/modules/criteria/enums/criteria-code.enum'
import { ScoringStrategy } from './scoring-strategy.interface'
import { ratioScore } from './scoring.util'

/**
 * Anos somados de experiência profissional (não docente); satura em TARGET_YEARS.
 * ANO_FIM nulo é tratado como "até hoje".
 */
@Injectable()
export class ExpProfissionalStrategy implements ScoringStrategy {
  private static readonly TARGET_YEARS = 10

  readonly code = CriteriaCode.EXP_PROFISSIONAL

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async score(candidateId: number): Promise<number> {
    const rows = await this.dataSource.query<Array<{ anos: number }>>(
      `
        SELECT NVL(SUM(
                 GREATEST(NVL(ANO_FIM, EXTRACT(YEAR FROM SYSDATE)) - ANO_INICIO, 0)
               ), 0) AS "anos"
        FROM GP_EXP_PROFISSIONAL
        WHERE CANDIDATO_ID = :1
          AND ANO_INICIO IS NOT NULL
      `,
      [candidateId],
    )

    return ratioScore(
      Number(rows[0]?.anos ?? 0),
      ExpProfissionalStrategy.TARGET_YEARS,
    )
  }
}

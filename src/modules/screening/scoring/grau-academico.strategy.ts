import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

import { CriteriaCode } from 'src/modules/criteria/enums/criteria-code.enum'
import { ScoringStrategy } from './scoring-strategy.interface'
import { ratioScore } from './scoring.util'

/**
 * Nota = grau mais alto do candidato em relação ao grau mais alto do catálogo.
 * Ex.: catálogo vai até ORDEM 3 (Doutor); candidato Mestre (ORDEM 2) => 66,7.
 */
@Injectable()
export class GrauAcademicoStrategy implements ScoringStrategy {
  readonly code = CriteriaCode.GRAU_ACADEMICO

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async score(candidateId: number): Promise<number> {
    const rows = await this.dataSource.query<
      Array<{ ordem: number | null; ordemMax: number | null }>
    >(
      `
        SELECT (
                 SELECT MAX(g.ORDEM)
                 FROM GP_FORMACAO_ACADEMICA f
                 JOIN GP_GRAU_ACADEMICO g ON g.CODIGO = f.GRAU_ID
                 WHERE f.CANDIDATO_ID = :1
               ) AS "ordem",
               (
                 SELECT MAX(ORDEM) FROM GP_GRAU_ACADEMICO WHERE ESTADO = 1
               ) AS "ordemMax"
        FROM DUAL
      `,
      [candidateId],
    )

    const row = rows[0]

    if (!row || row.ordem == null || !row.ordemMax) {
      return 0
    }

    return ratioScore(Number(row.ordem), Number(row.ordemMax))
  }
}

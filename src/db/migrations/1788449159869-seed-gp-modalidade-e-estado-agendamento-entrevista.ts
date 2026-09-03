import { MigrationInterface, QueryRunner } from 'typeorm'

const MODALIDADES = ['PRESENCIAL', 'ONLINE', 'HIBRIDO']

const ESTADOS = [
  'AGENDADA',
  'CONFIRMADA',
  'REALIZADA',
  'CANCELADA',
  'REAGENDADA',
]

export class SeedGpModalidadeEEstadoAgendamentoEntrevista1788449159869 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const designacao of MODALIDADES) {
      await queryRunner.query(
        `
          INSERT INTO GP_MODALIDADE (DESIGNACAO)
          SELECT :designacao FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1 FROM GP_MODALIDADE
            WHERE UPPER(TRIM(DESIGNACAO)) = UPPER(TRIM(:designacaoCheck))
          )
        `,
        [designacao, designacao],
      )
    }

    for (const designacao of ESTADOS) {
      await queryRunner.query(
        `
          INSERT INTO GP_ESTADO_AGENDAMENTO_ENTREVISTA (DESIGNACAO)
          SELECT :designacao FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1 FROM GP_ESTADO_AGENDAMENTO_ENTREVISTA
            WHERE UPPER(TRIM(DESIGNACAO)) = UPPER(TRIM(:designacaoCheck))
          )
        `,
        [designacao, designacao],
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM GP_ESTADO_AGENDAMENTO_ENTREVISTA WHERE DESIGNACAO IN (${ESTADOS.map(
        (_, i) => `:${i + 1}`,
      ).join(', ')})`,
      ESTADOS,
    )

    await queryRunner.query(
      `DELETE FROM GP_MODALIDADE WHERE DESIGNACAO IN (${MODALIDADES.map(
        (_, i) => `:${i + 1}`,
      ).join(', ')})`,
      MODALIDADES,
    )
  }
}

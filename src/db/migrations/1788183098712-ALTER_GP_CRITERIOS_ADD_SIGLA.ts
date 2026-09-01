import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Adiciona GP_CRITERIOS.SIGLA (chave estável de máquina, ver enum CriteriaCode)
 * e faz o seed dos 5 critérios usados na triagem.
 *
 * O critério "Experiência profissional" já existe (CODIGO 1); a migration só
 * carimba a SIGLA nele e insere os outros 4 de forma idempotente.
 */
type CriterioSeed = { sigla: string; descricao: string }

const criterios: CriterioSeed[] = [
  { sigla: 'EXP_PROFISSIONAL', descricao: 'Experiência profissional' },
  { sigla: 'EXP_DOCENTE', descricao: 'Experiência docente' },
  { sigla: 'FORMACAO_ACADEMICA', descricao: 'Formação acadêmica' },
  { sigla: 'OUTRAS_FORMACOES', descricao: 'Outras formações' },
  { sigla: 'GRAU_ACADEMICO', descricao: 'Grau acadêmico' },
]

export class ALTERGPCRITERIOSADDSIGLA1788183098712 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_CRITERIOS ADD (SIGLA VARCHAR2(30))
    `)

    await queryRunner.query(`
      CREATE UNIQUE INDEX UQ_GP_CRITERIOS_SIGLA_ATIVA
        ON GP_CRITERIOS (
          CASE WHEN DELETADO_EM IS NULL THEN SIGLA END
        )
    `)

    for (const criterio of criterios) {
      // carimba a SIGLA num critério já existente com a mesma descrição
      await queryRunner.query(
        `
          UPDATE GP_CRITERIOS
             SET SIGLA = :sigla
           WHERE LOWER(TRIM(DESCRICAO)) = LOWER(TRIM(:descricao))
             AND SIGLA IS NULL
             AND DELETADO_EM IS NULL
        `,
        [criterio.sigla, criterio.descricao],
      )

      // insere o critério se ainda não houver nenhum ativo com essa SIGLA
      await queryRunner.query(
        `
          INSERT INTO GP_CRITERIOS (DESCRICAO, SIGLA, ESTADO, CRIADO_EM)
          SELECT :descricao, :sigla, 1, SYSDATE
          FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1 FROM GP_CRITERIOS
            WHERE SIGLA = :siglaCheck AND DELETADO_EM IS NULL
          )
        `,
        [criterio.descricao, criterio.sigla, criterio.sigla],
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // remove só os critérios seedados que não estão em uso em nenhuma vaga
    await queryRunner.query(`
      DELETE FROM GP_CRITERIOS c
       WHERE c.SIGLA IN ('EXP_DOCENTE', 'FORMACAO_ACADEMICA', 'OUTRAS_FORMACOES', 'GRAU_ACADEMICO')
         AND NOT EXISTS (
           SELECT 1 FROM GP_CRITERIOS_VAGAS cv WHERE cv.CRITERIO_ID = c.CODIGO
         )
    `)

    await queryRunner.query(`
      DROP INDEX UQ_GP_CRITERIOS_SIGLA_ATIVA
    `)

    await queryRunner.query(`
      ALTER TABLE GP_CRITERIOS DROP COLUMN SIGLA
    `)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Ajusta GP_FORMACAO_ACADEMICA: troca AREA_FORMACAO (texto livre) por
 * CURSO (texto) + CURSO_ID (referência lógica para a futura tabela canônica
 * de cursos/áreas de formação). Sem FK física por enquanto.
 */
export class ALTERGPFORMACAOACADEMICACURSO1788181526147 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_FORMACAO_ACADEMICA
        ADD (
          CURSO VARCHAR2(255),
          CURSO_ID NUMBER
        )
    `)

    await queryRunner.query(`
      ALTER TABLE GP_FORMACAO_ACADEMICA
        DROP COLUMN AREA_FORMACAO
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_FORMACAO_ACADEMICA
        ADD (AREA_FORMACAO VARCHAR2(500))
    `)

    await queryRunner.query(`
      ALTER TABLE GP_FORMACAO_ACADEMICA
        DROP (CURSO, CURSO_ID)
    `)
  }
}

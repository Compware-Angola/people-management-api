import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddHorasToGpProcessamentosSalariaisColaboradores1785515676244 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_PROCESSAMENTOS_SALARIAIS_COLABORADORES ADD (
        HORAS_TRABALHADAS NUMBER(7,2),
        HORAS_EXTRAS NUMBER(7,2)
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_PROCESSAMENTOS_SALARIAIS_COLABORADORES DROP COLUMN HORAS_TRABALHADAS
    `)
    await queryRunner.query(`
      ALTER TABLE GP_PROCESSAMENTOS_SALARIAIS_COLABORADORES DROP COLUMN HORAS_EXTRAS
    `)
  }
}

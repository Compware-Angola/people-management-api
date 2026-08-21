import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEstadoToGpColaboradoresEstruturasSalariais1785515676237 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_COLABORADORES_ESTRUTURAS_SALARIAIS
      ADD (
        ESTADO VARCHAR2(20) DEFAULT 'ATIVA' NOT NULL,
        DATA_INICIO DATE DEFAULT SYSDATE NOT NULL,
        DATA_FIM DATE
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_COLABORADORES_ESTRUTURAS_SALARIAIS
      DROP COLUMN ESTADO
    `)
    await queryRunner.query(`
      ALTER TABLE GP_COLABORADORES_ESTRUTURAS_SALARIAIS
      DROP COLUMN DATA_INICIO
    `)
    await queryRunner.query(`
      ALTER TABLE GP_COLABORADORES_ESTRUTURAS_SALARIAIS
      DROP COLUMN DATA_FIM
    `)
  }
}

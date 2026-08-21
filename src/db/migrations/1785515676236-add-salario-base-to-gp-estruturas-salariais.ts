import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSalarioBaseToGpEstruturasSalariais1785515676236 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_ESTRUTURAS_SALARIAIS
      ADD SALARIO_BASE NUMBER(10,2) DEFAULT 0 NOT NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_ESTRUTURAS_SALARIAIS
      DROP COLUMN SALARIO_BASE
    `)
  }
}

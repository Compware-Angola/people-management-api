import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddColaboradoresPuladosToGpProcessamentosSalariais1785515676243 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_PROCESSAMENTOS_SALARIAIS ADD COLABORADORES_PULADOS CLOB
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_PROCESSAMENTOS_SALARIAIS DROP COLUMN COLABORADORES_PULADOS
    `)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Adiciona GP_CANDIDATOS.CANDIDATURA_ID — referência lógica para a candidatura
 * de origem (FK2_MGD_TB_CANDIDATURA.CODIGO). Sem FK física: não queremos acoplar
 * o schema GP ao legado. O preenchimento/backfill é responsabilidade do
 * serviço de sincronização (LegacyCandidateSyncService), não desta migration.
 */
export class ALTERGPCANDIDATOSADDCANDIDATURAID1788183152468 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_CANDIDATOS ADD (CANDIDATURA_ID NUMBER)
    `)

    await queryRunner.query(`
      CREATE INDEX IDX_GP_CAN_CANDIDATURA
        ON GP_CANDIDATOS (CANDIDATURA_ID)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IDX_GP_CAN_CANDIDATURA
    `)

    await queryRunner.query(`
      ALTER TABLE GP_CANDIDATOS DROP COLUMN CANDIDATURA_ID
    `)
  }
}

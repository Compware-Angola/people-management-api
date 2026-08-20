import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddHoraExtraToGpRubricas1785515676242 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_RUBRICAS DROP CONSTRAINT CHK_RUBRICAS_TIPO_VALOR
    `)
    await queryRunner.query(`
      ALTER TABLE GP_RUBRICAS ADD CONSTRAINT CHK_RUBRICAS_TIPO_VALOR
        CHECK (TIPO_VALOR IN ('PERCENTUAL', 'FIXO', 'HORA_EXTRA'))
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_RUBRICAS DROP CONSTRAINT CHK_RUBRICAS_TIPO_VALOR
    `)
    await queryRunner.query(`
      ALTER TABLE GP_RUBRICAS ADD CONSTRAINT CHK_RUBRICAS_TIPO_VALOR
        CHECK (TIPO_VALOR IN ('PERCENTUAL', 'FIXO'))
    `)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDescricaoToGpPermissoes1785515676246
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_PERMISSOES ADD DESCRICAO VARCHAR2(255)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_PERMISSOES DROP COLUMN DESCRICAO
    `)
  }
}

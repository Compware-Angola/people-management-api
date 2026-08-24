import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameDescricaoToSlugInGpPermissoes1785515676245
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_PERMISSOES RENAME COLUMN DESCRICAO TO SLUG
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE GP_PERMISSOES RENAME COLUMN SLUG TO DESCRICAO
    `)
  }
}

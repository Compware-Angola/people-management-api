import { MigrationInterface, QueryRunner } from 'typeorm'

export class ALTERETABLEGPUSERCOLABORADORADDFIELDPASSWORD1788338139210
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE GP_USER_COLABORADOR
      ADD SENHA VARCHAR2(255)
    `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE GP_USER_COLABORADOR
      DROP COLUMN SENHA
    `)
    }
}
import { MigrationInterface, QueryRunner } from 'typeorm'

export class DROPTABLEGPUSERADMIN1788357526058 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      DROP TABLE GP_USER_ADMIN CASCADE CONSTRAINTS
    `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // A tabela removida não será restaurada.
    }
}
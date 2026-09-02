import { MigrationInterface, QueryRunner } from "typeorm";

export class ALTERETABLEGPUSUARIOSADDNEWFIELDS1788359695056 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE GP_USUARIOS
        ADD (
          ID_PESSOA NUMBER NULL,
          EXTERNAL_ID NUMBER NULL
        )
    `)

        await queryRunner.query(`
      ALTER TABLE GP_USUARIOS
        ADD CONSTRAINT FK_GP_USUARIOS_PESSOA
        FOREIGN KEY (ID_PESSOA)
        REFERENCES GP_PESSOA (CODIGO)
    `)

        await queryRunner.query(`
      ALTER TABLE GP_USUARIOS
        ADD CONSTRAINT UQ_GP_USUARIOS_PESSOA
        UNIQUE (ID_PESSOA)
    `)


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE GP_USUARIOS
        DROP COLUMN ID_PESSOA
    `)

        await queryRunner.query(`
      ALTER TABLE GP_USUARIOS
        DROP COLUMN EXTERNAL_ID
    `)
        await queryRunner.query(`
      ALTER TABLE GP_USUARIOS
        DROP CONSTRAINT UQ_GP_USUARIOS_PESSOA
    `)

        await queryRunner.query(`
      ALTER TABLE GP_USUARIOS
        DROP CONSTRAINT FK_GP_USUARIOS_PESSOA
    `)

        await queryRunner.query(`
      ALTER TABLE GP_USUARIOS
        DROP COLUMN ID_PESSOA
    `)

        await queryRunner.query(`
      ALTER TABLE GP_USUARIOS
        DROP COLUMN EXTERNAL_ID
    `)
    }

}

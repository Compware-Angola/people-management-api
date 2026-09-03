import { MigrationInterface, QueryRunner } from "typeorm";

export class ALTERETABLEGPEXPPROFISSIONAL1788361199928 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const dropColumnIfExists = async (
            columnName: string,
        ): Promise<void> => {
            const result = await queryRunner.query(
                `
          SELECT COUNT(*) AS "COUNT"
          FROM ALL_TAB_COLUMNS
          WHERE TABLE_NAME = 'GP_EXP_PROFISSIONAL'
            AND COLUMN_NAME = : 1
    `,
                [columnName],
            )

            const exists = Number(result[0]?.COUNT) > 0

            if (exists) {
                await queryRunner.query(`
          ALTER TABLE GP_EXP_PROFISSIONAL
          DROP COLUMN ${columnName}
`)
            }
        }

        await dropColumnIfExists('CANDIDATO_ID')

        await queryRunner.query(`
      ALTER TABLE GP_EXP_PROFISSIONAL
ADD(
    CODIGO_PESSOA NUMBER NULL
)
    `)

        await queryRunner.query(`
      ALTER TABLE GP_EXP_PROFISSIONAL
      ADD CONSTRAINT FK_GP_EXP_PROFISSIONAL_PESSOA
      FOREIGN KEY(CODIGO_PESSOA)
      REFERENCES GP_PESSOA(CODIGO)
    `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE GP_EXP_PROFISSIONAL
      DROP CONSTRAINT FK_GP_EXP_PROFISSIONAL_PESSOA
    `)

        await queryRunner.query(`
      ALTER TABLE GP_EXP_PROFISSIONAL
      DROP COLUMN CODIGO_PESSOA
    `)
    }
}
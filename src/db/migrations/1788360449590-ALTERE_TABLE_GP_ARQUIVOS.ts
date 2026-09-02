import { MigrationInterface, QueryRunner } from 'typeorm'

export class ALTERETABLEGPARQUIVOS1788360449590
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const dropColumnIfExists = async (
            columnName: string,
        ): Promise<void> => {
            const result = await queryRunner.query(
                `
          SELECT COUNT(*) AS "COUNT"
          FROM ALL_TAB_COLUMNS
          WHERE TABLE_NAME = 'GP_ARQUIVOS'
            AND COLUMN_NAME = : 1
    `,
                [columnName],
            )

            const exists = Number(result[0]?.COUNT) > 0

            if (exists) {
                await queryRunner.query(`
          ALTER TABLE GP_ARQUIVOS
          DROP COLUMN ${columnName}
`)
            }
        }

        await dropColumnIfExists('CODIGO_USUARIO')

        await queryRunner.query(`
      ALTER TABLE GP_ARQUIVOS
ADD(
    ID_PESSOA NUMBER NULL,
    EXTERNAL_ID NUMBER NULL
)
    `)

        await queryRunner.query(`
      ALTER TABLE GP_ARQUIVOS
      ADD CONSTRAINT FK_GP_ARQUIVOS_PESSOA
      FOREIGN KEY(ID_PESSOA)
      REFERENCES GP_PESSOA(CODIGO)
    `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE GP_ARQUIVOS
      DROP CONSTRAINT FK_GP_ARQUIVOS_PESSOA
    `)

        await queryRunner.query(`
      ALTER TABLE GP_ARQUIVOS
      DROP COLUMN EXTERNAL_ID
    `)

        await queryRunner.query(`
      ALTER TABLE GP_ARQUIVOS
      DROP COLUMN ID_PESSOA
    `)
    }
}


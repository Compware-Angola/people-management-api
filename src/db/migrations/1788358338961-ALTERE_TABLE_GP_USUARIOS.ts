
import { MigrationInterface, QueryRunner } from 'typeorm'

export class ALTERETABLEGPUSUARIOS1788358338961
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const dropColumnIfExists = async (columnName: string): Promise<void> => {
            const result = await queryRunner.query(
                `
          SELECT COUNT(*) AS "COUNT"
          FROM USER_TAB_COLUMNS
          WHERE TABLE_NAME = 'GP_USUARIOS'
            AND COLUMN_NAME = :1
        `,
                [columnName],
            )

            const exists = Number(result[0]?.COUNT) > 0

            if (exists) {
                await queryRunner.query(`
          ALTER TABLE GP_USUARIOS
          DROP COLUMN ${columnName}
        `)
            }
        }

        await dropColumnIfExists('NOME')
        await dropColumnIfExists('BI')
        await dropColumnIfExists('NIF')
        await dropColumnIfExists('TELEFONE')
        await dropColumnIfExists('TELEFONE_ALTERNATIVO')
        await dropColumnIfExists('PROVINCIA')
        await dropColumnIfExists('MUNICIPIO')
        await dropColumnIfExists('MORADA')
        await dropColumnIfExists('SENHA')
        await dropColumnIfExists('PRECISA_MUDAR_SENHA')
        await dropColumnIfExists('ESTADO')
        await dropColumnIfExists('CRIADO_EM')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Não é possível restaurar os dados que foram removidos.
        // Caso seja necessário rollback estrutural, recriar as colunas
        // exigirá conhecer os tipos/defaults/constraints originais.
    }
}


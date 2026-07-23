import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsers1784209466141 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'GP_USUARIOS',
                columns: [
                    {
                        name: 'CODIGO',
                        type: 'number',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'NOME',
                        type: 'varchar2',
                        length: '150',
                        isNullable: false,
                    },
                    {
                        name: 'BI',
                        type: 'varchar2',
                        length: '20',
                        isNullable: false,
                    },
                    {
                        name: 'NIF',
                        type: 'varchar2',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'TELEFONE',
                        type: 'varchar2',
                        length: '20',
                        isNullable: false,
                    },
                    {
                        name: 'TELEFONE_ALTERNATIVO',
                        type: 'varchar2',
                        length: '20',
                        isNullable: true,
                    },
                    {
                        name: 'PROVINCIA',
                        type: 'varchar2',
                        length: '80',
                        isNullable: false,
                    },
                    {
                        name: 'MUNICIPIO',
                        type: 'varchar2',
                        length: '80',
                        isNullable: false,
                    },
                    {
                        name: 'MORADA',
                        type: 'varchar2',
                        length: '500',
                        isNullable: false,
                    },
                    {
                        name: 'EMAIL',
                        type: 'varchar2',
                        length: '150',
                        isNullable: false,
                    },
                    {
                        name: 'SENHA',
                        type: 'varchar2',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'PRECISA_MUDAR_SENHA',
                        type: 'number',
                        precision: 1,
                        default: 1,
                        isNullable: false,
                    },
                    {
                        name: 'ESTADO',
                        type: 'number',
                        precision: 1,
                        default: 1,
                        isNullable: false,
                    },
                    {
                        name: 'CRIADO_EM',
                        type: 'date',
                        default: 'SYSDATE',
                        isNullable: false,
                    },
                ],
            }),
            true,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('GP_USUARIOS')
    }

}

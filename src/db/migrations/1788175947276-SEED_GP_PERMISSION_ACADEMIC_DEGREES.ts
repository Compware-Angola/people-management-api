import { MigrationInterface, QueryRunner } from 'typeorm'
import { PermissionsEnum } from '../../commons/enums/permissions.enum'

type PermissionSeed = {
  slug: PermissionsEnum
  description: string
}

const permissions: PermissionSeed[] = [
  {
    slug: PermissionsEnum.READ_ACADEMIC_DEGREES,
    description: 'Consultar graus acadêmico',
  },
  {
    slug: PermissionsEnum.WRITE_ACADEMIC_DEGREES,
    description: 'Criar e editar graus acadêmico',
  },
]

export class SeedGPPermissionAcademicDegrees1788173896302 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const permission of permissions) {
      await queryRunner.query(
        `
          INSERT INTO GP_PERMISSOES (
            SLUG,
            DESCRICAO,
            ESTADO,
            CRIADO_EM
          )
          SELECT
            :slug,
            :description,
            1,
            SYSDATE
          FROM DUAL
          WHERE NOT EXISTS (
            SELECT 1
            FROM GP_PERMISSOES
            WHERE LOWER(TRIM(SLUG)) = LOWER(TRIM(:slugCheck))
          )
        `,
        [permission.slug, permission.description, permission.slug],
      )
    }
  }

  public async down(): Promise<void> {
    // Intencionalmente vazio.
    // As permissões podem estar associadas a usuários/grupos.
  }
}

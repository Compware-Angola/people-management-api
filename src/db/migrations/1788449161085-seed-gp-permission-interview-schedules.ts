import { MigrationInterface, QueryRunner } from 'typeorm'
import { PermissionsEnum } from '../../commons/enums/permissions.enum'

type PermissionSeed = {
  slug: PermissionsEnum
  description: string
}

const permissions: PermissionSeed[] = [
  {
    slug: PermissionsEnum.READ_INTERVIEW_SCHEDULES,
    description: 'Consultar agendamentos de entrevista',
  },
  {
    slug: PermissionsEnum.WRITE_INTERVIEW_SCHEDULES,
    description: 'Criar e editar agendamentos de entrevista',
  },
]

export class SeedGpPermissionInterviewSchedules1788449161085 implements MigrationInterface {
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

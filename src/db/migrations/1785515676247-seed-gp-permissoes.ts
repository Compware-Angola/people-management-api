import { MigrationInterface, QueryRunner } from 'typeorm'
import { PermissionsEnum } from '../../commons/enums/permissions.enum'

type PermissionSeed = {
  slug: PermissionsEnum
  description: string
}

const permissions: PermissionSeed[] = [
  { slug: PermissionsEnum.FULL_ACCESS, description: 'Acesso total ao sistema' },

  { slug: PermissionsEnum.READ_USERS, description: 'Consultar utilizadores' },
  { slug: PermissionsEnum.WRITE_USERS, description: 'Criar e editar utilizadores' },

  { slug: PermissionsEnum.READ_EMPLOYEES, description: 'Consultar colaboradores' },
  {
    slug: PermissionsEnum.WRITE_EMPLOYEES,
    description: 'Criar e editar colaboradores',
  },

  { slug: PermissionsEnum.READ_DEPARTMENTS, description: 'Consultar departamentos' },
  {
    slug: PermissionsEnum.WRITE_DEPARTMENTS,
    description: 'Criar e editar departamentos',
  },

  {
    slug: PermissionsEnum.READ_COST_CENTERS,
    description: 'Consultar centros de custo',
  },
  {
    slug: PermissionsEnum.WRITE_COST_CENTERS,
    description: 'Criar e editar centros de custo',
  },

  { slug: PermissionsEnum.READ_POSITIONS, description: 'Consultar cargos' },
  { slug: PermissionsEnum.WRITE_POSITIONS, description: 'Criar e editar cargos' },

  {
    slug: PermissionsEnum.READ_HIRING_TYPES,
    description: 'Consultar tipos de contratação',
  },
  {
    slug: PermissionsEnum.WRITE_HIRING_TYPES,
    description: 'Criar e editar tipos de contratação',
  },

  {
    slug: PermissionsEnum.READ_REQUISITION_STATES,
    description: 'Consultar estados de requisição',
  },

  {
    slug: PermissionsEnum.READ_REQUISITIONS,
    description: 'Consultar requisições de vaga',
  },
  {
    slug: PermissionsEnum.WRITE_REQUISITIONS,
    description: 'Criar, editar e analisar requisições de vaga',
  },

  {
    slug: PermissionsEnum.READ_VACANCY_STATES,
    description: 'Consultar estados de vaga',
  },

  {
    slug: PermissionsEnum.READ_VACANCY_REQUEST_TYPES,
    description: 'Consultar tipos de requisição de vaga',
  },
  {
    slug: PermissionsEnum.WRITE_VACANCY_REQUEST_TYPES,
    description: 'Criar e editar tipos de requisição de vaga',
  },

  { slug: PermissionsEnum.READ_VACANCIES, description: 'Consultar vagas' },
  {
    slug: PermissionsEnum.WRITE_VACANCIES,
    description: 'Criar, editar e administrar vagas',
  },

  { slug: PermissionsEnum.READ_CRITERIA, description: 'Consultar critérios' },
  { slug: PermissionsEnum.WRITE_CRITERIA, description: 'Criar e editar critérios' },

  {
    slug: PermissionsEnum.READ_CRITERIA_VACANCIES,
    description: 'Consultar critérios associados a vagas',
  },
  {
    slug: PermissionsEnum.WRITE_CRITERIA_VACANCIES,
    description: 'Associar e editar critérios de vagas',
  },

  {
    slug: PermissionsEnum.READ_APPLICATIONS,
    description: 'Consultar candidaturas',
  },
  {
    slug: PermissionsEnum.WRITE_APPLICATIONS,
    description: 'Atualizar candidaturas',
  },

  { slug: PermissionsEnum.READ_ATTENDANCE, description: 'Consultar assiduidade' },
  {
    slug: PermissionsEnum.WRITE_ATTENDANCE,
    description: 'Criar e editar assiduidade',
  },

  { slug: PermissionsEnum.READ_BIOMETRICS, description: 'Consultar biometria' },
  {
    slug: PermissionsEnum.WRITE_BIOMETRICS,
    description: 'Criar e editar dados biométricos',
  },

  { slug: PermissionsEnum.READ_VACATIONS, description: 'Consultar férias' },
  { slug: PermissionsEnum.WRITE_VACATIONS, description: 'Criar e editar férias' },

  { slug: PermissionsEnum.READ_LEAVES, description: 'Consultar licenças' },
  { slug: PermissionsEnum.WRITE_LEAVES, description: 'Criar e editar licenças' },

  { slug: PermissionsEnum.READ_CONTRACTS, description: 'Consultar contratos' },
  { slug: PermissionsEnum.WRITE_CONTRACTS, description: 'Criar e editar contratos' },

  {
    slug: PermissionsEnum.READ_SALARIES,
    description: 'Consultar estruturas salariais',
  },
  {
    slug: PermissionsEnum.WRITE_SALARIES,
    description: 'Criar e editar estruturas salariais',
  },

  {
    slug: PermissionsEnum.READ_SALARY_PROCESSING,
    description: 'Consultar processamentos salariais',
  },
  {
    slug: PermissionsEnum.WRITE_SALARY_PROCESSING,
    description: 'Processar, validar e reprocessar folha salarial',
  },

  { slug: PermissionsEnum.READ_PERMISSIONS, description: 'Consultar permissões' },
  {
    slug: PermissionsEnum.WRITE_PERMISSIONS,
    description: 'Criar e administrar permissões e grupos',
  },
]

export class SeedGpPermissoes1785515676247 implements MigrationInterface {
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
    // Intencionalmente vazio: a seed é idempotente e não deve apagar
    // permissões que podem já existir ou estar associadas a usuários/grupos.
  }
}

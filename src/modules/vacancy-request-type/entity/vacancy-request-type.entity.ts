import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

export enum VacancyRequestTypeStatus {
  INACTIVE = 0,
  ACTIVE = 1,
}

@Entity('GP_TIPOS_REQUISICAO_VAGA')
@Index('UQ_GP_TIPOS_REQ_VAGA_SIGLA_ATIVA', ['acronym'], {
  unique: true,
  where: '"DELETADO_EM" IS NULL',
})
@Index('UQ_GP_TIPOS_REQ_VAGA_DESCRICAO_ATIVA', ['description'], {
  unique: true,
  where: '"DELETADO_EM" IS NULL',
})
export class VacancyRequestType {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  declare id: number

  @Column({
    name: 'SIGLA',
    type: 'varchar2',
    length: 3,
  })
  declare acronym: string

  @Column({
    name: 'DESCRICAO',
    type: 'varchar2',
    length: 255,
  })
  declare description: string

  @Column({
    name: 'ESTADO',
    type: 'number',
    precision: 1,
    scale: 0,
    default: VacancyRequestTypeStatus.ACTIVE,
  })
  declare status: VacancyRequestTypeStatus

  @CreateDateColumn({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
  })
  declare createdAt: Date

  @DeleteDateColumn({
    name: 'DELETADO_EM',
    type: 'date',
    nullable: true,
  })
  declare deletedAt: Date | null
}

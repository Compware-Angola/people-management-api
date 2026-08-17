import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm'

export enum VacancyStateCode {
  DRAFT = 'RASCUNHO',
  SCHEDULED = 'AGENDADA',
  PUBLISHED = 'PUBLICADA',
  SUSPENDED = 'SUSPENSA',
  CLOSED = 'ENCERRADA',
  CANCELLED = 'CANCELADA',
}

@Entity('GP_ESTADOS_VAGA')
@Unique('UQ_GP_ESTADOS_VAGA_DESCRICAO', ['description'])
@Unique('UQ_GP_ESTADOS_VAGA_SIGLA', ['acronym'])
export class VacancyState {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  code: number

  @Column({
    name: 'SIGLA',
    type: 'varchar2',
    length: 20,
    nullable: false,
  })
  acronym: string

  @Column({
    name: 'DESCRICAO',
    type: 'varchar2',
    length: 100,
    nullable: false,
  })
  description: string

  @Column({
    name: 'ORDEM',
    type: 'number',
    nullable: false,
  })
  order: number

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
    nullable: false,
  })
  createdAt: Date
}

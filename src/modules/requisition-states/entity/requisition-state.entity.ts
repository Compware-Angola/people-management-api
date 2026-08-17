import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm'

export enum RequisitionStateCode {
  DRAFT = 'RASCUNHO',
  AWAITING_RH = 'AGUARDANDO_RH',
  AWAITING_FINANCIAL = 'AGUARDANDO_FINANCEIRO',
  APPROVED = 'APROVADA',
  APPROVED_PARTIAL = 'APROVADA_PARCIALMENTE',
  REJECTED = 'REJEITADA',
  CANCELLED = 'CANCELADA',
}

@Entity('GP_ESTADOS_REQUISICAO_VAGA')
@Unique('UQ_GP_EST_REQ_VAGA_DESCRICAO', ['description'])
@Unique('UQ_GP_EST_REQ_VAGA_SIGLA', ['acronym'])
export class RequisitionState {
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

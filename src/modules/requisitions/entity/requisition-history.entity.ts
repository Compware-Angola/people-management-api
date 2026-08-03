import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Requisition } from './requisition.entity'
import { RequisitionState } from 'src/modules/requisition-states/entity/requisition-state.entity'
import { User } from 'src/modules/user/entities/user.entity'

@Entity('GP_REQUISICOES_HISTORICO')
export class RequisitionHistory {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  code: number

  @Column({
    name: 'REQUISICAO_ID',
    type: 'number',
    nullable: false,
  })
  requisitionId: number

  @ManyToOne(() => Requisition, { eager: false })
  @JoinColumn({ name: 'REQUISICAO_ID' })
  requisition: Requisition

  @Column({
    name: 'ESTADO_ID',
    type: 'number',
    nullable: false,
  })
  stateId: number

  @ManyToOne(() => RequisitionState, { eager: false })
  @JoinColumn({ name: 'ESTADO_ID' })
  state: RequisitionState

  @Column({
    name: 'ACAO',
    type: 'varchar2',
    length: 50,
    nullable: false,
  })
  action: string

  @Column({
    name: 'DECISAO',
    type: 'varchar2',
    length: 50,
    nullable: true,
  })
  decision: string | null

  @Column({
    name: 'PARECER',
    type: 'varchar2',
    length: 2000,
    nullable: true,
  })
  opinion: string | null

  @Column({
    name: 'DISPONIBILIDADE_ORCAMENTARIA',
    type: 'varchar2',
    length: 30,
    nullable: true,
  })
  budgetAvailability: string | null

  @Column({
    name: 'QUANTIDADE_AUTORIZADA',
    type: 'number',
    nullable: true,
  })
  authorizedQuantity: number | null

  @Column({
    name: 'EXERCICIO_ORCAMENTARIO',
    type: 'varchar2',
    length: 30,
    nullable: true,
  })
  budgetExercise: string | null

  @Column({
    name: 'OBSERVACAO',
    type: 'varchar2',
    length: 2000,
    nullable: true,
  })
  observation: string | null

  @Column({
    name: 'RESPONSAVEL_ID',
    type: 'number',
    nullable: false,
  })
  responsibleId: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'RESPONSAVEL_ID' })
  responsible: User

  @Column({
    name: 'DATA',
    type: 'date',
    default: () => 'SYSDATE',
    nullable: false,
  })
  date: Date
}

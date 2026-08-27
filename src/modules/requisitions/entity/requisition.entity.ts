import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DeleteDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { Department } from 'src/modules/department/entity/department.entity'
import { CostCenter } from 'src/modules/cost-center/entity/cost-center.entity'
import { Position } from 'src/modules/Positions/entity/position.entity'
import { HiringType } from 'src/modules/hiring-types/entity/hiring-type.entity'
import { RequisitionState } from 'src/modules/requisition-states/entity/requisition-state.entity'
import { User } from 'src/modules/user/entities/user.entity'
import { RequisitionHistory } from './requisition-history.entity'
import { VacancyRequestType } from 'src/modules/vacancy-request-type/entity/vacancy-request-type.entity'

@Entity('GP_REQUISICOES_VAGA')
@Unique('UQ_GP_REQUISICOES_VAGA_CODIGO', ['requisitionCode'])
export class Requisition {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  declare code: number

  @Column({
    name: 'CODIGO_REQUISICAO',
    type: 'varchar2',
    length: 30,
    nullable: false,
  })
  declare requisitionCode: string

  @Column({
    name: 'DEPARTAMENTO_ID',
    type: 'number',
    nullable: false,
  })
  declare departmentId: number

  @ManyToOne(() => Department, { eager: false })
  @JoinColumn({ name: 'DEPARTAMENTO_ID' })
  declare department: Department

  @Column({
    name: 'CENTRO_CUSTO_ID',
    type: 'number',
    nullable: false,
  })
  declare costCenterId: number

  @ManyToOne(() => CostCenter, { eager: false })
  @JoinColumn({ name: 'CENTRO_CUSTO_ID' })
  declare costCenter: CostCenter

  @Column({
    name: 'CARGO_ID',
    type: 'number',
    nullable: false,
  })
  declare positionId: number

  @ManyToOne(() => Position, { eager: false })
  @JoinColumn({ name: 'CARGO_ID' })
  declare position: Position

  @Column({
    name: 'QUANTIDADE',
    type: 'number',
    nullable: false,
  })
  declare quantity: number

  @Column({
    name: 'JUSTIFICATIVA',
    type: 'varchar2',
    length: 2000,
    nullable: false,
  })
  declare justification: string

  @Column({
    name: 'TIPO_CONTRATACAO_ID',
    type: 'number',
    nullable: false,
  })
  declare hiringTypeId: number

  @Column({
    name: 'TIPO_REQUISICAO_VAGA_ID',
    type: 'number',
    nullable: false,
  })
  declare vacancyRequestTypeId: number

  @ManyToOne(() => VacancyRequestType, { eager: false })
  @JoinColumn({ name: 'TIPO_REQUISICAO_VAGA_ID' })
  declare vacancyRequestType: VacancyRequestType

  @ManyToOne(() => HiringType, { eager: false })
  @JoinColumn({ name: 'TIPO_CONTRATACAO_ID' })
  declare hiringType: HiringType

  @Column({
    name: 'SOLICITANTE_ID',
    type: 'number',
    nullable: false,
  })
  declare requesterId: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'SOLICITANTE_ID' })
  declare requester: User

  @Column({
    name: 'ESTADO_ID',
    type: 'number',
    nullable: false,
  })
  declare stateId: number

  @ManyToOne(() => RequisitionState, { eager: false })
  @JoinColumn({ name: 'ESTADO_ID' })
  declare state: RequisitionState

  @Column({
    name: 'QUANTIDADE_AUTORIZADA',
    type: 'number',
    nullable: true,
  })
  declare authorizedQuantity: number | null

  @Column({
    name: 'ENVIADA_EM',
    type: 'date',
    nullable: true,
  })
  declare sentAt: Date | null

  @Column({
    name: 'ENVIADO_POR',
    type: 'number',
    nullable: true,
  })
  declare sentBy: number | null

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
    nullable: false,
  })
  declare createdAt: Date

  @Column({
    name: 'ATUALIZADO_EM',
    type: 'date',
    nullable: true,
  })
  declare updatedAt: Date | null

  @DeleteDateColumn({
    name: 'DELETADO_EM',
    type: 'date',
  })
  declare deletedAt: Date | null

  @OneToMany(() => RequisitionHistory, (history) => history.requisition)
  declare history: RequisitionHistory[]
}

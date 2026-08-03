import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { Position } from 'src/modules/possition/entity/position.entity'
import { Department } from 'src/modules/department/entity/department.entity'
import { HiringType } from 'src/modules/hiring-types/entity/hiring-type.entity'
import { VacancyState } from 'src/modules/vacancy-states/entity/vacancy-state.entity'
import { User } from 'src/modules/user/entities/user.entity'
import { Requisition } from 'src/modules/requisitions/entity/requisition.entity'
import { VacancyDocument } from './vacancy-document.entity'
import { VacancyHistory } from './vacancy-history.entity'

@Entity('GP_VAGAS')
@Unique('UQ_GP_VAGAS_CODIGO', ['vacancyCode'])
export class Vacancy {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  code: number

  @Column({
    name: 'CODIGO_VAGA',
    type: 'varchar2',
    length: 30,
    nullable: false,
  })
  vacancyCode: string

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
    name: 'CARGO_ID',
    type: 'number',
    nullable: false,
  })
  positionId: number

  @ManyToOne(() => Position, { eager: false })
  @JoinColumn({ name: 'CARGO_ID' })
  position: Position

  @Column({
    name: 'DEPARTAMENTO_ID',
    type: 'number',
    nullable: false,
  })
  departmentId: number

  @ManyToOne(() => Department, { eager: false })
  @JoinColumn({ name: 'DEPARTAMENTO_ID' })
  department: Department

  @Column({
    name: 'TIPO_CONTRATACAO_ID',
    type: 'number',
    nullable: false,
  })
  hiringTypeId: number

  @ManyToOne(() => HiringType, { eager: false })
  @JoinColumn({ name: 'TIPO_CONTRATACAO_ID' })
  hiringType: HiringType

  @Column({
    name: 'NUMERO_VAGAS',
    type: 'number',
    nullable: false,
  })
  numberOfVacancies: number

  @Column({
    name: 'ESTADO_ID',
    type: 'number',
    nullable: false,
  })
  stateId: number

  @ManyToOne(() => VacancyState, { eager: false })
  @JoinColumn({ name: 'ESTADO_ID' })
  state: VacancyState

  @Column({
    name: 'DATA_PUBLICACAO',
    type: 'date',
    nullable: true,
  })
  publicationDate: Date | null

  @Column({
    name: 'DATA_ENCERRAMENTO',
    type: 'date',
    nullable: true,
  })
  closingDate: Date | null

  @Column({
    name: 'JUSTIFICATIVA',
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  justification: string | null

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
    nullable: false,
  })
  createdAt: Date

  @Column({
    name: 'CRIADO_POR',
    type: 'number',
    nullable: false,
  })
  createdBy: number

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'CRIADO_POR' })
  createdByUser: User

  @Column({
    name: 'ATUALIZADO_EM',
    type: 'date',
    nullable: true,
  })
  updatedAt: Date | null

  @Column({
    name: 'ATUALIZADO_POR',
    type: 'number',
    nullable: true,
  })
  updatedBy: number | null

  @Column({
    name: 'PUBLICADA_EM',
    type: 'date',
    nullable: true,
  })
  publishedAt: Date | null

  @Column({
    name: 'PUBLICADO_POR',
    type: 'number',
    nullable: true,
  })
  publishedBy: number | null

  @Column({
    name: 'SUSPENSA_EM',
    type: 'date',
    nullable: true,
  })
  suspendedAt: Date | null

  @Column({
    name: 'SUSPENSO_POR',
    type: 'number',
    nullable: true,
  })
  suspendedBy: number | null

  @Column({
    name: 'ENCERRADA_EM',
    type: 'date',
    nullable: true,
  })
  closedAt: Date | null

  @Column({
    name: 'ENCERRADO_POR',
    type: 'number',
    nullable: true,
  })
  closedBy: number | null

  @Column({
    name: 'CANCELADA_EM',
    type: 'date',
    nullable: true,
  })
  cancelledAt: Date | null

  @Column({
    name: 'CANCELADO_POR',
    type: 'number',
    nullable: true,
  })
  cancelledBy: number | null

  @OneToMany(() => VacancyDocument, (document) => document.vacancy)
  documents: VacancyDocument[]

  @OneToMany(() => VacancyHistory, (history) => history.vacancy)
  history: VacancyHistory[]
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Employee } from '../../employee/entities/employee.entity'

export enum SalaryProcessingStatus {
  PENDING = 'PENDENTE',
  SIMULATED = 'SIMULADO',
  CLOSED = 'FECHADO',
  REJECTED = 'RECUSADO',
  CANCELLED = 'CANCELADO',
}

@Entity('GP_PROCESSAMENTOS_SALARIAIS')
export class SalaryProcessing {
  @PrimaryGeneratedColumn({ name: 'CODIGO' })
  id: number

  @Column({ name: 'DATA_INICIO', type: 'date' })
  startDate: Date

  @Column({ name: 'DATA_FIM', type: 'date' })
  endDate: Date

  @Column({
    name: 'ESTADO',
    type: 'varchar2',
    length: 20,
    default: SalaryProcessingStatus.PENDING,
  })
  status: SalaryProcessingStatus

  @Column({ name: 'CODIGO_COLABORADOR_RESPONSAVEL', type: 'number' })
  responsibleEmployeeId: number

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({
    name: 'CODIGO_COLABORADOR_RESPONSAVEL',
    referencedColumnName: 'id',
  })
  responsibleEmployee: Employee

  @Column({
    name: 'CODIGO_COLABORADOR_VALIDADOR',
    type: 'number',
    nullable: true,
  })
  validatorEmployeeId?: number

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({
    name: 'CODIGO_COLABORADOR_VALIDADOR',
    referencedColumnName: 'id',
  })
  validatorEmployee?: Employee

  @Column({ name: 'DATA_VALIDACAO', type: 'date', nullable: true })
  validatedAt?: Date

  @Column({
    name: 'CODIGO_PROCESSAMENTO_ORIGEM',
    type: 'number',
    nullable: true,
  })
  originProcessingId?: number

  @ManyToOne(() => SalaryProcessing, { eager: false })
  @JoinColumn({
    name: 'CODIGO_PROCESSAMENTO_ORIGEM',
    referencedColumnName: 'id',
  })
  originProcessing?: SalaryProcessing

  @Column({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
  })
  createdAt: Date

  @Column({ name: 'COLABORADORES_PULADOS', type: 'clob', nullable: true })
  skippedEmployees?: string | null
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { LeaveType } from '../dto/create-leave.dto'
import { LeaveStatus } from '../dto/update-leave.dto'
import { Employee } from '../../employee/entities/employee.entity'

@Entity('GP_LICENCAS')
export class Leave {
  @PrimaryGeneratedColumn({ name: 'CODIGO' })
  id: number

  @Column({ name: 'CODIGO_COLABORADOR' })
  employeeId: number

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'CODIGO_COLABORADOR' })
  employee: Employee

  @Column({ name: 'CODIGO_COLABORADOR_APROVADOR', nullable: true })
  approverId?: number

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'CODIGO_COLABORADOR_APROVADOR' })
  approver?: Employee

  @Column({
    name: 'TIPO',
    type: 'varchar2',
    length: 20,
  })
  type: LeaveType

  @Column({
    name: 'ESTADO',
    type: 'varchar2',
    length: 20,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus

  @Column({ name: 'DATA_INICIO', type: 'date' })
  startDate: Date

  @Column({ name: 'DATA_FIM', type: 'date' })
  endDate: Date

  @Column({ name: 'CODIGO_DOCUMENTO', nullable: true })
  documentId?: number

  @Column({ name: 'OBSERVACAO', nullable: true, length: 500 })
  observation?: string

  @CreateDateColumn({ name: 'CRIADO_EM', type: 'date' })
  createdAt: Date

  @UpdateDateColumn({ name: 'ATUALIZADO_EM', type: 'date', nullable: true })
  updatedAt?: Date
}

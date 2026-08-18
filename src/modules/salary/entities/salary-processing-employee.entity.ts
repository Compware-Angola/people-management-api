import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { SalaryProcessing } from './salary-processing.entity'
import { Salary } from './salary.entity'
import { Rubric } from './rubric.entity'
import { Employee } from '../../employee/entities/employee.entity'

@Entity('GP_PROCESSAMENTOS_SALARIAIS_COLABORADORES')
export class SalaryProcessingEmployee {
  @PrimaryColumn({ name: 'CODIGO_PROCESSAMENTO_SALARIAL', type: 'number' })
  processingId: number

  @PrimaryColumn({ name: 'CODIGO_COLABORADOR', type: 'number' })
  employeeId: number

  @PrimaryColumn({ name: 'CODIGO_ESTRUTURA_SALARIAL', type: 'number' })
  salaryId: number

  @PrimaryColumn({ name: 'CODIGO_RUBRICA', type: 'number' })
  rubricCode: number

  @Column({ name: 'VALOR', type: 'number', precision: 10, scale: 2 })
  value: number

  @Column({
    name: 'HORAS_TRABALHADAS',
    type: 'number',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  workedHours?: number | null

  @Column({
    name: 'HORAS_EXTRAS',
    type: 'number',
    precision: 7,
    scale: 2,
    nullable: true,
  })
  overtimeHours?: number | null

  @ManyToOne(() => SalaryProcessing, { eager: false })
  @JoinColumn({
    name: 'CODIGO_PROCESSAMENTO_SALARIAL',
    referencedColumnName: 'id',
  })
  processing: SalaryProcessing

  @ManyToOne(() => Employee, { eager: false })
  @JoinColumn({ name: 'CODIGO_COLABORADOR', referencedColumnName: 'id' })
  employee: Employee

  @ManyToOne(() => Salary, { eager: false })
  @JoinColumn({
    name: 'CODIGO_ESTRUTURA_SALARIAL',
    referencedColumnName: 'id',
  })
  salaryStructure: Salary

  @ManyToOne(() => Rubric, { eager: false })
  @JoinColumn({ name: 'CODIGO_RUBRICA', referencedColumnName: 'code' })
  rubric: Rubric
}

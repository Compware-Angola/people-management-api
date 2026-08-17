import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm'
import { AttendanceSituation } from '../dto/create-attendance.dto'

@Entity('GP_ASSIDUIDADES')
export class Attendance {
  @PrimaryGeneratedColumn({ name: 'CODIGO' })
  id: number

  @Column({ name: 'CODIGO_COLABORADOR' })
  employeeId: number

  @Column({ name: 'DATA_INICIO', type: 'date' })
  startDate: Date

  @Column({ name: 'DATA_FIM', type: 'date', nullable: true })
  endDate?: Date

  @Column({
    name: 'HORAS',
    type: 'number',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  hours?: number

  @Column({
    name: 'SITUACAO',
    type: 'varchar2',
    length: 20,
  })
  situation: AttendanceSituation

  @CreateDateColumn({ name: 'CRIADO_EM', type: 'date' })
  createdAt: Date
}

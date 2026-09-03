import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'

import { User } from '../../user/entities/user.entity'
import { InterviewScheduleEntity } from './interview-schedule.entity'

@Entity({ name: 'GP_AGENDAMENTO_ENTREVISTA_ENTREVISTADOR' })
@Unique('UQ_GP_AEE_AGENDAMENTO_USER', ['interviewScheduleId', 'userId'])
export class InterviewScheduleInterviewerEntity {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  id: number

  @Column({
    name: 'CODIGO_AGENDAMENTO_ENTREVISTA',
    type: 'number',
  })
  interviewScheduleId: number

  @Column({
    name: 'CODIGO_USER',
    type: 'number',
  })
  userId: number

  @ManyToOne(
    () => InterviewScheduleEntity,
    (interviewSchedule) => interviewSchedule.interviewers,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({
    name: 'CODIGO_AGENDAMENTO_ENTREVISTA',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_GP_AEE_AGENDAMENTO',
  })
  interviewSchedule: InterviewScheduleEntity

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'CODIGO_USER',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_GP_AEE_USER',
  })
  user: User
}

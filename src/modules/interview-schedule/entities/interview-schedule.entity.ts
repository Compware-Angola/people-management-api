import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { User } from '../../user/entities/user.entity'
import { InterviewModalityEntity } from './interview-modality.entity'
import { InterviewScheduleStateEntity } from './interview-schedule-state.entity'
import { InterviewScheduleInterviewerEntity } from './interview-schedule-interviewer.entity'

@Entity({ name: 'GP_AGENDAMENTO_ENTREVISTA' })
export class InterviewScheduleEntity {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  id: number

  @Column({
    name: 'CODIGO_CANDIDATURA',
    type: 'number',
  })
  applicationId: number

  @Column({
    name: 'DATA_ENTREVISTA',
    type: 'date',
  })
  interviewDate: Date

  @Column({
    name: 'DURACAO_MINUTOS',
    type: 'number',
    nullable: true,
  })
  durationMinutes: number | null

  @Column({
    name: 'HORA_FIM',
    type: 'varchar2',
    length: 5,
    nullable: true,
  })
  endTime: string | null

  @Column({
    name: 'CODIGO_MODALIDADE',
    type: 'number',
  })
  modalityId: number

  @Column({
    name: 'LOCAL',
    type: 'varchar2',
    length: 255,
    nullable: true,
  })
  location: string | null

  @Column({
    name: 'LINK',
    type: 'varchar2',
    length: 500,
    nullable: true,
  })
  link: string | null

  @Column({
    name: 'OBSERVACAO',
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  note: string | null

  @Column({
    name: 'JUSTIFICATIVA',
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  justification: string | null

  @Column({
    name: 'ESTADO',
    type: 'number',
  })
  stateId: number

  @Column({
    name: 'CRIADO_POR',
    type: 'number',
    nullable: true,
  })
  createdById: number | null

  @CreateDateColumn({
    name: 'CRIADO_EM',
    type: 'date',
  })
  createdAt: Date

  @UpdateDateColumn({
    name: 'ATUALIZADO_EM',
    type: 'date',
  })
  updatedAt: Date

  @ManyToOne(() => InterviewModalityEntity)
  @JoinColumn({
    name: 'CODIGO_MODALIDADE',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_GP_AGEND_ENTR_MODALIDADE',
  })
  modality: InterviewModalityEntity

  @ManyToOne(() => InterviewScheduleStateEntity)
  @JoinColumn({
    name: 'ESTADO',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_GP_AGEND_ENTR_ESTADO',
  })
  state: InterviewScheduleStateEntity

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'CRIADO_POR',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_GP_AGEND_ENTR_CRIADO_POR',
  })
  createdBy: User | null

  @OneToMany(
    () => InterviewScheduleInterviewerEntity,
    (interviewer) => interviewer.interviewSchedule,
  )
  interviewers: InterviewScheduleInterviewerEntity[]
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'FK2_MGD_TB_CANDIDATURA' })
export class CandidateEntity {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  declare id: number

  @Column({
    name: 'APRECIACAO',
    type: 'varchar2',
    length: 300,
    nullable: true,
  })
  evaluation?: string

  @Column({
    name: 'GRAU_ACADEMICO',
    type: 'number',
    nullable: true,
  })
  academicDegreeId?: number

  @Column({
    name: 'FK_PESSOA',
    type: 'clob',
    nullable: true,
  })
  person?: string

  @Column({
    name: 'DATA_CANDIDATURA',
    type: 'date',
    nullable: true,
  })
  applicationDate?: Date

  @Column({
    name: 'CANAL',
    type: 'number',
    nullable: true,
  })
  channelId?: number

  @Column({
    name: 'CODIGO_VALIDACAO',
    type: 'varchar2',
    length: 45,
    nullable: true,
  })
  validationCode?: string

  @Column({
    name: 'CODIGO_MOTIVO',
    type: 'number',
    nullable: true,
  })
  reasonCode?: number

  @Column({
    name: 'FK_ESTADO_CANDIDATURA',
    type: 'number',
    nullable: true,
  })
  applicationStatusId?: number

  @Column({
    name: 'DATAACTUALIZACAO',
    type: 'date',
    nullable: true,
  })
  updatedAt?: Date

  @Column({
    name: 'DATA_INICIO_EXPERIENCIA',
    type: 'date',
    nullable: true,
  })
  experienceStartDate?: Date

  @Column({
    name: 'DATA_FIM_EXPERIENCIA',
    type: 'date',
    nullable: true,
  })
  experienceEndDate?: Date

  @Column({
    name: 'FACULDADE',
    type: 'number',
    nullable: true,
  })
  facultyId?: number
}

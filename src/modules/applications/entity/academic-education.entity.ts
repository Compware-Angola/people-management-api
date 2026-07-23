import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('FK2_MGD_TB_FORMACAO_ACADEMICA')
export class AcademicEducationEntity {
  @PrimaryGeneratedColumn({
    name: 'PK_FORMACAO_ACADEMICA',
  })
  declare id: number

  @Column({
    name: 'FK_GRAU_ACADEMICO',
    type: 'number',
    nullable: true,
  })
  declare academicDegreeId: number | null

  @Column({
    name: 'AREA_FORMACAO',
    type: 'clob',
    nullable: true,
  })
  declare trainingArea: string | null

  @Column({
    name: 'ANO_CONCLUSAO',
    type: 'number',
    nullable: true,
  })
  declare graduationYear: number | null

  @Column({
    name: 'INSTITUICAO',
    type: 'clob',
    nullable: true,
  })
  declare institution: string | null

  @Column({
    name: 'MEDIA_FORMACAO_DOCENTE',
    type: 'number',
    nullable: true,
  })
  declare finalAverage: number | null

  @Column({
    name: 'FK_CANDIDATURA',
    type: 'number',
    nullable: true,
  })
  declare candidateId: number | null

  @Column({
    name: 'AREA_FORMACAO_ID',
    type: 'number',
    nullable: true,
  })
  declare trainingAreaId: number | null

  @Column({
    name: 'CURSO_AREA_FORMACAO_ID',
    type: 'number',
    nullable: true,
  })
  declare courseTrainingAreaId: number | null
}

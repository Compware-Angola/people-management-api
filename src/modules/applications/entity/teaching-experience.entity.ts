import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('FK2_MGD_TB_EXPERIENCIA_COMO_DOCENTE')
export class TeachingExperienceEntity {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
  })
  declare id: number

  @Column({
    name: 'TITULO',
    type: 'clob',
    nullable: true,
  })
  declare title: string | null

  @Column({
    name: 'CURSO',
    type: 'clob',
    nullable: true,
  })
  declare course: string | null

  @Column({
    name: 'INSTITUICAO',
    type: 'clob',
    nullable: true,
  })
  declare institution: string | null

  @Column({
    name: 'DISCIPLINA',
    type: 'clob',
    nullable: true,
  })
  declare discipline: string | null

  @Column({
    name: 'ANO_INICIO',
    type: 'clob',
    nullable: true,
  })
  declare startYear: string | null

  @Column({
    name: 'ANO_FIM',
    type: 'clob',
    nullable: true,
  })
  declare endYear: string | null

  @Column({
    name: 'FK_CANDIDATURA',
    type: 'number',
    nullable: true,
  })
  declare candidateId: number | null
}

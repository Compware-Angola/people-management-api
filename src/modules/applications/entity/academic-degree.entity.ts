import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'FK2_TB_GRAU_ACADEMICO' })
export class AcademicDegreeEntity {
  @PrimaryGeneratedColumn({ name: 'CODIGO', type: 'number' })
  declare id: number

  @Column({ name: 'DESIGNACAO', type: 'varchar2', length: 255, nullable: true })
  declare designation: string | null

  @Column({ name: 'SIGLA', type: 'varchar2', length: 20, nullable: true })
  declare acronym: string | null

  @Column({ name: 'STATUS_', type: 'number', nullable: true })
  declare status: number | null

  @Column({ name: 'ORDEM', type: 'number', nullable: true })
  declare order: number | null
}

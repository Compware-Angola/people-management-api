import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'FK2_TB_ESTADO_CANDIDATURA' })
export class ApplicationStatusEntity {
  @PrimaryGeneratedColumn({ name: 'CODIGO', type: 'number' })
  declare id: number

  @Column({ name: 'DESCRICAO', type: 'varchar2', length: 255, nullable: true })
  declare description: string | null

  @Column({ name: 'ACTIVO', type: 'number', nullable: true })
  declare active: number | null

  @Column({ name: 'ORDEM', type: 'number', nullable: true })
  declare order: number | null

  @Column({ name: 'PROXIMO_ESTADO', type: 'number', nullable: true })
  declare nextStatusId: number | null

  @Column({ name: 'DEPARTAMENTO', type: 'number', nullable: true })
  declare departmentId: number | null
}

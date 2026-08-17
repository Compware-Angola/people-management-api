import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('FK2_MGD_TB_DOCUMENTOS_CANDIDATURA_DOCENTE')
export class TeacherApplicationDocument {
  @PrimaryGeneratedColumn({ name: 'CODIGO' })
  id: number

  @Column({ name: 'FK_CANDIDATURA', nullable: true })
  candidateId: number

  @Column({ name: 'FK_TIPO_DOCUMENTO', nullable: true })
  documentTypeId: number

  @Column({ name: 'NOME_ARQUIVO', type: 'clob', nullable: true })
  fileName: string

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date', nullable: true })
  createdAt: Date

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'date', nullable: true })
  updatedAt: Date
}

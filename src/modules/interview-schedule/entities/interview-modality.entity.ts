import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'GP_MODALIDADE' })
export class InterviewModalityEntity {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  id: number

  @Column({
    name: 'DESIGNACAO',
    type: 'varchar2',
    length: 100,
  })
  designation: string
}

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { PersonEntity } from './person.entity'
@Entity({ name: 'GP_USER_ADMIN' })
export class UserAdminEntity {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  id: number

  @Column({
    name: 'CODIGO_PESSOA',
    type: 'number',
  })
  personId: number

  @Column({
    name: 'EMAIL',
    type: 'varchar2',
    length: 255,
  })
  email: string

  @Column({
    name: 'USERNAME',
    type: 'varchar2',
    length: 100,
  })
  username: string

  @ManyToOne(() => PersonEntity)
  @JoinColumn({
    name: 'CODIGO_PESSOA',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_USER_ADMIN_PESSOA',
  })
  person: PersonEntity
}

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { PersonEntity } from './person.entity'

@Entity({ name: 'GP_USER_COLABORADOR' })
export class UserCollaboratorEntity {
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
    unique: true,
  })
  email: string

  @Column({
    name: 'USERNAME',
    type: 'varchar2',
    length: 100,
    unique: true,
  })
  username: string

  @Column({
    name: 'SENHA',
    type: 'varchar2',
    length: 255,
  })
  password: string

  @ManyToOne(() => PersonEntity)
  @JoinColumn({
    name: 'CODIGO_PESSOA',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_USER_COLAB_PESSOA',
  })
  person: PersonEntity
}
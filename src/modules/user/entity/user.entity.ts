import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('GP_USUARIOS')
export class UserEntity {
  @PrimaryGeneratedColumn({
    name: 'CODIGO',
    type: 'number',
  })
  declare id: number



  @Column({
    name: 'PROVINCIA',
    type: 'varchar2',
    length: 80,
  })
  declare province: string

  @Column({
    name: 'MUNICIPIO',
    type: 'varchar2',
    length: 80,
  })
  declare municipality: string

  @Column({
    name: 'MORADA',
    type: 'varchar2',
    length: 500,
  })
  declare address: string

  @Column({
    name: 'EMAIL',
    type: 'varchar2',
    length: 150,
  })
  declare email: string

  @Column({
    name: 'SENHA',
    type: 'varchar2',
    length: 255,
  })
  declare password: string

  @Column({
    name: 'PRECISA_MUDAR_SENHA',
    type: 'number',
    precision: 1,
    default: 1,
  })
  declare mustChangePassword: number

  @Column({
    name: 'ESTADO',
    type: 'number',
    precision: 1,
    default: 1,
  })
  declare status: number

  @CreateDateColumn({
    name: 'CRIADO_EM',
    type: 'date',
    default: () => 'SYSDATE',
  })
  declare createdAt: Date
}

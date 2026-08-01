import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('GP_COLABORADORES')
export class Employee {
  @PrimaryGeneratedColumn({ name: 'CODIGO' })
  id: number;

  @Column({ name: 'CODIGO_USUARIO' })
  userId: number;

  @Column({ name: 'BANCO' })
  bank: string;

  @Column({ name: 'IBAN' })
  iban: string;

  @Column({ name: 'TITULAR_CONTA' })
  accountHolder: string;

  @Column({ name: 'MOEDA' })
  currency: string;

  @Column({ name: 'ESTADO', type: 'number', default: 1 })
  status: number;

  @CreateDateColumn({ name: 'CRIADO_EM', type: 'date' })
  createdAt: Date;
}

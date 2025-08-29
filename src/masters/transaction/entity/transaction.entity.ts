import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  credit_core: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;
}

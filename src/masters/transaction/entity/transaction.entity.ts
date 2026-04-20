import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'numeric', default: 0 })
  amount: number;

  @Column({ type: 'varchar', length: 100, default: '0' })
  transaction_id: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  createdby: string;

  @Column({ type: 'timestamp', nullable: true })
  created_date: Date;

  @Column({ type: 'varchar', length: 50, default: 'Pending' })
  status: string;

  @Column({ type: 'varchar', length: 50, default: 'Credit' })
  mode: string;

  @Column({ type: 'numeric', default: 0 })
  credits: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  paymentid: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  orderid: string;
}

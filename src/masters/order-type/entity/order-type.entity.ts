import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'order_type' })
export class OrderType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  order_type: string;

  @Column({ type: 'int' })
  sequence_number: number;
}

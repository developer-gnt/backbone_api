import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('order_type')
export class OrderType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_type: string;

  @Column()
  sequence_number: number;
}

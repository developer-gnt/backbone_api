import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'tbl_order_type' })
export class OrderType {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  order_type: string;
}

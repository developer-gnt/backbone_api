import { UserBaseEntity } from 'src/packages/core/base-entity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'transaction' })
export class Transaction extends UserBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  credit_core: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;
}

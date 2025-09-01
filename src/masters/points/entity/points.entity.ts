import { UserBaseEntity } from 'src/packages/core/base-entity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('points')
export class Points extends UserBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  user_name: string;

  @Column({ type: 'int' })
  point: number;
}

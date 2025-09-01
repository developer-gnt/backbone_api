import { UserBaseEntity } from 'src/packages/core/base-entity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('state')
export class State extends UserBaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;
}

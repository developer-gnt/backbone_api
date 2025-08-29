import { UserBaseModifiedEntity } from 'src/packages/core/base-entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class Users extends UserBaseModifiedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', length: 50 })
  username: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @Column({ type: 'text', unique: true })
  refresh_token?: string;
}

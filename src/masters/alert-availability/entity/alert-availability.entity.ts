import { UserBaseEntity } from 'src/packages/core/base-entity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'alert_availability' })
export class AlertAvailability extends UserBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  eta: Date;

  @Column({ type: 'varchar', length: 255 })
  availability_status: string;
}

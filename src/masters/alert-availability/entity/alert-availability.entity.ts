import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'alert_availability' })
export class AlertAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  eta: Date;

  @Column({ type: 'varchar', length: 255 })
  availability_status: string;
}

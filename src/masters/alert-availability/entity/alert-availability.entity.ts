import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('alert_availability')
export class AlertAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  eta: Date;

  @Column()
  availability_status: string;
}

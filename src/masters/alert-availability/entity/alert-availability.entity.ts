import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'availablity' })
export class AlertAvailability {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  package: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  msg: string;
}

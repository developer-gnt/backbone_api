import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection26 } from './inspection26.entity';

@Entity('tbl_inspection26_measurements')
export class Inspection26Measurements {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection26, inspection => inspection.measurements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection26;

  @Column({ type: 'varchar', nullable: true }) gla: string;
  @Column({ type: 'varchar', nullable: true }) bgfinsf: string;
  @Column({ type: 'varchar', nullable: true }) totalrooms2: string;
  @Column({ type: 'text', nullable: true }) sketchnotes: string;
  @Column({ type: 'text', nullable: true }) comments: string;
  @Column({ type: 'jsonb', nullable: true }) departure: any;
  @Column({ type: 'text', nullable: true }) team_notes: string;
}

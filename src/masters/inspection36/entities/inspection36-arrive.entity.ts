import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection36 } from './inspection36.entity';

@Entity('tbl_inspection36_arrive')
export class Inspection36Arrive {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection36, inspection => inspection.arrive, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection36;

  @Column({ type: 'varchar', nullable: true }) access: string;
  @Column({ type: 'varchar', nullable: true }) streettype: string;
  @Column({ type: 'varchar', nullable: true }) streetsurface: string;
  @Column({ type: 'varchar', nullable: true }) pvtmaint: string;
  @Column({ type: 'varchar', nullable: true }) typaccess: string;
  @Column({ type: 'boolean', nullable: true }) p_Street_Scene: boolean;
}

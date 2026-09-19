import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection36 } from './inspection36.entity';

@Entity('tbl_inspection36_belowgrade')
export class Inspection36Belowgrade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection36, inspection => inspection.belowgrade, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection36;

  @Column({ type: 'varchar', nullable: true }) bg_finsf: string;
  @Column({ type: 'varchar', nullable: true }) bg_finnonstd: string;
  @Column({ type: 'varchar', nullable: true }) bg_unfinsf: string;
  @Column({ type: 'varchar', nullable: true }) bg_finish: string;
  @Column({ type: 'varchar', nullable: true }) bg_grade: string;
  @Column({ type: 'varchar', nullable: true }) bg_access: string;
  @Column({ type: 'varchar', nullable: true }) bg_extaccess: string;
  @Column({ type: 'varchar', nullable: true }) bg_ceilht: string;
  @Column({ type: 'varchar', nullable: true }) bg_rooms: string;
  @Column({ type: 'varchar', nullable: true }) heat_sys: string;
  @Column({ type: 'varchar', nullable: true }) heat_fuel: string;
  @Column({ type: 'varchar', nullable: true }) cooling: string;
  @Column({ type: 'varchar', nullable: true }) furnace_bg: string;
  @Column({ type: 'varchar', nullable: true }) bg_defects: string;
  @Column({ type: 'boolean', nullable: true }) p_8_BG_Finished: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_BG_Unfinished: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_Mechanicals: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_BG_Defects: boolean;
}

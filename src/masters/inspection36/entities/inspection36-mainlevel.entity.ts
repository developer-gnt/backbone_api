import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection36 } from './inspection36.entity';

@Entity('tbl_inspection36_mainlevel')
export class Inspection36Mainlevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection36, inspection => inspection.mainlevel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection36;

  @Column({ type: 'varchar', nullable: true }) occupancy: string;
  @Column({ type: 'varchar', nullable: true }) levels: string;
  @Column({ type: 'varchar', nullable: true }) br: string;
  @Column({ type: 'varchar', nullable: true }) fullba: string;
  @Column({ type: 'varchar', nullable: true }) halfba: string;
  @Column({ type: 'varchar', nullable: true }) intqual: string;
  @Column({ type: 'varchar', nullable: true }) intcond: string;
  @Column({ type: 'varchar', nullable: true }) k1_level: string;
  @Column({ type: 'varchar', nullable: true }) k1_update: string;
  @Column({ type: 'varchar', nullable: true }) k1_time: string;
  @Column({ type: 'varchar', nullable: true }) k1_cond: string;
  @Column({ type: 'varchar', nullable: true }) k2_level: string;
  @Column({ type: 'varchar', nullable: true }) k2_update: string;
  @Column({ type: 'varchar', nullable: true }) floor_update: string;
  @Column({ type: 'varchar', nullable: true }) floor_cond: string;
  @Column({ type: 'varchar', nullable: true }) ceil_ht: string;
  @Column({ type: 'varchar', nullable: true }) ceil_style: string;
  @Column({ type: 'varchar', nullable: true }) wallceil_cond: string;
  @Column({ type: 'jsonb', nullable: true }) floor_types: any[];
  @Column({ type: 'jsonb', nullable: true }) wholehome: any[];
  @Column({ type: 'jsonb', nullable: true }) accessibility: any[];
  @Column({ type: 'boolean', nullable: true }) p_8_Kitchen_s_: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_Living_Family: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_Dining: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_Main_Level_Rooms: boolean;
}

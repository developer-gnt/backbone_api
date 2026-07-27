import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection36 } from './inspection36.entity';

@Entity('tbl_inspection36_upperlevel')
export class Inspection36Upperlevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection36, inspection => inspection.upperlevel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection36;

  @Column({ type: 'varchar', nullable: true }) bath1_loc: string;
  @Column({ type: 'varchar', nullable: true }) bath1_type: string;
  @Column({ type: 'varchar', nullable: true }) bath1_update: string;
  @Column({ type: 'varchar', nullable: true }) bath1_cond: string;
  @Column({ type: 'varchar', nullable: true }) bath2_loc: string;
  @Column({ type: 'varchar', nullable: true }) bath2_type: string;
  @Column({ type: 'varchar', nullable: true }) bath2_update: string;
  @Column({ type: 'varchar', nullable: true }) bath2_cond: string;
  @Column({ type: 'varchar', nullable: true }) bath3_loc: string;
  @Column({ type: 'varchar', nullable: true }) bath3_type: string;
  @Column({ type: 'varchar', nullable: true }) bath3_update: string;
  @Column({ type: 'varchar', nullable: true }) bath3_cond: string;
  @Column({ type: 'varchar', nullable: true }) bath4_loc: string;
  @Column({ type: 'varchar', nullable: true }) bath4_type: string;
  @Column({ type: 'varchar', nullable: true }) bath4_update: string;
  @Column({ type: 'varchar', nullable: true }) bath4_cond: string;
  @Column({ type: 'varchar', nullable: true }) br1_level: string;
  @Column({ type: 'varchar', nullable: true }) br1_ceil: string;
  @Column({ type: 'varchar', nullable: true }) br1_floor: string;
  @Column({ type: 'varchar', nullable: true }) br1_notes: string;
  @Column({ type: 'varchar', nullable: true }) br2_level: string;
  @Column({ type: 'varchar', nullable: true }) br2_ceil: string;
  @Column({ type: 'varchar', nullable: true }) br2_floor: string;
  @Column({ type: 'varchar', nullable: true }) br2_notes: string;
  @Column({ type: 'varchar', nullable: true }) br3_level: string;
  @Column({ type: 'varchar', nullable: true }) br3_ceil: string;
  @Column({ type: 'varchar', nullable: true }) br3_floor: string;
  @Column({ type: 'varchar', nullable: true }) br3_notes: string;
  @Column({ type: 'varchar', nullable: true }) br4_level: string;
  @Column({ type: 'varchar', nullable: true }) br4_ceil: string;
  @Column({ type: 'varchar', nullable: true }) br4_floor: string;
  @Column({ type: 'varchar', nullable: true }) br4_notes: string;
  @Column({ type: 'varchar', nullable: true }) br5_level: string;
  @Column({ type: 'varchar', nullable: true }) br5_ceil: string;
  @Column({ type: 'varchar', nullable: true }) br5_floor: string;
  @Column({ type: 'varchar', nullable: true }) br5_notes: string;
  @Column({ type: 'varchar', nullable: true }) br6_level: string;
  @Column({ type: 'varchar', nullable: true }) br6_ceil: string;
  @Column({ type: 'varchar', nullable: true }) br6_floor: string;
  @Column({ type: 'varchar', nullable: true }) br6_notes: string;
  @Column({ type: 'varchar', nullable: true }) up1_ceilht: string;
  @Column({ type: 'varchar', nullable: true }) up1_floor: string;
  @Column({ type: 'varchar', nullable: true }) up1_finsf: string;
  @Column({ type: 'varchar', nullable: true }) up1_unfinsf: string;
  @Column({ type: 'varchar', nullable: true }) up1_rooms: string;
  @Column({ type: 'boolean', nullable: true }) p_8_All_Bedrooms: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_All_Baths: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_Upper_Rooms: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_Updates_Renovations: boolean;
}

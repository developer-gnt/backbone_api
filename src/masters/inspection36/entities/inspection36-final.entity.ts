import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection36 } from './inspection36.entity';

@Entity('tbl_inspection36_final')
export class Inspection36Final {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection36, inspection => inspection.final, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection36;

  @Column({ type: 'varchar', nullable: true }) ext_qual: string;
  @Column({ type: 'varchar', nullable: true }) ext_cond: string;
  @Column({ type: 'varchar', nullable: true }) ovr_qual: string;
  @Column({ type: 'varchar', nullable: true }) ovr_cond: string;
  @Column({ type: 'varchar', nullable: true }) fin_ag_std: string;
  @Column({ type: 'varchar', nullable: true }) fin_ag_nonstd: string;
  @Column({ type: 'varchar', nullable: true }) unfin_ag: string;
  @Column({ type: 'varchar', nullable: true }) gba_total: string;
  @Column({ type: 'varchar', nullable: true }) measstd: string;
  @Column({ type: 'varchar', nullable: true }) sketch_notes: string;
  @Column({ type: 'varchar', nullable: true }) team_notes: string;
  @Column({ type: 'jsonb', nullable: true }) func_issues: any[];
  @Column({ type: 'boolean', nullable: true }) c___Front_door_height_above_grade: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Roof_age_estimate: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Converted_areas: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Kitchen_update_timeframe_condition__EACH_: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Each_bathroom__type___update___condition: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Each_bedroom__level___ceiling_ht___flooring: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Flooring_types___update: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Ceiling_height_per_level: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Per_component_condition: boolean;
  @Column({ type: 'boolean', nullable: true }) c___View___range___impact: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Non_residential_use: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Amenity_counts___areas: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Disaster_mitigation: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Renewable_energy: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Broadband_internet: boolean;
  @Column({ type: 'boolean', nullable: true }) c___ADU_details__if_present_: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Outbuilding_GBA___utilities: boolean;
  @Column({ type: 'boolean', nullable: true }) c___Furnace_location__BG__: boolean;
  @Column({ type: 'boolean', nullable: true }) c_All_levels_measured: boolean;
  @Column({ type: 'boolean', nullable: true }) c_All_photos_taken: boolean;
  @Column({ type: 'boolean', nullable: true }) c_All_defects_documented: boolean;
  @Column({ type: 'boolean', nullable: true }) c_BR_BA_counts_confirmed: boolean;
}

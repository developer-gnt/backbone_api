import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection36 } from './inspection36.entity';

@Entity('tbl_inspection36_outbuildings')
export class Inspection36Outbuildings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection36, inspection => inspection.outbuildings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection36;

  @Column({ type: 'varchar', nullable: true }) veh_type: string;
  @Column({ type: 'varchar', nullable: true }) veh_attach: string;
  @Column({ type: 'varchar', nullable: true }) veh_spaces: string;
  @Column({ type: 'varchar', nullable: true }) veh_sf: string;
  @Column({ type: 'varchar', nullable: true }) veh_surface: string;
  @Column({ type: 'varchar', nullable: true }) ob1_type: string;
  @Column({ type: 'varchar', nullable: true }) ob1_gba: string;
  @Column({ type: 'varchar', nullable: true }) ob1_fin: string;
  @Column({ type: 'varchar', nullable: true }) ob1_unfin: string;
  @Column({ type: 'varchar', nullable: true }) ob1_rooms: string;
  @Column({ type: 'varchar', nullable: true }) ob1_utils: string;
  @Column({ type: 'varchar', nullable: true }) ob1_heat: string;
  @Column({ type: 'varchar', nullable: true }) ob2_type: string;
  @Column({ type: 'varchar', nullable: true }) ob2_gba: string;
  @Column({ type: 'varchar', nullable: true }) ob2_fin: string;
  @Column({ type: 'varchar', nullable: true }) ob2_heat: string;
  @Column({ type: 'boolean', nullable: true }) p_8_Garage_Carport: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_Outbuilding_Ext: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_Outbuilding_Int: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_Defects: boolean;
}

import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection36 } from './inspection36.entity';

@Entity('tbl_inspection36_yard')
export class Inspection36Yard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection36, inspection => inspection.yard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection36;

  @Column({ type: 'varchar', nullable: true }) topo: string;
  @Column({ type: 'varchar', nullable: true }) drainage: string;
  @Column({ type: 'varchar', nullable: true }) util_elec: string;
  @Column({ type: 'varchar', nullable: true }) util_gas: string;
  @Column({ type: 'varchar', nullable: true }) util_water: string;
  @Column({ type: 'varchar', nullable: true }) util_sewer: string;
  @Column({ type: 'varchar', nullable: true }) broadband: string;
  @Column({ type: 'varchar', nullable: true }) primres: string;
  @Column({ type: 'varchar', nullable: true }) respct: string;
  @Column({ type: 'varchar', nullable: true }) nonres: string;
  @Column({ type: 'varchar', nullable: true }) nonresmod: string;
  @Column({ type: 'varchar', nullable: true }) restrict: string;
  @Column({ type: 'varchar', nullable: true }) easement: string;
  @Column({ type: 'varchar', nullable: true }) encroach: string;
  @Column({ type: 'varchar', nullable: true }) amen_out: string;
  @Column({ type: 'varchar', nullable: true }) amen_living: string;
  @Column({ type: 'varchar', nullable: true }) amen_water: string;
  @Column({ type: 'varchar', nullable: true }) amen1_name: string;
  @Column({ type: 'varchar', nullable: true }) amen1_ct: string;
  @Column({ type: 'varchar', nullable: true }) amen1_sf: string;
  @Column({ type: 'varchar', nullable: true }) amen1_mat: string;
  @Column({ type: 'varchar', nullable: true }) amen2_name: string;
  @Column({ type: 'varchar', nullable: true }) amen2_ct: string;
  @Column({ type: 'varchar', nullable: true }) amen2_sf: string;
  @Column({ type: 'varchar', nullable: true }) amen2_mat: string;
  @Column({ type: 'varchar', nullable: true }) sitedefects: string;
  @Column({ type: 'varchar', nullable: true }) sitedef1_feat: string;
  @Column({ type: 'varchar', nullable: true }) sitedef1_loc: string;
  @Column({ type: 'varchar', nullable: true }) sitedef1_desc: string;
  @Column({ type: 'varchar', nullable: true }) sitedef1_struct: string;
  @Column({ type: 'varchar', nullable: true }) sitedef1_action: string;
  @Column({ type: 'varchar', nullable: true }) sitedef1_cost: string;
  @Column({ type: 'boolean', nullable: true }) p_Yard: boolean;
  @Column({ type: 'boolean', nullable: true }) p_Pool_Spa: boolean;
  @Column({ type: 'boolean', nullable: true }) p_Deck_Patio: boolean;
  @Column({ type: 'boolean', nullable: true }) p_Waterfront: boolean;
  @Column({ type: 'boolean', nullable: true }) p_Non_Res_Use: boolean;
  @Column({ type: 'boolean', nullable: true }) p_Site_Defects: boolean;
}

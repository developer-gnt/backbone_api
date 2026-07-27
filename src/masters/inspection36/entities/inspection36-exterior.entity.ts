import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection36 } from './inspection36.entity';

@Entity('tbl_inspection36_exterior')
export class Inspection36Exterior {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection36, inspection => inspection.exterior, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection36;

  @Column({ type: 'varchar', nullable: true }) extwalls: string;
  @Column({ type: 'varchar', nullable: true }) fndtype: string;
  @Column({ type: 'varchar', nullable: true }) fndmat: string;
  @Column({ type: 'varchar', nullable: true }) roofmat: string;
  @Column({ type: 'varchar', nullable: true }) cond_walls: string;
  @Column({ type: 'varchar', nullable: true }) cond_fnd: string;
  @Column({ type: 'varchar', nullable: true }) cond_roof: string;
  @Column({ type: 'varchar', nullable: true }) cond_win: string;
  @Column({ type: 'varchar', nullable: true }) fndaccess: string;
  @Column({ type: 'varchar', nullable: true }) roofage: string;
  @Column({ type: 'varchar', nullable: true }) roofobs: string;
  @Column({ type: 'varchar', nullable: true }) converted: string;
  @Column({ type: 'varchar', nullable: true }) convfinish: string;
  @Column({ type: 'varchar', nullable: true }) noncontig: string;
  @Column({ type: 'varchar', nullable: true }) attic: string;
  @Column({ type: 'varchar', nullable: true }) atticdet: string;
  @Column({ type: 'varchar', nullable: true }) renewable: string;
  @Column({ type: 'varchar', nullable: true }) renewtype: string;
  @Column({ type: 'varchar', nullable: true }) renewown: string;
  @Column({ type: 'varchar', nullable: true }) extdefects: string;
  @Column({ type: 'varchar', nullable: true }) extdef1_feat: string;
  @Column({ type: 'varchar', nullable: true }) extdef1_loc: string;
  @Column({ type: 'varchar', nullable: true }) extdef1_desc: string;
  @Column({ type: 'varchar', nullable: true }) extdef1_struct: string;
  @Column({ type: 'varchar', nullable: true }) extdef1_action: string;
  @Column({ type: 'varchar', nullable: true }) extdef1_cost: string;
  @Column({ type: 'varchar', nullable: true }) extdef2_feat: string;
  @Column({ type: 'varchar', nullable: true }) extdef2_loc: string;
  @Column({ type: 'varchar', nullable: true }) extdef2_desc: string;
  @Column({ type: 'varchar', nullable: true }) extdef2_struct: string;
  @Column({ type: 'varchar', nullable: true }) extdef2_action: string;
  @Column({ type: 'varchar', nullable: true }) extdef2_cost: string;
  @Column({ type: 'jsonb', nullable: true }) mitigation: any[];
  @Column({ type: 'boolean', nullable: true }) p_N_S_E: boolean;
  @Column({ type: 'boolean', nullable: true }) p_W_S_W: boolean;
  @Column({ type: 'boolean', nullable: true }) p_Right_Side: boolean;
  @Column({ type: 'boolean', nullable: true }) p_Foundation: boolean;
  @Column({ type: 'boolean', nullable: true }) p_Roof: boolean;
  @Column({ type: 'boolean', nullable: true }) p_Renew_Energy: boolean;
  @Column({ type: 'boolean', nullable: true }) p_Mitigation: boolean;
  @Column({ type: 'boolean', nullable: true }) p_Ext_Defects: boolean;
}

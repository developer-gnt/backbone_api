import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection36 } from './inspection36.entity';

@Entity('tbl_inspection36_adu')
export class Inspection36Adu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection36, inspection => inspection.adu, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection36;

  @Column({ type: 'varchar', nullable: true }) adu_present: string;
  @Column({ type: 'varchar', nullable: true }) adu_loc: string;
  @Column({ type: 'varchar', nullable: true }) adu_access: string;
  @Column({ type: 'varchar', nullable: true }) adu_rentable: string;
  @Column({ type: 'varchar', nullable: true }) adu_typical: string;
  @Column({ type: 'varchar', nullable: true }) adu_address: string;
  @Column({ type: 'varchar', nullable: true }) adu_br: string;
  @Column({ type: 'varchar', nullable: true }) adu_fullba: string;
  @Column({ type: 'varchar', nullable: true }) adu_halfba: string;
  @Column({ type: 'varchar', nullable: true }) adu_finsf: string;
  @Column({ type: 'varchar', nullable: true }) adu_unfinsf: string;
  @Column({ type: 'varchar', nullable: true }) adu_kitchen: string;
  @Column({ type: 'varchar', nullable: true }) adu_bath: string;
  @Column({ type: 'boolean', nullable: true }) p_8_ADU_Exterior: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_ADU_Interior: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_ADU_Kitchen: boolean;
  @Column({ type: 'boolean', nullable: true }) p_8_ADU_Bath: boolean;
}

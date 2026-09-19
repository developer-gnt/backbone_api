import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection26 } from './inspection26.entity';

@Entity('tbl_inspection26_interior')
export class Inspection26Interior {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection26, inspection => inspection.interior, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection26;

  @Column({ type: 'varchar', nullable: true }) totalrooms: string;
  @Column({ type: 'varchar', nullable: true }) bedrooms: string;
  @Column({ type: 'varchar', nullable: true }) fullbaths: string;
  @Column({ type: 'varchar', nullable: true }) halfbaths: string;
  @Column({ type: 'varchar', nullable: true }) laundry: string;
  @Column({ type: 'jsonb', nullable: true }) flooring: any;
  @Column({ type: 'varchar', nullable: true }) walls: string;
  @Column({ type: 'varchar', nullable: true }) trim: string;
  @Column({ type: 'varchar', nullable: true }) doors: string;
  @Column({ type: 'varchar', nullable: true }) bathfloor: string;
  @Column({ type: 'varchar', nullable: true }) bathwainscot: string;
  @Column({ type: 'text', nullable: true }) bathnotes: string;
  @Column({ type: 'jsonb', nullable: true }) appliances: any;
  @Column({ type: 'varchar', nullable: true }) counters: string;
  @Column({ type: 'varchar', nullable: true }) backsplash: string;
  @Column({ type: 'text', nullable: true }) kitchennotes: string;
  @Column({ type: 'varchar', nullable: true }) fireplace: string;
  @Column({ type: 'varchar', nullable: true }) fpcount: string;
  @Column({ type: 'varchar', nullable: true }) fptype: string;
  @Column({ type: 'varchar', nullable: true }) woodstove: string;
  @Column({ type: 'varchar', nullable: true }) alarm: string;
  @Column({ type: 'varchar', nullable: true }) intercom: string;
  @Column({ type: 'varchar', nullable: true }) centralvac: string;
  @Column({ type: 'varchar', nullable: true }) heating: string;
  @Column({ type: 'varchar', nullable: true }) fuel: string;
  @Column({ type: 'varchar', nullable: true }) cooling: string;
  @Column({ type: 'varchar', nullable: true }) attic: string;
  @Column({ type: 'jsonb', nullable: true }) atticfeat: any;
  @Column({ type: 'varchar', nullable: true }) intquality: string;
  @Column({ type: 'varchar', nullable: true }) intcond: string;
  @Column({ type: 'varchar', nullable: true }) intdefects: string;
  @Column({ type: 'text', nullable: true }) intdefect_desc: string;

  @Column({ type: 'boolean', nullable: true }) p3_Kitchen: boolean;
  @Column({ type: 'boolean', nullable: true }) p3_All_Baths: boolean;
  @Column({ type: 'boolean', nullable: true }) p3_All_Bedrooms: boolean;
  @Column({ type: 'boolean', nullable: true }) p3_Living_Room: boolean;
  @Column({ type: 'boolean', nullable: true }) p3_Dining: boolean;
  @Column({ type: 'boolean', nullable: true }) p3_Updates_Defects: boolean;
}

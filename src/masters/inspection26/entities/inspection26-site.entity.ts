import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection26 } from './inspection26.entity';

@Entity('tbl_inspection26_site')
export class Inspection26Site {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection26, inspection => inspection.site, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection26;

  @Column({ type: 'varchar', nullable: true }) streetsurface: string;
  @Column({ type: 'varchar', nullable: true }) streetpub: string;
  @Column({ type: 'varchar', nullable: true }) streetlights: string;
  @Column({ type: 'varchar', nullable: true }) alley: string;
  @Column({ type: 'varchar', nullable: true }) driveway: string;
  @Column({ type: 'varchar', nullable: true }) electric: string;
  @Column({ type: 'varchar', nullable: true }) gas: string;
  @Column({ type: 'varchar', nullable: true }) water: string;
  @Column({ type: 'varchar', nullable: true }) sewer: string;
  @Column({ type: 'varchar', nullable: true }) lotsize: string;
  @Column({ type: 'varchar', nullable: true }) lotshape: string;
  @Column({ type: 'varchar', nullable: true }) drainage: string;
  @Column({ type: 'varchar', nullable: true }) locimpact: string;
  @Column({ type: 'jsonb', nullable: true }) loctype: any;
  @Column({ type: 'varchar', nullable: true }) viewimpact: string;
  @Column({ type: 'jsonb', nullable: true }) viewtype: any;
  @Column({ type: 'text', nullable: true }) viewnotes: string;
  @Column({ type: 'varchar', nullable: true }) sitedefects: string;
  @Column({ type: 'text', nullable: true }) sitedefect_desc: string;

  @Column({ type: 'boolean', nullable: true }) p1_Street_Scene: boolean;
  @Column({ type: 'boolean', nullable: true }) p1_Front_of_Property: boolean;
}

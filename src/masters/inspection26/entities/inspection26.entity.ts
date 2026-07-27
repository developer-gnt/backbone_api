import { UserBaseModifiedEntity } from 'src/packages/core/base-entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Inspection26Site } from './inspection26-site.entity';
import { Inspection26Exterior } from './inspection26-exterior.entity';
import { Inspection26Interior } from './inspection26-interior.entity';
import { Inspection26Basement } from './inspection26-basement.entity';
import { Inspection26Measurements } from './inspection26-measurements.entity';

@Entity('tbl_inspection26')
export class Inspection26 extends UserBaseModifiedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  client_id: number;

  @Column({ type: 'varchar', nullable: true }) address: string;
  @Column({ type: 'varchar', nullable: true }) city: string;
  @Column({ type: 'varchar', nullable: true }) stzip: string;
  @Column({ type: 'varchar', nullable: true }) date: string;
  @Column({ type: 'varchar', nullable: true }) fileno: string;
  @Column({ type: 'varchar', nullable: true }) appraiser: string;
  @Column({ type: 'varchar', nullable: true }) borrower: string;
  @Column({ type: 'varchar', nullable: true }) timein: string;
  @Column({ type: 'varchar', nullable: true }) timeout: string;
  @Column({ type: 'varchar', nullable: true }) reporttype: string;
  @Column({ type: 'varchar', nullable: true }) occupant: string;
  @Column({ type: 'varchar', nullable: true }) dwelling_style: string;
  @Column({ type: 'varchar', nullable: true }) structure: string;
  @Column({ type: 'varchar', nullable: true }) units: string;
  @Column({ type: 'varchar', nullable: true }) stories: string;
  @Column({ type: 'varchar', nullable: true }) yearbuilt: string;
  @Column({ type: 'varchar', nullable: true }) age: string;
  @Column({ type: 'varchar', nullable: true }) effage: string;
  @Column({ type: 'varchar', nullable: true }) rel: string;
  @Column({ type: 'varchar', nullable: true }) pud: string;
  @Column({ type: 'varchar', nullable: true }) hoa: string;
  @Column({ type: 'varchar', nullable: true }) hoafreq: string;
  @Column({ type: 'varchar', nullable: true }) condoproj: string;

  @Column({ type: 'varchar', length: 50, default: 'Draft' })
  status: string;

  @OneToOne(() => Inspection26Site, site => site.inspection, { cascade: true })
  site: Inspection26Site;

  @OneToOne(() => Inspection26Exterior, exterior => exterior.inspection, { cascade: true })
  exterior: Inspection26Exterior;

  @OneToOne(() => Inspection26Interior, interior => interior.inspection, { cascade: true })
  interior: Inspection26Interior;

  @OneToOne(() => Inspection26Basement, basement => basement.inspection, { cascade: true })
  basement: Inspection26Basement;

  @OneToOne(() => Inspection26Measurements, measurements => measurements.inspection, { cascade: true })
  measurements: Inspection26Measurements;
}


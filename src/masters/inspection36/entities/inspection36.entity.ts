import { UserBaseModifiedEntity } from 'src/packages/core/base-entity';
import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Inspection36Arrive } from './inspection36-arrive.entity';
import { Inspection36Curb } from './inspection36-curb.entity';
import { Inspection36Exterior } from './inspection36-exterior.entity';
import { Inspection36Yard } from './inspection36-yard.entity';
import { Inspection36Outbuildings } from './inspection36-outbuildings.entity';
import { Inspection36Mainlevel } from './inspection36-mainlevel.entity';
import { Inspection36Upperlevel } from './inspection36-upperlevel.entity';
import { Inspection36Belowgrade } from './inspection36-belowgrade.entity';
import { Inspection36Adu } from './inspection36-adu.entity';
import { Inspection36Final } from './inspection36-final.entity';

@Entity('tbl_inspection36')
export class Inspection36 extends UserBaseModifiedEntity {
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
  @Column({ type: 'varchar', nullable: true }) proptype: string;
  @Column({ type: 'varchar', nullable: true }) dwelling_style: string;
  @Column({ type: 'varchar', nullable: true }) attachment_type: string;

  @Column({ type: 'varchar', length: 50, default: 'Draft' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  other_data: any;

  @OneToOne(() => Inspection36Arrive, arrive => arrive.inspection, { cascade: true })
  arrive: Inspection36Arrive;

  @OneToOne(() => Inspection36Curb, curb => curb.inspection, { cascade: true })
  curb: Inspection36Curb;

  @OneToOne(() => Inspection36Exterior, exterior => exterior.inspection, { cascade: true })
  exterior: Inspection36Exterior;

  @OneToOne(() => Inspection36Yard, yard => yard.inspection, { cascade: true })
  yard: Inspection36Yard;

  @OneToOne(() => Inspection36Outbuildings, outbuildings => outbuildings.inspection, { cascade: true })
  outbuildings: Inspection36Outbuildings;

  @OneToOne(() => Inspection36Mainlevel, mainlevel => mainlevel.inspection, { cascade: true })
  mainlevel: Inspection36Mainlevel;

  @OneToOne(() => Inspection36Upperlevel, upperlevel => upperlevel.inspection, { cascade: true })
  upperlevel: Inspection36Upperlevel;

  @OneToOne(() => Inspection36Belowgrade, belowgrade => belowgrade.inspection, { cascade: true })
  belowgrade: Inspection36Belowgrade;

  @OneToOne(() => Inspection36Adu, adu => adu.inspection, { cascade: true })
  adu: Inspection36Adu;

  @OneToOne(() => Inspection36Final, final => final.inspection, { cascade: true })
  final: Inspection36Final;
}

import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection26 } from './inspection26.entity';

@Entity('tbl_inspection26_exterior')
export class Inspection26Exterior {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection26, inspection => inspection.exterior, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection26;

  @Column({ type: 'varchar', nullable: true }) extfront: string;
  @Column({ type: 'varchar', nullable: true }) extside: string;
  @Column({ type: 'varchar', nullable: true }) roof: string;
  @Column({ type: 'varchar', nullable: true }) gutters: string;
  @Column({ type: 'varchar', nullable: true }) windows: string;
  @Column({ type: 'varchar', nullable: true }) stormwindows: string;
  @Column({ type: 'varchar', nullable: true }) screens: string;
  @Column({ type: 'varchar', nullable: true }) fence: string;
  @Column({ type: 'varchar', nullable: true }) patio: string;
  @Column({ type: 'varchar', nullable: true }) decksize: string;
  @Column({ type: 'varchar', nullable: true }) deckmat: string;
  @Column({ type: 'varchar', nullable: true }) coverporch: string;
  @Column({ type: 'varchar', nullable: true }) porchloc: string;
  @Column({ type: 'varchar', nullable: true }) screenporch: string;
  @Column({ type: 'varchar', nullable: true }) sunroom: string;
  @Column({ type: 'varchar', nullable: true }) gazebo: string;
  @Column({ type: 'varchar', nullable: true }) balcony: string;
  @Column({ type: 'varchar', nullable: true }) sprinklers: string;
  @Column({ type: 'varchar', nullable: true }) pool: string;
  @Column({ type: 'varchar', nullable: true }) shed: string;
  @Column({ type: 'text', nullable: true }) sheddesc: string;
  @Column({ type: 'varchar', nullable: true }) garagecars: string;
  @Column({ type: 'varchar', nullable: true }) garagesize: string;
  @Column({ type: 'varchar', nullable: true }) garagetype: string;
  @Column({ type: 'varchar', nullable: true }) garageloc: string;
  @Column({ type: 'varchar', nullable: true }) parking: string;
  @Column({ type: 'varchar', nullable: true }) extquality: string;
  @Column({ type: 'varchar', nullable: true }) extcond: string;
  @Column({ type: 'varchar', nullable: true }) extdefects: string;
  @Column({ type: 'text', nullable: true }) extdefect_desc: string;

  @Column({ type: 'boolean', nullable: true }) p2_Front: boolean;
  @Column({ type: 'boolean', nullable: true }) p2_Rear: boolean;
  @Column({ type: 'boolean', nullable: true }) p2_Left_Side: boolean;
  @Column({ type: 'boolean', nullable: true }) p2_Right_Side: boolean;
  @Column({ type: 'boolean', nullable: true }) p2_Garage: boolean;
  @Column({ type: 'boolean', nullable: true }) p2_Defects: boolean;
}

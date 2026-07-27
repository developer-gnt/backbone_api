import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection36 } from './inspection36.entity';

@Entity('tbl_inspection36_curb')
export class Inspection36Curb {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection36, inspection => inspection.curb, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection36;

  @Column({ type: 'varchar', nullable: true }) primview: string;
  @Column({ type: 'varchar', nullable: true }) viewrange: string;
  @Column({ type: 'varchar', nullable: true }) viewimpact: string;
  @Column({ type: 'varchar', nullable: true }) otherview: string;
  @Column({ type: 'varchar', nullable: true }) frontdoor: string;
  @Column({ type: 'jsonb', nullable: true }) influences: any[];
  @Column({ type: 'boolean', nullable: true }) p_Front_of_Property: boolean;
}

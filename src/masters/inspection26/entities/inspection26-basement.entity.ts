import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Inspection26 } from './inspection26.entity';

@Entity('tbl_inspection26_basement')
export class Inspection26Basement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  inspection_id: string;

  @OneToOne(() => Inspection26, inspection => inspection.basement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: Inspection26;

  @Column({ type: 'varchar', nullable: true })
  basetype: string;
  @Column({ type: 'varchar', nullable: true })
  baseentrance: string;
  @Column({ type: 'varchar', nullable: true })
  foundation: string;
  @Column({ type: 'varchar', nullable: true })
  sumppump: string;
  @Column({ type: 'varchar', nullable: true })
  basefinished: string;
  @Column({ type: 'varchar', nullable: true })
  basepct: string;
  @Column({ type: 'varchar', nullable: true })
  basefinsf: string;
  @Column({ type: 'varchar', nullable: true })
  baseunfinsf: string;
  @Column({ type: 'varchar', nullable: true })
  baseceilht: string;
  @Column({ type: 'text', nullable: true })
  baserooms: string;
  @Column({ type: 'text', nullable: true })
  basecond: string;
  @Column({ type: 'varchar', nullable: true })
  basedefects: string;
  @Column({ type: 'text', nullable: true })
  basedefect_desc: string;

  @Column({ type: 'boolean', nullable: true })
  p4_Basement_Finished: boolean;
  @Column({ type: 'boolean', nullable: true })
  p4_Basement_Unfinished: boolean;
  @Column({ type: 'boolean', nullable: true })
  p4_Mechanicals: boolean;
  @Column({ type: 'boolean', nullable: true })
  p4_Defects: boolean;
}

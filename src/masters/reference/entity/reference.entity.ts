import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reference')
export class Reference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  source: string;
}

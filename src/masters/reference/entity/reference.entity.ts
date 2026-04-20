import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'referencesource_master' })
export class Reference {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference_source: string;
}

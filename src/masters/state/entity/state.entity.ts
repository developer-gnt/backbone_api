import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'city_master' })
export class State {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;
}

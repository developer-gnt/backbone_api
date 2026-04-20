import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'package_master' })
export class Package {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  duration: string;

  @Column({ type: 'numeric', default: 0 })
  price: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  credit: string;
}

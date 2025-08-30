import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'package' })
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}

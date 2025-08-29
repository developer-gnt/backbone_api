import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('package')
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  duration: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}

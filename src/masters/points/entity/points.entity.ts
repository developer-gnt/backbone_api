import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('points')
export class Points {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  user_name: string;

  @Column({ type: 'int' })
  point: number;
}

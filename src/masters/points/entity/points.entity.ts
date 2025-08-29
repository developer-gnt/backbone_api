import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('points')
export class Points {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_name: string;

  @Column()
  point: number;
}

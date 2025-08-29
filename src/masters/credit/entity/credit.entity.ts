import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('credit')
export class Credit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  credit: number;
}

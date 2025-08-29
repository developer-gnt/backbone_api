import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('state')
export class State {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;
}

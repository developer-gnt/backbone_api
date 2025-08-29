import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reference')
export class Reference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  source: string;
}

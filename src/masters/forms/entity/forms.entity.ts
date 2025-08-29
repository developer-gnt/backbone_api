import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('forms')
export class Forms {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sequence_number: number;

  @Column()
  form: string;
}

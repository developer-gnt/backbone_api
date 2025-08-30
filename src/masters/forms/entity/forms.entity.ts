import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'forms' })
export class Forms {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  sequence_number: number;

  @Column({ type: 'varchar', length: 255 })
  form: string;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'credit' })
export class Credit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  credit: number;
}

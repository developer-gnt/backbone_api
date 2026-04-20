import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'tbl_formstype' })
export class Forms {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  form: string;
}

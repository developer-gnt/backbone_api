import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'downloads' })
export class Download {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  order_id: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  type: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  filename: string;

  @Column({ type: 'bytea', nullable: true })
  attachment: Buffer;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;

  @Column({ type: 'varchar', length: 3000, nullable: true })
  filepath: string;
}

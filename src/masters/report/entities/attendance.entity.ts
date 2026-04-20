import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'attendance' })
export class Attendance {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  username: string;

  @PrimaryColumn({ type: 'date' })
  todaysdate: string;

  @Column({ type: 'timestamp', nullable: true })
  logintime: Date;

  @Column({ type: 'timestamp', nullable: true })
  logouttime: Date;
}

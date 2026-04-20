import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lasttouchdate' })
export class WebsiteAccessLog {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  username: string;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  ipaddress: string;

  @Column({ type: 'timestamp', nullable: true })
  lastlogintime: Date;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  useraddress: string;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  country: string;
}

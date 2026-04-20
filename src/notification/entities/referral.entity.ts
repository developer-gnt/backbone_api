import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'refrrals' })
export class Referral {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  login_email: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  referral_email: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mob: string;
}

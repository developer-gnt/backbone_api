import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'registrations' })
export class Users {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstname: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastname: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  companyname: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referedby: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  officeno: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mobileno: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  zipcode: string;

  @Column({ type: 'timestamp', nullable: true })
  date: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  role: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  status: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  accept_terms: string;

  @Column({ type: 'numeric', precision: 16, scale: 2, nullable: true, default: 0 })
  wallete_balance: number;

  @Column({ type: 'bytea', nullable: true })
  profile_pic: Buffer;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emp_supervisor: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  free_trial: string;

  @Column({ type: 'timestamp', nullable: true })
  expiry_date: Date;

  @Column({ type: 'varchar', nullable: true })
  std_instr: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  points: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  type: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  sendmail: string;

  @Column({ type: 'varchar', nullable: true })
  altmail: string;

  @Column({ type: 'varchar', nullable: true })
  cc: string;

  @Column({ type: 'varchar', nullable: true })
  bcc: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  username: string;
}

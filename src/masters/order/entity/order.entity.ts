import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  createdby: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  package: string;

  @Column({ type: 'bytea', nullable: true })
  attachment: Buffer;

  @Column({ type: 'varchar', length: 50, default: 'Pending' })
  status: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  assigned_supervisor: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  assigned_team_member: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  reply: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @Column({ type: 'numeric', nullable: true, default: 0 })
  amount: number;

  @Column({ type: 'int', nullable: true })
  tat_package_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  package_code: string;

  @Column({ type: 'int', nullable: true })
  tat_hours: number;

  @Column({ type: 'numeric', nullable: true, default: 0 })
  charged_amount: number;

  @Column({ type: 'timestamp', nullable: true })
  created_date: Date;

  @Column({ type: 'varchar', length: 150, nullable: true })
  attachnent_type: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  filename: string;

  @Column({ type: 'text', nullable: true })
  completed_work: string;

  @Column({ type: 'text', nullable: true })
  emp_remark: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  complete_notification_email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  verified_by_supervisor: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  order_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reoform: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  non_uad: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  financing: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  borrower_name: string;

  @Column({ type: 'text', nullable: true })
  subject_address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subject_state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subject_city: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  subject_zipcode: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subject_country: string;

  @Column({ type: 'text', nullable: true })
  order_type_comment: string;

  @Column({ type: 'text', nullable: true })
  standard_instruction: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sketch: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  modifyby: string;

  @Column({ type: 'timestamp', nullable: true })
  modify_date: Date;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'numeric', nullable: true, default: 0 })
  feedback_rating: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assigner_name: string;
}

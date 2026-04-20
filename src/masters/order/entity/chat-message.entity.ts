import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'chatsystem' })
export class ChatMessage {
  @PrimaryColumn({ type: 'int' })
  order_id: number;

  @PrimaryColumn({ type: 'timestamp' })
  msg_time: Date;

  @PrimaryColumn({ type: 'varchar', length: 1000 })
  message: string;

  @PrimaryColumn({ type: 'varchar', length: 200 })
  createdby: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  name: string;

  @Column({ type: 'int', nullable: true })
  login_id: number;

  @Column({ type: 'varchar', length: 200, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  msg_frm: string;
}

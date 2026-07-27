import { Column } from 'typeorm';

export class UserBaseEntity {
  @Column({ type: 'int', nullable: true })
  created_by?: number;

  @Column({ type: 'bigint', nullable: true })
  created_on?: number;

  @Column({ type: 'int', nullable: true })
  modified_by?: number;

  @Column({ type: 'bigint' })
  modified_on?: number;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;
}

export class UserBaseModifiedEntity extends UserBaseEntity {}

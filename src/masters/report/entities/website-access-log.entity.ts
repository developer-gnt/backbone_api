import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lasttouchdate' })
export class WebsiteAccessLog {
  @PrimaryColumn({
    name: 'id',
    type: 'int',
  })
  id: number;

  @Column({
    name: 'username',
    type: 'varchar',
    length: 4000,
    nullable: true,
  })
  username: string;

  @Column({
    name: 'ipaddress',
    type: 'varchar',
    length: 4000,
    nullable: true,
  })
  ipaddress: string;

  @Column({
    name: 'lastlogintime',
    type: 'varchar',
    length: 4000,
    nullable: true,
  })
  lastlogintime: string;

  @Column({
    name: 'useraddress',
    type: 'varchar',
    length: 4000,
    nullable: true,
  })
  useraddress: string;

  @Column({
    name: 'country',
    type: 'varchar',
    length: 4000,
    nullable: true,
  })
  country: string;
}
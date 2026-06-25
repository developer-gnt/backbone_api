import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'lasttouchdate' })
export class WebsiteAccessLog {
  @PrimaryColumn({ name: 'Id', type: 'text' })
  id: string;

  @Column({
    name: 'UserName',
    type: 'varchar', length: 4000, nullable: true
  })
  username: string;

  @Column({
    name: 'IPAddress',
    type: 'varchar', length: 4000, nullable: true
  })
  ipaddress: string;

  @Column({
    name: 'LastLoginTime',
    type: 'varchar',
    length: 4000,
    nullable: true,
  })
  lastlogintime: string;

  @Column({
    name: 'UserAddress',
    type: 'varchar', length: 4000, nullable: true
  })
  useraddress: string;

  @Column({
    name: 'Country',
    type: 'varchar', length: 4000, nullable: true
  })
  country: string;
}

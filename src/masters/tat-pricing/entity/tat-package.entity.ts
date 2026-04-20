import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'tat_packages' })
export class TatPackage {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  package_code: string;

  @Column({ type: 'varchar', length: 255, name: 'display_name' })
  display_name: string;

  @Column({ type: 'int' })
  tat_hours: number;

  @Column({ type: 'numeric', precision: 16, scale: 2, default: 0 })
  default_price: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', nullable: true, default: 0 })
  sort_order: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  updated_at: Date | null;
}
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'client_package_pricing' })
export class ClientPackagePricing {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  package_id: number;

  @Column({ type: 'numeric', precision: 16, scale: 2, nullable: true, default: null })
  custom_price: number | null;

  @Column({ type: 'numeric', precision: 16, scale: 2, nullable: true, default: null })
  custom_credit: number | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  notes: string | null;

  @Column({ type: 'timestamp', nullable: true })
  created_date: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  modify_date: Date | null;
}

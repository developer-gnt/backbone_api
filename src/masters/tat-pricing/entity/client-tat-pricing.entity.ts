import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'client_tat_pricing' })
export class ClientTatPricing {
  @PrimaryColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'bigint', name: 'package_id' })
  package_id: number;

  @Column({ type: 'numeric', precision: 16, scale: 2, nullable: true, default: null })
  custom_price: number | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  effective_from: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  effective_to: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updated_by: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  created_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  updated_at: Date | null;
}
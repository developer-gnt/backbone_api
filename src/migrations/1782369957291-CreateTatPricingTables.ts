import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

export class CreateTatPricingTables1782369957291
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ----------------------------
    // tat_packages
    // ----------------------------
    const tatPackagesExists = await queryRunner.hasTable('tat_packages');

    if (!tatPackagesExists) {
      await queryRunner.createTable(
        new Table({
          name: 'tat_packages',
          columns: [
            {
              name: 'id',
              type: 'bigint',
              isPrimary: true,
            },
            {
              name: 'package_code',
              type: 'varchar',
              length: '100',
            },
            {
              name: 'display_name',
              type: 'varchar',
              length: '255',
            },
            {
              name: 'tat_hours',
              type: 'int',
            },
            {
              name: 'default_price',
              type: 'numeric',
              precision: 16,
              scale: 2,
              default: 0,
            },
            {
              name: 'sort_order',
              type: 'int',
              isNullable: true,
              default: 0,
            },
            {
              name: 'is_active',
              type: 'boolean',
              default: true,
            },
            {
              name: 'created_at',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'updated_at',
              type: 'timestamptz',
              isNullable: true,
            },
          ],
        }),
      );

      await queryRunner.createIndex(
        'tat_packages',
        new TableIndex({
          name: 'IDX_tat_packages_hours',
          columnNames: ['tat_hours'],
          isUnique: true,
        }),
      );

      await queryRunner.query(`
        INSERT INTO tat_packages
        (
          id,
          package_code,
          display_name,
          tat_hours,
          default_price,
          sort_order,
          is_active,
          created_at,
          updated_at
        )
        VALUES
        (1,'12','12 hours TAT',12,12.00,1,true,NOW(),NOW()),
        (2,'06','06 hours TAT',6,15.00,2,true,NOW(),NOW()),
        (3,'04','04 hours TAT',4,20.00,3,true,NOW(),NOW())
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // ----------------------------
    // client_tat_pricing
    // ----------------------------
    const pricingExists = await queryRunner.hasTable(
      'client_tat_pricing',
    );

    if (!pricingExists) {
      await queryRunner.createTable(
        new Table({
          name: 'client_tat_pricing',
          columns: [
            {
              name: 'id',
              type: 'bigint',
              isPrimary: true,
            },
            {
              name: 'username',
              type: 'varchar',
              length: '255',
            },
            {
              name: 'package_id',
              type: 'bigint',
            },
            {
              name: 'custom_price',
              type: 'numeric',
              precision: 16,
              scale: 2,
              isNullable: true,
            },
            {
              name: 'is_active',
              type: 'boolean',
              default: true,
            },
            {
              name: 'effective_from',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'effective_to',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'created_by',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'updated_by',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'created_at',
              type: 'timestamptz',
              isNullable: true,
            },
            {
              name: 'updated_at',
              type: 'timestamptz',
              isNullable: true,
            },
          ],
        }),
      );

      await queryRunner.createIndex(
        'client_tat_pricing',
        new TableIndex({
          name: 'IDX_client_tat_pricing_username_package',
          columnNames: ['username', 'package_id'],
          isUnique: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('client_tat_pricing')) {
      await queryRunner.dropIndex(
        'client_tat_pricing',
        'IDX_client_tat_pricing_username_package',
      );
      await queryRunner.dropTable('client_tat_pricing');
    }

    if (await queryRunner.hasTable('tat_packages')) {
      await queryRunner.dropIndex(
        'tat_packages',
        'IDX_tat_packages_hours',
      );
      await queryRunner.dropTable('tat_packages');
    }
  }
}
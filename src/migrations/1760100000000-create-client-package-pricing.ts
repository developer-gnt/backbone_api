import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateClientPackagePricing1760100000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable('client_package_pricing');

    if (exists) {
      return;
    }

    await queryRunner.createTable(
      new Table({
        name: 'client_package_pricing',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'package_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'custom_price',
            type: 'numeric',
            precision: 16,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'custom_credit',
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
            name: 'notes',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'created_date',
            type: 'timestamp',
            default: 'now()',
            isNullable: true,
          },
          {
            name: 'modify_date',
            type: 'timestamp',
            default: 'now()',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'client_package_pricing',
      new TableIndex({
        name: 'IDX_client_package_pricing_user_package',
        columnNames: ['user_id', 'package_id'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable('client_package_pricing');

    if (!exists) {
      return;
    }

    await queryRunner.dropIndex(
      'client_package_pricing',
      'IDX_client_package_pricing_user_package',
    );
    await queryRunner.dropTable('client_package_pricing');
  }
}

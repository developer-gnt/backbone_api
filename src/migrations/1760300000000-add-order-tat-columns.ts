import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOrderTatColumns1760300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = 'orders';
    const exists = await queryRunner.hasTable(table);

    if (!exists) {
      return;
    }

    const columns: Array<[string, TableColumn]> = [
      [
        'tat_package_id',
        new TableColumn({ name: 'tat_package_id', type: 'int', isNullable: true }),
      ],
      [
        'package_code',
        new TableColumn({ name: 'package_code', type: 'varchar', length: '100', isNullable: true }),
      ],
      [
        'tat_hours',
        new TableColumn({ name: 'tat_hours', type: 'int', isNullable: true }),
      ],
      [
        'charged_amount',
        new TableColumn({ name: 'charged_amount', type: 'numeric', precision: 16, scale: 2, isNullable: true }),
      ],
    ];

    for (const [columnName, column] of columns) {
      const hasColumn = await queryRunner.hasColumn(table, columnName);
      if (!hasColumn) {
        await queryRunner.addColumn(table, column);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = 'orders';
    const exists = await queryRunner.hasTable(table);

    if (!exists) {
      return;
    }

    for (const columnName of ['charged_amount', 'tat_hours', 'package_code', 'tat_package_id']) {
      const hasColumn = await queryRunner.hasColumn(table, columnName);
      if (hasColumn) {
        await queryRunner.dropColumn(table, columnName);
      }
    }
  }
}
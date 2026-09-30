import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOrderUadVersionColumn1760400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = 'orders';
    const exists = await queryRunner.hasTable(table);

    if (!exists) {
      return;
    }

    const hasColumn = await queryRunner.hasColumn(table, 'uad_version');
    if (!hasColumn) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: 'uad_version',
          type: 'varchar',
          length: '50',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = 'orders';
    const exists = await queryRunner.hasTable(table);

    if (!exists) {
      return;
    }

    const hasColumn = await queryRunner.hasColumn(table, 'uad_version');
    if (hasColumn) {
      await queryRunner.dropColumn(table, 'uad_version');
    }
  }
}

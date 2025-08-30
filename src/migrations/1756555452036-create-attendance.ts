import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAttendance1756555452036 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'attendance',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'user_id', type: 'int', isNullable: false },
          { name: 'date', type: 'date', isNullable: false },
          { name: 'login_time', type: 'timestamp', isNullable: false },
          { name: 'logout_time', type: 'timestamp', isNullable: true },
          { name: 'working_hour', type: 'int', isNullable: true },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_on',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'modified_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'modified_on',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'deleted',
            type: 'boolean',
            default: false,
          },
        ],
      }),
      true,
    );

    // await queryRunner.createForeignKey(
    //   'attendance',
    //   new TableForeignKey({
    //     columnNames: ['user_id'],
    //     referencedColumnNames: ['id'],
    //     referencedTableName: 'users',
    //     onDelete: 'CASCADE',
    //   }),
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // const table = await queryRunner.getTable('attendance');
    // const foreignKey = table.foreignKeys.find(
    //   (fk) => fk.columnNames.indexOf('user_id') !== -1,
    // );
    // if (foreignKey) {
    //   await queryRunner.dropForeignKey('attendance', foreignKey);
    // }
    await queryRunner.dropTable('attendance');
  }
}

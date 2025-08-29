import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Roles1739174345726 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'permissions',
            type: 'text',
            isArray: true,
            isNullable: false,
          },
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('roles');
  }
}

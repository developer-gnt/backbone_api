import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateSpecialInstructions1756556212741
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'special_instructions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'instruction',
            type: 'text',
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
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('special_instructions');
  }
}

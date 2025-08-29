import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMasterTables1756458108923 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // State
    await queryRunner.createTable(
      new Table({
        name: 'state',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
        ],
      }),
      true,
    );

    // Reference
    await queryRunner.createTable(
      new Table({
        name: 'reference',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'source', type: 'varchar', length: '255', isNullable: false },
        ],
      }),
      true,
    );

    // Package
    await queryRunner.createTable(
      new Table({
        name: 'package',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'title', type: 'varchar', length: '255', isNullable: false },
          { name: 'duration', type: 'int', isNullable: false },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Credit
    await queryRunner.createTable(
      new Table({
        name: 'credit',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'credit', type: 'int', isNullable: false },
        ],
      }),
      true,
    );

    // Transaction
    await queryRunner.createTable(
      new Table({
        name: 'transaction',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          { name: 'credit_core', type: 'int', isNullable: false },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Points
    await queryRunner.createTable(
      new Table({
        name: 'points',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'user_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          { name: 'point', type: 'int', isNullable: false },
        ],
      }),
      true,
    );

    // Order Type
    await queryRunner.createTable(
      new Table({
        name: 'order_type',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'order_type',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          { name: 'sequence_number', type: 'int', isNullable: false },
        ],
      }),
      true,
    );

    // Forms
    await queryRunner.createTable(
      new Table({
        name: 'forms',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'sequence_number', type: 'int', isNullable: false },
          { name: 'form', type: 'varchar', length: '255', isNullable: false },
        ],
      }),
      true,
    );

    // Alert Availability
    await queryRunner.createTable(
      new Table({
        name: 'alert_availability',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          { name: 'eta', type: 'timestamp', isNullable: false },
          {
            name: 'availability_status',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('alert_availability');
    await queryRunner.dropTable('forms');
    await queryRunner.dropTable('order_type');
    await queryRunner.dropTable('points');
    await queryRunner.dropTable('transaction');
    await queryRunner.dropTable('credit');
    await queryRunner.dropTable('package');
    await queryRunner.dropTable('reference');
    await queryRunner.dropTable('state');
  }
}

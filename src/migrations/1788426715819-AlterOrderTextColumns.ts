import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterOrderTextColumns1788426715819 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
          ALTER TABLE orders ALTER COLUMN reply TYPE text;
          ALTER TABLE orders ALTER COLUMN remark TYPE text;
          ALTER TABLE orders ALTER COLUMN description TYPE text;
          ALTER TABLE orders ALTER COLUMN message TYPE text;
          ALTER TABLE orders ALTER COLUMN emp_remark TYPE text;
          ALTER TABLE orders ALTER COLUMN completed_work TYPE text;
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          NULL;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op - text columns are backward compatible
  }
}

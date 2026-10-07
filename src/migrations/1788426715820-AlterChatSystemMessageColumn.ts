import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterChatSystemMessageColumn1788426715820 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chatsystem') THEN
          ALTER TABLE chatsystem ALTER COLUMN message TYPE text;
          ALTER TABLE chatsystem ALTER COLUMN name TYPE varchar(255);
          ALTER TABLE chatsystem ALTER COLUMN email TYPE varchar(255);
          ALTER TABLE chatsystem ALTER COLUMN createdby TYPE varchar(255);
        END IF;
      EXCEPTION
        WHEN OTHERS THEN
          NULL;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No-op
  }
}

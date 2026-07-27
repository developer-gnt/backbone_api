import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserBaseEntityColumns1784902523631 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tablesWithCreatedBy = ['roles', 'tbl_inspection26'];
        
        for (const table of tablesWithCreatedBy) {
            // Alter created_by
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "created_by"`);
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN "created_by" integer`);
            
            // Alter modified_by
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "modified_by"`);
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN "modified_by" integer`);
        }

        // Alter client_id in tbl_inspection26
        await queryRunner.query(`ALTER TABLE "tbl_inspection26" DROP COLUMN IF EXISTS "client_id"`);
        await queryRunner.query(`ALTER TABLE "tbl_inspection26" ADD COLUMN "client_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tablesWithCreatedBy = ['roles', 'tbl_inspection26'];
        
        for (const table of tablesWithCreatedBy) {
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "created_by"`);
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN "created_by" uuid`);
            
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "modified_by"`);
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN "modified_by" uuid`);
        }

        await queryRunner.query(`ALTER TABLE "tbl_inspection26" DROP COLUMN IF EXISTS "client_id"`);
        await queryRunner.query(`ALTER TABLE "tbl_inspection26" ADD COLUMN "client_id" uuid`);
    }

}

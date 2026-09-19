import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOtherFieldsJsonb1788426715818 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE tbl_inspection26 ADD COLUMN "other_data" jsonb`);
        await queryRunner.query(`ALTER TABLE tbl_inspection36 ADD COLUMN "other_data" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE tbl_inspection36 DROP COLUMN "other_data"`);
        await queryRunner.query(`ALTER TABLE tbl_inspection26 DROP COLUMN "other_data"`);
    }

}

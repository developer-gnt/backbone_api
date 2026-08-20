import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeedbackPointsToUsers1787145814373 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE registrations ADD feedback_points int DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE registrations DROP COLUMN feedback_points`);
    }

}

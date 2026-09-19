import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePointTransactions1787150788295 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE point_transactions (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                points_change INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                description VARCHAR(255) NULL,
                order_id INT NULL,
                created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE point_transactions`);
    }

}
        

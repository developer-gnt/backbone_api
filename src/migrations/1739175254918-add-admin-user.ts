import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();
export class AddAdminUser1739175254918 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const username = process.env.ADMIN_USERNAME;
    const email = process.env.ADMIN_EMAIL;
    const plainPassword = process.env.ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await queryRunner.query(
      `INSERT INTO main.users (id, email, username, password, role_id) VALUES ($1, $2, $3, $4, $5)`,
      [
        'a87b8ae0-8f0f-4eab-8384-5031d3d9ec6f',
        email,
        username,
        hashedPassword,
        'fb4d0960-9c72-47df-bde4-f92b3dbd793e',
      ],
    );
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM users WHERE email = $1`, [
      'admin@admin.com',
    ]);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminUserRoles1739176590928 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const currentTimeUnix = Math.floor(Date.now() / 1000);

    await queryRunner.query(
      `INSERT INTO main.roles(id, name, permissions, created_on) VALUES($1, $2, $3, $4), ($5, $6, $7, $8)`,
      [
        'fb4d0960-9c72-47df-bde4-f92b3dbd793e', // UUID for Admin
        'admin',
        [101, 102, 103, 104, 111, 112, 113, 114],
        currentTimeUnix,
        'a82e512b-d2d8-4af5-b208-2ebe7eea097e', // UUID for User
        'user',
        [],
        currentTimeUnix,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM roles WHERE id IN($1, $2)`, [
      'fb4d0960-9c72-47df-bde4-f92b3dbd793e',
      'a82e512b-d2d8-4af5-b208-2ebe7eea097e',
    ]);
  }
}

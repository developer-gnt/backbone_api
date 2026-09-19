import { MigrationInterface, QueryRunner } from 'typeorm';

export class finalSeed1782390859655
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const pricingExists = await queryRunner.hasTable('client_tat_pricing');
        const tatExists = await queryRunner.hasTable('tat_packages');
        const registrationsExist = await queryRunner.hasTable('registrations');

        if (!pricingExists || !tatExists || !registrationsExist) {
            return;
        }

        await queryRunner.query(`
      WITH legacy_rules(lookup_key, tat_hours, custom_price) AS (
        VALUES
          ('swaters28@gmail.com', 12, 10),
          ('jerseyappraisers', 12, 10),
          ('James Snyder', 12, 10),
          ('kevingibbons@outlook.com', 12, 10),
          ('Sid@SouthShoreAppraisalsCa.com', 12, 10),
          ('dansa.services@outlook.com', 12, 10),
          ('daaron', 12, 8),
          ('TAG123!', 12, 8),
          ('sanjay2004', 12, 8),
          ('amandahsf', 12, 8),
          ('analytixappraisal', 12, 8),
          ('msurmaty', 12, 8),
          ('Richard101', 12, 8),
          ('markgsato@gmail.com', 12, 9),
          ('ryangramb', 12, 20),
          ('BanksAG', 12, 5),

          ('daaron', 6, 12),
          ('swaters28@gmail.com', 6, 12),
          ('markgsato@gmail.com', 6, 12),
          ('msurmaty', 6, 10),
          ('sanjay2004', 6, 10),
          ('amandahsf', 6, 10),
          ('analytixappraisal', 6, 10),
          ('Richard101', 6, 10),
          ('dansa.services', 6, 10),
          ('James Snyder', 6, 14),
          ('jerseyappraisers', 6, 14),
          ('TAG123!', 6, 8),
          ('BanksAG', 6, 5),

          ('daaron', 4, 15),
          ('sanjay2004', 4, 15),
          ('amandahsf', 4, 15),
          ('analytixappraisal', 4, 15),
          ('msurmaty', 4, 15),
          ('swaters28@gmail.com', 4, 15),
          ('Richard101', 4, 15),
          ('James Snyder', 4, 18),
          ('jerseyappraisers', 4, 18),
          ('markgsato@gmail.com', 4, 16),
          ('TAG123!', 4, 8),
          ('dansa.services', 4, 12),
          ('BanksAG', 4, 5)
      ),
      matched_users AS (
        SELECT DISTINCT ON (LOWER(rule.lookup_key), reg.id)
          rule.lookup_key,
          reg.id AS client_id
        FROM legacy_rules rule
        JOIN registrations reg
          ON LOWER(COALESCE(reg.role, '')) = 'client'
         AND (
           LOWER(COALESCE(reg.username, '')) = LOWER(rule.lookup_key)
           OR LOWER(COALESCE(reg.email, '')) = LOWER(rule.lookup_key)
           OR LOWER(COALESCE(reg.companyname, '')) = LOWER(rule.lookup_key)
           OR LOWER(TRIM(CONCAT(COALESCE(reg.firstname, ''), ' ', COALESCE(reg.lastname, '')))) = LOWER(rule.lookup_key)
         )
        ORDER BY LOWER(rule.lookup_key), reg.id
      ),
      tat_rows AS (
        SELECT
          id AS tat_package_id,
          tat_hours,
          ROW_NUMBER() OVER (
            PARTITION BY tat_hours
            ORDER BY COALESCE(sort_order,0), id
          ) AS rn
        FROM tat_packages
        WHERE is_active = true
      ),
      selected_tats AS (
        SELECT tat_hours, tat_package_id
        FROM tat_rows
        WHERE rn = 1
      ),
      seed_rows AS (
        SELECT DISTINCT
          COALESCE(NULLIF(reg.username,''), NULLIF(reg.email,''), rule.lookup_key) AS username,
          tat_match.tat_package_id,
          rule.custom_price
        FROM legacy_rules rule
        JOIN matched_users user_match
          ON user_match.lookup_key = rule.lookup_key
        JOIN registrations reg
          ON reg.id = user_match.client_id
        JOIN selected_tats tat_match
          ON tat_match.tat_hours = rule.tat_hours
      )
      INSERT INTO client_tat_pricing (
        id,
        username,
        package_id,
        custom_price,
        is_active,
        effective_from,
        effective_to,
        created_by,
        updated_by,
        created_at,
        updated_at
      )
      SELECT
        (SELECT COALESCE(MAX(id),0) FROM client_tat_pricing)
          + ROW_NUMBER() OVER (ORDER BY seed.username, seed.tat_package_id),
        seed.username,
        seed.tat_package_id,
        seed.custom_price,
        true,
        NULL,
        NULL,
        'migration',
        'migration',
        NOW(),
        NOW()
      FROM seed_rows seed
      WHERE NOT EXISTS (
        SELECT 1
        FROM client_tat_pricing existing
        WHERE existing.username = seed.username
          AND existing.package_id = seed.tat_package_id
      );
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const pricingExists = await queryRunner.hasTable('client_tat_pricing');

        if (!pricingExists) {
            return;
        }

        await queryRunner.query(`
      DELETE FROM client_tat_pricing
      WHERE created_by = 'migration'
        AND updated_by = 'migration';
    `);
    }
}
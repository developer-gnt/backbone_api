import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedLegacyClientTatPricing1760200000000
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const pricingExists = await queryRunner.hasTable('client_package_pricing');
    const packageExists = await queryRunner.hasTable('package_master');
    const registrationsExist = await queryRunner.hasTable('registrations');

    if (!pricingExists || !packageExists || !registrationsExist) {
      return;
    }

    await queryRunner.query(`
      WITH legacy_rules(lookup_key, tat_code, custom_price, custom_credit, notes) AS (
        VALUES
          ('swaters28@gmail.com', 12, 10, 10, 'Legacy migrated TAT pricing'),
          ('jerseyappraisers', 12, 10, 10, 'Legacy migrated TAT pricing'),
          ('James Snyder', 12, 10, 10, 'Legacy migrated TAT pricing'),
          ('kevingibbons@outlook.com', 12, 10, 10, 'Legacy migrated TAT pricing'),
          ('Sid@SouthShoreAppraisalsCa.com', 12, 10, 10, 'Legacy migrated TAT pricing'),
          ('dansa.services@outlook.com', 12, 10, 10, 'Legacy migrated TAT pricing'),
          ('daaron', 12, 8, 8, 'Legacy migrated TAT pricing'),
          ('TAG123!', 12, 8, 8, 'Legacy migrated TAT pricing'),
          ('sanjay2004', 12, 8, 8, 'Legacy migrated TAT pricing'),
          ('amandahsf', 12, 8, 8, 'Legacy migrated TAT pricing'),
          ('analytixappraisal', 12, 8, 8, 'Legacy migrated TAT pricing'),
          ('msurmaty', 12, 8, 8, 'Legacy migrated TAT pricing'),
          ('Richard101', 12, 8, 8, 'Legacy migrated TAT pricing'),
          ('markgsato@gmail.com', 12, 9, 9, 'Legacy migrated TAT pricing'),
          ('ryangramb', 12, 20, 20, 'Legacy migrated TAT pricing'),
          ('BanksAG', 12, 5, 5, 'Legacy migrated TAT pricing'),

          ('daaron', 6, 12, 12, 'Legacy migrated TAT pricing'),
          ('swaters28@gmail.com', 6, 12, 12, 'Legacy migrated TAT pricing'),
          ('markgsato@gmail.com', 6, 12, 12, 'Legacy migrated TAT pricing'),
          ('msurmaty', 6, 10, 10, 'Legacy migrated TAT pricing'),
          ('sanjay2004', 6, 10, 10, 'Legacy migrated TAT pricing'),
          ('amandahsf', 6, 10, 10, 'Legacy migrated TAT pricing'),
          ('analytixappraisal', 6, 10, 10, 'Legacy migrated TAT pricing'),
          ('Richard101', 6, 10, 10, 'Legacy migrated TAT pricing'),
          ('dansa.services', 6, 10, 10, 'Legacy migrated TAT pricing'),
          ('James Snyder', 6, 14, 14, 'Legacy migrated TAT pricing'),
          ('jerseyappraisers', 6, 14, 14, 'Legacy migrated TAT pricing'),
          ('TAG123!', 6, 8, 8, 'Legacy migrated TAT pricing'),
          ('BanksAG', 6, 5, 5, 'Legacy migrated TAT pricing'),

          ('daaron', 4, 15, 15, 'Legacy migrated TAT pricing'),
          ('sanjay2004', 4, 15, 15, 'Legacy migrated TAT pricing'),
          ('amandahsf', 4, 15, 15, 'Legacy migrated TAT pricing'),
          ('analytixappraisal', 4, 15, 15, 'Legacy migrated TAT pricing'),
          ('msurmaty', 4, 15, 15, 'Legacy migrated TAT pricing'),
          ('swaters28@gmail.com', 4, 15, 15, 'Legacy migrated TAT pricing'),
          ('Richard101', 4, 15, 15, 'Legacy migrated TAT pricing'),
          ('James Snyder', 4, 18, 18, 'Legacy migrated TAT pricing'),
          ('jerseyappraisers', 4, 18, 18, 'Legacy migrated TAT pricing'),
          ('markgsato@gmail.com', 4, 16, 16, 'Legacy migrated TAT pricing'),
          ('TAG123!', 4, 8, 8, 'Legacy migrated TAT pricing'),
          ('dansa.services', 4, 12, 12, 'Legacy migrated TAT pricing'),
          ('BanksAG', 4, 5, 5, 'Legacy migrated TAT pricing')
      ),
      matched_users AS (
        SELECT DISTINCT ON (LOWER(rule.lookup_key), reg.id)
          rule.lookup_key,
          reg.id AS user_id
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
      package_candidates AS (
        SELECT
          pkg.id AS id,
          CASE
            WHEN COALESCE(
              NULLIF(REGEXP_REPLACE(COALESCE(pkg.duration, ''), '[^0-9]', '', 'g'), ''),
              NULLIF(REGEXP_REPLACE(COALESCE(pkg.title, ''), '[^0-9]', '', 'g'), '')
            ) ~ '^[0-9]+$'
              THEN CAST(
                COALESCE(
                  NULLIF(REGEXP_REPLACE(COALESCE(pkg.duration, ''), '[^0-9]', '', 'g'), ''),
                  NULLIF(REGEXP_REPLACE(COALESCE(pkg.title, ''), '[^0-9]', '', 'g'), '')
                ) AS INT
              )
            ELSE NULL
          END AS tat_code,
          ROW_NUMBER() OVER (
            PARTITION BY CASE
              WHEN COALESCE(
                NULLIF(REGEXP_REPLACE(COALESCE(pkg.duration, ''), '[^0-9]', '', 'g'), ''),
                NULLIF(REGEXP_REPLACE(COALESCE(pkg.title, ''), '[^0-9]', '', 'g'), '')
              ) ~ '^[0-9]+$'
                THEN CAST(
                  COALESCE(
                    NULLIF(REGEXP_REPLACE(COALESCE(pkg.duration, ''), '[^0-9]', '', 'g'), ''),
                    NULLIF(REGEXP_REPLACE(COALESCE(pkg.title, ''), '[^0-9]', '', 'g'), '')
                  ) AS INT
                )
              ELSE NULL
            END
            ORDER BY pkg.id ASC
          ) AS rn
        FROM package_master pkg
      ),
      packages_by_tat AS (
        SELECT
          tat_code,
          id AS package_id
        FROM package_candidates
        WHERE tat_code IN (12, 6, 4)
          AND rn = 1
          AND id IS NOT NULL
      ),
      seed_rows AS (
        SELECT DISTINCT
          user_match.user_id AS user_id,
          package_match.package_id AS package_id,
          rule.custom_price,
          rule.custom_credit,
          rule.notes
        FROM legacy_rules rule
        JOIN matched_users user_match ON user_match.lookup_key = rule.lookup_key
        JOIN packages_by_tat package_match ON package_match.tat_code = rule.tat_code
      )
      INSERT INTO client_package_pricing (
        id,
        user_id,
        package_id,
        custom_price,
        custom_credit,
        is_active,
        notes,
        created_date,
        modify_date
      )
      SELECT
        (SELECT COALESCE(MAX(existing.id), 0) FROM client_package_pricing existing)
          + ROW_NUMBER() OVER (ORDER BY seed.user_id, seed.package_id),
        seed.user_id,
        seed.package_id,
        seed.custom_price,
        seed.custom_credit,
        true,
        seed.notes,
        NOW(),
        NOW()
      FROM seed_rows seed
      WHERE seed.user_id IS NOT NULL
      AND seed.package_id IS NOT NULL
      ON CONFLICT (user_id, package_id) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const pricingExists = await queryRunner.hasTable('client_package_pricing');

    if (!pricingExists) {
      return;
    }

    await queryRunner.query(`
      DELETE FROM client_package_pricing
      WHERE notes = 'Legacy migrated TAT pricing';
    `);
  }
}
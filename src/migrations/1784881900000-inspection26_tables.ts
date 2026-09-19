import { MigrationInterface, QueryRunner } from "typeorm";

export class Inspection26Tables1784881900000 implements MigrationInterface {
    name = 'Inspection26Tables1784881900000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the old single table if it exists
        await queryRunner.query(`DROP TABLE IF EXISTS "tbl_inspection26" CASCADE`);

        // 1. Master Table
        await queryRunner.query(`CREATE TABLE "tbl_inspection26" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "client_id" uuid NOT NULL, 
            "address" varchar, 
            "city" varchar,
            "stzip" varchar,
            "date" varchar,
            "fileno" varchar,
            "appraiser" varchar,
            "borrower" varchar,
            "timein" varchar,
            "timeout" varchar,
            "reporttype" varchar,
            "occupant" varchar,
            "dwelling_style" varchar,
            "structure" varchar,
            "units" varchar,
            "stories" varchar,
            "yearbuilt" varchar,
            "age" varchar,
            "effage" varchar,
            "rel" varchar,
            "pud" varchar,
            "hoa" varchar,
            "hoafreq" varchar,
            "condoproj" varchar,
            "status" varchar NOT NULL DEFAULT 'Draft', 
            "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
            "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, 
            "created_by" uuid, 
            "updated_by" uuid, 
            "deleted_at" timestamp, 
            "deleted" boolean NOT NULL DEFAULT false,
            "created_on" bigint,
            "modified_by" uuid,
            "modified_on" bigint,
            CONSTRAINT "PK_inspection26" PRIMARY KEY ("id")
        )`);

        // 2. Site Table
        await queryRunner.query(`CREATE TABLE "tbl_inspection26_site" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "inspection_id" uuid NOT NULL,
            "streetsurface" varchar,
            "streetpub" varchar,
            "streetlights" varchar,
            "alley" varchar,
            "driveway" varchar,
            "electric" varchar,
            "gas" varchar,
            "water" varchar,
            "sewer" varchar,
            "lotsize" varchar,
            "lotshape" varchar,
            "drainage" varchar,
            "locimpact" varchar,
            "loctype" jsonb,
            "viewimpact" varchar,
            "viewtype" jsonb,
            "viewnotes" text,
            "sitedefects" varchar,
            "sitedefect_desc" text,
            "p1_Street_Scene" boolean,
            "p1_Front_of_Property" boolean,
            CONSTRAINT "PK_inspection26_site" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`ALTER TABLE "tbl_inspection26_site" ADD CONSTRAINT "FK_site_inspection" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection26"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // 3. Exterior Table
        await queryRunner.query(`CREATE TABLE "tbl_inspection26_exterior" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "inspection_id" uuid NOT NULL,
            "extfront" varchar,
            "extside" varchar,
            "roof" varchar,
            "gutters" varchar,
            "windows" varchar,
            "stormwindows" varchar,
            "screens" varchar,
            "fence" varchar,
            "patio" varchar,
            "decksize" varchar,
            "deckmat" varchar,
            "coverporch" varchar,
            "porchloc" varchar,
            "screenporch" varchar,
            "sunroom" varchar,
            "gazebo" varchar,
            "balcony" varchar,
            "sprinklers" varchar,
            "pool" varchar,
            "shed" varchar,
            "sheddesc" text,
            "garagecars" varchar,
            "garagesize" varchar,
            "garagetype" varchar,
            "garageloc" varchar,
            "parking" varchar,
            "extquality" varchar,
            "extcond" varchar,
            "extdefects" varchar,
            "extdefect_desc" text,
            "p2_Front" boolean,
            "p2_Rear" boolean,
            "p2_Left_Side" boolean,
            "p2_Right_Side" boolean,
            "p2_Garage" boolean,
            "p2_Defects" boolean,
            CONSTRAINT "PK_inspection26_exterior" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`ALTER TABLE "tbl_inspection26_exterior" ADD CONSTRAINT "FK_exterior_inspection" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection26"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // 4. Interior Table
        await queryRunner.query(`CREATE TABLE "tbl_inspection26_interior" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "inspection_id" uuid NOT NULL,
            "totalrooms" varchar,
            "bedrooms" varchar,
            "fullbaths" varchar,
            "halfbaths" varchar,
            "laundry" varchar,
            "flooring" jsonb,
            "walls" varchar,
            "trim" varchar,
            "doors" varchar,
            "bathfloor" varchar,
            "bathwainscot" varchar,
            "bathnotes" text,
            "appliances" jsonb,
            "counters" varchar,
            "backsplash" varchar,
            "kitchennotes" text,
            "fireplace" varchar,
            "fpcount" varchar,
            "fptype" varchar,
            "woodstove" varchar,
            "alarm" varchar,
            "intercom" varchar,
            "centralvac" varchar,
            "heating" varchar,
            "fuel" varchar,
            "cooling" varchar,
            "attic" varchar,
            "atticfeat" jsonb,
            "intquality" varchar,
            "intcond" varchar,
            "intdefects" varchar,
            "intdefect_desc" text,
            "p3_Kitchen" boolean,
            "p3_All_Baths" boolean,
            "p3_All_Bedrooms" boolean,
            "p3_Living_Room" boolean,
            "p3_Dining" boolean,
            "p3_Updates_Defects" boolean,
            CONSTRAINT "PK_inspection26_interior" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`ALTER TABLE "tbl_inspection26_interior" ADD CONSTRAINT "FK_interior_inspection" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection26"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // 5. Basement Table
        await queryRunner.query(`CREATE TABLE "tbl_inspection26_basement" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "inspection_id" uuid NOT NULL,
            "basetype" varchar,
            "baseentrance" varchar,
            "foundation" varchar,
            "sumppump" varchar,
            "basefinished" varchar,
            "basepct" varchar,
            "basefinsf" varchar,
            "baseunfinsf" varchar,
            "baseceilht" varchar,
            "baserooms" text,
            "basecond" text,
            "basedefects" varchar,
            "basedefect_desc" text,
            "p4_Basement_Finished" boolean,
            "p4_Basement_Unfinished" boolean,
            "p4_Mechanicals" boolean,
            "p4_Defects" boolean,
            CONSTRAINT "PK_inspection26_basement" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`ALTER TABLE "tbl_inspection26_basement" ADD CONSTRAINT "FK_basement_inspection" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection26"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // 6. Measurements Table
        await queryRunner.query(`CREATE TABLE "tbl_inspection26_measurements" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "inspection_id" uuid NOT NULL,
            "gla" varchar,
            "bgfinsf" varchar,
            "totalrooms2" varchar,
            "sketchnotes" text,
            "comments" text,
            "departure" jsonb,
            "team_notes" text,
            CONSTRAINT "PK_inspection26_measurements" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`ALTER TABLE "tbl_inspection26_measurements" ADD CONSTRAINT "FK_measurements_inspection" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection26"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tbl_inspection26_measurements" DROP CONSTRAINT "FK_measurements_inspection"`);
        await queryRunner.query(`ALTER TABLE "tbl_inspection26_basement" DROP CONSTRAINT "FK_basement_inspection"`);
        await queryRunner.query(`ALTER TABLE "tbl_inspection26_interior" DROP CONSTRAINT "FK_interior_inspection"`);
        await queryRunner.query(`ALTER TABLE "tbl_inspection26_exterior" DROP CONSTRAINT "FK_exterior_inspection"`);
        await queryRunner.query(`ALTER TABLE "tbl_inspection26_site" DROP CONSTRAINT "FK_site_inspection"`);
        await queryRunner.query(`DROP TABLE "tbl_inspection26_measurements"`);
        await queryRunner.query(`DROP TABLE "tbl_inspection26_basement"`);
        await queryRunner.query(`DROP TABLE "tbl_inspection26_interior"`);
        await queryRunner.query(`DROP TABLE "tbl_inspection26_exterior"`);
        await queryRunner.query(`DROP TABLE "tbl_inspection26_site"`);
        await queryRunner.query(`DROP TABLE "tbl_inspection26"`);
    }
}

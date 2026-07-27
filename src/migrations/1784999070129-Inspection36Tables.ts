import { MigrationInterface, QueryRunner } from "typeorm";

export class Inspection36Tables1784999070129 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tbl_inspection36" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_by" integer,
                "created_on" bigint,
                "modified_by" integer,
                "modified_on" bigint,
                "deleted" boolean NOT NULL DEFAULT false,
                "client_id" integer NOT NULL,
                "address" character varying,
                "city" character varying,
                "stzip" character varying,
                "date" character varying,
                "fileno" character varying,
                "appraiser" character varying,
                "borrower" character varying,
                "timein" character varying,
                "timeout" character varying,
                "proptype" character varying,
                "dwelling_style" character varying,
                "attachment_type" character varying,
                "status" character varying(50) NOT NULL DEFAULT 'Draft',
                CONSTRAINT "PK_tbl_inspection36" PRIMARY KEY ("id")
            );

            CREATE TABLE "tbl_inspection36_arrive" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inspection_id" uuid NOT NULL,
                "access" character varying,
                "streettype" character varying,
                "streetsurface" character varying,
                "pvtmaint" character varying,
                "typaccess" character varying,
                "p_Street_Scene" boolean,
                CONSTRAINT "PK_tbl_inspection36_arrive" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_tbl_inspection36_arrive_inspection_id" UNIQUE ("inspection_id")
            );

            CREATE TABLE "tbl_inspection36_curb" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inspection_id" uuid NOT NULL,
                "primview" character varying,
                "viewrange" character varying,
                "viewimpact" character varying,
                "otherview" character varying,
                "frontdoor" character varying,
                "influences" jsonb,
                "p_Front_of_Property" boolean,
                CONSTRAINT "PK_tbl_inspection36_curb" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_tbl_inspection36_curb_inspection_id" UNIQUE ("inspection_id")
            );

            CREATE TABLE "tbl_inspection36_exterior" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inspection_id" uuid NOT NULL,
                "extwalls" character varying,
                "fndtype" character varying,
                "fndmat" character varying,
                "roofmat" character varying,
                "cond_walls" character varying,
                "cond_fnd" character varying,
                "cond_roof" character varying,
                "cond_win" character varying,
                "fndaccess" character varying,
                "roofage" character varying,
                "roofobs" character varying,
                "converted" character varying,
                "convfinish" character varying,
                "noncontig" character varying,
                "attic" character varying,
                "atticdet" character varying,
                "renewable" character varying,
                "renewtype" character varying,
                "renewown" character varying,
                "extdefects" character varying,
                "extdef1_feat" character varying,
                "extdef1_loc" character varying,
                "extdef1_desc" character varying,
                "extdef1_struct" character varying,
                "extdef1_action" character varying,
                "extdef1_cost" character varying,
                "extdef2_feat" character varying,
                "extdef2_loc" character varying,
                "extdef2_desc" character varying,
                "extdef2_struct" character varying,
                "extdef2_action" character varying,
                "extdef2_cost" character varying,
                "mitigation" jsonb,
                "p_N_S_E" boolean,
                "p_W_S_W" boolean,
                "p_Right_Side" boolean,
                "p_Foundation" boolean,
                "p_Roof" boolean,
                "p_Renew_Energy" boolean,
                "p_Mitigation" boolean,
                "p_Ext_Defects" boolean,
                CONSTRAINT "PK_tbl_inspection36_exterior" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_tbl_inspection36_exterior_inspection_id" UNIQUE ("inspection_id")
            );

            CREATE TABLE "tbl_inspection36_yard" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inspection_id" uuid NOT NULL,
                "topo" character varying,
                "drainage" character varying,
                "util_elec" character varying,
                "util_gas" character varying,
                "util_water" character varying,
                "util_sewer" character varying,
                "broadband" character varying,
                "primres" character varying,
                "respct" character varying,
                "nonres" character varying,
                "nonresmod" character varying,
                "restrict" character varying,
                "easement" character varying,
                "encroach" character varying,
                "amen_out" character varying,
                "amen_living" character varying,
                "amen_water" character varying,
                "amen1_name" character varying,
                "amen1_ct" character varying,
                "amen1_sf" character varying,
                "amen1_mat" character varying,
                "amen2_name" character varying,
                "amen2_ct" character varying,
                "amen2_sf" character varying,
                "amen2_mat" character varying,
                "sitedefects" character varying,
                "sitedef1_feat" character varying,
                "sitedef1_loc" character varying,
                "sitedef1_desc" character varying,
                "sitedef1_struct" character varying,
                "sitedef1_action" character varying,
                "sitedef1_cost" character varying,
                "p_Yard" boolean,
                "p_Pool_Spa" boolean,
                "p_Deck_Patio" boolean,
                "p_Waterfront" boolean,
                "p_Non_Res_Use" boolean,
                "p_Site_Defects" boolean,
                CONSTRAINT "PK_tbl_inspection36_yard" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_tbl_inspection36_yard_inspection_id" UNIQUE ("inspection_id")
            );

            CREATE TABLE "tbl_inspection36_outbuildings" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inspection_id" uuid NOT NULL,
                "veh_type" character varying,
                "veh_attach" character varying,
                "veh_spaces" character varying,
                "veh_sf" character varying,
                "veh_surface" character varying,
                "ob1_type" character varying,
                "ob1_gba" character varying,
                "ob1_fin" character varying,
                "ob1_unfin" character varying,
                "ob1_rooms" character varying,
                "ob1_utils" character varying,
                "ob1_heat" character varying,
                "ob2_type" character varying,
                "ob2_gba" character varying,
                "ob2_fin" character varying,
                "ob2_heat" character varying,
                "p_8_Garage_Carport" boolean,
                "p_8_Outbuilding_Ext" boolean,
                "p_8_Outbuilding_Int" boolean,
                "p_8_Defects" boolean,
                CONSTRAINT "PK_tbl_inspection36_outbuildings" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_tbl_inspection36_outbuildings_inspection_id" UNIQUE ("inspection_id")
            );

            CREATE TABLE "tbl_inspection36_mainlevel" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inspection_id" uuid NOT NULL,
                "occupancy" character varying,
                "levels" character varying,
                "br" character varying,
                "fullba" character varying,
                "halfba" character varying,
                "intqual" character varying,
                "intcond" character varying,
                "k1_level" character varying,
                "k1_update" character varying,
                "k1_time" character varying,
                "k1_cond" character varying,
                "k2_level" character varying,
                "k2_update" character varying,
                "floor_update" character varying,
                "floor_cond" character varying,
                "ceil_ht" character varying,
                "ceil_style" character varying,
                "wallceil_cond" character varying,
                "floor_types" jsonb,
                "wholehome" jsonb,
                "accessibility" jsonb,
                "p_8_Kitchen_s_" boolean,
                "p_8_Living_Family" boolean,
                "p_8_Dining" boolean,
                "p_8_Main_Level_Rooms" boolean,
                CONSTRAINT "PK_tbl_inspection36_mainlevel" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_tbl_inspection36_mainlevel_inspection_id" UNIQUE ("inspection_id")
            );

            CREATE TABLE "tbl_inspection36_upperlevel" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inspection_id" uuid NOT NULL,
                "bath1_loc" character varying,
                "bath1_type" character varying,
                "bath1_update" character varying,
                "bath1_cond" character varying,
                "bath2_loc" character varying,
                "bath2_type" character varying,
                "bath2_update" character varying,
                "bath2_cond" character varying,
                "bath3_loc" character varying,
                "bath3_type" character varying,
                "bath3_update" character varying,
                "bath3_cond" character varying,
                "bath4_loc" character varying,
                "bath4_type" character varying,
                "bath4_update" character varying,
                "bath4_cond" character varying,
                "br1_level" character varying,
                "br1_ceil" character varying,
                "br1_floor" character varying,
                "br1_notes" character varying,
                "br2_level" character varying,
                "br2_ceil" character varying,
                "br2_floor" character varying,
                "br2_notes" character varying,
                "br3_level" character varying,
                "br3_ceil" character varying,
                "br3_floor" character varying,
                "br3_notes" character varying,
                "br4_level" character varying,
                "br4_ceil" character varying,
                "br4_floor" character varying,
                "br4_notes" character varying,
                "br5_level" character varying,
                "br5_ceil" character varying,
                "br5_floor" character varying,
                "br5_notes" character varying,
                "br6_level" character varying,
                "br6_ceil" character varying,
                "br6_floor" character varying,
                "br6_notes" character varying,
                "up1_ceilht" character varying,
                "up1_floor" character varying,
                "up1_finsf" character varying,
                "up1_unfinsf" character varying,
                "up1_rooms" character varying,
                "p_8_All_Bedrooms" boolean,
                "p_8_All_Baths" boolean,
                "p_8_Upper_Rooms" boolean,
                "p_8_Updates_Renovations" boolean,
                CONSTRAINT "PK_tbl_inspection36_upperlevel" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_tbl_inspection36_upperlevel_inspection_id" UNIQUE ("inspection_id")
            );

            CREATE TABLE "tbl_inspection36_belowgrade" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inspection_id" uuid NOT NULL,
                "bg_finsf" character varying,
                "bg_finnonstd" character varying,
                "bg_unfinsf" character varying,
                "bg_finish" character varying,
                "bg_grade" character varying,
                "bg_access" character varying,
                "bg_extaccess" character varying,
                "bg_ceilht" character varying,
                "bg_rooms" character varying,
                "heat_sys" character varying,
                "heat_fuel" character varying,
                "cooling" character varying,
                "furnace_bg" character varying,
                "bg_defects" character varying,
                "p_8_BG_Finished" boolean,
                "p_8_BG_Unfinished" boolean,
                "p_8_Mechanicals" boolean,
                "p_8_BG_Defects" boolean,
                CONSTRAINT "PK_tbl_inspection36_belowgrade" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_tbl_inspection36_belowgrade_inspection_id" UNIQUE ("inspection_id")
            );

            CREATE TABLE "tbl_inspection36_adu" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inspection_id" uuid NOT NULL,
                "adu_present" character varying,
                "adu_loc" character varying,
                "adu_access" character varying,
                "adu_rentable" character varying,
                "adu_typical" character varying,
                "adu_address" character varying,
                "adu_br" character varying,
                "adu_fullba" character varying,
                "adu_halfba" character varying,
                "adu_finsf" character varying,
                "adu_unfinsf" character varying,
                "adu_kitchen" character varying,
                "adu_bath" character varying,
                "p_8_ADU_Exterior" boolean,
                "p_8_ADU_Interior" boolean,
                "p_8_ADU_Kitchen" boolean,
                "p_8_ADU_Bath" boolean,
                CONSTRAINT "PK_tbl_inspection36_adu" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_tbl_inspection36_adu_inspection_id" UNIQUE ("inspection_id")
            );

            CREATE TABLE "tbl_inspection36_final" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "inspection_id" uuid NOT NULL,
                "ext_qual" character varying,
                "ext_cond" character varying,
                "ovr_qual" character varying,
                "ovr_cond" character varying,
                "fin_ag_std" character varying,
                "fin_ag_nonstd" character varying,
                "unfin_ag" character varying,
                "gba_total" character varying,
                "measstd" character varying,
                "sketch_notes" character varying,
                "team_notes" character varying,
                "func_issues" jsonb,
                "c___Front_door_height_above_grade" boolean,
                "c___Roof_age_estimate" boolean,
                "c___Converted_areas" boolean,
                "c___Kitchen_update_timeframe_condition__EACH_" boolean,
                "c___Each_bathroom__type___update___condition" boolean,
                "c___Each_bedroom__level___ceiling_ht___flooring" boolean,
                "c___Flooring_types___update" boolean,
                "c___Ceiling_height_per_level" boolean,
                "c___Per_component_condition" boolean,
                "c___View___range___impact" boolean,
                "c___Non_residential_use" boolean,
                "c___Amenity_counts___areas" boolean,
                "c___Disaster_mitigation" boolean,
                "c___Renewable_energy" boolean,
                "c___Broadband_internet" boolean,
                "c___ADU_details__if_present_" boolean,
                "c___Outbuilding_GBA___utilities" boolean,
                "c___Furnace_location__BG__" boolean,
                "c_All_levels_measured" boolean,
                "c_All_photos_taken" boolean,
                "c_All_defects_documented" boolean,
                "c_BR_BA_counts_confirmed" boolean,
                CONSTRAINT "PK_tbl_inspection36_final" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_tbl_inspection36_final_inspection_id" UNIQUE ("inspection_id")
            );
            ALTER TABLE "tbl_inspection36_arrive" ADD CONSTRAINT "FK_tbl_inspection36_arrive" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection36"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "tbl_inspection36_curb" ADD CONSTRAINT "FK_tbl_inspection36_curb" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection36"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "tbl_inspection36_exterior" ADD CONSTRAINT "FK_tbl_inspection36_exterior" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection36"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "tbl_inspection36_yard" ADD CONSTRAINT "FK_tbl_inspection36_yard" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection36"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "tbl_inspection36_outbuildings" ADD CONSTRAINT "FK_tbl_inspection36_outbuildings" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection36"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "tbl_inspection36_mainlevel" ADD CONSTRAINT "FK_tbl_inspection36_mainlevel" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection36"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "tbl_inspection36_upperlevel" ADD CONSTRAINT "FK_tbl_inspection36_upperlevel" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection36"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "tbl_inspection36_belowgrade" ADD CONSTRAINT "FK_tbl_inspection36_belowgrade" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection36"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "tbl_inspection36_adu" ADD CONSTRAINT "FK_tbl_inspection36_adu" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection36"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "tbl_inspection36_final" ADD CONSTRAINT "FK_tbl_inspection36_final" FOREIGN KEY ("inspection_id") REFERENCES "tbl_inspection36"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "tbl_inspection36_final";
            DROP TABLE "tbl_inspection36_adu";
            DROP TABLE "tbl_inspection36_belowgrade";
            DROP TABLE "tbl_inspection36_upperlevel";
            DROP TABLE "tbl_inspection36_mainlevel";
            DROP TABLE "tbl_inspection36_outbuildings";
            DROP TABLE "tbl_inspection36_yard";
            DROP TABLE "tbl_inspection36_exterior";
            DROP TABLE "tbl_inspection36_curb";
            DROP TABLE "tbl_inspection36_arrive";
            DROP TABLE "tbl_inspection36";
        `);
    }

}

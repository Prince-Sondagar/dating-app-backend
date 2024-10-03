import { MigrationInterface, QueryRunner } from "typeorm";

export class createUserDiscoverySettingEntity1680501639677 implements MigrationInterface {
	name = "createUserDiscoverySettingEntity1680501639677";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "userDiscoverySetting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "location" geometry, "distance_pref" integer NOT NULL DEFAULT '80', "distancePrefShowOnlyThisRange" boolean NOT NULL DEFAULT false, "agePref" integer array NOT NULL DEFAULT '{18,35}', "agePrefShowOnlyThisRange" boolean NOT NULL DEFAULT false, "global" boolean NOT NULL DEFAULT false, "showMeOnApp" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), "userId" uuid, CONSTRAINT "REL_d1479e876eb87143a9699f5c3d" UNIQUE ("userId"), CONSTRAINT "CHK_205c4250c53ea48aecee3548ce" CHECK (distance_pref >= 2 AND distance_pref <= 160), CONSTRAINT "PK_4b2c4eade2f497dca11ba73638a" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD CONSTRAINT "FK_d1479e876eb87143a9699f5c3d9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP CONSTRAINT "FK_d1479e876eb87143a9699f5c3d9"`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`DROP TABLE "userDiscoverySetting"`);
	}
}

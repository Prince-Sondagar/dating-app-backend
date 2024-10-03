import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAdminLoginEntity1686722636113 implements MigrationInterface {
	name = "CreateAdminLoginEntity1686722636113";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "admin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying, "otp" integer, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), CONSTRAINT "UQ_686acf11eb89e98c4dcae3fe478" UNIQUE ("otp"), CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "userSpotifyAccountArtist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "artist" character varying NOT NULL, "image" character varying NOT NULL, "isSelected" character varying NOT NULL DEFAULT true, "metadata" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), "userId" uuid, CONSTRAINT "PK_7d534e6b1d8bf5b944130767bd2" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(
			`ALTER TABLE "userSpotifyAccountArtist" ADD CONSTRAINT "FK_9a361fb4d456cf986c496afd184" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "userSpotifyAccountArtist" DROP CONSTRAINT "FK_9a361fb4d456cf986c496afd184"`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`DROP TABLE "userSpotifyAccountArtist"`);
		await queryRunner.query(`DROP TABLE "admin"`);
	}
}

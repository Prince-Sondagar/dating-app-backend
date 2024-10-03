import { MigrationInterface, QueryRunner } from "typeorm";

export class updateTablesColumns1680246318080 implements MigrationInterface {
	name = "updateTablesColumns1680246318080";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users_language" DROP CONSTRAINT "FK_e8888195ff78e48248207336d5b"`);
		await queryRunner.query(`ALTER TABLE "users_language" DROP CONSTRAINT "FK_eb095688733d786af4e726cae47"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_e8888195ff78e48248207336d5"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_eb095688733d786af4e726cae4"`);
		await queryRunner.query(`ALTER TABLE "users_language" RENAME COLUMN "languagesId" TO "languageId"`);
		await queryRunner.query(
			`CREATE TYPE "public"."languagesEnum" AS ENUM('English', 'Afrikaans', 'Arabic', 'Azerbaijani', 'Bulgarian', 'Bangla', 'Bosnian', 'Catalan', 'Czech', 'Danish', 'German', 'Greek', 'English (Australia)', 'English (United Kingdom)', 'Spanish', 'Spanish (Argentina)', 'Spanish (Spain)', 'Estonian', 'Basque', 'Finnish', 'French', 'French (Canada)', 'Galician', 'Hebrew', 'Hindi', 'Croatian', 'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Georgian', 'Kazakh', 'Khmer', 'Korean', 'Lithuanian', 'Latvian', 'Macedonian', 'Malay', 'Norwegian Bokmål', 'Dutch', 'Polish', 'Portuguese', 'Portuguese (Portugal)', 'Romanian', 'Russian', 'Slovak', 'Slovenian', 'Serbian', 'Swedish', 'Tamil', 'Telugu', 'Thai', 'Filipino', 'Turkish', 'Ukrainian', 'Vietnamese', 'Simplified Chinese', 'Traditional Chinese')`,
		);
		await queryRunner.query(
			`CREATE TABLE "languages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "language" "public"."languagesEnum" NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), CONSTRAINT "UQ_e5f1bf70b71bfc21132630fbd1b" UNIQUE ("language"), CONSTRAINT "PK_b517f827ca496b29f4d549c631d" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(`ALTER TABLE "users" ADD "isValidEmail" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "users" ADD "profile_comp_per" integer NOT NULL DEFAULT '20'`);
		await queryRunner.query(`ALTER TABLE "users" ADD "isCompOnboarding" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "latLong"`);
		await queryRunner.query(`ALTER TABLE "users" ADD "latLong" double precision array NOT NULL DEFAULT '{}'`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(`CREATE INDEX "IDX_564b12da97034f696dbe80323a" ON "users_language" ("userId") `);
		await queryRunner.query(`CREATE INDEX "IDX_54934f614471ba39d107c8ffca" ON "users_language" ("languageId") `);
		await queryRunner.query(
			`ALTER TABLE "users" ADD CONSTRAINT "CHK_bb03af6f27134bcbbab1f5cfb4" CHECK (profile_comp_per >= 20 AND profile_comp_per <= 100)`,
		);
		await queryRunner.query(
			`ALTER TABLE "users_language" ADD CONSTRAINT "FK_564b12da97034f696dbe80323ac" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
		);
		await queryRunner.query(
			`ALTER TABLE "users_language" ADD CONSTRAINT "FK_54934f614471ba39d107c8ffcaf" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users_language" DROP CONSTRAINT "FK_54934f614471ba39d107c8ffcaf"`);
		await queryRunner.query(`ALTER TABLE "users_language" DROP CONSTRAINT "FK_564b12da97034f696dbe80323ac"`);
		await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_bb03af6f27134bcbbab1f5cfb4"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_54934f614471ba39d107c8ffca"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_564b12da97034f696dbe80323a"`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "latLong"`);
		await queryRunner.query(`ALTER TABLE "users" ADD "latLong" integer array NOT NULL DEFAULT '{}'`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isCompOnboarding"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_comp_per"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isValidEmail"`);
		await queryRunner.query(`DROP TABLE "languages"`);
		await queryRunner.query(`DROP TYPE "public"."languagesEnum"`);
		await queryRunner.query(`ALTER TABLE "users_language" RENAME COLUMN "languageId" TO "languagesId"`);
		await queryRunner.query(`CREATE INDEX "IDX_eb095688733d786af4e726cae4" ON "users_language" ("languagesId") `);
		await queryRunner.query(`CREATE INDEX "IDX_e8888195ff78e48248207336d5" ON "users_language" ("userId") `);
		await queryRunner.query(
			`ALTER TABLE "users_language" ADD CONSTRAINT "FK_eb095688733d786af4e726cae47" FOREIGN KEY ("languagesId") REFERENCES "language"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
		await queryRunner.query(
			`ALTER TABLE "users_language" ADD CONSTRAINT "FK_e8888195ff78e48248207336d5b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
		);
	}
}

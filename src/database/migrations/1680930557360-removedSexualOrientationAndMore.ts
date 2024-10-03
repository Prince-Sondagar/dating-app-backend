import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedSexualOrientationAndMore1680930557360 implements MigrationInterface {
	name = "RemovedSexualOrientationAndMore1680930557360";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "showMyOrientation"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(`ALTER TYPE "public"."users_gender_enum" RENAME TO "users_gender_enum_old"`);
		await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female')`);
		await queryRunner.query(
			`ALTER TABLE "users" ALTER COLUMN "gender" TYPE "public"."users_gender_enum" USING "gender"::"text"::"public"."users_gender_enum"`,
		);
		await queryRunner.query(`DROP TYPE "public"."users_gender_enum_old"`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(`DROP TABLE "user_sexualOrientations" CASCADE`);
		await queryRunner.query(`DROP TABLE "sexualOrientation" CASCADE`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE "sexualOrientation" ();`);
		await queryRunner.query(`CREATE TABLE "user_sexualOrientations" ();`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`CREATE TYPE "public"."users_gender_enum_old" AS ENUM('male', 'female', 'more')`);
		await queryRunner.query(
			`ALTER TABLE "users" ALTER COLUMN "gender" TYPE "public"."users_gender_enum_old" USING "gender"::"text"::"public"."users_gender_enum_old"`,
		);
		await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
		await queryRunner.query(`ALTER TYPE "public"."users_gender_enum_old" RENAME TO "users_gender_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`ALTER TABLE "users" ADD "showMyOrientation" boolean NOT NULL DEFAULT false`);
	}
}

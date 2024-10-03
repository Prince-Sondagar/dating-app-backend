import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteUserSubscriptionHistory1681896170078 implements MigrationInterface {
	name = "DeleteUserSubscriptionHistory1681896170078";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_15f9bd2bf472ff12b6ee20012d0"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(
			`ALTER TYPE "public"."subscriptions_type_enum_old" RENAME TO "subscriptions_type_enum_old_old"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."subscriptions_type_enum" AS ENUM('platinum', 'gold', 'plus', 'boost', 'superlike')`,
		);
		await queryRunner.query(
			`ALTER TABLE "subscriptions" ALTER COLUMN "type" TYPE "public"."subscriptions_type_enum" USING "type"::"text"::"public"."subscriptions_type_enum"`,
		);
		await queryRunner.query(`DROP TYPE "public"."subscriptions_type_enum_old_old"`);
		await queryRunner.query(
			`ALTER TABLE "messages" ADD CONSTRAINT "FK_15f9bd2bf472ff12b6ee20012d0" FOREIGN KEY ("threadId") REFERENCES "usersMessageThread"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(`DROP TABLE "usersSubscriptionHistory" CASCADE`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`CREATE TABLE "usersSubscriptionHistory" ();`);
		await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_15f9bd2bf472ff12b6ee20012d0"`);
		await queryRunner.query(
			`CREATE TYPE "public"."subscriptions_type_enum_old_old" AS ENUM('platinum', 'gold', 'plus', 'boost', 'superlike')`,
		);
		await queryRunner.query(
			`ALTER TABLE "subscriptions" ALTER COLUMN "type" TYPE "public"."subscriptions_type_enum_old_old" USING "type"::"text"::"public"."subscriptions_type_enum_old_old"`,
		);
		await queryRunner.query(`DROP TYPE "public"."subscriptions_type_enum"`);
		await queryRunner.query(
			`ALTER TYPE "public"."subscriptions_type_enum_old_old" RENAME TO "subscriptions_type_enum_old"`,
		);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(
			`ALTER TABLE "messages" ADD CONSTRAINT "FK_15f9bd2bf472ff12b6ee20012d0" FOREIGN KEY ("threadId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMessageModule1681735410804 implements MigrationInterface {
	name = "CreateMessageModule1681735410804";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."usersMessageThread_reason_enum" AS ENUM('match', 'superlike', 'direct')`,
		);
		await queryRunner.query(
			`CREATE TABLE "usersMessageThread" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" "public"."usersMessageThread_reason_enum" NOT NULL DEFAULT 'match', "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), "userSenderId" uuid, "userReceiverId" uuid, CONSTRAINT "PK_356ec719148521219134932b1d6" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."messages_type_enum" AS ENUM('string', 'gif', 'sticker', 'image', 'video')`,
		);
		await queryRunner.query(
			`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" character varying NOT NULL, "type" "public"."messages_type_enum" NOT NULL DEFAULT 'string', "isLiked" TIMESTAMP, "isSeen" TIMESTAMP, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), "threadId" uuid, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(`ALTER TYPE "public"."subscriptions_type_enum" RENAME TO "subscriptions_type_enum_old"`);
		await queryRunner.query(
			`CREATE TYPE "public"."usersSubscriptionHistory_subscriptiontype_enum" AS ENUM('platinum', 'gold', 'plus')`,
		);
		await queryRunner.query(
			`ALTER TABLE "usersSubscriptionHistory" ALTER COLUMN "subscriptionType" TYPE "public"."usersSubscriptionHistory_subscriptiontype_enum" USING "subscriptionType"::"text"::"public"."usersSubscriptionHistory_subscriptiontype_enum"`,
		);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(
			`ALTER TABLE "usersMessageThread" ADD CONSTRAINT "FK_1e12f207a15fd66fd9f76e11cb5" FOREIGN KEY ("userSenderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "usersMessageThread" ADD CONSTRAINT "FK_19f2b1be9d1e38e3b56886ba408" FOREIGN KEY ("userReceiverId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" ADD CONSTRAINT "FK_15f9bd2bf472ff12b6ee20012d0" FOREIGN KEY ("threadId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_15f9bd2bf472ff12b6ee20012d0"`);
		await queryRunner.query(`ALTER TABLE "usersMessageThread" DROP CONSTRAINT "FK_19f2b1be9d1e38e3b56886ba408"`);
		await queryRunner.query(`ALTER TABLE "usersMessageThread" DROP CONSTRAINT "FK_1e12f207a15fd66fd9f76e11cb5"`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`DROP TYPE "public"."subscriptions_type_enum_old"`);
		await queryRunner.query(`CREATE TYPE "public"."subscriptions_type_enum_old" AS ENUM('platinum', 'gold', 'plus')`);
		await queryRunner.query(
			`ALTER TABLE "usersSubscriptionHistory" ALTER COLUMN "subscriptionType" TYPE "public"."subscriptions_type_enum_old" USING "subscriptionType"::"text"::"public"."subscriptions_type_enum_old"`,
		);
		await queryRunner.query(`DROP TYPE "public"."usersSubscriptionHistory_subscriptiontype_enum"`);
		await queryRunner.query(`ALTER TYPE "public"."subscriptions_type_enum_old" RENAME TO "subscriptions_type_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`DROP TABLE "messages"`);
		await queryRunner.query(`DROP TYPE "public"."messages_type_enum"`);
		await queryRunner.query(`DROP TABLE "usersMessageThread"`);
		await queryRunner.query(`DROP TYPE "public"."usersMessageThread_reason_enum"`);
	}
}

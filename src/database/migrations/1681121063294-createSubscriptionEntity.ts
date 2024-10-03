import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscriptionEntity1681121063294 implements MigrationInterface {
	name = "CreateSubscriptionEntity1681121063294";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."subscriptions_type_enum" AS ENUM('platinum', 'gold', 'plus', 'boost', 'superlike')`,
		);
		await queryRunner.query(
			`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."subscriptions_type_enum" NOT NULL, "month" integer NOT NULL, "currency" character varying NOT NULL DEFAULT '$', "amount" double precision NOT NULL, "stripeProductId" character varying NOT NULL, "stripePriceId" character varying NOT NULL, "isUnlimitedLikes" boolean NOT NULL DEFAULT false, "seeWhoLikesYou" boolean NOT NULL DEFAULT false, "priorityLikes" boolean NOT NULL DEFAULT false, "UnlimitedRewinds" boolean NOT NULL DEFAULT false, "free1BoostPerMonth" boolean NOT NULL DEFAULT false, "free5SuperLikesPerWeek" boolean NOT NULL DEFAULT false, "messageBeforeMatching" boolean NOT NULL DEFAULT false, "passport" boolean NOT NULL DEFAULT false, "controlYourProfile" boolean NOT NULL DEFAULT false, "controlWhoSeesYou" boolean NOT NULL DEFAULT false, "controlWhoYouSee" boolean NOT NULL DEFAULT false, "HideAds" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`ALTER TABLE "subscriptions" ADD CONSTRAINT "UQ_3ab784ac47bd41ae39d901b1c02" UNIQUE ("stripePriceId")`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."usersSubscriptionHistory_subscriptionstatus_enum" AS ENUM('canceled', 'active', 'failed')`,
		);
		await queryRunner.query(
			`CREATE TABLE "usersSubscriptionHistory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subscriptionType" "public"."subscriptions_type_enum" NOT NULL, "subscriptionStatus" "public"."usersSubscriptionHistory_subscriptionstatus_enum" NOT NULL, "stripeSubscriptionId" character varying NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), "userId" uuid, "subscriptionId" uuid, CONSTRAINT "PK_dc92f435cecfb39e5d88f31f517" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(`ALTER TABLE "users" ADD "school" character varying NOT NULL DEFAULT ''`);
		await queryRunner.query(`ALTER TABLE "users" ADD "job" character varying NOT NULL DEFAULT ''`);
		await queryRunner.query(`ALTER TABLE "users" ADD "stripeUserId" character varying NOT NULL DEFAULT ''`);
		await queryRunner.query(`ALTER TABLE "users" ADD "subscriptionId" character varying NOT NULL DEFAULT ''`);
		await queryRunner.query(`ALTER TABLE "users" ADD "stripeSubscriptionId" character varying NOT NULL DEFAULT ''`);
		await queryRunner.query(`ALTER TABLE "users" ADD "boosts" integer NOT NULL DEFAULT '0'`);
		await queryRunner.query(`ALTER TABLE "users" ADD "superLikes" integer NOT NULL DEFAULT '0'`);
		await queryRunner.query(`ALTER TABLE "users" ADD "darkModeDeviceSetting" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "users" ADD "darkMode" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(
			`ALTER TABLE "usersSubscriptionHistory" ADD CONSTRAINT "FK_202e483e7985824ed26be214464" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "usersSubscriptionHistory" ADD CONSTRAINT "FK_a6202fd26423857663b8dc435c8" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "usersSubscriptionHistory" DROP CONSTRAINT "FK_a6202fd26423857663b8dc435c8"`);
		await queryRunner.query(`ALTER TABLE "usersSubscriptionHistory" DROP CONSTRAINT "FK_202e483e7985824ed26be214464"`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "darkMode"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "darkModeDeviceSetting"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "superLikes"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "boosts"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "stripeSubscriptionId"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "subscriptionId"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "stripeUserId"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "job"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "school"`);
		await queryRunner.query(`DROP TABLE "usersSubscriptionHistory"`);
		await queryRunner.query(`DROP TYPE "public"."usersSubscriptionHistory_subscriptiontype_enum"`);
		await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "UQ_3ab784ac47bd41ae39d901b1c02"`);
		await queryRunner.query(`DROP TABLE "subscriptions"`);
		await queryRunner.query(`DROP TYPE "public"."subscriptions_type_enum"`);
	}
}

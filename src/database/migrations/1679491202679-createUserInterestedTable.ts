import { MigrationInterface, QueryRunner } from "typeorm";

export class createUsersInterestedTable1679491202679 implements MigrationInterface {
	name = "createUsersInterestedTable1679491202679";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "blocked_user" DROP CONSTRAINT "FK_964577e85c8ec46bf9cc6e57f52"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_964577e85c8ec46bf9cc6e57f5"`);
		await queryRunner.query(`ALTER TABLE "blocked_user" RENAME COLUMN "blockedUsers" TO "blockedUserId"`);
		await queryRunner.query(
			`ALTER TABLE "blocked_user" RENAME CONSTRAINT "PK_ce8f6a99a71c0b327dfab7c4394" TO "PK_a6c6f5535ef9d2c15b742da6e54"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userInterestProfile_status_enum" AS ENUM('liked', 'rejected', 'superliked')`,
		);
		await queryRunner.query(
			`CREATE TABLE "userInterestProfile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."userInterestProfile_status_enum" NOT NULL, "userId" uuid, "interestedUserId" uuid,  "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), CONSTRAINT "PK_a24646f78c168eab329b1f3d17c" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE UNIQUE INDEX "IDX_bb0eeff30a26cee099dd60bc1b" ON "userInterestProfile" ("userId", "interestedUserId") `,
		);
		await queryRunner.query(`ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "users" ADD "lastActive" timestamp`);
		await queryRunner.query(`CREATE INDEX "IDX_59bb7b96bfedcdc96f346dbf8c" ON "blocked_user" ("blockedUserId") `);
		await queryRunner.query(
			`ALTER TABLE "userInterestProfile" ADD CONSTRAINT "FK_da4b6a661d42d1186fb4795d474" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "userInterestProfile" ADD CONSTRAINT "FK_21167b2ed9b334c974e73654ed2" FOREIGN KEY ("interestedUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "blocked_user" ADD CONSTRAINT "FK_59bb7b96bfedcdc96f346dbf8c9" FOREIGN KEY ("blockedUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "blocked_user" DROP CONSTRAINT "FK_59bb7b96bfedcdc96f346dbf8c9"`);
		await queryRunner.query(`ALTER TABLE "userInterestProfile" DROP CONSTRAINT "FK_21167b2ed9b334c974e73654ed2"`);
		await queryRunner.query(`ALTER TABLE "userInterestProfile" DROP CONSTRAINT "FK_da4b6a661d42d1186fb4795d474"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_59bb7b96bfedcdc96f346dbf8c"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastActive"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_bb0eeff30a26cee099dd60bc1b"`);
		await queryRunner.query(`DROP TABLE "userInterestProfile"`);
		await queryRunner.query(`DROP TYPE "public"."userInterestProfile_status_enum"`);
		await queryRunner.query(
			`ALTER TABLE "blocked_user" RENAME CONSTRAINT "PK_a6c6f5535ef9d2c15b742da6e54" TO "PK_ce8f6a99a71c0b327dfab7c4394"`,
		);
		await queryRunner.query(`ALTER TABLE "blocked_user" RENAME COLUMN "blockedUserId" TO "blockedUsers"`);
		await queryRunner.query(`CREATE INDEX "IDX_964577e85c8ec46bf9cc6e57f5" ON "blocked_user" ("blockedUsers") `);
		await queryRunner.query(
			`ALTER TABLE "blocked_user" ADD CONSTRAINT "FK_964577e85c8ec46bf9cc6e57f52" FOREIGN KEY ("blockedUsers") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
	}
}

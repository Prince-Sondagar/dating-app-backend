import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMessageEntityRelation1682074682676 implements MigrationInterface {
	name = "UpdateMessageEntityRelation1682074682676";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "usersMessageThread" DROP CONSTRAINT "FK_1e12f207a15fd66fd9f76e11cb5"`);
		await queryRunner.query(`ALTER TABLE "usersMessageThread" DROP CONSTRAINT "FK_19f2b1be9d1e38e3b56886ba408"`);
		await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_15f9bd2bf472ff12b6ee20012d0"`);
		await queryRunner.query(`ALTER TABLE "usersMessageThread" ADD "isNewMatch" boolean NOT NULL DEFAULT true`);
		await queryRunner.query(`ALTER TABLE "messages" ADD "fromUserId" uuid`);
		await queryRunner.query(`ALTER TABLE "messages" ADD "toUserId" uuid`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(
			`ALTER TABLE "usersMessageThread" ADD CONSTRAINT "FK_1e12f207a15fd66fd9f76e11cb5" FOREIGN KEY ("userSenderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "usersMessageThread" ADD CONSTRAINT "FK_19f2b1be9d1e38e3b56886ba408" FOREIGN KEY ("userReceiverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" ADD CONSTRAINT "FK_15f9bd2bf472ff12b6ee20012d0" FOREIGN KEY ("threadId") REFERENCES "usersMessageThread"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" ADD CONSTRAINT "FK_3096fc70fe5dcc8d516972f17ba" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "messages" ADD CONSTRAINT "FK_eb73515d4226282d9b6d2206ab4" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_eb73515d4226282d9b6d2206ab4"`);
		await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_3096fc70fe5dcc8d516972f17ba"`);
		await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_15f9bd2bf472ff12b6ee20012d0"`);
		await queryRunner.query(`ALTER TABLE "usersMessageThread" DROP CONSTRAINT "FK_19f2b1be9d1e38e3b56886ba408"`);
		await queryRunner.query(`ALTER TABLE "usersMessageThread" DROP CONSTRAINT "FK_1e12f207a15fd66fd9f76e11cb5"`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "toUserId"`);
		await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "fromUserId"`);
		await queryRunner.query(`ALTER TABLE "usersMessageThread" DROP COLUMN "isNewMatch"`);
		await queryRunner.query(
			`ALTER TABLE "messages" ADD CONSTRAINT "FK_15f9bd2bf472ff12b6ee20012d0" FOREIGN KEY ("threadId") REFERENCES "usersMessageThread"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "usersMessageThread" ADD CONSTRAINT "FK_19f2b1be9d1e38e3b56886ba408" FOREIGN KEY ("userReceiverId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "usersMessageThread" ADD CONSTRAINT "FK_1e12f207a15fd66fd9f76e11cb5" FOREIGN KEY ("userSenderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
	}
}

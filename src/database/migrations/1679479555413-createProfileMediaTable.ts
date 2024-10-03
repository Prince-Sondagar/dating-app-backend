import { MigrationInterface, QueryRunner } from "typeorm";

export class createProfileMediaTable1679479555413 implements MigrationInterface {
    name = 'createProfileMediaTable1679479555413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blocked_user" DROP CONSTRAINT "FK_021a210d1aa5c0059925f9b1ae4"`);
        await queryRunner.query(`ALTER TABLE "blocked_user" DROP CONSTRAINT "FK_34b0f8ccbc2ed33b63269c501a5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_34b0f8ccbc2ed33b63269c501a"`);
        await queryRunner.query(`ALTER TABLE "blocked_user" RENAME COLUMN "blockedusers" TO "blockedUsers"`);
        await queryRunner.query(`ALTER TABLE "blocked_user" RENAME CONSTRAINT "PK_cf1efb0f9e87c8a313a31c48504" TO "PK_ce8f6a99a71c0b327dfab7c4394"`);
        await queryRunner.query(`CREATE TABLE "profileMedia" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), "userId" uuid, CONSTRAINT "PK_562083ec0b7bb16b6113700f063" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_964577e85c8ec46bf9cc6e57f5" ON "blocked_user" ("blockedUsers") `);
        await queryRunner.query(`ALTER TABLE "profileMedia" ADD CONSTRAINT "FK_427f79dd5439a0a43a0c20977df" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "blocked_user" ADD CONSTRAINT "FK_021a210d1aa5c0059925f9b1ae4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "blocked_user" ADD CONSTRAINT "FK_964577e85c8ec46bf9cc6e57f52" FOREIGN KEY ("blockedUsers") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blocked_user" DROP CONSTRAINT "FK_964577e85c8ec46bf9cc6e57f52"`);
        await queryRunner.query(`ALTER TABLE "blocked_user" DROP CONSTRAINT "FK_021a210d1aa5c0059925f9b1ae4"`);
        await queryRunner.query(`ALTER TABLE "profileMedia" DROP CONSTRAINT "FK_427f79dd5439a0a43a0c20977df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_964577e85c8ec46bf9cc6e57f5"`);
        await queryRunner.query(`DROP TABLE "profileMedia"`);
        await queryRunner.query(`ALTER TABLE "blocked_user" RENAME CONSTRAINT "PK_ce8f6a99a71c0b327dfab7c4394" TO "PK_cf1efb0f9e87c8a313a31c48504"`);
        await queryRunner.query(`ALTER TABLE "blocked_user" RENAME COLUMN "blockedUsers" TO "blockedusers"`);
        await queryRunner.query(`CREATE INDEX "IDX_34b0f8ccbc2ed33b63269c501a" ON "blocked_user" ("blockedusers") `);
        await queryRunner.query(`ALTER TABLE "blocked_user" ADD CONSTRAINT "FK_34b0f8ccbc2ed33b63269c501a5" FOREIGN KEY ("blockedusers") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "blocked_user" ADD CONSTRAINT "FK_021a210d1aa5c0059925f9b1ae4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}

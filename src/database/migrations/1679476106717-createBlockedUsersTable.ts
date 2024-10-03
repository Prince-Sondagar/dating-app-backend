import { MigrationInterface, QueryRunner } from "typeorm";

export class createBlockedUsersTable1679476106717 implements MigrationInterface {
    name = 'createBlockedUsersTable1679476106717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "blocked_user" ("userId" uuid NOT NULL, "blockedusers" uuid NOT NULL, CONSTRAINT "PK_cf1efb0f9e87c8a313a31c48504" PRIMARY KEY ("userId", "blockedusers"))`);
        await queryRunner.query(`CREATE INDEX "IDX_021a210d1aa5c0059925f9b1ae" ON "blocked_user" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_34b0f8ccbc2ed33b63269c501a" ON "blocked_user" ("blockedusers") `);
        await queryRunner.query(`ALTER TABLE "blocked_user" ADD CONSTRAINT "FK_021a210d1aa5c0059925f9b1ae4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "blocked_user" ADD CONSTRAINT "FK_34b0f8ccbc2ed33b63269c501a5" FOREIGN KEY ("blockedusers") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blocked_user" DROP CONSTRAINT "FK_34b0f8ccbc2ed33b63269c501a5"`);
        await queryRunner.query(`ALTER TABLE "blocked_user" DROP CONSTRAINT "FK_021a210d1aa5c0059925f9b1ae4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_34b0f8ccbc2ed33b63269c501a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_021a210d1aa5c0059925f9b1ae"`);
        await queryRunner.query(`DROP TABLE "blocked_user"`);
    }

}

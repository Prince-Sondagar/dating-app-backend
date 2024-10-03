import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSuperPassionsEntity1686289139645 implements MigrationInterface {
	name = "CreateSuperPassionsEntity1686289139645";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TABLE "superPassions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "superPassion" character varying NOT NULL, "type" character varying NOT NULL, "image" character varying NOT NULL, "description" character varying NOT NULL, "isDisplay" boolean DEFAULT false, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), CONSTRAINT "PK_6e934409d460881080d9c294ded" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(`CREATE TYPE "public"."userConnectedAccount_type_enum" AS ENUM('instagram', 'spotify')`);
		await queryRunner.query(
			`CREATE TABLE "userConnectedAccount" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."userConnectedAccount_type_enum" NOT NULL, "tokens" jsonb NOT NULL DEFAULT '{}', "metadata" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), "userId" uuid, CONSTRAINT "PK_6d32b4355e94e5fd55af8015244" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "groupByPassions" ("superPassionId" uuid NOT NULL, "subPassionId" uuid NOT NULL, CONSTRAINT "PK_d3a02ffcd825c7f15dd4ab571bb" PRIMARY KEY ("superPassionId", "subPassionId"))`,
		);
		await queryRunner.query(`CREATE INDEX "IDX_5b2ac0ec5f0b81b9b9bf3a3609" ON "groupByPassions" ("superPassionId") `);
		await queryRunner.query(`CREATE INDEX "IDX_7089cc49bbdb15421750a11250" ON "groupByPassions" ("subPassionId") `);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(
			`ALTER TABLE "userConnectedAccount" ADD CONSTRAINT "FK_1b321da6f32495d352c30d41cd2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
		await queryRunner.query(
			`ALTER TABLE "groupByPassions" ADD CONSTRAINT "FK_5b2ac0ec5f0b81b9b9bf3a36098" FOREIGN KEY ("superPassionId") REFERENCES "superPassions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
		await queryRunner.query(
			`ALTER TABLE "groupByPassions" ADD CONSTRAINT "FK_7089cc49bbdb15421750a112500" FOREIGN KEY ("subPassionId") REFERENCES "passions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "groupByPassions" DROP CONSTRAINT "FK_7089cc49bbdb15421750a112500"`);
		await queryRunner.query(`ALTER TABLE "groupByPassions" DROP CONSTRAINT "FK_5b2ac0ec5f0b81b9b9bf3a36098"`);
		await queryRunner.query(`ALTER TABLE "userConnectedAccount" DROP CONSTRAINT "FK_1b321da6f32495d352c30d41cd2"`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`DROP INDEX "public"."IDX_7089cc49bbdb15421750a11250"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_5b2ac0ec5f0b81b9b9bf3a3609"`);
		await queryRunner.query(`DROP TABLE "groupByPassions"`);
		await queryRunner.query(`DROP TABLE "userConnectedAccount"`);
		await queryRunner.query(`DROP TYPE "public"."userConnectedAccount_type_enum"`);
		await queryRunner.query(`DROP TABLE "superPassions"`);
	}
}

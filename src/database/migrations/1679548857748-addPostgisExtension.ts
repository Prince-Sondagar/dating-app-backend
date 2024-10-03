import { MigrationInterface, QueryRunner } from "typeorm";

export class addPostgisExtension1620350085765 implements MigrationInterface {
	name = "addPostgisExtension1620350085765";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("CREATE EXTENSION IF NOT EXISTS postgis;");
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query("DROP EXTENSION IF EXISTS postgis;");
	}
}

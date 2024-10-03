import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedLocationField1683875112568 implements MigrationInterface {
    name = 'AddedLocationField1683875112568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "balancedRecommendations" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "standard" SET DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "standard" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "balancedRecommendations" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
    }

}
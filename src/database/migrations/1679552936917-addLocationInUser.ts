import { MigrationInterface, QueryRunner } from "typeorm";

export class addLocationInUser1679552936917 implements MigrationInterface {
    name = 'addLocationInUser1679552936917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "location" geometry`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "location"`);
    }

}

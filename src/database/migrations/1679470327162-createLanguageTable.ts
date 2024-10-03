import { MigrationInterface, QueryRunner } from "typeorm";

export class createUserLanguageTable1679470327162 implements MigrationInterface {
    name = 'createUserLanguageTable1679470327162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."languageEnum" AS ENUM('English', 'Afrikaans', 'Arabic', 'Azerbaijani', 'Bulgarian', 'Bangla', 'Bosnian', 'Catalan', 'Czech', 'Danish', 'German', 'Greek', 'English (Australia)', 'English (United Kingdom)', 'Spanish', 'Spanish (Argentina)', 'Spanish (Spain)', 'Estonian', 'Basque', 'Finnish', 'French', 'French (Canada)', 'Galician', 'Hebrew', 'Hindi', 'Croatian', 'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Georgian', 'Kazakh', 'Khmer', 'Korean', 'Lithuanian', 'Latvian', 'Macedonian', 'Malay', 'Norwegian Bokmål', 'Dutch', 'Polish', 'Portuguese', 'Portuguese (Portugal)', 'Romanian', 'Russian', 'Slovak', 'Slovenian', 'Serbian', 'Swedish', 'Tamil', 'Telugu', 'Thai', 'Filipino', 'Turkish', 'Ukrainian', 'Vietnamese', 'Simplified Chinese', 'Traditional Chinese')`);
        await queryRunner.query(`CREATE TABLE "language" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "language" "public"."languageEnum" NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), CONSTRAINT "UQ_965be5bcc7bff8bb16bc386ab90" UNIQUE ("language"), CONSTRAINT "PK_3a05a2cc6644afc942edb9b20d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_language" ("userId" uuid NOT NULL, "languagesId" uuid NOT NULL, CONSTRAINT "PK_3acedffaff6a66de9977a6a5963" PRIMARY KEY ("userId", "languagesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e8888195ff78e48248207336d5" ON "users_language" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_eb095688733d786af4e726cae4" ON "users_language" ("languagesId") `);
        await queryRunner.query(`ALTER TABLE "users_language" ADD CONSTRAINT "FK_e8888195ff78e48248207336d5b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_language" ADD CONSTRAINT "FK_eb095688733d786af4e726cae47" FOREIGN KEY ("languagesId") REFERENCES "language"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_language" DROP CONSTRAINT "FK_eb095688733d786af4e726cae47"`);
        await queryRunner.query(`ALTER TABLE "users_language" DROP CONSTRAINT "FK_e8888195ff78e48248207336d5b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eb095688733d786af4e726cae4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e8888195ff78e48248207336d5"`);
        await queryRunner.query(`DROP TABLE "users_language"`);
        await queryRunner.query(`DROP TABLE "language"`);
        await queryRunner.query(`DROP TYPE "public"."languageEnum"`);
    }
}

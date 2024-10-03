import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserDiscoverySettingEntity1684314308549 implements MigrationInterface {
	name = "UpdateUserDiscoverySettingEntity1684314308549";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_zodiacsign_enum" AS ENUM('Capricorn', 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "zodiacSign" "public"."userDiscoverySetting_zodiacsign_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_educationlevel_enum" AS ENUM('Bachelors', 'In College', 'High School', 'PhD', 'In Grad School', 'Masters', 'Trade School')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "educationLevel" "public"."userDiscoverySetting_educationlevel_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_childrens_enum" AS ENUM('I want children', 'I don''t want children', 'I have children and want more', 'I have children and don''t want more', 'Not sure yet')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "childrens" "public"."userDiscoverySetting_childrens_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_vaccinated_enum" AS ENUM('Vaccinated', 'Unvaccinated', 'Prefer not to say')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "vaccinated" "public"."userDiscoverySetting_vaccinated_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_personalitytype_enum" AS ENUM('INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "personalityType" "public"."userDiscoverySetting_personalitytype_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_communicationstyle_enum" AS ENUM('I stay on WhatsApp all day', 'Big time texter', 'Phone caller', 'Video chatter', 'I''m slow to answer on WhatsApp', 'Bad texter', 'Better in person')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "communicationStyle" "public"."userDiscoverySetting_communicationstyle_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_receivelove_enum" AS ENUM('Thoughtful gestures', 'Presents', 'Touch', 'Compliments', 'Time together')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "receiveLove" "public"."userDiscoverySetting_receivelove_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_pets_enum" AS ENUM('Dog', 'Cat', 'Reptile', 'Amphibian', 'Bird', 'Fish', 'Don''t have but love', 'Other', 'Turtle', 'Hamster', 'Rabbit', 'Pet-free', 'All the pets', 'Want a pet', 'Allergic to pets')`,
		);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ADD "pets" "public"."userDiscoverySetting_pets_enum"`);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_drinking_enum" AS ENUM('Not for me', 'Sober', 'Sober curious', 'On special occasions', 'Socially on weekends', 'Most Nights')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "drinking" "public"."userDiscoverySetting_drinking_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_smoking_enum" AS ENUM('Social smoker', 'Smoker when drinking', 'Non-smoker', 'Smoker', 'Trying to quit')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "smoking" "public"."userDiscoverySetting_smoking_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_workout_enum" AS ENUM('Everyday', 'Often', 'Sometimes', 'Never')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "workout" "public"."userDiscoverySetting_workout_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_dietarypreference_enum" AS ENUM('Vegan', 'Vegetarian', 'Pescatarian', 'Kosher', 'Halal', 'Carnivore', 'Omnivore', 'Other')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "dietaryPreference" "public"."userDiscoverySetting_dietarypreference_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_socialmedia_enum" AS ENUM('Influencer status', 'Socially active', 'Off the grid', 'Passive scroller')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "socialMedia" "public"."userDiscoverySetting_socialmedia_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_sleepinghabits_enum" AS ENUM('Early bird', 'Night owl', 'In a spectrum')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "sleepingHabits" "public"."userDiscoverySetting_sleepinghabits_enum"`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."userDiscoverySetting_relationshiptype_enum" AS ENUM('Monogamy', 'Ethical non-monogamy', 'Polyamory', 'Open to exploring')`,
		);
		await queryRunner.query(
			`ALTER TABLE "userDiscoverySetting" ADD "relationShipType" "public"."userDiscoverySetting_relationshiptype_enum" array NOT NULL DEFAULT '{}'`,
		);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry`);
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" ALTER COLUMN "location" TYPE geometry(GEOMETRY,0)`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "relationShipType"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_relationshiptype_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "sleepingHabits"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_sleepinghabits_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "socialMedia"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_socialmedia_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "dietaryPreference"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_dietarypreference_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "workout"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_workout_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "smoking"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_smoking_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "drinking"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_drinking_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "pets"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_pets_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "receiveLove"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_receivelove_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "communicationStyle"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_communicationstyle_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "personalityType"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_personalitytype_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "vaccinated"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_vaccinated_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "childrens"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_childrens_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "educationLevel"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_educationlevel_enum"`);
		await queryRunner.query(`ALTER TABLE "userDiscoverySetting" DROP COLUMN "zodiacSign"`);
		await queryRunner.query(`DROP TYPE "public"."userDiscoverySetting_zodiacsign_enum"`);
	}
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class createUserTable1679400057954 implements MigrationInterface {
	name = "createUserTable1679400057954";

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(
			`CREATE TYPE "public"."passionsEnum" AS ENUM('90s Kid', 'Harry Potter', 'SoundCloud', 'Spa', 'Self Care', 'Heavy Metal', 'House Parties', 'Gin tonic', 'Gymnastics', 'Ludo', 'Maggi', 'Hot Yoga', 'Biryani', 'Meditation', 'Sushi', 'Spotify', 'Hockey', 'Basketball', 'Slam Poetry', 'Home Workout', 'Theater', 'Cafe hopping', 'Sneakers', 'Aquarium', 'Instagram', 'Hot Springs', 'Walking', 'Running', 'Travel', 'Language Exchange', 'Movies', 'Guitarists', 'Social Development', 'Gym', 'Social Media', 'Hip Hop', 'Skincare', 'J-Pop', 'Cricket', 'Shisha', 'Freelance', 'K-Pop', 'Skateboarding', 'Gospel', 'Potterhead', 'Trying New Things', 'Photography', 'Bollywood', 'Bhangra', 'Reading', 'Singing', 'Sports', 'Poetry', 'Stand up Comedy', 'Coffee', 'Karaoke', 'Fortnite', 'Free Diving', 'Self Development', 'Mental Health Awareness', 'Foodie Tour', 'Voter Rights', 'Jiu-jitsu', 'Climate Change', 'Exhibition', 'Walking My Dog', 'ghts', 'Feminism', 'VR Room', 'Escape Cafe', 'Shopping', 'Brunch', 'Investment', 'Jetski', 'Reggaeton', 'Second-hand apparel', 'Black Lives Matter', 'Jogging', 'Road Trips', 'Vintage fashion', 'Voguing', 'Couchsurfing', 'Happy hour', 'Inclusivity', 'Country Music', 'Football', 'Inline Skate', 'Investing', 'Tennis', 'Ice Cream', 'Ice Skating', 'Human Rights', 'Expositions', 'Pig Roast', 'Skiing', 'Canoeing', 'West End Musicals', 'Snowboarding', 'Pilates', 'Pentathlon', 'Broadway', 'PlayStation', 'Cheerleading', 'Choir', 'Pole Dancing', 'Five-a-side Football', 'Car Racing', 'Pinterest', 'Festivals', 'Pub Quiz', 'Catan', 'Cosplay', 'Motor Sports', 'Coffee Stall', 'Content Creation', 'E-Sports', 'Bicycle Racing', 'Binge-Watching TV shows', 'Songwriter', 'Bodycombat', 'Tattoos', 'Painting', 'Bodyjam', 'Paddle Boarding', 'Padel', 'Blackpink', 'Surfing', 'Bowling', 'Grime', '90s Britpop', 'Bodypump', 'Beach Bars', 'Bodystep', 'Paragliding', 'Upcycling', 'Equality', 'Astrology', 'Motorcycles', 'Equestrian', 'Entrepreneurship', 'Sake', 'BTS', 'Cooking', 'Environmental Protection', 'Fencing', 'Soccer', 'Saxophonist', 'Sci-Fi', 'Dancing', 'Film Festival', 'Freeletics', 'Gardening', 'Amateur Cook', 'Exchange Program', 'Sauna', 'Art', 'Politics', 'Flamenco', 'Museum', 'Activism', 'DAOs', 'Real Estate', 'Podcasts', 'Disability Rights', 'Rave', 'Pimms', 'Drive Thru Cinema', 'Rock Climbing', 'BBQ', 'Craft Beer', 'Iced Tea', 'Drummer', 'Tea', 'Board Games', 'Roblox', 'Pubs', 'Rock', 'Tango', 'Drawing', 'Trivia', 'Pho', 'Volunteering', 'Environmentalism', 'Rollerskating', 'Wine', 'Dungeons & Dragons', 'Vlogging', 'Electronic Music', 'Ramen', 'Weightlifting', 'Live Music', 'Writing', 'Xbox', 'World Peace', 'Wrestling', 'Literature', 'Manga', 'Pride', 'Marathon', 'Makeup', 'Youth Empowerment', 'YouTube', 'Martial Arts', 'Marvel', 'Vegan Cooking', 'Vermut', 'Korean Food', 'Twitter', 'Volleyball', 'Walking Tour', 'Vinyasa', 'Virtual Reality', 'League of Legends', 'NFTs', 'Bar Hopping', 'Nintendo', 'Baseball', 'Parties', 'Ballet', 'Band', 'Online Games', 'Battle Ground', 'Beach Tennis', 'Nightlife', 'Online Shopping', 'Sailing', 'Olympic Gymnastics', 'Bassist', 'Online Broker', 'Military', 'Memes', 'Among Us', 'Motorbike Racing', 'Motorcycling', 'Metaverse', 'Mindfulness', 'Acapella', 'Musical Instrument', 'Art Galleries', 'Musical Writing', 'Hiking', 'Artistic Gymnastics', 'Mountains', 'Archery', 'Atari', 'Backpacking', 'Fishing', 'Clubbing', 'Street Food', 'Crossfit', 'Concerts', 'Climbing', 'Baking', 'Camping', 'Blogging', 'Collecting', 'Cars', 'Start ups', 'Boba tea', 'High School Sports', 'Badminton', 'Active Lifestyle', 'Fashion', 'Anime', 'NBA', 'MLB', 'Funk music', 'Caipirinha', 'Indoor Activities', 'Tempeh', 'DIY', 'Town Festivities', 'Cycling', 'Outdoors', 'TikTok', 'Picnicking', 'Twitch', 'Comedy', 'Trap Music', 'Music', 'Triathlon', 'Netflix', 'Disney', 'Rugby', 'Açaí', 'Samba', 'Tarot', 'Stock Exchange', 'Stocks', 'Swimming', 'Table Tennis', 'Killing time', 'Working out', 'Yoga', 'Horror Movies', 'Boxing', 'Bar Chilling')`,
		);
		await queryRunner.query(
			`CREATE TABLE "passions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "passion" "public"."passionsEnum" NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), CONSTRAINT "UQ_d65aaf77554c6995489b949d355" UNIQUE ("passion"), CONSTRAINT "PK_134e8bb1c94c045f9a983544056" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."sexualOrientationsEnum" AS ENUM('Straight', 'Gay', 'Lesbian', 'Bisexual', 'Asexual', 'Demisexual', 'Pansexual', 'Queer', 'Bicurious', 'Aromantic')`,
		);
		await queryRunner.query(
			`CREATE TABLE "sexualOrientation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sexualOrientation" "public"."sexualOrientationsEnum" NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), CONSTRAINT "UQ_c91d091398589be2cc73b0f87fb" UNIQUE ("sexualOrientation"), CONSTRAINT "PK_c22acf762cea83f999013c1c835" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female', 'more')`);
		await queryRunner.query(`CREATE TYPE "public"."users_showme_enum" AS ENUM('male', 'female', 'everyone')`);
		await queryRunner.query(
			`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstname" character varying, "lastname" character varying, "bio" character varying, "aboutMe" character varying, "avatar" character varying NOT NULL DEFAULT '', "isSmartPhoto" boolean NOT NULL DEFAULT false, "countryCode" character varying NOT NULL, "mobile" character varying NOT NULL, "isValidMobile" boolean NOT NULL DEFAULT false, "birthdate" date, "gender" "public"."users_gender_enum", "showMeOnApp" boolean NOT NULL DEFAULT false, "showMe" "public"."users_showme_enum", "showMyGenderOnProfile" boolean NOT NULL DEFAULT false, "city" character varying, "state" character varying, "country" character varying, "latLong" integer array NOT NULL DEFAULT '{}', "isVerified" boolean NOT NULL DEFAULT false, "email" character varying, "password" character varying, "showMyOrientation" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), "lookingForId" uuid, CONSTRAINT "UQ_d376a9f93bba651f32a2c03a7d3" UNIQUE ("mobile"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TYPE "public"."lookingForEnum" AS ENUM('Long-term partner', 'Long-term, open to short', 'Short-term, open to long', 'Short-term fun', 'New friends', 'Still figuring it out')`,
		);
		await queryRunner.query(
			`CREATE TABLE "lookingFor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "for" "public"."lookingForEnum" NOT NULL, "image" character varying NOT NULL, "createdAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP(0), CONSTRAINT "UQ_59ebcddb43ac9703e185748e9ca" UNIQUE ("for"), CONSTRAINT "PK_3d5b3c1d54e898eaff27bf65aa8" PRIMARY KEY ("id"))`,
		);
		await queryRunner.query(
			`CREATE TABLE "user_passions" ("userId" uuid NOT NULL, "passionId" uuid NOT NULL, CONSTRAINT "PK_5258b6507d8e129e3577e09b32d" PRIMARY KEY ("userId", "passionId"))`,
		);
		await queryRunner.query(`ALTER TABLE "users" ADD "age" integer NOT NULL DEFAULT '0'`);
		await queryRunner.query(`CREATE INDEX "IDX_2792c6630314856e2e408097ff" ON "user_passions" ("userId") `);
		await queryRunner.query(`CREATE INDEX "IDX_596e93d09d93ff6b41f6b4c9c0" ON "user_passions" ("passionId") `);
		await queryRunner.query(`ALTER TABLE "users" ADD "company" character varying`);
		await queryRunner.query(`ALTER TABLE "users" ADD "showMyAge" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "users" ADD "showMyDistance" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(
			`CREATE TABLE "user_sexualOrientations" ("userId" uuid NOT NULL, "sexualOrientationId" uuid NOT NULL, CONSTRAINT "PK_0501b39598e7335fe9da9fc0357" PRIMARY KEY ("userId", "sexualOrientationId"))`,
		);
		await queryRunner.query(`CREATE INDEX "IDX_302f4f9ae52bd7f92584a050d9" ON "user_sexualOrientations" ("userId") `);
		await queryRunner.query(
			`CREATE INDEX "IDX_03a1c38f88ccd98108114fa1e9" ON "user_sexualOrientations" ("sexualOrientationId") `,
		);
		await queryRunner.query(
			`ALTER TABLE "users" ADD CONSTRAINT "FK_bab06e498159a0643aaf1995f74" FOREIGN KEY ("lookingForId") REFERENCES "lookingFor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
		);
		await queryRunner.query(`ALTER TABLE "users" ADD "profileBoostDate" TIMESTAMP`);
		await queryRunner.query(
			`ALTER TABLE "user_passions" ADD CONSTRAINT "FK_2792c6630314856e2e408097ff8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_passions" ADD CONSTRAINT "FK_596e93d09d93ff6b41f6b4c9c08" FOREIGN KEY ("passionId") REFERENCES "passions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_sexualOrientations" ADD CONSTRAINT "FK_302f4f9ae52bd7f92584a050d99" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
		);
		await queryRunner.query(
			`ALTER TABLE "user_sexualOrientations" ADD CONSTRAINT "FK_03a1c38f88ccd98108114fa1e96" FOREIGN KEY ("sexualOrientationId") REFERENCES "sexualOrientation"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
		);
		await queryRunner.query(`ALTER TABLE "users" ADD "balancedRecommendations" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "users" ADD "recentlyActive" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "users" ADD "standard" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "users" ADD "onlyPeopleLiked" boolean NOT NULL DEFAULT false`);
		await queryRunner.query(`ALTER TABLE "users" ADD "distanceType" character varying DEFAULT 'km'`);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`ALTER TABLE "user_sexualOrientations" DROP CONSTRAINT "FK_03a1c38f88ccd98108114fa1e96"`);
		await queryRunner.query(`ALTER TABLE "user_sexualOrientations" DROP CONSTRAINT "FK_302f4f9ae52bd7f92584a050d99"`);
		await queryRunner.query(`ALTER TABLE "user_passions" DROP CONSTRAINT "FK_596e93d09d93ff6b41f6b4c9c08"`);
		await queryRunner.query(`ALTER TABLE "user_passions" DROP CONSTRAINT "FK_2792c6630314856e2e408097ff8"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileBoostDate"`);
		await queryRunner.query(`ALTER TABLE "users" ADD "profileBoostDate" date`);
		await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_bab06e498159a0643aaf1995f74"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "showMyDistance"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "showMyAge"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "company"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_03a1c38f88ccd98108114fa1e9"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_302f4f9ae52bd7f92584a050d9"`);
		await queryRunner.query(`DROP TABLE "user_sexualOrientations"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_596e93d09d93ff6b41f6b4c9c0"`);
		await queryRunner.query(`DROP INDEX "public"."IDX_2792c6630314856e2e408097ff"`);
		await queryRunner.query(`DROP TABLE "user_passions"`);
		await queryRunner.query(`DROP TABLE "lookingFor"`);
		await queryRunner.query(`DROP TYPE "public"."lookingForEnum"`);
		await queryRunner.query(`DROP TABLE "users"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "age"`);
		await queryRunner.query(`DROP TYPE "public"."users_showme_enum"`);
		await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
		await queryRunner.query(`DROP TABLE "sexualOrientation"`);
		await queryRunner.query(`DROP TYPE "public"."sexualOrientationsEnum"`);
		await queryRunner.query(`DROP TABLE "passions"`);
		await queryRunner.query(`DROP TYPE "public"."passionsEnum"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "onlyPeopleLiked"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "standard"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "recentlyActive"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "balancedRecommendations"`);
		await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "distanceType"`);
	}
}

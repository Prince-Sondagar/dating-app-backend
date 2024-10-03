import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MulterModule } from "@nestjs/platform-express";
import * as multerS3 from "multer-s3";
import { JwtStrategy } from "src/auth/strategies/jwt.strategy";
import { AwsModule } from "src/aws/aws.module";
import { AwsService } from "src/aws/aws.service";
import { DatabaseModule } from "src/database/database.module";
import { LanguageService } from "src/language/language.service";
import { LookingForService } from "src/lookingFor/lookingFor.service";
import { MessageService } from "src/message/message.service";
import { PassionService } from "src/passion/passion.service";
import { ProfileMediaService } from "src/profileMedia/profileMedia.service";
import StripeService from "src/services/stripe.service";
import SubscriptionService from "src/subscriptions/subscription.service";
import { UsersInterestService } from "src/usersInterest/usersInterest.service";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
	imports: [
		DatabaseModule,
		MulterModule.registerAsync({
			imports: [AwsModule, ConfigModule],
			useFactory: (awsService: AwsService, configService: ConfigService) => ({
				storage: multerS3({
					s3: awsService.s3,
					bucket: process.env.AWS_S3_BUCKET,
					acl: "public-read",
					contentType: multerS3.AUTO_CONTENT_TYPE,
					key: function (req: any, file, cb) {
						cb(null, `${req.user?.id}/${file.fieldname}/${file.originalname}`);
					},
				}),
				fileFilter: (req, file, cb) => {
					const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "video/mp4"];
					if (allowedTypes.includes(file.mimetype)) {
						return cb(null, true);
					} else {
						return cb(new Error("Only JPEG, JPG, and PNG images are allowed"), false);
					}
				},
				limits: {
					fileSize: configService.get("AWS_S3_FILE_SIZE"),
				},
			}),
			inject: [AwsService, ConfigService],
		}),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get("JWT_SECRET"),
				signOptions: { expiresIn: configService.get("JWT_TOKEN_EXPIRE_TIME") },
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [UserController],
	providers: [
		UserService,
		PassionService,
		JwtStrategy,
		AwsService,
		StripeService,
		LanguageService,
		SubscriptionService,
		LookingForService,
		ProfileMediaService,
		UsersInterestService,
		MessageService,
		SubscriptionService,
	],
})
export class UserModule {}

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AwsService } from "src/aws/aws.service";
import { DatabaseModule } from "src/database/database.module";
import { LanguageService } from "src/language/language.service";
import { LookingForService } from "src/lookingFor/lookingFor.service";
import { MessageService } from "src/message/message.service";
import { PassionService } from "src/passion/passion.service";
import { ProfileMediaService } from "src/profileMedia/profileMedia.service";
import { EmailService } from "src/services/emailSms.service";
import SmsService from "src/services/sms.service";
import StripeService from "src/services/stripe.service";
import SubscriptionService from "src/subscriptions/subscription.service";
import { UserService } from "src/user/user.service";
import { UsersInterestService } from "src/usersInterest/usersInterest.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
	imports: [
		DatabaseModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get("JWT_SECRET"),
				signOptions: { expiresIn: configService.get("JWT_TOKEN_EXPIRE_TIME") },
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		UserService,
		EmailService,
		PassionService,
		StripeService,
		SmsService,
		LanguageService,
		SubscriptionService,
		LookingForService,
		AwsService,
		ProfileMediaService,
		UsersInterestService,
		MessageService,
	],
})
export class AuthModule {}

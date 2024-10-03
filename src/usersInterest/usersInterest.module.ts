import { Module } from "@nestjs/common";
import { AwsService } from "src/aws/aws.service";
import { DatabaseModule } from "src/database/database.module";
import { LanguageService } from "src/language/language.service";
import { LookingForService } from "src/lookingFor/lookingFor.service";
import { MessageService } from "src/message/message.service";
import { PassionService } from "src/passion/passion.service";
import { ProfileMediaService } from "src/profileMedia/profileMedia.service";
import StripeService from "src/services/stripe.service";
import SubscriptionService from "src/subscriptions/subscription.service";
import { UserService } from "src/user/user.service";
import { UsersInterestController } from "./usersInterest.controller";
import { UsersInterestService } from "./usersInterest.service";

@Module({
	imports: [DatabaseModule],
	controllers: [UsersInterestController],
	providers: [
		UsersInterestService,
		UserService,
		PassionService,
		AwsService,
		StripeService,
		LookingForService,
		LanguageService,
		ProfileMediaService,
		MessageService,
		SubscriptionService,
	],
})
export class UsersInterestModule {}

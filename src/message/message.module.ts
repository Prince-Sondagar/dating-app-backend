import { Module } from "@nestjs/common";
import { AwsService } from "src/aws/aws.service";
import { DatabaseModule } from "src/database/database.module";
import { LanguageService } from "src/language/language.service";
import { LookingForService } from "src/lookingFor/lookingFor.service";
import { PassionService } from "src/passion/passion.service";
import { ProfileMediaService } from "src/profileMedia/profileMedia.service";
import StripeService from "src/services/stripe.service";
import SubscriptionService from "src/subscriptions/subscription.service";
import { UserService } from "src/user/user.service";
import { UsersInterestService } from "src/usersInterest/usersInterest.service";
import { MessageController } from "./message.controller";
import { MessageGateway } from "./message.gateway";
import { MessageService } from "./message.service";

@Module({
	imports: [DatabaseModule],
	controllers: [MessageController],
	providers: [
		MessageService,
		MessageGateway,
		UserService,
		AwsService,
		LookingForService,
		PassionService,
		StripeService,
		LanguageService,
		ProfileMediaService,
		UsersInterestService,
		SubscriptionService,
	],
})
export class MessageModule {}

import { Module } from "@nestjs/common";
import { AwsService } from "src/aws/aws.service";
import { DatabaseModule } from "src/database/database.module";
import { LanguageService } from "src/language/language.service";
import { LookingForService } from "src/lookingFor/lookingFor.service";
import { MessageService } from "src/message/message.service";
import { PassionService } from "src/passion/passion.service";
import { ProfileMediaService } from "src/profileMedia/profileMedia.service";
import StripeService from "src/services/stripe.service";
import { UserService } from "src/user/user.service";
import { UsersInterestService } from "src/usersInterest/usersInterest.service";
import SubscriptionController from "./subscription.controller";
import SubscriptionService from "./subscription.service";

@Module({
	imports: [DatabaseModule],
	controllers: [SubscriptionController],
	providers: [
		SubscriptionService,
		StripeService,
		UserService,
		PassionService,
		LookingForService,
		AwsService,
		LanguageService,
		ProfileMediaService,
		MessageService,
		UsersInterestService,
	],
})
class SubscriptionModule {}

export default SubscriptionModule;

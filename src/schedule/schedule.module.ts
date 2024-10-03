import { Module } from "@nestjs/common";
import { ScheduleModule as Schedule } from "@nestjs/schedule";
import { AwsService } from "src/aws/aws.service";
import { DatabaseModule } from "src/database/database.module";
import SuperPassionsEntity from "src/database/entities/superPassions.entity";
import { LanguageService } from "src/language/language.service";
import { LookingForService } from "src/lookingFor/lookingFor.service";
import { MessageService } from "src/message/message.service";
import { PassionService } from "src/passion/passion.service";
import { ProfileMediaService } from "src/profileMedia/profileMedia.service";
import StripeService from "src/services/stripe.service";
import SubscriptionService from "src/subscriptions/subscription.service";
import { UserService } from "src/user/user.service";
import { UsersInterestService } from "src/usersInterest/usersInterest.service";
import { EmailService } from "../services/emailSms.service";
// import ScheduleService from "./schedule.service";

@Module({
	imports: [DatabaseModule, Schedule.forRoot()],
	controllers: [],
	providers: [
		// ScheduleService,
		UserService,
		PassionService,
		LookingForService,
		AwsService,
		StripeService,
		LanguageService,
		ProfileMediaService,
		UsersInterestService,
		MessageService,
		SubscriptionService,
		SuperPassionsEntity,
		EmailService,
	],
})
export class ScheduleModule {}

import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SubscriptionsEnum } from "src/database/entities/subscriptions.entity";
import SubscriptionService from "src/subscriptions/subscription.service";
import { UserService } from "src/user/user.service";
import { In } from "typeorm";
import { EmailService } from "../services/emailSms.service";

@Injectable()
export default class ScheduleService {
	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly userService: UserService,
		private readonly emailService: EmailService,
	) {}

	// @Cron(CronExpression.EVERY_MINUTE)
	@Cron(CronExpression.EVERY_WEEK)
	async updateUserSuperLike() {
		const memberships = await this.subscriptionService.fetchMemberships([
			SubscriptionsEnum.GOLD,
			SubscriptionsEnum.PLATINUM,
		]);
		await this.userService.updateUsers(
			{ subscriptionId: In(memberships.map(({ id }) => id)) },
			{
				superLikes() {
					return '"superLikes" + 5';
				},
			},
		);
	}

	// @Cron(CronExpression.EVERY_MINUTE)
	@Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
	async updateUserBoost() {
		const memberships = await this.subscriptionService.fetchMemberships([
			SubscriptionsEnum.GOLD,
			SubscriptionsEnum.PLATINUM,
		]);
		await this.userService.updateUsers(
			{ subscriptionId: In(memberships.map(({ id }) => id)) },
			{
				boosts() {
					return '"boosts" + 1';
				},
			},
		);
	}

	@Cron("0 0 * * 1")
	async sendCompleteOnboardingEmail() {
		await this.userService.sendCompleteOnboardingEmail(this.emailService.sendCompleteOnboardingEmail);
	}
}

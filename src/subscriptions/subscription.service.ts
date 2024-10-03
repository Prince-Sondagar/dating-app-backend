import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import SubscriptionsEntity, { SubscriptionsEnum } from "src/database/entities/subscriptions.entity";
import UserEntity from "src/database/entities/user.entity";
import StripeService from "src/services/stripe.service";
import { UserService } from "src/user/user.service";
import Stripe from "stripe";
import { FindOptionsSelect, FindOptionsWhere, In, Repository } from "typeorm";

@Injectable()
class SubscriptionService {
	constructor(
		@InjectRepository(SubscriptionsEntity)
		private readonly subscriptions: Repository<SubscriptionsEntity>,

		private readonly userService: UserService,
		private readonly stripeClient: StripeService,
	) {}

	async findOne(option: FindOptionsWhere<SubscriptionsEntity>, selectedAttr?: FindOptionsSelect<SubscriptionsEntity>) {
		const user = await this.subscriptions.findOne({ where: option, ...(selectedAttr ? { select: selectedAttr } : {}) });
		return user || null;
	}

	async getMySubscriptions(userStripeSubscriptionId: string, userSubscriptionId: string) {
		const stripeSubscription = await this.stripeClient.getSubscription(userStripeSubscriptionId);
		const subscription = await this.findOne({ id: userSubscriptionId });
		return {
			subStatus: stripeSubscription.status,
			isSubPaused: stripeSubscription.pause_collection?.behavior === "void",
			subEndDate: new Date(stripeSubscription.current_period_end * 1000),
			subscriptionDetail: subscription,
		};
	}

	findOneById(id: string) {
		return this.subscriptions.findOne({ where: { id } });
	}

	fetchCards(stripeUserId) {
		return this.stripeClient.fetchCards(stripeUserId);
	}

	async setDefaultCard(stripeUserId, cardId) {
		return this.stripeClient.setDefaultCard(stripeUserId, cardId);
	}

	async deleteCard(stripeUserId, cardId) {
		return this.stripeClient.deleteCard(stripeUserId, cardId);
	}

	async checkoutBoostOrSuperlike(
		type: SubscriptionsEnum.BOOST | SubscriptionsEnum.SUPERLIKE,
		priceId: string,
		user: UserEntity,
	) {
		try {
			const price = await this.subscriptions.findOneOrFail({ where: { stripePriceId: priceId, type } });
			return this.stripeClient.createPaymentIntent(price, user);
		} catch (error) {
			throw new BadRequestException("Please select valid plan");
		}
	}

	async getAllPlans(reqType: SubscriptionsEnum.SUPERLIKE | SubscriptionsEnum.BOOST) {
		const plans = await this.subscriptions.find({ where: { type: reqType } });
		return plans.reduce(
			(plans, plan) => {
				return {
					...plans,
					subPlans: [
						...plans.subPlans,
						{
							boosts: plan.month,
							amount: plan.amount,
							currency: plan.currency,
							priceId: plan.stripePriceId,
							planId: plan.stripeProductId,
						},
					],
				};
			},
			{ type: reqType, subPlans: [] },
		);
	}

	async getAllSubscriptions(): Promise<SubscriptionsEntity[]> {
		const subscriptions = await this.subscriptions.find({
			where: { type: In([SubscriptionsEnum.PLUS, SubscriptionsEnum.GOLD, SubscriptionsEnum.PLATINUM]) },
		});
		return subscriptions.reduce((newArray: Array<any>, obj: SubscriptionsEntity) => {
			const createPriceObject = (obj) => {
				const { month, currency, amount, stripePriceId } = obj;
				const find1MonthPrice = subscriptions.find((sub) => sub.month === 1 && sub.type === obj.type);
				return {
					month,
					priceId: stripePriceId,
					amount,
					currency,
					label: month === 6 ? "Most Popular" : month === 12 ? "Best Value" : `Monthly`,
					...(month !== 1
						? {
								discount: Math.round(((find1MonthPrice.amount - amount / month) * 100) / find1MonthPrice.amount) + "%",
						  }
						: {}),
				};
			};
			if (newArray.find((sub) => sub.type === obj.type)) {
				newArray = newArray.map((sub) =>
					sub.type === obj.type
						? {
								...sub,
								prices: [...sub.prices, createPriceObject(obj)],
						  }
						: sub,
				);
			} else {
				const {
					type,
					stripeProductId,
					month,
					currency,
					amount,
					stripePriceId,
					createdAt,
					updatedAt,
					deletedAt,
					...remainObj
				} = obj;
				newArray = [
					...newArray,
					{
						type: type,
						productId: stripeProductId,
						...remainObj,
						prices: [createPriceObject(obj)],
					},
				];
			}
			return newArray;
		}, []);
	}

	async userSubscriptionsHook(body: Stripe.Event): Promise<void> {
		try {
			const { type, data } = body;
			switch (type) {
				case "payment_intent.succeeded":
					const paymentIntent: any = data.object;
					if (
						(!paymentIntent?.metadata || paymentIntent.object === "payment_intent") &&
						paymentIntent.status !== "succeeded"
					)
						return null;
					const typeProduct = paymentIntent.metadata.type === SubscriptionsEnum.SUPERLIKE ? "superLikes" : "boosts";
					const subscriptionPlan = await this.subscriptions.findOne({
						where: {
							stripePriceId: paymentIntent.metadata.priceId,
							stripeProductId: paymentIntent.metadata.productId,
							type: paymentIntent.metadata.type,
						},
					});
					await this.userService.updateOne(
						{ stripeUserId: paymentIntent.metadata.customerId, id: paymentIntent.metadata.userId },
						{ [typeProduct]: () => `"${typeProduct}" + ${subscriptionPlan.month}` },
					);
					break;
				case "customer.subscription.created":
					const subscriptionCreated: any = data.object;
					const subscriptionPlanForCreate = await this.subscriptions.findOne({
						where: { stripePriceId: subscriptionCreated.plan.id },
					});
					await this.userService.updateOne(
						{ stripeUserId: subscriptionCreated.metadata.customerId },
						{ subscriptionId: subscriptionPlanForCreate.id, stripeSubscriptionId: subscriptionCreated.id },
					);
					break;
				case "customer.subscription.updated":
					const previous_attributes: any = data.previous_attributes;
					const subscriptionUpdate: any = data.object;
					if (!(previous_attributes?.status === "incomplete" && subscriptionUpdate?.status === "active")) return null;
					const user = await this.userService.findOne({ stripeUserId: subscriptionUpdate.metadata.customerId });
					if (!user) return null;
					const subscriptionPlanForUpdate = await this.subscriptions.findOne({
						where: { stripePriceId: subscriptionUpdate.plan.id },
					});
					await this.userService.updateOne(
						{ stripeUserId: subscriptionUpdate.metadata.customerId },
						{ subscriptionId: subscriptionPlanForUpdate.id, stripeSubscriptionId: subscriptionUpdate.id },
					);
					break;
				case "customer.subscription.deleted":
					const subscriptionDeleted: any = data.object;
					if (subscriptionDeleted.status !== "canceled") return null;
					await this.userService.updateOne(
						{ stripeUserId: subscriptionDeleted.metadata.customerId },
						{ subscriptionId: "", stripeSubscriptionId: "" },
					);
				default:
					break;
			}
		} catch {}
	}

	async createUserSubscription(
		stripeCustomerId: string,
		stripePriceId: string,
	): Promise<{ subscriptionId: string; clientSecret: string; paymentInvoice: string }> {
		const newSubscription = await this.stripeClient.createUserSubscription(stripeCustomerId, stripePriceId);
		return {
			subscriptionId: newSubscription.id,
			clientSecret: ((newSubscription.latest_invoice as Stripe.Invoice)?.payment_intent as Stripe.PaymentIntent)
				?.client_secret,
			paymentInvoice: (newSubscription?.latest_invoice as Stripe.Invoice)?.id,
		};
	}

	async updateUserSubscription(subscriptionId: string, stripePriceId: string): Promise<{ subscriptionId: string }> {
		const updatedSubscription = await this.stripeClient.updateUserSubscription(subscriptionId, stripePriceId);
		return {
			subscriptionId: updatedSubscription.id,
		};
	}

	async cancelUserSubscription(subscriptionId: string): Promise<void> {
		await this.stripeClient.cancelUserSubscription(subscriptionId);
	}

	async pauseUserSubscription(subscriptionId: string): Promise<void> {
		await this.stripeClient.pauseSubscription(subscriptionId);
	}

	async resumeUserSubscription(subscriptionId: string): Promise<void> {
		await this.stripeClient.resumeSubscription(subscriptionId);
	}

	async fetchMemberships(requestedMemberships: SubscriptionsEnum[]): Promise<SubscriptionsEntity[]> {
		const memberships = await this.subscriptions.find({ where: { type: In(requestedMemberships) } });
		return memberships;
	}
}

export default SubscriptionService;

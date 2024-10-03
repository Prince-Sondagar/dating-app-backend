import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import SubscriptionsEntity, { SubscriptionsEnum } from "src/database/entities/subscriptions.entity";
import UserEntity from "src/database/entities/user.entity";
import Stripe from "stripe";

@Injectable()
export default class StripeService {
	private stripeClient: Stripe;

	constructor(private configService: ConfigService) {
		this.stripeClient = new Stripe(this.configService.get("STRIPE_API_KEY"), { apiVersion: "2022-11-15" });
	}

	async createCustomer(requestedCustomer: Stripe.CustomerCreateParams) {
		const customer = await this.stripeClient.customers.create(requestedCustomer);
		return customer;
	}

	async updateCustomer(stripeId: string, updatedCustomer: Stripe.CustomerUpdateParams) {
		const customer = await this.stripeClient.customers.update(stripeId, updatedCustomer);
		return customer;
	}
	async setDefaultCard(customerId: string, cardId: string) {
		const customer = await this.stripeClient.customers.update(customerId, {
			invoice_settings: { default_payment_method: cardId },
		});
		return customer;
	}

	async deleteCard(customerId: string, cardId: string) {
		const customer = await this.stripeClient.customers.update(customerId, {
			invoice_settings: { default_payment_method: null },
		});
		const paymentMethod = await this.stripeClient.paymentMethods.detach(cardId);
		return { customer, paymentMethod };
	}

	async fetchCustomer(customerId): Promise<Stripe.Customer | Stripe.DeletedCustomer | null> {
		const customer = await this.stripeClient.customers.retrieve(customerId);
		if (customer.deleted) return null;
		return customer;
	}

	getSubscription(subscriptionId: string) {
		return this.stripeClient.subscriptions.retrieve(subscriptionId);
	}

	createPaymentIntent(price: SubscriptionsEntity, user: UserEntity): Promise<Stripe.PaymentIntent> {
		return this.stripeClient.paymentIntents.create({
			amount: price.amount * 100,
			payment_method_types: ["card"],
			description: `${price.type === SubscriptionsEnum.BOOST ? `Boosts` : "Superlikes"} purchase`,
			customer: user.stripeUserId,
			currency: "usd",
			metadata: {
				userId: user.id,
				customerId: user.stripeUserId,
				priceId: price.stripePriceId,
				productId: price.stripeProductId,
				type: price.type,
			},
		});
	}

	async fetchCards(customerId): Promise<Stripe.PaymentMethod.Card[]> {
		const customer: any = await this.fetchCustomer(customerId);
		if (!customer) return null;

		const stripePaymentMethods: Stripe.PaymentMethod[] = [];
		await this.stripeClient.paymentMethods
			.list({ customer: customerId, type: "card", limit: 100 })
			.autoPagingEach((item) => {
				stripePaymentMethods.push(item);
			});
		return stripePaymentMethods.map((paymentMethod: Stripe.PaymentMethod) => ({
			...(paymentMethod.id === customer?.invoice_settings?.default_payment_method ?? ""
				? { ...paymentMethod.card, id: paymentMethod.id, default: true }
				: { ...paymentMethod.card, id: paymentMethod.id, default: false }),
		}));
	}

	async createUserSubscription(stripeCustomerId: string, stripePriceId: string): Promise<Stripe.Subscription> {
		// const subscription = await this.stripeClient.subscriptions.list({
		// 	status: "incomplete",
		// 	limit: 1,
		// 	price: stripePriceId,
		// 	expand: ["data.latest_invoice.payment_intent"],
		// });
		// if (subscription.data.length > 0) return subscription.data[0];
		const newSubscription: Stripe.Subscription = await this.stripeClient.subscriptions.create({
			customer: stripeCustomerId,
			items: [{ price: stripePriceId }],
			payment_behavior: "default_incomplete",
			payment_settings: { save_default_payment_method: "on_subscription" },
			expand: ["latest_invoice.payment_intent"],
			metadata: { customerId: stripeCustomerId },
		});
		return newSubscription;
	}

	async updateUserSubscription(subscriptionId: string, stripePriceId: string): Promise<Stripe.Subscription> {
		const subscription = await this.stripeClient.subscriptions.retrieve(subscriptionId);

		const updatedSubscription: Stripe.Subscription = await this.stripeClient.subscriptions.update(subscriptionId, {
			cancel_at_period_end: false,
			proration_behavior: "create_prorations",
			items: [
				{
					id: subscription.items.data[0].id,
					price: stripePriceId,
				},
			],
		});

		return updatedSubscription;
	}

	async cancelUserSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
		const canceledSubscription: Stripe.Subscription = await this.stripeClient.subscriptions.del(subscriptionId);
		return canceledSubscription;
	}

	async pauseSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
		const pausedSubscription: Stripe.Subscription = await this.stripeClient.subscriptions.update(subscriptionId, {
			pause_collection: { behavior: "void" },
		});
		return pausedSubscription;
	}
	async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
		const resumedSubscription: Stripe.Subscription = await this.stripeClient.subscriptions.update(subscriptionId, {
			pause_collection: "",
		});
		return resumedSubscription;
	}

	validateWebhookSignature(requestBody: any, signature: string, endpointSecret: string) {
		const header = this.stripeClient.webhooks.generateTestHeaderString({
			payload: requestBody,
			secret: endpointSecret,
		});

		return this.stripeClient.webhooks.constructEvent(requestBody, header, endpointSecret);
	}
}

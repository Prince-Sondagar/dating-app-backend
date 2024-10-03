import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Headers,
	HttpStatus,
	Param,
	Post,
	Put,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import SubscriptionsEntity, { SubscriptionsEnum } from "src/database/entities/subscriptions.entity";
import UserEntity from "src/database/entities/user.entity";
import StripeService from "src/services/stripe.service";
import { SuccessResponse } from "src/utils/common-types/userResponse.type";
import { User } from "src/utils/decorators/user.decorator";
import SubscriptionService from "./subscription.service";
import { createSubscriptionDto } from "./subscriptions.dto";

@Controller("subscriptions")
@ApiTags("Subscriptions")
class SubscriptionController {
	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly stripeService: StripeService,
		private readonly configService: ConfigService,
	) {}

	@Get("fetch-all")
	@ApiOperation({ summary: "Fetch Subscriptions" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Fetched all subscriptions!",
	})
	async getAllSubscriptions(): Promise<SuccessResponse<SubscriptionsEntity[]>> {
		const subscriptions = await this.subscriptionService.getAllSubscriptions();
		return { message: "fetched all subscriptions", data: subscriptions, error: false };
	}

	@Get("fetch-all/:type(boost|superlike)")
	@ApiParam({
		name: "type",
		enum: [SubscriptionsEnum.SUPERLIKE, SubscriptionsEnum.BOOST],
		description: "Type of subscription (boost or superlike)",
	})
	@ApiOperation({ summary: "Fetch Type Wise Subscriptions" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "fetched all Plans successfully!",
	})
	async getAllPlans(
		@Param("type") type: SubscriptionsEnum.SUPERLIKE | SubscriptionsEnum.BOOST,
	): Promise<SuccessResponse<any>> {
		const subscriptions = await this.subscriptionService.getAllPlans(type);
		return { message: "fetched all Plans", data: subscriptions, error: false };
	}

	@Post(":type(boost|superlike)/checkout/:priceId")
	@ApiParam({
		name: "type",
		enum: [SubscriptionsEnum.SUPERLIKE, SubscriptionsEnum.BOOST],
		description: "Type of subscription (boost or superlike)",
	})
	@ApiParam({ name: "priceId", type: String, description: "Type Your Price Id" })
	@ApiOperation({ summary: "Fetch All Plans" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "fetched all Plan successfully!",
	})
	async createPaymentIntent(
		@User() user: UserEntity,
		@Param("type") type: SubscriptionsEnum.SUPERLIKE | SubscriptionsEnum.BOOST,
		@Param("priceId") priceId: string,
	): Promise<SuccessResponse<any>> {
		const subscriptions = await this.subscriptionService.checkoutBoostOrSuperlike(type, priceId, user);
		return { message: "fetched all Plans", data: { client_secret: subscriptions.client_secret }, error: false };
	}

	@Get()
	@ApiOperation({ summary: "Subscription" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "fetched all subscriptions successfully!",
	})
	async getMySubscriptions(@User() user: UserEntity): Promise<SuccessResponse<any>> {
		if (!user.stripeSubscriptionId || !user.subscriptionId)
			return { message: "You have not any active subscription", data: {}, error: false };
		const subscriptions = await this.subscriptionService.getMySubscriptions(
			user.stripeSubscriptionId,
			user.subscriptionId,
		);
		return { message: "fetched all subscriptions", data: subscriptions, error: false };
	}

	@Get("cards")
	@ApiOperation({ summary: "Fetch Default Cards" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "default card set successfully!",
	})
	async getMyCards(@User() user: UserEntity): Promise<SuccessResponse<any>> {
		return {
			message: "default card set successfully",
			data: await this.subscriptionService.fetchCards(user.stripeUserId),
			error: false,
		};
	}

	@Post("card-default/:cardId")
	@ApiParam({ name: "cardId", type: String, description: "Type Your CardId" })
	@ApiOperation({ summary: "Fetch Subscriptins with card Id" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "fetched all subscriptions successfully!",
	})
	async setDefaulCards(@User() user: UserEntity, @Param("cardId") cardId: string): Promise<SuccessResponse> {
		await this.subscriptionService.setDefaultCard(user.stripeUserId, cardId);
		return {
			message: "fetched all subscriptions",
			error: false,
		};
	}

	@Delete("cards/:cardId")
	@ApiParam({ name: "cardId", type: String, description: "Type Your CardId" })
	@ApiOperation({ summary: "Delete Cards With Card Id" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "card deleted subscriptions successfully!",
	})
	async deleteMyCard(@User() user: UserEntity, @Param("cardId") cardId: string): Promise<SuccessResponse> {
		await this.subscriptionService.deleteCard(user.stripeUserId, cardId);
		return {
			message: "card deleted subscriptions",
			error: false,
		};
	}

	@Post()
	@ApiOperation({ summary: "Create User Subscription" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "created user subscription payment successfully!",
	})
	@UsePipes(new ValidationPipe())
	async createUserSubscriptionPayment(
		@User() user: UserEntity,
		@Body() body: createSubscriptionDto,
	): Promise<SuccessResponse<{ subscriptionId: string; clientSecret: string; paymentInvoice: string }>> {
		return {
			error: false,
			message: "created user subscription payment",
			data: await this.subscriptionService.createUserSubscription(user.stripeUserId, body.priceId),
		};
	}

	@Put(":status(pause|resume|cancel)")
	@ApiParam({
		name: "status",
		enum: ["pause", "resume", "cancel"],
		description: "Type of status (pause or resume or cancel)",
	})
	@ApiOperation({ summary: "update user subscription" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User subscription updated successfully!",
	})
	@UsePipes(new ValidationPipe())
	async updateUserSubscriptionPayment(
		@User() user: UserEntity,
		@Param("status") status: "pause" | "resume",
	): Promise<SuccessResponse<{ subscriptionId: string }>> {
		if (!user.subscriptionId) {
			throw new BadRequestException("You have not any active subscription");
		}
		if (status === "pause") await this.subscriptionService.pauseUserSubscription(user.stripeSubscriptionId);
		if (status === "resume") await this.subscriptionService.resumeUserSubscription(user.stripeSubscriptionId);

		return {
			error: false,
			message: "User subscription updated successfully",
		};
	}

	@Delete()
	@ApiOperation({ summary: "Delete Subscription" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Usersubscription cancel successfully!",
	})
	async cancelUserSubscriptionPayment(@User() user: UserEntity): Promise<SuccessResponse> {
		if (!user.stripeSubscriptionId) throw new BadRequestException("You have not any active subscription");
		await this.subscriptionService.cancelUserSubscription(user.stripeSubscriptionId);
		return {
			error: false,
			message: "Usersubscription cancel successfully",
		};
	}

	@Post("stripe-webhook")
	@ApiOperation({ summary: "Call Stripe Webhook" })
	async handleWebhook(
		@Body({ transform: (body) => JSON.stringify(body) }) body: string,
		@Headers("stripe-signature") stripeSignature: string,
	): Promise<{ success: boolean }> {
		try {
			const event = await this.stripeService.validateWebhookSignature(
				body,
				stripeSignature,
				this.configService.get("STRIPE_WEBHOOK_SECRET"),
			);
			if (!event) throw Error("Webhook signature verification failed");
			await this.subscriptionService.userSubscriptionsHook(event);
			return { success: true };
		} catch (error) {
			return { success: false };
		}
	}
}

export default SubscriptionController;

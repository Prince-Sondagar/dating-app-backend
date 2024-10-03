import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { createdAt, deletedAt, updatedAt } from "../constant";

export const Subscriptions = ["platinum", "gold", "plus", "boost", "superlike"];
export enum SubscriptionsEnum {
	PLATINUM = "platinum",
	GOLD = "gold",
	PLUS = "plus",
	BOOST = "boost",
	SUPERLIKE = "superlike",
}

@Entity({ name: "subscriptions" })
class SubscriptionsEntity {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column({ type: "enum", enum: Subscriptions, nullable: false })
	type: SubscriptionsEnum;

	@Column({ type: "integer", nullable: false })
	month: number;

	@Column({ type: "varchar", nullable: false, default: "$" })
	currency: string;

	@Column({ type: "float", nullable: false })
	amount: number;

	@Column({ type: "varchar", nullable: false })
	stripeProductId: string;

	@Column({ type: "varchar", unique: true, nullable: false })
	stripePriceId: string;

	@Column({ type: "boolean", default: false })
	isUnlimitedLikes: boolean;

	@Column({ type: "boolean", default: false })
	seeWhoLikesYou: boolean;

	@Column({ type: "boolean", default: false })
	priorityLikes: boolean;

	@Column({ type: "boolean", default: false })
	UnlimitedRewinds: boolean;

	@Column({ type: "boolean", default: false })
	free1BoostPerMonth: boolean;

	@Column({ type: "boolean", default: false })
	free5SuperLikesPerWeek: boolean;

	@Column({ type: "boolean", default: false })
	messageBeforeMatching: boolean;

	@Column({ type: "boolean", default: false })
	passport: boolean;

	@Column({ type: "boolean", default: false })
	controlYourProfile: boolean;

	@Column({ type: "boolean", default: false })
	controlWhoSeesYou: boolean;

	@Column({ type: "boolean", default: false })
	controlWhoYouSee: boolean;

	@Column({ type: "boolean", default: false })
	HideAds: boolean;

	@CreateDateColumn(createdAt)
	createdAt?: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt?: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt?: Date;
}

export default SubscriptionsEntity;

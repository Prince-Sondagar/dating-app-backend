import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { createdAt, deletedAt, updatedAt } from "../constant";
import { UserAccountEnum, UserCurrentAccount } from "../types/user-current-account";
import UserEntity from "./user.entity";

type Tokens = {
	access_token?: string;
	refresh_token?: string;
};

@Entity({ name: "userConnectedAccount" })
export default class userConnectedAccountEntity {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@ManyToOne(() => UserEntity, (user) => user.connectedAccount, { onDelete: "SET NULL" })
	@JoinColumn({ name: "userId" })
	user: UserEntity;

	@Column({ type: "enum", enum: UserCurrentAccount, nullable: false })
	type: UserAccountEnum;

	@Column({ type: "jsonb", default: {} })
	tokens: Tokens;

	@Column({ type: "jsonb", default: {} })
	metadata: object;

	@CreateDateColumn(createdAt)
	createdAt?: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt?: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt?: Date;
}

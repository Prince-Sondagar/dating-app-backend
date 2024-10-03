import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { createdAt, deletedAt, updatedAt } from "../constant";
import MessageEntity from "./message.entity";
import UserEntity from "./user.entity";

export const messageThreadReason = ["match", "superlike", "direct"];
export enum MessageThreadReasonEnum {
	MATCH = "match",
	SUPERLIKE = "superlike",
	DIRECT = "direct",
}

@Entity({ name: "usersMessageThread" })
class UsersMessageThreadEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => UserEntity, { onDelete: "SET NULL" })
	@JoinColumn({ name: "userSenderId" })
	userSender: UserEntity;

	@ManyToOne(() => UserEntity, { onDelete: "SET NULL" })
	@JoinColumn({ name: "userReceiverId" })
	userReceiver: UserEntity;

	@OneToMany(() => MessageEntity, (messages) => messages.thread, { onDelete: "CASCADE" })
	messages: MessageEntity[];

	@Column({ type: "boolean", default: true })
	isNewMatch: boolean;

	@Column({ type: "enum", default: "match", enum: messageThreadReason, nullable: false })
	reason: MessageThreadReasonEnum;

	@CreateDateColumn(createdAt)
	createdAt?: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt?: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt?: Date;
}

export default UsersMessageThreadEntity;

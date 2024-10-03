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
import UserEntity from "./user.entity";
import UsersMessageThreadEntity from "./usersMessageThread.entity";

export const messageTypes = ["string", "gif", "sticker", "image", "video"];
export enum MessageTypeEnum {
	STRING = "string",
	GIF = "gif",
	STICKER = "sticker",
	IMAGE = "image",
	VIDEO = "video",
}

@Entity({ name: "messages" })
class MessageEntity {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@ManyToOne(() => UsersMessageThreadEntity, (userMessageThread) => userMessageThread.messages, {
		onDelete: "SET NULL",
	})
	@JoinColumn({ name: "threadId" })
	thread: UsersMessageThreadEntity;

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: "fromUserId" })
	fromUser: UserEntity;

	@ManyToOne(() => UserEntity)
	@JoinColumn({ name: "toUserId" })
	toUser: UserEntity;

	@Column({ type: "varchar", nullable: false })
	message: string;

	@Column({ type: "enum", enum: messageTypes, default: "string" })
	type?: MessageTypeEnum;

	@Column({ type: "timestamp", nullable: true, default: null })
	isLiked?: Date;

	@Column({ type: "timestamp", nullable: true, default: null })
	isSeen?: Date;

	@CreateDateColumn(createdAt)
	createdAt?: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt?: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt?: Date;
}

export default MessageEntity;

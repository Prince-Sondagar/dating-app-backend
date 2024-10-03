import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { createdAt, deletedAt, updatedAt } from "../constant";
import { InterestStatus, InterestStatusENUM } from "../types/users-interest";
import UserEntity from "./user.entity";

@Index(["user", "interestedUser"], { unique: true })
@Entity({ name: "userInterestProfile" })
export default class UsersInterestProfileEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "enum", enum: InterestStatus })
	status: InterestStatusENUM;

	@ManyToOne(() => UserEntity, (user) => user.id, { onDelete: "CASCADE" })
	@JoinColumn({ name: "userId" })
	user: UserEntity;

	@ManyToOne(() => UserEntity, (user) => user.id, { onDelete: "CASCADE" })
	@JoinColumn({ name: "interestedUserId" })
	interestedUser: UserEntity;

	@CreateDateColumn(createdAt)
	createdAt?: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt?: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt?: Date;
}

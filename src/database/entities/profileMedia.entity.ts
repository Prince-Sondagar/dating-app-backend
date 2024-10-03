import { IsNotEmpty } from "class-validator";
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from "typeorm";
import { createdAt, deletedAt, updatedAt } from "../constant";
import UserEntity from "./user.entity";

@Entity({ name: "profileMedia" })
export default class ProfileMediaEntity {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column({ type: "varchar", nullable: false })
	@IsNotEmpty({ message: "URL is required" })
	url: string;

	@ManyToOne(() => UserEntity, (user) => user.profileMedias, { onDelete: "SET NULL" })
	user: UserEntity;

	@CreateDateColumn(createdAt)
	createdAt: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt: Date;
}

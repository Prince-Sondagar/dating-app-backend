import { IsNotEmpty, Length } from "class-validator";
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from "typeorm";
import { createdAt, deletedAt, updatedAt } from "../constant";
import { LookingFor, LookingForEnum } from "../types/looking-for";
import UserEntity from "./user.entity";

@Entity({ name: "lookingFor" })
export default class LookingForEntity {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column({ type: "enum", enum: LookingFor, enumName: "lookingForEnum", unique: true })
	@Length(3, 25, { message: "passion must be at least 3 but not longer than 25 characters" })
	@IsNotEmpty({ message: "passion is required" })
	for: LookingForEnum;

	@Column({ type: "varchar", nullable: false })
	@IsNotEmpty({ message: "URL is required" })
	image: string;

	@OneToMany(() => UserEntity, (user) => user.lookingFor, { onDelete: "SET NULL" })
	users: UserEntity[];

	@CreateDateColumn(createdAt)
	createdAt: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt: Date;
}

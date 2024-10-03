import { IsNotEmpty } from "class-validator";
import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	ManyToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { createdAt, deletedAt, updatedAt } from "../constant";
import { Languages, LanguagesEnum } from "../types/languages";
import UserEntity from "./user.entity";

@Entity({ name: "languages" })
export default class LanguagesEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "enum", enum: Languages, enumName: "languagesEnum", unique: true })
	@IsNotEmpty({ message: "Language is required" })
	language: LanguagesEnum;

	@ManyToMany(() => UserEntity, (user) => user.languages, { onDelete: "SET NULL" })
	users: UserEntity[];

	@CreateDateColumn(createdAt)
	createdAt: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt: Date;
}

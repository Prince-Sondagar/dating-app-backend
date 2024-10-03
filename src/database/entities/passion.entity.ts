import { IsNotEmpty, Length } from "class-validator";
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
import { PassionsEnum, passions } from "../types/passions";
import SuperPassionsEntity from "./superPassions.entity";
import UserEntity from "./user.entity";

@Entity({ name: "passions" })
export default class PassionEntity {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column({ type: "enum", enum: passions, enumName: "passionsEnum", unique: true })
	@Length(3, 25, { message: "passion must be at least 3 but not longer than 25 characters" })
	@IsNotEmpty({ message: "passion is required" })
	passion!: PassionsEnum;

	@ManyToMany(() => UserEntity, (user) => user.passions, { onDelete: "SET NULL" })
	users: UserEntity[];

	@ManyToMany(() => SuperPassionsEntity, (superPassions) => superPassions.subPassions, { onDelete: "SET NULL" })
	superPassions?: PassionEntity[];

	@CreateDateColumn(createdAt)
	createdAt: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt: Date;
}

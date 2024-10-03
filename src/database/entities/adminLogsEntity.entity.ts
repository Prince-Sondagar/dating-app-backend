import { IsEmail } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { createdAt, deletedAt, updatedAt } from "../constant";

@Entity({ name: "admin" })
export default class AdminLogsEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", unique: false, nullable: true })
	@IsEmail({}, { message: "Invalid email" })
	email: string;

	@Column({ type: "integer", unique: true, nullable: true })
	otp: number;

	@CreateDateColumn(createdAt)
	createdAt: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt: Date;
}

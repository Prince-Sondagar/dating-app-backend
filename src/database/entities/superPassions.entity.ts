import {
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { createdAt, deletedAt, updatedAt } from "../constant";
import PassionEntity from "./passion.entity";

@Entity({ name: "superPassions" })
export default class SuperPassionsEntity {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column({ type: "varchar", nullable: false })
	superPassion: string;

	@Column({ type: "varchar", nullable: false })
	type: string;

	@Column({ type: "varchar" })
	image: string;

	@Column({ type: "varchar", nullable: false })
	description: string;

	@Column({ type: "boolean", nullable: true, default: false })
	isDisplay: boolean;

	@ManyToMany(() => PassionEntity, (passion) => passion.superPassions, { onDelete: "CASCADE" })
	@JoinTable({
		name: "groupByPassions",
		joinColumn: { name: "superPassionId" },
		inverseJoinColumn: { name: "subPassionId" },
	})
	subPassions: PassionEntity[];

	@CreateDateColumn(createdAt)
	createdAt?: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt?: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt?: Date;
}

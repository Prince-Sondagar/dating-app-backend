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

@Entity({ name: "userSpotifyAccountArtist" })
export default class userSpotifyAccountArtistEntity {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@ManyToOne(() => UserEntity, (user) => user.spotifyArtists, { onDelete: "SET NULL" })
	@JoinColumn({ name: "userId" })
	user?: UserEntity[];

	@Column({ type: "varchar", nullable: false })
	artist?: string;

	@Column({ type: "varchar", nullable: false })
	image?: string;

	@Column({ type: "varchar", nullable: false, default: true })
	isSelected?: boolean;

	@Column({ type: "jsonb", default: {} })
	metadata: object;

	@CreateDateColumn(createdAt)
	createdAt?: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt?: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt?: Date;
}

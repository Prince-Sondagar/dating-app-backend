import { IsEmail, Length } from "class-validator";
import {
	Check,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Geometry,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { GenderEnum, GenderValues, ShowMeEnum, ShowMeValues } from "../types/user";
import { createdAt, deletedAt, updatedAt } from "./../constant";
import LanguageEntity from "./language.entity";
import LookingForEntity from "./lookingfor.entity";
import MessageEntity from "./message.entity";
import PassionEntity from "./passion.entity";
import ProfileMediaEntity from "./profileMedia.entity";
import userConnectedAccountEntity from "./userConnectedAccount.entity";
import UserDiscoverySettingEntity from "./userDiscoverySetting.entity";
import userSpotifyAccountArtistEntity from "./userSpotifyArtist.entity";
import UserInterestProfileEntity from "./usersInterest.entity";

const currantDate = new Date();
currantDate.setFullYear(currantDate.getFullYear() - 18);

@Entity({ name: "users" })
export default class UserEntity {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@Column({ type: "varchar", nullable: true })
	firstname?: string;

	@Column({ type: "varchar", nullable: true })
	lastname?: string;

	@Column({ type: "varchar", nullable: true })
	@Length(10, 255, { message: "bio must be at least 2 but not longer than 255 characters" })
	bio?: string;

	@Column({ type: "varchar", nullable: true })
	@Length(25, 500, { message: "aboutMe must be at least 25 but not longer than 500 characters" })
	aboutMe?: string;

	@Column({ type: "varchar", default: "" })
	avatar?: string;

	@Column({ type: "boolean", default: false })
	isSmartPhoto?: boolean;

	@Column({ type: "varchar", nullable: false })
	countryCode?: string;

	@Column({ type: "varchar", unique: true, nullable: false })
	mobile: string;

	@Column({ type: "boolean", default: false })
	isValidMobile?: boolean;

	@Column({ type: "date", nullable: true })
	birthdate?: string;

	@Column({ type: "enum", enum: GenderValues, nullable: true })
	gender?: GenderEnum;

	@Column({ type: "boolean", default: false })
	showMeOnApp?: boolean;

	@Column({ type: "enum", enum: ShowMeValues, nullable: true })
	showMe?: ShowMeEnum;

	@Column({ type: "boolean", default: false })
	showMyGenderOnProfile?: boolean;

	@Column({ type: "varchar", nullable: true })
	city?: string;

	@Column({ type: "varchar", nullable: true })
	state?: string;

	@Column({ type: "varchar", nullable: true, default: "km" })
	distanceType?: string;

	@Column({ type: "varchar", nullable: true })
	country?: string;

	@Column({ type: "varchar", nullable: true, default: null })
	company?: string;

	@Column({ type: "boolean", default: false })
	showMyAge?: boolean;

	@Column({ type: "boolean", default: false })
	showMyDistance?: boolean;

	@Column({ type: "float", array: true, default: [] })
	latLong?: number[];

	@Column({ type: "geometry", nullable: true })
	location: Geometry;

	@Column({ type: "boolean", default: false })
	isVerified?: boolean;

	@Column({ type: "boolean", default: false })
	isActive?: boolean;

	@Column({ type: "boolean", default: true })
	balancedRecommendations?: boolean;

	@Column({ type: "boolean", default: false })
	recentlyActive?: boolean;

	@Column({ type: "boolean", default: true })
	standard?: boolean;

	@Column({ type: "boolean", default: false })
	onlyPeopleLiked?: boolean;

	@Column({ type: "integer", default: 0 })
	age?: number;

	@Column({ type: "timestamp", nullable: true })
	lastActive?: Date;

	@Column({ type: "varchar", unique: true, nullable: true })
	@IsEmail({}, { message: "Invalid email" })
	email: string;

	@Column({ type: "boolean", default: false })
	isValidEmail?: boolean;

	@Column({ type: "integer", default: 20, name: "profile_comp_per" })
	@Check("profile_comp_per >= 20 AND profile_comp_per <= 100")
	profileCompPer?: number;

	@Column({ type: "varchar", nullable: true })
	password?: string;

	@OneToOne(() => UserDiscoverySettingEntity, (userDiscoverySetting) => userDiscoverySetting.user, {
		onDelete: "CASCADE",
	})
	discoverySetting?: UserDiscoverySettingEntity;

	@OneToMany(() => userConnectedAccountEntity, (userConnectedAccount) => userConnectedAccount.user, {
		onDelete: "CASCADE",
	})
	connectedAccount: userConnectedAccountEntity[];

	@OneToMany(() => userSpotifyAccountArtistEntity, (userSpotifyAccountArtist) => userSpotifyAccountArtist.user, {
		onDelete: "CASCADE",
	})
	spotifyArtists: userSpotifyAccountArtistEntity[];

	@ManyToMany(() => PassionEntity, (passion) => passion.id, { cascade: true })
	@JoinTable({ name: "user_passions", joinColumn: { name: "userId" }, inverseJoinColumn: { name: "passionId" } })
	passions?: PassionEntity[];

	@ManyToMany(() => LanguageEntity, (language) => language.id, { onDelete: "SET NULL" })
	@JoinTable({
		name: "users_language",
		joinColumn: { name: "userId" },
		inverseJoinColumn: { name: "languageId" },
	})
	languages?: LanguageEntity[];

	@ManyToMany(() => UserEntity, (users) => users)
	@JoinTable({
		name: "blocked_user",
		joinColumn: { name: "userId" },
		inverseJoinColumn: { name: "blockedUserId" },
	})
	blockedUsers?: UserEntity[];

	@OneToMany(() => ProfileMediaEntity, (profileMedia) => profileMedia.user, { onDelete: "CASCADE" })
	profileMedias: ProfileMediaEntity[];

	@OneToMany(() => UserInterestProfileEntity, (usersInterest) => usersInterest.id, { onDelete: "CASCADE" })
	userInterestProfile: UserInterestProfileEntity[];

	@Column({ type: "boolean", default: false })
	isCompOnboarding?: boolean;

	@ManyToOne(() => LookingForEntity, (lookingFor) => lookingFor.users)
	lookingFor?: LookingForEntity;

	@OneToMany(() => MessageEntity, (message) => message.fromUser, { onDelete: "CASCADE" })
	sendedMessages?: MessageEntity[];

	@OneToMany(() => MessageEntity, (message) => message.toUser, { onDelete: "CASCADE" })
	receivedMessage?: MessageEntity[];

	@Column({ type: "timestamp", default: null })
	profileBoostDate: Date;

	@Column({ type: "varchar", default: "" })
	school: string;

	@Column({ type: "varchar", default: "" })
	job: string;

	@Column({ type: "varchar", default: "" })
	stripeUserId: string;

	@Column({ type: "varchar", default: "" })
	subscriptionId: string;

	@Column({ type: "varchar", default: "" })
	stripeSubscriptionId: string;

	@Column({ type: "integer", default: 0 })
	boosts: number;

	@Column({ type: "integer", default: 0 })
	superLikes: number;

	@Column({ type: "boolean", default: false })
	darkModeDeviceSetting: boolean;

	@Column({ type: "boolean", default: false })
	darkMode: boolean;

	@CreateDateColumn(createdAt)
	createdAt?: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt?: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt?: Date;
}

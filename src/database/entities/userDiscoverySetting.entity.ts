import {
	Check,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	Geometry,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { createdAt, deletedAt, updatedAt } from "../constant";
import {
	Childrens,
	ChildrensEnum,
	CommunicationStyle,
	CommunicationStyleEnum,
	EducationLevel,
	EducationLevelEnum,
	PersonalityType,
	PersonalityTypeEnum,
	ReceiveLove,
	ReceiveLoveEnum,
	Vaccinated,
	VaccinatedEnum,
	ZodiacSign,
	ZodiacSignEnum,
} from "../types/basics";
import {
	DietaryPreference,
	DietaryPreferenceEnum,
	Drinking,
	DrinkingEnum,
	Pets,
	PetsEnum,
	SleepingHabits,
	SleepingHabitsEnum,
	Smoking,
	SmokingEnum,
	SocialMedia,
	SocialMediaEnum,
	Workout,
	WorkoutEnum,
} from "../types/lifestyle";
import { RelationshipEnum, RelationshipType } from "../types/relationshiptype";
import UserEntity from "./user.entity";

const currantDate = new Date();
currantDate.setFullYear(currantDate.getFullYear() - 18);

@Entity({ name: "userDiscoverySetting" })
export default class UserDiscoverySettingEntity {
	@PrimaryGeneratedColumn("uuid")
	id?: string;

	@OneToOne(() => UserEntity, (user) => user.discoverySetting, { onDelete: "RESTRICT" })
	@JoinColumn({ name: "userId" })
	user: UserEntity;

	@Column({ type: "geometry", nullable: true })
	location?: Geometry;

	@Column({ type: "integer", name: "distance_pref", default: 80 })
	@Check("distance_pref >= 2 AND distance_pref <= 160")
	distancePref?: number;

	@Column({ type: "boolean", default: false })
	distancePrefShowOnlyThisRange?: boolean;

	@Column({ type: "integer", array: true, default: [18, 35] })
	agePref?: Array<number>;

	@Column({ type: "boolean", default: false })
	agePrefShowOnlyThisRange?: boolean;

	@Column({ type: "boolean", default: false })
	global?: boolean;

	@Column({ type: "boolean", default: true })
	showMeOnApp?: boolean;

	@Column({ type: "enum", enum: ZodiacSign, nullable: true })
	zodiacSign?: ZodiacSignEnum;

	@Column({ type: "enum", enum: EducationLevel, nullable: true })
	educationLevel?: EducationLevelEnum;

	@Column({ type: "enum", enum: Childrens, nullable: true })
	childrens?: ChildrensEnum;

	@Column({ type: "enum", enum: Vaccinated, nullable: true })
	vaccinated?: VaccinatedEnum;

	@Column({ type: "enum", enum: PersonalityType, nullable: true })
	personalityType?: PersonalityTypeEnum;

	@Column({ type: "enum", enum: CommunicationStyle, nullable: true })
	communicationStyle?: CommunicationStyleEnum;

	@Column({ type: "enum", enum: ReceiveLove, nullable: true })
	receiveLove?: ReceiveLoveEnum;

	@Column({ type: "enum", enum: Pets, nullable: true })
	pets?: PetsEnum;

	@Column({ type: "enum", enum: Drinking, nullable: true })
	drinking?: DrinkingEnum;

	@Column({ type: "enum", enum: Smoking, nullable: true })
	smoking?: SmokingEnum;

	@Column({ type: "enum", enum: Workout, nullable: true })
	workout?: WorkoutEnum;

	@Column({ type: "enum", enum: DietaryPreference, nullable: true })
	dietaryPreference?: DietaryPreferenceEnum;

	@Column({ type: "enum", enum: SocialMedia, nullable: true })
	socialMedia?: SocialMediaEnum;

	@Column({ type: "enum", enum: SleepingHabits, nullable: true })
	sleepingHabits?: SleepingHabitsEnum;

	@Column({ type: "enum", array: true, enum: RelationshipType, default: [] })
	relationShipType?: RelationshipEnum[];

	@CreateDateColumn(createdAt)
	createdAt?: Date;

	@UpdateDateColumn(updatedAt)
	updatedAt?: Date;

	@DeleteDateColumn(deletedAt)
	deletedAt?: Date;
}

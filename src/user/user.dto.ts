import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsDate,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsStrongPassword,
	Length,
	Max,
	Min,
	Validate,
} from "class-validator";
import UsersLanguagesEntity from "src/database/entities/language.entity";
import UserEntity from "src/database/entities/user.entity";
import {
	ChildrensEnum,
	CommunicationStyleEnum,
	EducationLevelEnum,
	PersonalityTypeEnum,
	ReceiveLoveEnum,
	VaccinatedEnum,
	ZodiacSignEnum,
} from "src/database/types/basics";
import {
	DietaryPreferenceEnum,
	DrinkingEnum,
	PetsEnum,
	SleepingHabitsEnum,
	SmokingEnum,
	SocialMediaEnum,
	WorkoutEnum,
} from "src/database/types/lifestyle";
import { RelationshipEnum } from "src/database/types/relationshiptype";
import { GenderEnum, ShowMeEnum } from "src/database/types/user";

export class PaginationDto {
	@Transform((page) => parseInt(page), { toClassOnly: true })
	@IsNotEmpty()
	@IsNumber()
	page: number;

	@Transform((page) => parseInt(page), { toClassOnly: true })
	@IsNotEmpty()
	@IsNumber()
	limit: number;

	search: string;
}

export class PaginatedUsersResultDto {
	data: UserEntity[];
	page: number;
	limit: number;
	totalCount: number;
	FilteredCount: number;
}

export class CreateUserDto {
	@IsNotEmpty({ message: "Firstname is required" })
	@Length(2, 25, { message: "Firstname must be at least 2 but not longer than 25 characters" })
	firstname: string;

	@IsNotEmpty({ message: "Lastname is required" })
	// @IsString()
	@Length(2, 25, { message: "Lastname must be at least 2 but not longer than 25 characters" })
	lastname: string;

	@IsNotEmpty({ message: "Bio is required" })
	// @IsString()
	@Length(10, 255, { message: "Bio must be at least 10 but not longer than 255 characters" })
	bio: string;

	@IsNotEmpty({ message: "AboutMe is required" })
	// @IsString()
	@Length(25, 500, { message: "AboutMe must be at least 25 but not longer than 500 characters" })
	aboutMe: string;

	@IsNotEmpty({ message: "Mobile is required" })
	// @IsString()
	mobile: string;

	@IsNotEmpty({ message: "Birthdate is required" })
	@IsDate()
	// @MinDate(
	// 	() => {
	// 		const cd = new Date();
	// 		cd.setFullYear(cd.getFullYear() - 18);
	// 		return cd;
	// 	},
	// 	{ message: "Birthdate must minimum 18 year old" },
	// )
	birthdate: string;

	@IsNotEmpty({ message: "Gender is required" })
	@IsEnum(GenderEnum, { message: "Gender must be 'male' or 'female'" })
	gender: GenderEnum;

	@IsOptional()
	@IsBoolean()
	showMyGender: boolean;

	@IsOptional()
	@Transform((value) => !!value)
	@IsBoolean()
	showMyGenderOnProfile: boolean;

	@IsNotEmpty({ message: "Email is required" })
	// @IsString()
	@IsEmail({}, { message: "Invalid email format" })
	email: string;

	@IsNotEmpty({ message: "Password is required" })
	@IsStrongPassword({ minLength: 8 })
	password: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	passions: string[];

	@IsNotEmpty({ message: "Looking For is required" })
	@IsString({ each: true })
	@IsOptional()
	lookingFor: string;
}

function checkUserAge(value: string) {
	const currentDate = new Date();
	const date = new Date(value);
	const diffInYears =
		currentDate.getFullYear() -
		date.getFullYear() -
		(currentDate.getMonth() < date.getMonth() ||
		(currentDate.getMonth() === date.getMonth() && currentDate.getDate() < date.getDate())
			? 1
			: 0);
	return diffInYears >= 18;
}

// Check birthdate less than 18
export class UpdateUserDto {
	@ApiProperty({type:"file"})
	@IsOptional()
	profileImages?: File[];
	
	@ApiProperty({ required: false })
	@IsOptional()
	@Length(1, 22)
	firstname: string;

	@IsOptional()
	@Length(1, 22)
	@ApiProperty({ required: false })
	lastname: string;

	@Length(10, 255)
	@IsOptional()
	@ApiProperty({ required: false })
	bio: string;

	@Length(25, 500)
	@IsOptional()
	@ApiProperty({ required: false })
	aboutMe: string;

	@IsOptional()
	@ApiProperty({ required: false })
	darkMode: boolean;

	@IsOptional()
	@ApiProperty({ required: false })
	isSmartPhoto: boolean;

	@IsOptional()
	@IsEmail({}, { message: "Invalid email" })
	@ApiProperty({ required: false })
	email: string;

	@IsOptional()
	@Validate(checkUserAge, { message: "You must be at least 18 years old." })
	@ApiProperty({ required: false })
	birthdate: string;

	@IsOptional()
	@IsEnum(GenderEnum)
	@ApiProperty({ required: false })
	gender: GenderEnum;

	@IsOptional()
	@ApiProperty({ required: false })
	showMeOnApp: boolean;

	@IsOptional()
	@ApiProperty({ required: false })
	age: number;

	@IsOptional()
	@IsEnum(ShowMeEnum)
	@ApiProperty({ required: false })
	showMe: ShowMeEnum;

	@IsOptional()
	@ApiProperty({ required: false })
	showMyGenderOnProfile: boolean;

	@IsOptional()
	@ApiProperty({ required: false })
	city: string;

	@IsOptional()
	@ApiProperty({ required: false })
	state: string;

	@IsOptional()
	@ApiProperty({ required: false })
	country: string;

	@IsOptional()
	@ApiProperty({ required: false })
	job: string;

	@IsOptional()
	@ApiProperty({ required: false })
	school: string;

	@IsOptional()
	@ApiProperty({ required: false })
	company: string;

	@IsOptional()
	@ApiProperty({ required: false })
	distanceType: string;

	@IsArray()
	@IsOptional()
	@ArrayMinSize(2)
	@ApiProperty({ required: false })
	latLong: number[];

	@IsOptional()
	@IsNumber({ allowNaN: false })
	@Min(20)
	@Max(100)
	@ApiProperty({ required: false })
	profileCompPer: number;

	@IsOptional()
	@ApiProperty({ required: false })
	isCompOnboarding: boolean;

	@IsOptional()
	@ApiProperty({ required: false })
	balancedRecommendations: boolean;

	@IsOptional()
	@ApiProperty({ required: false })
	recentlyActive: boolean;

	@IsOptional()
	@ApiProperty({ required: false })
	standard: boolean;

	@IsOptional()
	@ApiProperty({ required: false })
	onlyPeopleLiked: boolean;

	@IsOptional()
	@ApiProperty({ required: false })
	isActive: boolean;

	@IsOptional()
	@ApiProperty({ required: false })
	showMyAge: boolean;

	@IsOptional()
	@ApiProperty({ required: false })
	showMyDistance: boolean;

	@IsOptional()
	@ApiProperty({ required: false })
	lastActive: Date;

	@IsOptional()
	@IsStrongPassword({ minLength: 8 })
	@ApiProperty({ required: false })
	password: string;

	@IsArray()
	@IsOptional()
	@ApiProperty({ required: false })
	passions: string[];

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	@ApiProperty({ required: false })
	userLanguages: UsersLanguagesEntity[];

	// @IsArray()
	// @IsString({ each: true })
	// @IsOptional()
	// blockedUsers: UserEntity[];

	@IsString()
	@IsOptional()
	@ApiProperty({ required: false })
	lookingFor: string;
}

export class UpdateUserDiscoverySettingDto {
	@ApiProperty()
	@IsArray()
	@IsOptional()
	@ArrayMinSize(2)
	latLong: number[];

	@ApiProperty()
	@IsOptional()
	@Transform((value) => +value)
	@IsNumber()
	@Min(2)
	@Max(160)
	distancePref?: number;

	@ApiProperty()
	@IsOptional()
	@Transform((value) => !!value)
	@IsBoolean()
	distancePrefShowOnlyThisRange?: boolean;

	@ApiProperty()
	@Transform((value) => (value.length === 2 && +value[0] >= 18 ? value : null))
	@IsOptional()
	@IsArray()
	agePref?: Array<number>;

	@ApiProperty()
	@IsOptional()
	@Transform((value) => !!value)
	@IsBoolean()
	agePrefShowOnlyThisRange?: boolean;

	@ApiProperty()
	@IsOptional()
	zodiacSign: ZodiacSignEnum;

	@ApiProperty()
	@IsOptional()
	educationLevel: EducationLevelEnum;

	@ApiProperty()
	@IsOptional()
	childrens: ChildrensEnum;

	@ApiProperty()
	@IsOptional()
	vaccinated: VaccinatedEnum;

	@ApiProperty()
	@IsOptional()
	personalityType: PersonalityTypeEnum;

	@ApiProperty()
	@IsOptional()
	communicationStyle: CommunicationStyleEnum;

	@ApiProperty()
	@IsOptional()
	receiveLove: ReceiveLoveEnum;

	@ApiProperty()
	@IsOptional()
	pets: PetsEnum;

	@ApiProperty()
	@IsOptional()
	drinking: DrinkingEnum;

	@ApiProperty()
	@IsOptional()
	smoking: SmokingEnum;

	@ApiProperty()
	@IsOptional()
	workout: WorkoutEnum;

	@ApiProperty()
	@IsOptional()
	dietaryPreference: DietaryPreferenceEnum;

	@ApiProperty()
	@IsOptional()
	socialMedia: SocialMediaEnum;

	@ApiProperty()
	@IsOptional()
	sleepingHabits: SleepingHabitsEnum;

	@ApiProperty()
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	@ArrayMaxSize(3)
	relationShipType: RelationshipEnum[];

	@ApiProperty()
	@IsOptional()
	@Transform((value) => !!value)
	@IsBoolean()
	global?: boolean;

	@ApiProperty()
	@IsOptional()
	@Transform((value) => !!value)
	@IsBoolean()
	showMeOnApp?: boolean;
}

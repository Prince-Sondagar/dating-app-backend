import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class UsersInterestDto {
	@ApiProperty()
	@IsNotEmpty({ message: "User is required" })
	@IsString()
	interestedUser: string;
}

export class MatchesQueryDto {
	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	@Transform((maxDistance) => parseInt(maxDistance))
	@IsNotEmpty({ message: "Maxdistance should be required" })
	maxDistance: number;

	@ApiProperty()
	@Transform((ageRange) => ageRange.split(","))
	@IsArray()
	@IsOptional()
	ageRange: any;

	@ApiProperty()
	@IsNumber()
	@IsOptional()
	@Transform((minPhotos) => parseInt(minPhotos))
	@IsNotEmpty({ message: "Min photo should be required" })
	minPhotos: any;

	@ApiProperty()
	@Transform((passions) => passions.split(","))
	@IsArray()
	@IsOptional()
	passions: any;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	@Transform((isVerified) => !!isVerified)
	@IsNotEmpty({ message: "Is verified should be required" })
	isVerified: boolean;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	@Transform((hasBio) => !!hasBio)
	@IsNotEmpty({ message: "Has bio should be required" })
	hasBio: boolean;
}

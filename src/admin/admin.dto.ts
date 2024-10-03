import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import PassionEntity from "src/database/entities/passion.entity";

export class EmailOtpVerifyBody {
	@ApiProperty()
	@IsNotEmpty()
	otp: number;

	@ApiProperty()
	@IsNotEmpty()
	email: string;
}

export class AdminLoginDto {
	@ApiProperty()
	@IsNotEmpty()
	email: string;
}

export class SuperPassionsDto {
	@ApiProperty({ type: "file" })
	@IsNotEmpty()
	@IsOptional()
	image?: File[];
	
	@ApiProperty()
	@IsNotEmpty()
	superPassion: string;

	@ApiProperty()
	@IsNotEmpty()
	description: string;

	@ApiProperty()
	@IsNotEmpty()
	type: string;

	@ApiProperty()
	@IsNotEmpty()
	isDisplay: boolean;

	@ApiProperty()
	@IsNotEmpty()
	subPassions: PassionEntity[];
}

export class UpdatePassionsDto {
	@ApiProperty({ required: false,  type: "file" })
	@IsOptional()
	image?: File[];
	
	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	superPassion?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	type?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	isDisplay?: boolean;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsArray()
	subPassions?: PassionEntity[];
}

export class AdminRenewAccessTokenDto {
	@ApiProperty()
	@IsNotEmpty()
	refreshToken: string;
}

export class ChartTimeDto {
	@ApiProperty()
	@IsOptional()
	@IsNotEmpty()
	time?: string;
}

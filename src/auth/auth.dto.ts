import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginDto {
	
	@ApiProperty()
	@IsNotEmpty()
	email: string;

	@ApiProperty()
	@IsNotEmpty()
	password: string;
}

export class SignupDto {
	@ApiProperty()
  	@IsNotEmpty()
  	countryCode: string;

  	@ApiProperty()
  	@IsNotEmpty()
  	phoneNumber: string;

  	@ApiProperty()
  	@IsNotEmpty()
  	email: string;

  	@ApiProperty()
  	@IsNotEmpty()
  	password: string;
}

export class VerifyLoginWithPhoneDto {

	@ApiProperty()
	@IsNotEmpty()
	otp: string;

	@ApiProperty()
	@IsNotEmpty()
	countryCode: string;

	@ApiProperty()
	@IsNotEmpty()
	phoneNumber: string;

	@ApiProperty()
	@IsNotEmpty()
	email: string;

	@ApiProperty()
	@IsNotEmpty()
	password: string;
}

export class UpdateNewPhoneNumberDto {

	@ApiProperty()
	@IsNotEmpty()
	countryCode: string;

	@ApiProperty()
	@IsNotEmpty()
	phoneNumber: string;
}

export class VerifyNewPhoneNumberDto {

	@ApiProperty()
	@IsNotEmpty()
	otp: string;

	@ApiProperty()
	@IsNotEmpty()
	countryCode: string;

	@ApiProperty()
	@IsNotEmpty()
	phoneNumber: string;
}

export class forgotPasswordDto {
	
	@ApiProperty()
	@IsNotEmpty()
	email: string;
}

export class resetPasswordDto {

	@ApiProperty()
	@IsNotEmpty()
	token: string;

	@ApiProperty()
	@IsNotEmpty()
	password: string;
}

export class RenewAccessTokenDto {

	@ApiProperty()
	@IsNotEmpty()
	refreshToken: string;
}

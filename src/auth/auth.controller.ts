import { BadRequestException, Body, Controller, HttpStatus, Post, Put, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import UserEntity from "src/database/entities/user.entity";
import { UserService } from "src/user/user.service";
import { SuccessResponse } from "src/utils/common-types/userResponse.type";
import { User } from "src/utils/decorators/user.decorator";
import { LoginType } from "./auth-type";
import { LoginDto, RenewAccessTokenDto, SignupDto, UpdateNewPhoneNumberDto, VerifyLoginWithPhoneDto, VerifyNewPhoneNumberDto, forgotPasswordDto, resetPasswordDto } from "./auth.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
	constructor(private readonly authService: AuthService, private readonly userService: UserService) {}

	@Post("phone-login")
	@ApiOperation({ summary: "Phone Login." })
	@UseGuards()
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Otp Successfully Sent",
	})
	async loginWithPhone(@Body() loginWithPhoneBody: SignupDto): Promise<SuccessResponse> {
		const response = await this.authService.loginWithPhone(loginWithPhoneBody);
		return {
			error: false,
			message: `Otp successfully sent on ${response.to}`,
			data: null,
		};
	}

	@Post("login")
	@ApiOperation({ summary: "Sign In" })
	@UseGuards()
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "You have sign in successfully!",
	})
	async login(@Body() loginWithBody: LoginDto): Promise<SuccessResponse<LoginType>> {
		const user = await this.authService.validateUser(loginWithBody);
		return {
			error: false,
			message: `You have sign in successfully!`,
			data: await this.authService.login(user),
		};
	}

	@Post("phone-otp-sent")
	@ApiOperation({ summary: "Otp sent on Phone" })
	@UseGuards()
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Otp successfully sent!",
	})
	async signup(@Body() signupWithBody: SignupDto): Promise<SuccessResponse<LoginType>> {
		const response = await this.authService.sentOtpwithPhone(signupWithBody);
		return {
			error: false,
			message: `Otp successfully sent on ${response.to}`,
			data: null,
		};
	}

	@Post("phone-otp-verify")
	@ApiOperation({ summary: "Verify Phone Otp" })
	@UseGuards()
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User OTP is verified for mobile number and, Login successfully!",
	})
	async phoneOtpVerify(@Body() phoneOtpVerifyBody: VerifyLoginWithPhoneDto): Promise<SuccessResponse<LoginType>> {
		const user = await this.authService.phoneOtpVerify(phoneOtpVerifyBody);
		return {
			error: false,
			message: `User OTP is verified for mobile number +${user.countryCode}${user.mobile}, Login successfully`,
			data: await this.authService.login(user),
		};
	}

	@Post("/update-phone-number")
	@ApiOperation({ summary: "Update Phone Number" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Otp successfully sent!",
	})
	async updateMobileNumber(
		@User() user: UserEntity,
		@Body() updateMobileNumberBody: UpdateNewPhoneNumberDto,
	): Promise<SuccessResponse> {
		try {
			if (user.mobile === updateMobileNumberBody.phoneNumber)
				throw Error("Please provide new mobile number for update");

			const response = await this.authService.updatePhoneNumber(updateMobileNumberBody, user);

			return {
				error: false,
				message: `Otp successfully sent on ${response.to}`,
				data: null,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	@Post("new-phone-otp-verify")
	@ApiOperation({ summary: "New Phone Otp Verify" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User OTP is verified!",
	})
	async updatePhoneOtpVerify(
		@User() user: UserEntity,
		@Body() phoneOtpVerifyBody: VerifyNewPhoneNumberDto,
	): Promise<SuccessResponse> {
		const newUser = await this.authService.updatePhoneOtpVerify(phoneOtpVerifyBody, user);
		return {
			error: false,
			message: `User OTP is verified for mobile number +${newUser.countryCode}${newUser.mobile}`,
			data: null,
		};
	}

	@Post("renew-token")
	@ApiOperation({ summary: "Renew Token" })
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Token successfully renewed!",
	})
	async renewAccessToken(@Body() renewAccessTokenDto: RenewAccessTokenDto): Promise<SuccessResponse<LoginType>> {
		const response = await this.authService.renewAccessToken(renewAccessTokenDto.refreshToken);

		return {
			error: false,
			message: `token successfully renewed`,
			data: response,
		};
	}

	@Post("forgot-password")
	@ApiOperation({ summary: "Forgot Password" })
	@UseGuards()
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "An email has been sent to the address you provided if there is a user account associated with it!",
	})
	async forgotPassword(@Body() forgotPasswordBody: forgotPasswordDto): Promise<SuccessResponse> {
		await this.authService.forgotPassword(forgotPasswordBody);
		return {
			error: false,
			message: `An email has been sent to the address you provided if there is a user account associated with it`,
			data: null,
		};
	}

	@Put("reset-password")
	@ApiOperation({ summary: "Reset Password" })
	@UseGuards()
	@UsePipes(new ValidationPipe())
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Password update successfully!",
	})
	async resetPassword(@Body() resetPasswordBody: resetPasswordDto): Promise<SuccessResponse> {
		try {
			await this.authService.resetPassword(resetPasswordBody);
			return {
				error: false,
				message: `Password update successfully!`,
				data: null,
			};
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}

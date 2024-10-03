import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import UserEntity from "src/database/entities/user.entity";
import UserDiscoverySettingEntity from "src/database/entities/userDiscoverySetting.entity";
import { EmailService } from "src/services/emailSms.service";
import SmsService from "src/services/sms.service";
import StripeService from "src/services/stripe.service";
import { UserService } from "src/user/user.service";
import { IUser } from "src/user/user.type";
import { VerificationInstance } from "twilio/lib/rest/verify/v2/service/verification";
import { Repository } from "typeorm";
import { LoginType } from "./auth-type";
import { SignupDto, UpdateNewPhoneNumberDto, VerifyLoginWithPhoneDto, VerifyNewPhoneNumberDto } from "./auth.dto";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly users: Repository<UserEntity>,
		@InjectRepository(UserDiscoverySettingEntity)
		private readonly userDiscoverySetting: Repository<UserDiscoverySettingEntity>,

		private jwtService: JwtService,
		private configService: ConfigService,
		private readonly mailServices: EmailService,
		private smsService: SmsService,
		private stripeService: StripeService,
		private userService: UserService,
	) {}

	async login(user: IUser): Promise<LoginType> {
		return {
			access_token: await this.jwtService.sign(
				{ role: "user", id: user.id, email: user.email, mobile: user.mobile },
				{ expiresIn: "24h" },
			),
			refresh_token: await this.jwtService.sign(
				{ role: "user", id: user.id, email: user.email, mobile: user.mobile },
				{ expiresIn: "28d" },
			),
		};
	}

	async validateUser({ email, password }): Promise<IUser> {
		const user = await this.users.findOne({ where: { email: email } });

		if (!user) throw new BadRequestException("User is not valid");
		const isValidated = await bcrypt.compare(password, user.password);
		if (!isValidated) throw new BadRequestException("Invalid password, try again with valid password");
		const { password: delPass, ...result } = user;
		return result;
	}

	async sentOtpwithPhone(sentOtpWithPhoneBody: SignupDto): Promise<VerificationInstance> {
		const { countryCode, phoneNumber, email } = sentOtpWithPhoneBody;
		const isExitUser = await this.users.findOne({ where: { email: email } });
		if (isExitUser) throw new BadRequestException("Email is already exits!");

		const isExitPhoneNumber = await this.userService.findOne({ countryCode, mobile: phoneNumber });
		if (isExitPhoneNumber) throw new BadRequestException("Phone number is already exits!");

		if (this.configService.get("NODE_ENV") !== "prod") return { to: `+${countryCode}${phoneNumber}` } as any;
		const { error, response } = await this.smsService.sendVerificationOtp(`+${countryCode}${phoneNumber}`);
		if (error)
			throw new BadRequestException("Otp not generated, please try again", {
				cause: new Error(),
				description: error.message,
			});

		return response;
	}

	async createUserInitAccount(loginWithPhone: SignupDto): Promise<UserEntity> {
		const user = await this.users.create({
			countryCode: loginWithPhone.countryCode,
			mobile: loginWithPhone.phoneNumber,
			email: loginWithPhone.email,
			password: loginWithPhone.password,
		});
		const discoverySetting = await this.userDiscoverySetting.create();
		const stripeCustomer = await this.stripeService.createCustomer({
			email: user.email,
			address: { country: "canada", line1: "xyz", line2: "xyz" },
			metadata: { userId: user.id },
		});
		user.stripeUserId = stripeCustomer.id;
		discoverySetting.user = user;
		await this.users.save(user);
		await this.userDiscoverySetting.save(discoverySetting);
		return user;
	}

	async loginWithPhone(loginWithPhoneBody: SignupDto): Promise<VerificationInstance> {
		const { countryCode, phoneNumber } = loginWithPhoneBody;
		let user: IUser | any = { countryCode: countryCode, mobile: phoneNumber };
		const isValidUser = await this.userService.findOne({ countryCode, mobile: phoneNumber });
		if (isValidUser) {
			user = isValidUser;
		}

		if (!user) throw new BadRequestException("User not created, please try again");
		if (this.configService.get("NODE_ENV") !== "prod") return { to: `+${user.countryCode}${user.mobile}` } as any;

		const { error, response } = await this.smsService.sendVerificationOtp(`+${user.countryCode}${user.mobile}`);
		if (error)
			throw new BadRequestException("Otp not generated, please try again", {
				cause: new Error(),
				description: error.message,
			});

		return response;
	}

	async phoneOtpVerify(phoneOtpVerifyBody: VerifyLoginWithPhoneDto): Promise<UserEntity> {
		const { otp, countryCode, phoneNumber } = phoneOtpVerifyBody;

		if (this.configService.get("NODE_ENV") === "prod") {
			const { error } = await this.smsService.verifyPhoneOtp({ phoneNumber: `+${countryCode}${phoneNumber}`, otp });

			if (error)
				throw new BadRequestException("Invalid OTP. please enter valid OTP", {
					cause: new Error(),
					description: error.message,
				});
		}
		let user = await this.userService.findOne({ countryCode, mobile: phoneNumber });
		if (!user) {
			user = await this.createUserInitAccount(phoneOtpVerifyBody);
		}

		user.mobile = phoneNumber;
		user.isValidMobile = true;
		await this.users.save(user);

		return user;
	}

	async updatePhoneNumber(phoneNumberBody: UpdateNewPhoneNumberDto, user: UserEntity): Promise<VerificationInstance> {
		const { countryCode, phoneNumber } = phoneNumberBody;

		const isAlreadyUser = await this.userService.findOne({ mobile: phoneNumber, countryCode: countryCode });
		if (isAlreadyUser)
			throw new BadRequestException("User already exist with this mobile number", {
				cause: new Error(),
			});

		const { error, response } = await this.smsService.sendVerificationOtp(`+${countryCode}${phoneNumber}`);
		if (error)
			throw new BadRequestException(
				`Otp not generated for this mobile number +${countryCode}${phoneNumber}, please try again`,
				{
					cause: new Error(),
				},
			);

		return response;
	}

	async updatePhoneOtpVerify(phoneOtpVerifyBody: VerifyNewPhoneNumberDto, user: UserEntity): Promise<UserEntity> {
		const { otp, phoneNumber, countryCode } = phoneOtpVerifyBody;

		const isAlreadyUser = await this.userService.findOne({ mobile: phoneNumber, countryCode: countryCode });
		if (isAlreadyUser)
			throw new BadRequestException("User already exist with this mobile number", {
				cause: new Error(),
			});

		const { error } = await this.smsService.verifyPhoneOtp({
			phoneNumber: `+${countryCode}${phoneNumber}`,
			otp,
		});
		if (error)
			throw new BadRequestException("Invalid OTP. please enter valid OTP", {
				cause: new Error(),
				description: error.message,
			});

		user.mobile = phoneNumber;
		user.isValidMobile = true;
		await this.users.update({ id: user.id }, user);

		return user;
	}

	async renewAccessToken(refreshToken: string): Promise<LoginType> {
		const { id, mobile } = await this.jwtService.verify(refreshToken);
		const user = await this.users.findOne({ where: { id, mobile } });
		return this.login(user);
	}

	async forgotPassword({ email }): Promise<UserEntity> {
		const user = await this.users.findOne({ where: { email: email } });
		if (!user) throw new BadRequestException("User is not valid");

		const token = await this.jwtService.sign({ id: user.id }, { expiresIn: "20m" });
		await this.mailServices.sendForgotPasswordEmail(user.email, token);
		return user;
	}

	async resetPassword({ password, token }): Promise<UserEntity> {
		try {
			const { id } = await this.jwtService.verifyAsync(token);
			await this.users.update({ id: id }, { password: await bcrypt.hash(password, await bcrypt.genSalt(12)) });
			return;
		} catch (error) {
			throw new BadRequestException("Sorry, Your token expired!");
		}
	}
}

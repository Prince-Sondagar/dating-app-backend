import { BadRequestException, Injectable } from "@nestjs/common";
import axios from "axios";
import * as ejs from "ejs";
import * as path from "path";
import UserEntity from "../database/entities/user.entity";

@Injectable()
export class EmailService {
	async sendEmailWithOTP(to: string, subject: string, message: number): Promise<{ response: string; otp: number }> {
		try {
			const url = process.env.MAILGUN_POST_REQUEST;
			const params = {
				from: process.env.FROM_MAIL,
				to: to,
				subject: subject,
				text: message,
			};

			const auth = {
				username: "api",
				password: process.env.MAILGUN_API_KEY,
			};

			const response: { message: string } = await axios.post(url, null, { params, auth });
			return { response: to, otp: message };
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async sendCompleteOnboardingEmail(user: Partial<UserEntity>) {
		const onboardingUrl = `${process.env.FRONTEND_URL}/onboarding`;
		const url = process.env.MAILGUN_POST_REQUEST;
		const params = {
			from: process.env.FROM_MAIL,
			to: user.email,
			subject: "Complete your onboarding",
			html: await ejs.renderFile(path.resolve(process.cwd(), "views/email/onboarding.ejs"), {
				url: onboardingUrl,
				logo: `${process.env.BACKEND_ASSETS_URL}/logo.png`,
			}),
		};

		const auth = {
			username: "api",
			password: process.env.MAILGUN_API_KEY,
		};
		await axios.post(url, null, { params, auth });
	}

	async sendForgotPasswordEmail(email: string, token:string) {
		try {
			const onboardingUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
			const url = process.env.MAILGUN_POST_REQUEST;
			const params = {
				from: process.env.FROM_MAIL,
				to: email,
				subject: "Reset Password",
				html: await ejs.renderFile(path.resolve(process.cwd(), "views/email/forgot-password.ejs"), {
					url: onboardingUrl,
					logo: `${process.env.BACKEND_ASSETS_URL}/logo.png`,
				}),
			};

			const auth = {
				username: "api",
				password: process.env.MAILGUN_API_KEY,
			};

			await axios.post(url, null, { params, auth });
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
}

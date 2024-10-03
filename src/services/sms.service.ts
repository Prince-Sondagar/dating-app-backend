import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Twilio } from "twilio";
import { VerificationInstance } from "twilio/lib/rest/verify/v2/service/verification";
import { VerificationCheckInstance } from "twilio/lib/rest/verify/v2/service/verificationCheck";

@Injectable()
export default class SmsService {
	private twilioClient: Twilio;

	constructor(private readonly configService: ConfigService) {
		this.twilioClient = new Twilio(configService.get("TWILIO_ACCOUNT_SID"), configService.get("TWILIO_AUTH_TOKEN"));
		// this.twilioClient.verify.v2.services.create({ friendlyName: "DevTradLife" }).then(console.log);
	}

	async sendVerificationOtp(phoneNumber: string): Promise<{ error: Error | null; response: VerificationInstance }> {
		try {
			const response = await this.twilioClient.verify.v2
				.services(this.configService.get("TWILIO_VERIFICATION_SERVICE_SID"))
				.verifications.create({ to: phoneNumber, channel: "sms" });
			return { error: null, response };
		} catch (error) {
			return { error, response: null };
		}
	}

	async verifyPhoneOtp({
		phoneNumber,
		otp,
	}: {
		phoneNumber: string;
		otp: string;
	}): Promise<{ error: Error | null; response: VerificationCheckInstance }> {
		try {
			const response = await this.twilioClient.verify.v2
				.services(this.configService.get("TWILIO_VERIFICATION_SERVICE_SID"))
				.verificationChecks.create({ to: phoneNumber, code: otp });
			if (!response.valid || response.status !== "approved") throw Error("Invalid OTP for this phone number");

			return { error: null, response };
		} catch (error) {
			return { error, response: null };
		}
	}
}

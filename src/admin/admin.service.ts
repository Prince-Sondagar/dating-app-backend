import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { LoginType } from "src/auth/auth-type";
import { AwsService } from "src/aws/aws.service";
import AdminLogsEntity from "src/database/entities/adminLogsEntity.entity";
import PassionEntity from "src/database/entities/passion.entity";
import SubscriptionsEntity from "src/database/entities/subscriptions.entity";
import SuperPassionsEntity from "src/database/entities/superPassions.entity";
import UserEntity from "src/database/entities/user.entity";
import { EmailService } from "src/services/emailSms.service";
import StripeService from "src/services/stripe.service";
import { FindOptionsWhere, Repository } from "typeorm";
import { parse } from "url";
import { v4 as uuidv4 } from "uuid";
import { EmailOtpVerifyBody, SuperPassionsDto, UpdatePassionsDto } from "./admin.dto";

@Injectable()
export class AdminService {
	constructor(
		@InjectRepository(AdminLogsEntity)
		private readonly adminRepository: Repository<AdminLogsEntity>,
		@InjectRepository(UserEntity)
		private readonly users: Repository<UserEntity>,
		@InjectRepository(SuperPassionsEntity)
		private readonly superPassions: Repository<SuperPassionsEntity>,
		@InjectRepository(SubscriptionsEntity)
		private readonly subscriptions: Repository<SubscriptionsEntity>,
		@InjectRepository(PassionEntity)
		private readonly passions: Repository<PassionEntity>,

		private readonly mailService: EmailService,
		private jwtService: JwtService,
		private awsService: AwsService,
		private readonly stripeClient: StripeService,
	) {}

	async login(user: any): Promise<LoginType> {
		return {
			access_token: await this.jwtService.sign({ role: "admin", id: user.id, email: user.email }, { expiresIn: "24h" }),
			refresh_token: await this.jwtService.sign(
				{ role: "admin", id: user.id, email: user.email },
				{ expiresIn: "28d" },
			),
		};
	}

	async loginWithEmailOtp(email: string) {
		try {
			const matchEmail = process.env.ADMINS?.split(",")?.includes(email);
			console.log("matchEmail", process.env.ADMINS?.split(","), matchEmail);
			if (!matchEmail) {
				throw new Error("Please check your Email");
			}
			const subject = "One-Time-Password";
			const message = Math.floor(100000 + Math.random() * 900000);
			const { response, otp }: any = await this.mailService.sendEmailWithOTP(email, subject, message);

			const logoutUser = await this.adminRepository.findOne({ where: { email: response } });

			if (logoutUser) {
				logoutUser.deletedAt = new Date();
				await this.adminRepository.save(logoutUser);
			}

			const createUser = await this.adminRepository.create({
				id: uuidv4(),
				email: response,
				otp: otp,
			});

			await this.adminRepository.save(createUser);
			return createUser;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async verifyUserEmailOTP(emailOtpVerifyBody: EmailOtpVerifyBody): Promise<{ error: Error | null; response: any }> {
		try {
			const { email, otp } = emailOtpVerifyBody;
			const checkAvailableUser = await this.adminRepository.findOne({
				where: { email: email, deletedAt: null },
				order: { createdAt: "DESC" },
			});

			if (!checkAvailableUser) {
				throw new Error("User Not Available");
			}

			const updatedDate: Date = new Date(checkAvailableUser?.updatedAt);
			const currentDate: Date = new Date();
			const timeDifferenceInMilliseconds: number = currentDate.getTime() - updatedDate.getTime();
			const timeDifferenceInMinutes: number = Math.floor(timeDifferenceInMilliseconds / (1000 * 60));

			if (timeDifferenceInMinutes >= 5) {
				throw new BadRequestException("Your OTP Is Invalid. Please Generate New OTP");
			}

			if (checkAvailableUser?.otp !== Number(otp)) {
				throw new BadRequestException("please Check Your OTP");
			}

			if (checkAvailableUser?.otp === Number(otp)) {
				return { error: null, response: checkAvailableUser };
			}
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async fetchAllUsersDetails() {
		try {
			const query = await this.users
				.createQueryBuilder("user")
				.leftJoinAndSelect("user.profileMedias", "profileMedia")
				.leftJoinAndSelect("user.passions", "passions")
				.leftJoinAndSelect("user.lookingFor", "lookingFor")
				.leftJoinAndSelect("user.connectedAccount", "connectedAccount")
				.getMany();

			return query;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async deleteUser(id) {
		try {
			const existingRecord = await this.users.findOne({ where: { id: id } });
			if (existingRecord) {
				await this.users.createQueryBuilder().delete().from("user_passions").where("userId = :id", { id }).execute();
				await this.users.createQueryBuilder().delete().from("userDiscoverySetting").where("userId = :id", { id }).execute();
				const deleteuser = await this.users.delete({ id: id });
				return deleteuser;
			}
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async fetchAllSuperPassions() {
		try {
			const groupByPassionsData = await this.superPassions
				.createQueryBuilder("superPassions")
				.leftJoinAndSelect("superPassions.subPassions", "subPassions")
				.getMany();

			return groupByPassionsData;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
	async findBy(where: FindOptionsWhere<PassionEntity>): Promise<PassionEntity[]> {
		const passion: PassionEntity[] = await this.passions.findBy(where);
		return passion ?? [];
	}

	async createNewSuperPassions(files, createPassions: SuperPassionsDto): Promise<void> {
		try {
			const { description, isDisplay, subPassions, superPassion, type } = createPassions;
			const image = files?.image?.[0]?.location;
			const newSuperPassion = await this.superPassions.create({
				superPassion: superPassion,
				type: type,
				description: description,
				isDisplay: isDisplay,
				image: image,
				subPassions: await this.passions
					.createQueryBuilder("passions")
					.where("passions.passion IN (:...subPassions)", { subPassions: subPassions })
					.getMany(),
			});

			await this.superPassions.save(newSuperPassion);
		} catch (error) {
			throw new BadRequestException("Failed to create a new super passion");
		}
	}

	async updateNewSuperPassions(id: string, updatePassions: UpdatePassionsDto, files) {
		try {
			const { description, isDisplay, subPassions, superPassion, type } = updatePassions;

			const findSuperPassions = await this.superPassions.findOne({ where: { id: id } });
			const image = files?.image?.[0]?.location;
			if (findSuperPassions) {
				findSuperPassions.description = description || findSuperPassions.description;
				findSuperPassions.isDisplay = isDisplay !== null ? isDisplay : findSuperPassions.isDisplay;
				findSuperPassions.superPassion = superPassion || findSuperPassions.superPassion;
				findSuperPassions.type = type || findSuperPassions.type;

				if (image) {
					await this.deleteImageFromS3(findSuperPassions?.image);
				}
				findSuperPassions.image = image || findSuperPassions.image;

				if (subPassions) {
					const passions = await this.passions
						.createQueryBuilder("passions")
						.where("passions.passion IN (:...subPassions)", { subPassions: subPassions })
						.getMany();

					findSuperPassions.subPassions = passions;
				}

				await this.superPassions.save(findSuperPassions);
			}
		} catch (error) {
			throw new BadRequestException("Failed to update a new super passion");
		}
	}

	async deletePassions(id: string) {
		try {
			const existingRecord = await this.superPassions.findOne({ where: { id: id } });
			if (existingRecord) {
				const deleteSuperPassions = await this.superPassions.delete(id);
				await this.deleteImageFromS3(existingRecord?.image);
				return deleteSuperPassions;
			}
		} catch (error) {
			throw new BadRequestException("Failed to Delete a new super passion");
		}
	}

	async deleteImageFromS3(imageUrl: string) {
		await this.awsService.removeObjectFromS3(parse(imageUrl).path.replace("/", ""));
	}

	async getAllUsersSubscriptions() {
		try {
			const query = await this.users
				.createQueryBuilder("user")
				.leftJoinAndSelect("user.profileMedias", "profileMedia")
				.leftJoinAndSelect("user.discoverySetting", "discoverySetting")
				.getMany();

			const subScriptionId = query?.map((subscription) => subscription?.subscriptionId).filter((id) => id !== "");
			if (subScriptionId?.length) {
				const subScriptionQuery = await this.subscriptions
					.createQueryBuilder("subscription")
					.where("subscription.id IN (:...ids)", { ids: subScriptionId })
					.getMany();

				const subScriptionQueryWithUserId = subScriptionQuery.map((subscription) => {
					const user = query.find((user) => user.subscriptionId === subscription.id);
					return { ...subscription, user };
				});
				return subScriptionQueryWithUserId || [];
			}
			return [];
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async getUsersData({ time }) {
		try {
			const currentDate = new Date();
			const twelveHoursAgo = new Date(currentDate.getTime() - 12 * 60 * 60 * 1000);
			const users = await this.users.find({});

			const getHourlyCount = (array, key) =>
				Array.from({ length: 12 }, (_, i) => {
					const hourStart = new Date(twelveHoursAgo.getTime() + i * 60 * 60 * 1000);
					const hourEnd = new Date(twelveHoursAgo.getTime() + (i + 1) * 60 * 60 * 1000);
					return array.filter((item) => item[key] >= hourStart && item[key] < hourEnd).length;
				}).reverse();

			const getWeeklyCount = (array, key) =>
				Array.from({ length: 7 }, (_, i) => {
					const dayStart = new Date(
						currentDate.getFullYear(),
						currentDate.getMonth(),
						currentDate.getDate() - i,
						0,
						0,
						0,
					);
					const dayEnd = new Date(
						currentDate.getFullYear(),
						currentDate.getMonth(),
						currentDate.getDate() - i + 1,
						0,
						0,
						0,
					);
					return array.filter((item) => item[key] >= dayStart && item[key] < dayEnd).length;
				}).reverse();

			const getLastMonthCount = (array, key) =>
				Array.from({ length: 30 }, (_, i) => {
					const dayStart = new Date(currentDate.getTime() - (i + 1) * 24 * 60 * 60 * 1000);
					const dayEnd = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
					return array.filter((item) => item[key] >= dayStart && item[key] < dayEnd).length;
				}).reverse();

			const getLastYearCount = (array, key) =>
				Array.from({ length: 12 }, (_, i) => {
					const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1, 0, 0, 0);
					const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1, 0, 0, 0);
					return array.filter((item) => item[key] >= monthStart && item[key] < monthEnd).length;
				}).reverse();

			let hourlyCountsOfUsers;

			if (time === "today") {
				hourlyCountsOfUsers = getHourlyCount(users, "createdAt");
			} else if (time === "last7day") {
				hourlyCountsOfUsers = getWeeklyCount(users, "createdAt");
			} else if (time === "last30day") {
				hourlyCountsOfUsers = getLastMonthCount(users, "createdAt");
			} else if (time === "lastyear") {
				hourlyCountsOfUsers = getLastYearCount(users, "createdAt");
			}

			return hourlyCountsOfUsers;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async getSubscriptionData({ time }) {
		try {
			const currentDate = new Date();
			const allUser = await this.users.find({});
			const twelveHoursAgo = new Date(currentDate.getTime() - 12 * 60 * 60 * 1000);

			const subScriptionId = allUser.map((subscription) => subscription?.subscriptionId).filter((id) => id !== "");
			if (subScriptionId?.length > 0) {
				const subScriptionQuery = await this.subscriptions
					.createQueryBuilder("subscription")
					.where("subscription.id IN (:...ids)", { ids: subScriptionId })
					.getMany();

				const subScriptionQueryWithUserId = await Promise.all(
					subScriptionQuery.map(async (subscription) => {
						const user = allUser?.find((user) => user.subscriptionId === subscription.id);
						const stripeSubscription = await this.stripeClient.getSubscription(user?.stripeSubscriptionId);
						return { ...subscription, startDate: stripeSubscription?.start_date, user };
					}),
				);

				const getHourlyCount = (array) =>
					Array.from({ length: 12 }, (_, i) => {
						const hourStart = new Date(twelveHoursAgo.getTime() + i * 60 * 60 * 1000);
						const hourEnd = new Date(twelveHoursAgo.getTime() + (i + 1) * 60 * 60 * 1000);
						return array.filter((item) => {
							const startDate = new Date(new Date(item?.startDate * 1000).toISOString());
							return startDate >= hourStart && startDate < hourEnd;
						}).length;
					}).reverse();

				const getWeeklyCount = (array) =>
					Array.from({ length: 7 }, (_, i) => {
						const currentDate = new Date();
						const dayStart = new Date(
							currentDate.getFullYear(),
							currentDate.getMonth(),
							currentDate.getDate() - i,
							0,
							0,
							0,
						);
						const dayEnd = new Date(
							currentDate.getFullYear(),
							currentDate.getMonth(),
							currentDate.getDate() - i + 1,
							0,
							0,
							0,
						);
						return array.filter((item) => {
							const startDate = new Date(new Date(item?.startDate * 1000).toISOString());
							return startDate >= dayStart && startDate < dayEnd;
						}).length;
					}).reverse();

				const getMonthlyCount = (array) =>
					Array.from({ length: 30 }, (_, i) => {
						const currentDate = new Date();
						const dayStart = new Date(
							currentDate.getFullYear(),
							currentDate.getMonth(),
							currentDate.getDate() - i,
							0,
							0,
							0,
						);
						const dayEnd = new Date(
							currentDate.getFullYear(),
							currentDate.getMonth(),
							currentDate.getDate() - i + 1,
							0,
							0,
							0,
						);
						return array.filter((item) => {
							const startDate = new Date(new Date(item?.startDate * 1000).toISOString());
							return startDate >= dayStart && startDate < dayEnd;
						}).length;
					}).reverse();

				const getYearlyCount = (array) =>
					Array.from({ length: 12 }, (_, i) => {
						const currentDate = new Date();
						const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1, 0, 0, 0);
						const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1, 0, 0, 0);
						return array.filter((item) => {
							const startDate = new Date(new Date(item?.startDate * 1000).toISOString());
							return startDate >= monthStart && startDate < monthEnd;
						}).length;
					}).reverse();

				let hourlyCountsOfUsers;

				if (time === "today") {
					hourlyCountsOfUsers = getHourlyCount(subScriptionQueryWithUserId);
				} else if (time === "last7day") {
					hourlyCountsOfUsers = getWeeklyCount(subScriptionQueryWithUserId);
				} else if (time === "last30day") {
					hourlyCountsOfUsers = getMonthlyCount(subScriptionQueryWithUserId);
				} else if (time === "lastyear") {
					hourlyCountsOfUsers = getYearlyCount(subScriptionQueryWithUserId);
				}

				return hourlyCountsOfUsers;
			}
			return [];
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async getSubscriptions() {
		try {
			const subScriptionQuery = await this.subscriptions.createQueryBuilder("subscription").getMany();

			const groupedData = subScriptionQuery?.reduce((groups, item) => {
				const { type } = item;
				if (!groups[type]) {
					groups[type] = [];
				}
				groups[type].push(item);
				return groups;
			}, {});

			return groupedData;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async logoutUser(user) {
		try {
			const logoutUser = await this.adminRepository.findOne({ where: { id: user.id } });

			if (logoutUser) {
				logoutUser.deletedAt = new Date();
				await this.adminRepository.save(logoutUser);
			} else {
				throw new BadRequestException("User not found");
			}
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}
	async renewAccessToken(refreshToken: string): Promise<LoginType> {
		const { id } = await this.jwtService.verify(refreshToken);
		const user = await this.adminRepository.findOne({ where: { id } });
		return this.login(user);
	}
}

import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import * as tf from "@tensorflow/tfjs-node";
import * as faceapi from "@vladmandic/face-api/dist/face-api.node.js";
import fetch from "node-fetch-polyfill";
import { join } from "path";
import { AwsService } from "src/aws/aws.service";
import { SubscriptionsEnum } from "src/database/entities/subscriptions.entity";
import SuperPassionsEntity from "src/database/entities/superPassions.entity";
import UserEntity from "src/database/entities/user.entity";
import UserDiscoverySettingEntity from "src/database/entities/userDiscoverySetting.entity";
import { LanguageService } from "src/language/language.service";
import { LookingForService } from "src/lookingFor/lookingFor.service";
import { PassionService } from "src/passion/passion.service";
import { ProfileMediaService } from "src/profileMedia/profileMedia.service";
import StripeService from "src/services/stripe.service";
import SubscriptionService from "src/subscriptions/subscription.service";
import { UsersInterestService } from "src/usersInterest/usersInterest.service";
import { getAgeBasedOnDate, getFullAddressFromLocation, isNullOrUndefined } from "src/utils/helperFunctions";
import { FindOptionsSelect, FindOptionsWhere, In, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { parse } from "url";
import { UpdateUserDiscoverySettingDto, UpdateUserDto } from "./user.dto";
import { IUser } from "./user.type";
@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly users: Repository<UserEntity>,
		@InjectRepository(UserDiscoverySettingEntity)
		private readonly userDiscoverySetting: Repository<UserDiscoverySettingEntity>,
		@InjectRepository(SuperPassionsEntity)
		private readonly superPassions: Repository<SuperPassionsEntity>,

		@Inject(forwardRef(() => UsersInterestService))
		private usersInterestService: UsersInterestService,
		@Inject(forwardRef(() => SubscriptionService))
		private subscriptionService: SubscriptionService,
		private passionService: PassionService,
		private lookingForService: LookingForService,
		private awsService: AwsService,
		private stripeService: StripeService,
		private languageService: LanguageService,
		private profileMediaService: ProfileMediaService,
		private configService: ConfigService,
	) {}

	async findByEmail(email: string) {
		const user = await this.users.findOne({ where: { email } });
		return user || null;
	}

	async findOne(requestedUser: FindOptionsWhere<UserEntity>, selectedAttr?: FindOptionsSelect<UserEntity>) {
		const user = await this.users.findOne({ where: requestedUser, ...(selectedAttr ? { select: selectedAttr } : {}) });
		return user || null;
	}

	findById(id: string) {
		return this.users.findOne({ where: { id } });
	}

	async find(where: FindOptionsWhere<UserEntity>): Promise<UserEntity[]> {
		const users: UserEntity[] = await this.users.findBy(where);
		return users ?? [];
	}

	async updateOne(
		requestedUser: FindOptionsWhere<UserEntity>,
		updatedUserData: Partial<UserEntity>,
	): Promise<UserEntity | null> {
		const user = await this.users.findOne({ where: requestedUser });

		if (!user) {
			return null;
		}
		const updatedUser = await this.users.save({ ...user, ...updatedUserData });
		return updatedUser;
	}

	async findNearbyUsers(user: IUser, passionId: string, limit: number): Promise<any[]> {
		try {
			const { latLong, id, showMe, recentlyActive, distanceType } = user;
			const userDiscoverySetting = await this.userDiscoverySetting.findOne({ where: { user: { id } } });
			const { agePref, agePrefShowOnlyThisRange, distancePref, distancePrefShowOnlyThisRange, global, showMeOnApp } =
				userDiscoverySetting;

			const userIntrustedProfile = await this.usersInterestService.find({
				where: { user: { id } },
				relations: ["interestedUser"],
			});
			const getUserInterestIds = userIntrustedProfile.map((userInterest) => userInterest.interestedUser.id);

			if (latLong.length) {
				const query = this.users
					.createQueryBuilder("user")
					.leftJoinAndSelect("user.profileMedias", "profileMedia")
					.leftJoinAndSelect("user.passions", "passions")
					.leftJoinAndSelect("user.lookingFor", "lookingFor")
					.leftJoinAndSelect("user.connectedAccount", "connectedAccount")
					.addSelect(`ST_DistanceSphere(user.location, ST_MakePoint(${latLong[1]}, ${latLong[0]}))`, "distance");

				if (passionId) {
					const groupByPassionsData = await this.superPassions
						.createQueryBuilder("superPassions")
						.leftJoinAndSelect("superPassions.subPassions", "subPassions")
						.where("superPassions.id = :id", { id: passionId })
						.select(["superPassions.id", "subPassions.id"])
						.getOne();

					const subPassionIds = groupByPassionsData?.subPassions.map((subPassion) => subPassion.id);

					query
						.where(`passions.id IN (:...ids)`, { ids: subPassionIds })
						.andWhere("user.id != :userId", { userId: id })
						.andWhere(
							`ST_DistanceSphere(user.location, ST_MakePoint(${latLong[1]}, ${latLong[0]})) <= ${
								distancePrefShowOnlyThisRange
									? distanceType === "miles"
										? distancePref * 1600
										: distancePref * 1000
									: 200000000
							}`,
						);
				} else {
					query
						.where((qb) => {
							qb.andWhere("user.id != :userId", { userId: id });
							if (getUserInterestIds.length)
								qb.andWhere("user.id NOT IN (:...getUserInterestIds)", {
									getUserInterestIds: getUserInterestIds,
								});
							if (agePrefShowOnlyThisRange)
								qb.andWhere("user.age BETWEEN :minAge AND :maxAge", {
									minAge: agePref[0],
									maxAge: agePref[1],
								});
							if (showMe !== "everyone")
								qb.andWhere("user.gender = :showMe", {
									showMe,
								});
							if (recentlyActive) {
								qb.andWhere("user.isActive = :isActive", {
									isActive: true,
								});
							}
						})
						.orderBy("distance")
						.addOrderBy("user.profileBoostDate", "DESC")
						.limit(+limit);
				}

				const resultWithRaw = await query.getRawMany();
				const result = await query.getMany();

				const allUserProfiles = result.map((profile) => {
					const {
						id,
						firstname,
						lastname,
						bio,
						aboutMe,
						avatar,
						gender,
						isVerified,
						isActive,
						age,
						school,
						job,
						passions,
						profileMedias,
						lookingFor,
						connectedAccount,
					} = profile;

					const findUser = resultWithRaw.find((user) => user.user_id == id);
					return {
						id,
						firstname,
						lastname,
						bio,
						aboutMe,
						avatar,
						gender,
						isVerified,
						isActive,
						age,
						school,
						job,
						passions,
						profileMedias,
						lookingFor,
						connectedAccount,
						distance: findUser?.distance / 1000 ?? 0,
					};
				});

				return allUserProfiles;
			}
			return [];
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async fetchUserSuperPassions() {
		try {
			const user = await this.users.createQueryBuilder("user").leftJoinAndSelect("user.passions", "passion").getOne();

			const passionsId = user.passions?.map((passion) => passion?.id) || [];

			if (passionsId?.length) {
				const groupByPassionsData = await this.superPassions
					.createQueryBuilder("superPassions")
					.leftJoinAndSelect("superPassions.subPassions", "subPassions")
					.where("subPassions.id IN (:...ids)", { ids: passionsId })
					.andWhere("superPassions.type IN (:...types)", { types: ["discover", "passion"] })
					.getMany();

				let userSuperVibePassions = groupByPassionsData.filter((item) => item?.type === "discover") || [];
				let userSuperFroYouPassions = groupByPassionsData.filter((item) => item?.type === "passion") || [];

				if (!userSuperVibePassions.length) {
					userSuperVibePassions = await this.superPassions.find({
						where: { type: "discover", isDisplay: true },
						take: 4,
					});
				}

				if (!userSuperFroYouPassions.length) {
					userSuperFroYouPassions = await this.superPassions.find({
						where: { type: "passion", isDisplay: true },
						take: 6,
					});
				}

				const discoverPassions = {
					myVibe: [...userSuperVibePassions],
					forYou: [...userSuperFroYouPassions],
				};

				return discoverPassions;
			}
			return [];
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async getUserProgress(user: IUser) {
		const { id } = user;
		const userDiscovery = await this.userDiscoverySetting.findOne({ where: { user: { id } } });

		let isCompleted = 0;

		const { aboutMe, passions, lookingFor, job, company, school, location, isVerified } = user;
		const {
			relationShipType,
			zodiacSign,
			educationLevel,
			communicationStyle,
			childrens,
			personalityType,
			receiveLove,
			vaccinated,
			dietaryPreference,
			drinking,
			pets,
			sleepingHabits,
			smoking,
			socialMedia,
			workout,
		} = userDiscovery;

		isCompleted += aboutMe ? 22 : 0;
		isCompleted += isVerified ? 20 : 0;
		isCompleted += passions ? 15 : 0;
		isCompleted += lookingFor ? 3 : 0;
		isCompleted += job ? 3 : 0;
		isCompleted += company ? 3 : 0;
		isCompleted += school ? 3 : 0;
		isCompleted += location ? 3 : 0;
		isCompleted += relationShipType ? 3 : 0;
		isCompleted +=
			zodiacSign || educationLevel || communicationStyle || childrens || personalityType || receiveLove || vaccinated
				? 3
				: 0;
		isCompleted += dietaryPreference || drinking || pets || sleepingHabits || smoking || socialMedia || workout ? 3 : 0;

		return isCompleted;
	}

	async updateUser(files, user: IUser, updateUserBody: UpdateUserDto): Promise<UserEntity> {
		try {
			const {
				firstname,
				lastname,
				bio,
				email,
				aboutMe,
				isSmartPhoto,
				birthdate,
				gender,
				showMeOnApp,
				showMe,
				showMyGenderOnProfile,
				city,
				state,
				country,
				latLong,
				isActive,
				lastActive,
				isCompOnboarding,
				profileCompPer,
				passions,
				userLanguages,
				lookingFor,
				showMyAge,
				job,
				school,
				company,
				darkMode,
				showMyDistance,
				balancedRecommendations,
				recentlyActive,
				standard,
				onlyPeopleLiked,
				distanceType,
			} = updateUserBody;

			const { id, subscriptionId } = user;
			const profileImages = files?.profileImages;

			const subscription = subscriptionId ? await this.subscriptionService.findOneById(subscriptionId) : undefined;

			if (profileImages?.length) {
				const profileMediaRecord = profileImages.map((file) => ({ url: `${file.location}`, user }));
				await this.profileMediaService.saveProfileMedias(profileMediaRecord);
			}
			if (firstname || lastname || email)
				await this.stripeService.updateCustomer(user.stripeUserId, {
					...(firstname || lastname ? { name: `${firstname || user.firstname} ${lastname || user.lastname}` } : {}),
					...(email ? { email } : {}),
				});
			if ((showMyAge || showMyDistance) && !user?.subscriptionId && subscription?.type !== SubscriptionsEnum.PLUS) {
				throw new Error("Please Purchase Plus Subscription!");
			}

			if (
				(balancedRecommendations || recentlyActive || standard || onlyPeopleLiked) &&
				subscription?.type !== SubscriptionsEnum.PLUS
			) {
				throw new Error("Please Purchase Plus Subscription!");
			}
			const selectedPassions = Array.isArray(passions) ? passions : [passions];
			const updatedUser = await this.updateOne(
				{ id },
				{
					...(firstname ? { firstname } : {}),
					...(lastname ? { lastname } : {}),
					...(email ? { email, isVerified: false } : {}),
					...(bio ? { bio } : {}),
					...(aboutMe ? { aboutMe } : {}),
					...(darkMode ? { darkMode } : {}),
					...(isSmartPhoto ? { isSmartPhoto } : {}),
					...(birthdate
						? { birthdate: new Date(birthdate).toISOString(), age: getAgeBasedOnDate(new Date(birthdate)) }
						: {}),
					...(gender ? { gender } : {}),
					...(showMeOnApp ? { showMeOnApp } : {}),
					...(showMe ? { showMe } : {}),
					...(showMyGenderOnProfile ? { showMyGenderOnProfile } : {}),
					...(city ? { city } : {}),
					...(job ? { job } : {}),
					...(school ? { school } : {}),
					...(company ? { company } : {}),
					...(profileCompPer ? { profileCompPer } : {}),
					...(state ? { state } : {}),
					...(country ? { country } : {}),
					...(showMyAge ? { showMyAge } : {}),
					...(showMyDistance ? { showMyDistance } : {}),
					...(latLong ? { latLong } : {}),
					...(balancedRecommendations ? { balancedRecommendations } : {}),
					...(recentlyActive ? { recentlyActive } : {}),
					...(standard ? { standard } : {}),
					...(onlyPeopleLiked ? { onlyPeopleLiked } : {}),
					...(distanceType ? { distanceType } : {}),
					...(isActive ? { isActive } : {}),
					...(lastActive ? { lastActive } : {}),
					...(isCompOnboarding ? { isCompOnboarding } : {}),
					...(latLong ? { location: { type: "Point", coordinates: [latLong[1], latLong[0]] } } : {}),
					...(passions
						? { passions: await this.passionService.findBy({ id: In(selectedPassions) }) }
						: { passions: [] }),
					...(userLanguages?.length
						? { userLanguages: await this.languageService.findBy({ id: In(userLanguages) }) }
						: {}),
					...(lookingFor ? { lookingFor: await this.lookingForService.findOne({ id: lookingFor }) } : {}),
				},
			);

			return updatedUser;
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async faceDetect(file): Promise<faceapi.FaceDetection[]> {
		return new Promise(async (res, rej) => {
			try {
				await tf.setBackend("tensorflow");
				await tf.enableProdMode();
				await tf.ENV.set("DEBUG", false);
				await tf.ready();
				const decoded = tf.node.decodeImage(file);
				const casted = decoded.toFloat();
				const tensor = casted.expandDims(0);
				decoded.dispose();
				casted.dispose();
				await faceapi.nets.ssdMobilenetv1.loadFromDisk(join(__dirname, "../", "utils/", "models/"));
				const optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.7 });
				await faceapi
					.detectAllFaces(tensor as any, optionsSSDMobileNet)
					.then((detections: faceapi.FaceDetection[]) => {
						res(detections);
						return detections;
					})
					.catch((error: any) => {
						rej(error.message || "Something is wrong!");
					});
				tensor.dispose();
			} catch (error: any) {
				rej(error.message || "Something is wrong!");
			}
		});
	}

	async maskUserVerified(user: UserEntity) {
		try {
			const detections = await this.faceDetect(await fetch(user.avatar).then((res) => res.blob()));
			if (!detections.length) throw Error("Provided image have a no user face, please provide correct user image.");
			if (detections.length && detections.length > 1)
				throw Error("Provided image have multiple user faces, please provide correct user image.");
			user.isVerified = true;
			await this.users.save(user);
		} catch (error) {
			// await this.awsService.removeObjectFromS3(parse(avatar).path.replace("/", ""));
			throw new BadRequestException(error.message);
		}
	}

	async removeUploadedFiles(avatar: any) {
		await this.awsService.removeObjectFromS3(parse(avatar.location).path.replace("/", ""));
	}

	async updateDiscoverySetting(
		user: UserEntity,
		updateDiscoverySettingBody: UpdateUserDiscoverySettingDto,
	): Promise<UserDiscoverySettingEntity> {
		try {
			const {
				agePref,
				agePrefShowOnlyThisRange,
				distancePref,
				distancePrefShowOnlyThisRange,
				latLong,
				showMeOnApp,
				global,
				zodiacSign,
				educationLevel,
				communicationStyle,
				childrens,
				personalityType,
				receiveLove,
				vaccinated,
				dietaryPreference,
				drinking,
				pets,
				sleepingHabits,
				smoking,
				socialMedia,
				workout,
				relationShipType,
			} = updateDiscoverySettingBody;
			console.log("relationShipType", updateDiscoverySettingBody);
			let discoverySetting = await this.userDiscoverySetting.findOneBy({ user: { id: user.id } });
			if (latLong) {
				await this.updateOne(
					{ id: user.id },
					{ latLong, location: { type: "Point", coordinates: [latLong[1], latLong[0]] } },
				);
			}
			discoverySetting = {
				...discoverySetting,
				...(agePref ? { agePref } : {}),
				...(!isNullOrUndefined(agePrefShowOnlyThisRange) ? { agePrefShowOnlyThisRange } : {}),
				...(distancePref ? { distancePref } : {}),
				...(!isNullOrUndefined(distancePrefShowOnlyThisRange) ? { distancePrefShowOnlyThisRange } : {}),
				...(!isNullOrUndefined(showMeOnApp) ? { showMeOnApp } : {}),
				...(!isNullOrUndefined(global) ? { global } : {}),
				...(zodiacSign
					? { zodiacSign }
					: { zodiacSign: (zodiacSign as string) === "" ? null : discoverySetting?.zodiacSign }),
				...(educationLevel
					? { educationLevel }
					: { educationLevel: (educationLevel as string) === "" ? null : discoverySetting?.educationLevel }),
				...(communicationStyle
					? { communicationStyle }
					: {
							communicationStyle: (communicationStyle as string) === "" ? null : discoverySetting?.communicationStyle,
					  }),
				...(childrens
					? { childrens }
					: { childrens: (childrens as string) === "" ? null : discoverySetting?.childrens }),
				...(personalityType
					? { personalityType }
					: { personalityType: (personalityType as string) === "" ? null : discoverySetting?.personalityType }),
				...(receiveLove
					? { receiveLove }
					: { receiveLove: (receiveLove as string) === "" ? null : discoverySetting?.receiveLove }),
				...(vaccinated
					? { vaccinated }
					: { vaccinated: (vaccinated as string) === "" ? null : discoverySetting?.vaccinated }),
				...(dietaryPreference
					? { dietaryPreference }
					: { dietaryPreference: (dietaryPreference as string) === "" ? null : discoverySetting?.dietaryPreference }),
				...(drinking ? { drinking } : { drinking: (drinking as string) === "" ? null : discoverySetting?.drinking }),
				...(pets ? { pets } : { pets: (pets as string) === "" ? null : discoverySetting?.pets }),
				...(sleepingHabits
					? { sleepingHabits }
					: { sleepingHabits: (sleepingHabits as string) === "" ? null : discoverySetting?.sleepingHabits }),
				...(smoking ? { smoking } : { smoking: (smoking as string) === "" ? null : discoverySetting?.smoking }),
				...(socialMedia
					? { socialMedia }
					: { socialMedia: (socialMedia as string) === "" ? null : discoverySetting?.socialMedia }),
				...(workout ? { workout } : { workout: (workout as string) === "" ? null : discoverySetting?.workout }),
				...(relationShipType
					? { relationShipType }
					: { relationShipType: !relationShipType?.length ? discoverySetting?.relationShipType : [] }),
				...(latLong ? { location: { type: "Point", coordinates: [latLong[1], latLong[0]] } } : {}),
			};

			return await this.userDiscoverySetting.save(discoverySetting);
		} catch (error) {
			throw new BadRequestException(error.message);
		}
	}

	async getDiscoverySetting(user: IUser) {
		const { id } = user;
		const userDiscovery = await this.userDiscoverySetting.findOne({ where: { user: { id } } });

		if (userDiscovery) {
			const { createdAt, updatedAt, deletedAt, ...restUserDiscovery } = userDiscovery;
			const location: any = restUserDiscovery.location;
			const isCompleted = await this.getUserProgress(user);
			let locationData = location;
			if (location) {
				const { data } = await getFullAddressFromLocation(
					this.configService.get("GOOGLE_GEO_LOCATION_APIKEY"),
					location?.coordinates[1],
					location?.coordinates[0],
				);

				locationData = data?.["results"]?.[0]?.["formatted_address"];
			}

			return { ...restUserDiscovery, location: locationData, isCompleted: isCompleted };
		}

		return null;
	}

	async updateUsers(where: FindOptionsWhere<UserEntity>, request: QueryDeepPartialEntity<UserEntity>) {
		const updatedUsers = await this.users.update(where, request);
		return updatedUsers;
	}

	saveUser(user: UserEntity) {
		return this.users.save(user);
	}

	async sendCompleteOnboardingEmail(send: (user: Partial<UserEntity>) => void) {
		const users = await this.users.find({ where: { isCompOnboarding: false } });
		for (const user of users) {
			try {
				await send(user);
			} catch {}
		}
	}
}

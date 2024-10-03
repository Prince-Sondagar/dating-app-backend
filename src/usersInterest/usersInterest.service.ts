import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SubscriptionsEnum } from "src/database/entities/subscriptions.entity";
import UsersInterestProfileEntity from "src/database/entities/usersInterest.entity";
import { MessageThreadReasonEnum } from "src/database/entities/usersMessageThread.entity";
import { InterestStatusENUM } from "src/database/types/users-interest";
import { MessageService } from "src/message/message.service";
import SubscriptionService from "src/subscriptions/subscription.service";
import { UserService } from "src/user/user.service";
import { IUser } from "src/user/user.type";
import { addMinuteInDate, blurImageFromUrl } from "src/utils/helperFunctions";
import { DeleteResult, FindManyOptions, FindOneOptions, FindOptionsWhere, Repository } from "typeorm";
import { MatchesQueryDto, UsersInterestDto } from "./usersInterest.dto";

@Injectable()
export class UsersInterestService {
	constructor(
		@InjectRepository(UsersInterestProfileEntity)
		private readonly usersInterest: Repository<UsersInterestProfileEntity>,

		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subscriptionService: SubscriptionService,
		private readonly messagesService: MessageService,
	) {}

	async delete(criteria: FindOptionsWhere<UsersInterestProfileEntity>): Promise<DeleteResult | null> {
		const deletedUsersInterest = await this.usersInterest.delete(criteria);
		return deletedUsersInterest || null;
	}

	async findOne(options: FindOneOptions<UsersInterestProfileEntity>): Promise<UsersInterestProfileEntity> {
		const usersInterest = await this.usersInterest.findOne(options);
		return usersInterest || null;
	}

	async find(options?: FindManyOptions<UsersInterestProfileEntity>): Promise<UsersInterestProfileEntity[]> {
		const findUserInterest = await this.usersInterest.find(options);
		return findUserInterest || [];
	}

	async likeUserInterest(user: IUser, userInterestBody: UsersInterestDto, status) {
		const { interestedUser } = userInterestBody;
		const { id } = user;
		if (interestedUser == id) throw new BadRequestException("You can not show an interest in yourself");

		const interestUser = await this.userService.findOne({ id: interestedUser });
		if (!interestUser) throw new BadRequestException("Interested user not found!!");

		const usersInterest = await this.usersInterest.create({
			interestedUser: interestUser,
			status,
			user,
		});
		const savedUserInterest = await this.usersInterest.save(usersInterest);

		const checkMatch = await this.findOne({
			where: { interestedUser: { id: user.id }, user: { id: interestUser.id }, status: InterestStatusENUM["LIKED"] },
		});
		let result;
		if (checkMatch) {
			result = await this.messagesService.createMessageThread([
				{
					userSender: user,
					userReceiver: interestUser,
					reason: MessageThreadReasonEnum.MATCH,
				},
			]);
		}
		return { ...savedUserInterest, threadId: result[0]?.id, isMatch: checkMatch ? true : false };
	}

	async superLikeUserInterest(user: IUser, userInterestBody: UsersInterestDto, status) {
		const { interestedUser } = userInterestBody;
		const { id, superLikes } = user;
		const interestUser = await this.userService.findOne({ id: interestedUser });

		if (interestedUser == id) throw new BadRequestException("You can not show an interest in yourself");
		if (!superLikes) throw new BadRequestException("You have not any super like!! Please purchase subscription");
		if (!interestUser) throw new BadRequestException("Interested user not found!!");

		const usersInterest = await this.usersInterest.create({
			interestedUser: interestUser,
			status,
			user,
		});

		const savedUserInterest = await this.usersInterest.save(usersInterest);
		// handle another features of super like // Notification
		await this.userService.updateOne({ id }, { superLikes: superLikes - 1 });
		return savedUserInterest;
	}

	async rejectUserInterest(user: IUser, userInterestBody: UsersInterestDto, status) {
		const { interestedUser } = userInterestBody;
		const { id } = user;
		const interestUser = await this.userService.findOne({ id: interestedUser });

		if (interestedUser == id) throw new BadRequestException("You can not show an interest in yourself");
		if (!interestUser) throw new BadRequestException("Interested user not found!!");

		const usersInterest = await this.usersInterest.create({
			interestedUser: interestUser,
			status,
			user,
		});

		return await this.usersInterest.save(usersInterest);
	}

	async boostUserInterest(user: IUser) {
		const { id, profileBoostDate, boosts } = user;
		const currentDate = new Date();

		const futureDate = profileBoostDate
			? profileBoostDate < currentDate
				? addMinuteInDate(new Date(), 30)
				: addMinuteInDate(new Date(profileBoostDate), 30)
			: addMinuteInDate(new Date(), 30);

		if (!boosts) throw new BadRequestException("You have not any boost remain!! Please purchase subscription");

		const boostedProfile = await this.userService.updateOne(
			{ id },
			{ profileBoostDate: futureDate, boosts: boosts - 1 },
		);

		return boostedProfile;
	}

	async reviseUsersInterest(user: IUser): Promise<DeleteResult> {
		const { id } = user;

		const previousUsersInterest = await this.findOne({ where: { user: { id } }, order: { createdAt: "DESC" } });

		if (previousUsersInterest) return await this.delete({ id: previousUsersInterest.id });
		else throw new BadRequestException("No found");
	}

	async getSentLike(user: IUser): Promise<any[]> {
		const { id, latLong } = user;

		const matchedProfiles = await this.usersInterest
			.createQueryBuilder("interest")
			.where("interest.user = :userId AND interest.status = :status", { userId: id, status: InterestStatusENUM.LIKED })
			.leftJoinAndSelect("interest.interestedUser", "interestedUser")
			.leftJoinAndSelect("interestedUser.profileMedias", "profileMedias")
			.leftJoinAndSelect("interestedUser.passions", "passions")
			.leftJoinAndSelect("interestedUser.lookingFor", "lookingFor")
			.addSelect(`ST_DistanceSphere(interestedUser.location, ST_MakePoint(${latLong[1]}, ${latLong[0]}))`, "distance")
			.orderBy("distance", "ASC");

		const resultWithRaw = await matchedProfiles.getRawMany();
		const result = await matchedProfiles.getMany();

		const allMatchedProfiles = result.map((profile) => {
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
			} = profile.interestedUser;

			const findUser = resultWithRaw.find((user) => user.interestedUser_id == id);
			return {
				...profile,
				interestedUser: {
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
					distance: findUser?.distance / 1000 ?? 0,
				},
			};
		});

		return allMatchedProfiles;
	}

	async getLikes(user: IUser, searchQuery: MatchesQueryDto): Promise<any[]> {
		const { id, subscriptionId, latLong } = user;
		const { hasBio, isVerified, maxDistance, minPhotos, passions } = searchQuery;
		const ageRange = searchQuery.ageRange ? searchQuery?.ageRange.split(",") : undefined;
		const subscription = subscriptionId ? await this.subscriptionService.findOne({ id: subscriptionId }) : undefined;

		if (hasBio || isVerified || maxDistance || minPhotos || passions) {
			if (!subscriptionId) throw new BadRequestException("Please purchase subscription");
			if (subscription.type == SubscriptionsEnum.PLUS)
				throw new BadRequestException("You have not gold OR platinum membership!!");
		}

		const matchedProfiles: any = await this.usersInterest
			.createQueryBuilder("interest")
			.leftJoinAndSelect("interest.user", "user")
			.leftJoinAndSelect("user.profileMedias", "profileMedia")
			.leftJoinAndSelect("user.passions", "passions")
			.addSelect(`ST_DistanceSphere(user.location, ST_MakePoint(${latLong[1]}, ${latLong[0]})) AS distance`)
			.where((qb) => {
				qb.andWhere("interest.interestedUser = :id", { id });
				qb.andWhere("interest.status = :status", { status: InterestStatusENUM.LIKED });
				if (isVerified == ("true" as any)) {
					qb.andWhere("user.isVerified = :isVerified", { isVerified });
				}
				if (hasBio == ("true" as any)) {
					qb.andWhere("user.bio IS NOT NULL");
				}
				if (passions && passions?.split(",")?.length) {
					qb.andWhere("passions.id IN (:...passions)", { passions: passions?.split(",") });
				}
				if (minPhotos) {
					qb.having("COUNT(profileMedia.id) >= :minPhotos", { minPhotos: parseInt(minPhotos) - 1 });
				}
				if (ageRange) {
					qb.andWhere("user.age BETWEEN :minAge AND :maxAge", { minAge: ageRange[0], maxAge: ageRange[1] });
				}
				if (maxDistance) {
					qb.andWhere(
						`ST_DistanceSphere(user.location, ST_MakePoint(${latLong[1]}, ${latLong[0]})) <= ${maxDistance * 1000}`,
					);
				}
			})
			.groupBy(["interest.id", "user.id", "profileMedia.id", "passions.id"].join(", "));

		const getAllProfilesWithDistance = await matchedProfiles.getRawMany();
		const getAllProfiles = await matchedProfiles.getMany();

		const allUpdatedProfiles = getAllProfiles.map((profile) => {
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
			} = profile.user;

			const findUser = getAllProfilesWithDistance.find((user) => user.user_id == profile.user.id);
			return {
				...profile,
				user: {
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
					distance: findUser?.distance / 1000 ?? 0,
				},
			};
		});

		if (!subscription || subscription?.type == SubscriptionsEnum.PLUS) {
			return Promise.all(
				allUpdatedProfiles.map(async (profile) => ({
					...profile,
					user: {
						avatar: profile.user.avatar !== "" ? await blurImageFromUrl(profile.user.avatar, 10) : "",
						id: profile.user.id,
					},
				})),
			);
		}

		return allUpdatedProfiles;
	}
}

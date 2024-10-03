import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import MessageEntity from "src/database/entities/message.entity";
import ProfileMediaEntity from "src/database/entities/profileMedia.entity";
import UserEntity from "src/database/entities/user.entity";
import UsersMessageThreadEntity from "src/database/entities/usersMessageThread.entity";
import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(UsersMessageThreadEntity)
		private readonly userMessageThread: Repository<UsersMessageThreadEntity>,
		@InjectRepository(MessageEntity)
		private readonly messages: Repository<MessageEntity>,
	) {}

	async update(
		where: FindOptionsWhere<UsersMessageThreadEntity>,
		request: QueryDeepPartialEntity<UsersMessageThreadEntity>,
	) {
		const updatedMessageThread = await this.userMessageThread.update(where, request);
		return updatedMessageThread;
	}

	async createMessageThread(
		entityLikeArray: DeepPartial<UsersMessageThreadEntity>[],
	): Promise<UsersMessageThreadEntity[]> {
		const createdUserMessageThread = await this.userMessageThread.create(entityLikeArray);
		return await this.userMessageThread.save(createdUserMessageThread);
	}

	async fetchThreadById(threadId: string) {
		const thread = await this.userMessageThread.findOneBy({ id: threadId });
		if (!thread) return null;
		return thread;
	}

	async createMessage(reqMes: MessageEntity) {
		const message = await this.messages.create(reqMes);
		return await this.messages.save(message);
	}

	async fetchMyThreads(userId: string) {
		const threads = await this.userMessageThread.find({
			where: [{ userSender: { id: userId } }, { userReceiver: { id: userId } }],
		});
		return threads;
	}

	async findThread(threadId: string, userId: string) {
		const thread = await this.userMessageThread.findOne({
			where: [
				{ id: threadId, userSender: { id: userId } },
				{ id: threadId, userReceiver: { id: userId } },
			],
			relations: ["userSender", "userReceiver"],
		});
		return thread;
	}

	async searchThreads(user: UserEntity) {
		try {
			const threads = await this.userMessageThread
				.createQueryBuilder("thread")
				.leftJoinAndSelect("thread.userSender", "senderUser")
				.leftJoinAndSelect("thread.userReceiver", "receiverUser")
				.where(`senderUser.id = :userId OR receiverUser.id = :userId`, { userId: user.id })
				.leftJoinAndSelect("receiverUser.profileMedias", "receiverUserProfileMedia")
				.leftJoinAndSelect("senderUser.profileMedias", "senderUserProfileMedia")
				.leftJoin(
					(qb) =>
						qb
							.select("message.threadId", "threadId")
							.addSelect("MAX(message.createdAt)", "createdAt")
							.from(MessageEntity, "message")
							.groupBy("message.threadId"),
					"latestMessage",
					'"latestMessage"."threadId" = "thread"."id"',
				)
				.leftJoinAndSelect(
					"thread.messages",
					"message",
					'"message"."threadId" = "latestMessage"."threadId" AND "message"."createdAt" = "latestMessage"."createdAt"',
				)
				.leftJoinAndSelect("message.toUser", "messageToUser")
				.leftJoinAndMapOne(
					"receiverUser.profileMedia",
					ProfileMediaEntity,
					"receiverProfileMedia",
					"receiverProfileMedia.id = receiverUserProfileMedia.id",
				)
				.leftJoinAndMapOne(
					"senderUser.profileMedia",
					ProfileMediaEntity,
					"senderProfileMedia",
					"senderProfileMedia.id = senderUserProfileMedia.id",
				)
				.select([
					"thread.id",
					"thread.reason",
					"thread.createdAt",
					"thread.isNewMatch",
					// sender user
					"senderUser.id",
					"senderUser.firstname",
					"senderUser.lastname",
					"senderUser.isActive",
					"senderUser.aboutMe",
					"senderUser.bio",
					"senderUser.school",
					"senderUser.city",
					// receiver user
					"receiverUser.id",
					"receiverUser.firstname",
					"receiverUser.lastname",
					"receiverUser.isActive",
					"receiverUser.aboutMe",
					"receiverUser.bio",
					"receiverUser.school",
					"receiverUser.city",
				])
				.addSelect([
					// user's messages
					"message.id",
					"message.message",
					"message.type",
					"message.isLiked",
					"message.isSeen",
					"message.createdAt",
					"messageToUser.id",

					// user's profile image
					"receiverProfileMedia.id",
					"receiverProfileMedia.url",
					"senderProfileMedia.id",
					"senderProfileMedia.url",
				])
				.getMany();
			let unSeenMessageCount = [];
			try {
				unSeenMessageCount = await this.messages
					.createQueryBuilder("message")
					.where("message.isSeen IS NULL AND message.toUser = :userId AND message.threadId IN(:...threadIds)", {
						userId: user.id,
						threadIds: threads.map(({ id }) => id),
					})
					.groupBy("message.threadId")
					.select(["message.threadId"])
					.addSelect("COUNT(*)", "unSeenMessageCount")
					.getRawMany();
			} catch {}

			return threads.map((threads) => ({
				...threads,
				unSeenMessageCount: unSeenMessageCount.find(({ threadId }) => threadId === threads.id)?.unSeenMessageCount ?? 0,
			}));
		} catch (e: any) {
			return null;
		}
	}

	async fetchPaginatedMessages(threadId: string, userId: string, { page, limit }: { page: number; limit: number }) {
		try {
			const messages = await this.messages
				.createQueryBuilder("messages")
				.where("messages.thread = :threadId AND messages.toUser = :userId", { threadId, userId })
				.orWhere("messages.thread = :threadId AND messages.fromUser = :userId", { threadId, userId })
				.leftJoinAndSelect("messages.fromUser", "fromUser")
				.leftJoinAndSelect("messages.toUser", "toUser")
				.select([
					// message
					"messages.id",
					"messages.message",
					"messages.type",
					"messages.isLiked",
					"messages.createdAt",
					"messages.isSeen",
					// from user
					"fromUser.id",
					// to user
					"toUser.id",
				])
				.orderBy("messages.createdAt", "DESC")
				.offset((page - 1) * limit)
				.limit(+limit)
				.getMany();
			return messages.reverse();
		} catch (e: any) {
			return null;
		}
	}

	async fetchThreadMessages(threadId: string, userId: string, limit: number) {
		try {
			const isThread = await this.findThread(threadId, userId);
			if (!isThread) return null;

			const thread = await this.userMessageThread
				.createQueryBuilder("thread")
				.where(`thread.id = :threadId`, { threadId })
				.leftJoinAndSelect("thread.userSender", "senderUser")
				.leftJoinAndSelect("thread.userReceiver", "receiverUser")
				.leftJoinAndSelect("receiverUser.profileMedias", "receiverUserProfileMedia")
				.leftJoinAndSelect("senderUser.profileMedias", "senderUserProfileMedia")
				.leftJoinAndMapOne(
					"receiverUser.profileMedia",
					ProfileMediaEntity,
					"receiverProfileMedia",
					"receiverProfileMedia.id = receiverUserProfileMedia.id",
				)
				.leftJoinAndMapOne(
					"senderUser.profileMedia",
					ProfileMediaEntity,
					"senderProfileMedia",
					"senderProfileMedia.id = senderUserProfileMedia.id",
				)
				.select([
					// thread
					"thread.id",
					"thread.reason",
					"thread.createdAt",
					"thread.isNewMatch",
					// sender user
					"senderUser.id",
					"senderUser.firstname",
					"senderUser.lastname",
					"senderUser.isActive",
					"senderUser.aboutMe",
					"senderUser.bio",
					"senderUser.school",
					"senderUser.city",
					// receiver user
					"receiverUser.id",
					"receiverUser.firstname",
					"receiverUser.lastname",
					"receiverUser.isActive",
					"receiverUser.aboutMe",
					"receiverUser.bio",
					"receiverUser.school",
					"receiverUser.city",
					// user's profile image
					"receiverProfileMedia.id",
					"receiverProfileMedia.url",
					"senderProfileMedia.id",
					"senderProfileMedia.url",
				])
				.getOne();
			return { ...thread, messages: await this.fetchPaginatedMessages(threadId, userId, { page: 1, limit }) };
		} catch (error) {
			return null;
		}
	}

	async setMessagesToSeen(threadId, userId) {
		try {
			const messages = await this.messages
				.createQueryBuilder("message")
				.update(MessageEntity)
				.set({ isSeen: new Date() })
				.where("threadId = :threadId AND isSeen IS NULL AND toUser.id = :userId", {
					threadId,
					userId,
				})
				.execute();

			if (!messages) throw Error("No messages found");
			return messages;
		} catch (error: any) {
			throw new BadRequestException(error.message || "Something is wrong");
		}
	}

	async setLikeUnlikeToMessage(threadId: string, messageId: string, userId: string, isLiked: Date | null) {
		try {
			const message = await this.messages
				.createQueryBuilder("message")
				.update(MessageEntity)
				.set({ isLiked })
				.where("id = :messageId and thread.id = :threadId AND toUser.id = :userId", { threadId, messageId, userId })
				.execute();
			if (!message) throw Error("No messages found");

			return message;
		} catch (error: any) {
			throw new BadRequestException(error.message || "Something is wrong");
		}
	}

	async updatedMessageThread(threadId: string) {
		try {
			const updatedMessageThread = await this.update({ id: threadId }, { isNewMatch: false });

			if (!updatedMessageThread) throw Error("No thread found");

			return updatedMessageThread;
		} catch (error) {
			throw new BadRequestException(error.message || "Something is wrong");
		}
	}

	async fetchUnSeenMessageCount(userId: string): Promise<number> {
		try {
			const unSeenMessageCount = await this.messages
				.createQueryBuilder("message")
				.select("message.id", "id")
				.where("message.toUser = :userId AND message.isSeen IS NULL", { userId })
				.getCount();

			return unSeenMessageCount;
		} catch (error) {
			throw new BadRequestException(error.message || "Something is wrong");
		}
	}
}

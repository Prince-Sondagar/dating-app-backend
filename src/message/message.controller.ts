import { Controller, Get, HttpStatus, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import MessageEntity from "src/database/entities/message.entity";
import UserEntity from "src/database/entities/user.entity";
import UsersMessageThreadEntity from "src/database/entities/usersMessageThread.entity";
import { SuccessResponse } from "src/utils/common-types/userResponse.type";
import { User } from "src/utils/decorators/user.decorator";
import { MessageService } from "./message.service";

@Controller("messages")
@ApiTags("Chat")
export class MessageController {
	constructor(private readonly messageService: MessageService) {}

	@Get()
	@ApiOperation({ summary: "Fetch Messages" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Threads fetched successfully!",
	})
	async fetchThreads(@User() user: UserEntity): Promise<SuccessResponse<UsersMessageThreadEntity[]>> {
		const threads = await this.messageService.searchThreads(user);
		return {
			message: !threads ? "Something is wrong here!" : "Threads fetched successfully",
			error: false,
			data: threads ? threads : null,
		};
	}

	@Get(":threadId")
	@ApiOperation({ summary: "Fetch Messages with Thread Id" })
	@ApiParam({ name: "threadId", description: "Enter ThreadId" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Threads fetched successfully!",
	})
	async fetchThreadMessages(
		@User() user: UserEntity,
		@Param("threadId") threadId: string,
		@Query("limit", { transform: (limit) => limit ?? 20 }) limit?: number,
	): Promise<SuccessResponse<any>> {
		const messages = await this.messageService.fetchThreadMessages(threadId, user.id, limit);
		return {
			message: !messages ? "Invalid Thread for you, please try again" : "Threads fetched successfully",
			error: false,
			data: messages,
		};
	}

	@Get(":threadId/messages")
	@ApiOperation({ summary: "Fetch Messages with Thread Id" })
	@ApiParam({ name: "threadId", description: "Enter ThreadId" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Threads fetched successfully!",
	})
	async fetchPaginatedThreadMessages(
		@User() user: UserEntity,
		@Param("threadId") threadId: string,
		@Query("page", { transform: (page) => page ?? 2 }) page?: number,
		@Query("limit", { transform: (limit) => limit ?? 20 }) limit?: number,
	): Promise<SuccessResponse<MessageEntity[]>> {
		const messages = await this.messageService.fetchPaginatedMessages(threadId, user.id, { page, limit });
		return {
			message: !messages ? "Invalid Thread for you, please try again" : "Threads fetched successfully",
			error: false,
			data: messages,
		};
	}

	@Post(":threadId/seen")
	@ApiOperation({ summary: "Seen Thread Messages" })
	@ApiParam({ name: "threadId", description: "Enter ThreadId" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Seen message successfully!",
	})
	async setSeenTrue(
		@User() user: UserEntity,
		@Param("threadId") threadId: string,
	): Promise<SuccessResponse<MessageEntity[]>> {
		await this.messageService.setMessagesToSeen(threadId, user.id);
		return {
			message: "Seen message successfully",
			error: false,
		};
	}

	@Get(":threadId/:messageId/:likeUnlike(unlike|like)")
	@ApiOperation({ summary: "like and unlike" })
	@ApiParam({ name: "threadId", description: "Enter ThreadId" })
	@ApiParam({ name: "messageId", description: "Enter MessageId" })
	@ApiParam({ name: "likeUnlike", enum: ["unlike", "like"], description: "Select Like/Unlike" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "message Like Or Unlike successfully!",
	})
	async setLikeUnlike(
		@User() user: UserEntity,
		@Param("threadId") threadId: string,
		@Param("messageId") messageId: string,
		@Param("likeUnlike") likeUnlike: "like" | "unlike",
	): Promise<SuccessResponse<MessageEntity[]>> {
		const { affected } = await this.messageService.setLikeUnlikeToMessage(
			threadId,
			messageId,
			user.id,
			likeUnlike === "like" ? new Date() : null,
		);
		return {
			message: affected ? `message ${likeUnlike} successfully` : "No message found",
			error: false,
		};
	}

	@Put(":threadId")
	@ApiOperation({ summary: "Update Thread" })
	@ApiParam({ name: "threadId", description: "Enter ThreadId" })
	@ApiBearerAuth("JWT-auth")
	@UseGuards(AuthGuard("jwt"))
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Thread updated successfully!",
	})
	async updateMessageThread(@Param("threadId") threadId: string): Promise<SuccessResponse<any>> {
		const updatedMessageThread = await this.messageService.updatedMessageThread(threadId);

		return {
			message: "Thread updated successfully",
			error: false,
			data: updatedMessageThread,
		};
	}
}
